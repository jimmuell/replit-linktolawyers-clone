import { Storage, File } from "@google-cloud/storage";
import { Response } from "express";
import { randomUUID } from "crypto";
import * as fs from "fs";
import * as path from "path";
import {
  ObjectAclPolicy,
  ObjectPermission,
  canAccessObject,
  getObjectAclPolicy,
  setObjectAclPolicy,
} from "./objectAcl.js";

const REPLIT_SIDECAR_ENDPOINT = "http://127.0.0.1:1106";
const LOCAL_STORAGE_DIR = "public/uploads";

export function isLocalStorageMode(): boolean {
  if (process.env.USE_LOCAL_STORAGE === 'true') {
    return true;
  }
  if (!process.env.REPL_ID) {
    return true;
  }
  return false;
}

function ensureLocalStorageDir(): void {
  const uploadsDir = path.resolve(LOCAL_STORAGE_DIR);
  if (!fs.existsSync(uploadsDir)) {
    fs.mkdirSync(uploadsDir, { recursive: true });
    console.log(`Created local storage directory: ${uploadsDir}`);
  }
}

const objectStorageClient = !isLocalStorageMode() ? new Storage({
  credentials: {
    audience: "replit",
    subject_token_type: "access_token",
    token_url: `${REPLIT_SIDECAR_ENDPOINT}/token`,
    type: "external_account",
    credential_source: {
      url: `${REPLIT_SIDECAR_ENDPOINT}/credential`,
      format: {
        type: "json",
        subject_token_field_name: "access_token",
      },
    },
    universe_domain: "googleapis.com",
  },
  projectId: "",
}) : null;

export { objectStorageClient };

export class ObjectNotFoundError extends Error {
  constructor() {
    super("Object not found");
    this.name = "ObjectNotFoundError";
    Object.setPrototypeOf(this, ObjectNotFoundError.prototype);
  }
}

export class ObjectStorageService {
  private isLocal: boolean;

  constructor() {
    this.isLocal = isLocalStorageMode();
    if (this.isLocal) {
      ensureLocalStorageDir();
      console.log('ObjectStorageService: Running in local storage mode');
    }
  }

  getPublicObjectSearchPaths(): Array<string> {
    if (this.isLocal) {
      return [LOCAL_STORAGE_DIR];
    }
    
    const pathsStr = process.env.PUBLIC_OBJECT_SEARCH_PATHS || "";
    const paths = Array.from(
      new Set(
        pathsStr
          .split(",")
          .map((path) => path.trim())
          .filter((path) => path.length > 0)
      )
    );
    if (paths.length === 0) {
      throw new Error(
        "PUBLIC_OBJECT_SEARCH_PATHS not set. Create a bucket in 'Object Storage' " +
          "tool and set PUBLIC_OBJECT_SEARCH_PATHS env var (comma-separated paths)."
      );
    }
    return paths;
  }

  getPrivateObjectDir(): string {
    if (this.isLocal) {
      return LOCAL_STORAGE_DIR;
    }
    
    const dir = process.env.PRIVATE_OBJECT_DIR || "";
    if (!dir) {
      throw new Error(
        "PRIVATE_OBJECT_DIR not set. Create a bucket in 'Object Storage' " +
          "tool and set PRIVATE_OBJECT_DIR env var."
      );
    }
    return dir;
  }

  async searchPublicObject(filePath: string): Promise<File | null> {
    if (this.isLocal) {
      return null;
    }
    
    for (const searchPath of this.getPublicObjectSearchPaths()) {
      const fullPath = `${searchPath}/${filePath}`;
      const { bucketName, objectName } = parseObjectPath(fullPath);
      const bucket = objectStorageClient!.bucket(bucketName);
      const file = bucket.file(objectName);
      const [exists] = await file.exists();
      if (exists) {
        return file;
      }
    }

    return null;
  }

  async downloadObject(file: File, res: Response, cacheTtlSec: number = 3600) {
    try {
      const [metadata] = await file.getMetadata();
      const aclPolicy = await getObjectAclPolicy(file);
      const isPublic = aclPolicy?.visibility === "public";
      res.set({
        "Content-Type": metadata.contentType || "application/octet-stream",
        "Content-Length": metadata.size,
        "Cache-Control": `${
          isPublic ? "public" : "private"
        }, max-age=${cacheTtlSec}`,
      });

      const stream = file.createReadStream();

      stream.on("error", (err) => {
        console.error("Stream error:", err);
        if (!res.headersSent) {
          res.status(500).json({ error: "Error streaming file" });
        }
      });

      stream.pipe(res);
    } catch (error) {
      console.error("Error downloading file:", error);
      if (!res.headersSent) {
        res.status(500).json({ error: "Error downloading file" });
      }
    }
  }

  async downloadLocalFile(filePath: string, res: Response, cacheTtlSec: number = 3600) {
    try {
      const fullPath = path.resolve(filePath);
      
      if (!fs.existsSync(fullPath)) {
        throw new ObjectNotFoundError();
      }

      const stats = fs.statSync(fullPath);
      const ext = path.extname(fullPath).toLowerCase();
      
      const mimeTypes: Record<string, string> = {
        '.jpg': 'image/jpeg',
        '.jpeg': 'image/jpeg',
        '.png': 'image/png',
        '.gif': 'image/gif',
        '.webp': 'image/webp',
        '.svg': 'image/svg+xml',
      };

      res.set({
        "Content-Type": mimeTypes[ext] || "application/octet-stream",
        "Content-Length": stats.size,
        "Cache-Control": `public, max-age=${cacheTtlSec}`,
      });

      const stream = fs.createReadStream(fullPath);
      
      stream.on("error", (err) => {
        console.error("Stream error:", err);
        if (!res.headersSent) {
          res.status(500).json({ error: "Error streaming file" });
        }
      });

      stream.pipe(res);
    } catch (error) {
      console.error("Error downloading local file:", error);
      if (!res.headersSent) {
        if (error instanceof ObjectNotFoundError) {
          res.status(404).json({ error: "File not found" });
        } else {
          res.status(500).json({ error: "Error downloading file" });
        }
      }
    }
  }

  async getObjectEntityUploadURL(): Promise<string> {
    if (this.isLocal) {
      const objectId = randomUUID();
      return `local://${LOCAL_STORAGE_DIR}/${objectId}`;
    }
    
    const privateObjectDir = this.getPrivateObjectDir();
    if (!privateObjectDir) {
      throw new Error(
        "PRIVATE_OBJECT_DIR not set. Create a bucket in 'Object Storage' " +
          "tool and set PRIVATE_OBJECT_DIR env var."
      );
    }

    const objectId = randomUUID();
    const fullPath = `${privateObjectDir}/uploads/${objectId}`;

    const { bucketName, objectName } = parseObjectPath(fullPath);

    return signObjectURL({
      bucketName,
      objectName,
      method: "PUT",
      ttlSec: 900,
    });
  }

  async uploadLocalFile(buffer: Buffer, mimeType: string): Promise<string> {
    ensureLocalStorageDir();
    const objectId = randomUUID();
    const ext = mimeType.split('/')[1] || 'bin';
    const filename = `${objectId}.${ext}`;
    const filePath = path.join(LOCAL_STORAGE_DIR, filename);
    
    fs.writeFileSync(filePath, buffer);
    console.log(`Local file saved: ${filePath}`);
    
    return `/images/uploads/${filename}`;
  }

  async getObjectEntityFile(objectPath: string): Promise<File> {
    if (this.isLocal) {
      throw new Error("getObjectEntityFile is not supported in local mode. Use getLocalFilePath instead.");
    }
    
    if (!objectPath.startsWith("/objects/")) {
      throw new ObjectNotFoundError();
    }

    const parts = objectPath.slice(1).split("/");
    if (parts.length < 2) {
      throw new ObjectNotFoundError();
    }

    const entityId = parts.slice(1).join("/");
    let entityDir = this.getPrivateObjectDir();
    if (!entityDir.endsWith("/")) {
      entityDir = `${entityDir}/`;
    }
    const objectEntityPath = `${entityDir}${entityId}`;
    const { bucketName, objectName } = parseObjectPath(objectEntityPath);
    const bucket = objectStorageClient!.bucket(bucketName);
    const objectFile = bucket.file(objectName);
    const [exists] = await objectFile.exists();
    if (!exists) {
      throw new ObjectNotFoundError();
    }
    return objectFile;
  }

  getLocalFilePath(objectPath: string): string {
    console.log('[DEBUG v2] getLocalFilePath called with:', objectPath);
    let normalizedPath = objectPath;
    if (normalizedPath.startsWith('/objects/')) {
      normalizedPath = normalizedPath.replace('/objects/', '');
    }
    if (normalizedPath.startsWith('/images/')) {
      normalizedPath = normalizedPath.replace('/images/', '');
    }
    if (normalizedPath.startsWith('uploads/')) {
      normalizedPath = normalizedPath.replace('uploads/', '');
    }
    console.log('[DEBUG v2] normalizedPath after stripping prefixes:', normalizedPath);
    
    if (normalizedPath.includes('..') || normalizedPath.includes('\0')) {
      throw new ObjectNotFoundError();
    }
    
    const baseDir = path.resolve(LOCAL_STORAGE_DIR);
    const filePath = path.resolve(baseDir, normalizedPath);
    console.log('[DEBUG v2] Final resolved filePath:', filePath);
    
    if (!filePath.startsWith(baseDir + path.sep) && filePath !== baseDir) {
      throw new ObjectNotFoundError();
    }
    
    return filePath;
  }

  localFileExists(objectPath: string): boolean {
    try {
      const filePath = this.getLocalFilePath(objectPath);
      return fs.existsSync(filePath);
    } catch {
      return false;
    }
  }

  normalizeObjectEntityPath(
    rawPath: string,
  ): string {
    if (this.isLocal) {
      if (rawPath.startsWith('local://')) {
        const localPath = rawPath.replace('local://', '');
        const filename = path.basename(localPath);
        return `/objects/uploads/${filename}`;
      }
      return rawPath;
    }
    
    if (!rawPath.startsWith("https://storage.googleapis.com/")) {
      return rawPath;
    }
  
    const url = new URL(rawPath);
    const rawObjectPath = url.pathname;
  
    let objectEntityDir = this.getPrivateObjectDir();
    if (!objectEntityDir.endsWith("/")) {
      objectEntityDir = `${objectEntityDir}/`;
    }
  
    if (!rawObjectPath.startsWith(objectEntityDir)) {
      return rawObjectPath;
    }
  
    const entityId = rawObjectPath.slice(objectEntityDir.length);
    return `/objects/${entityId}`;
  }

  async trySetObjectEntityAclPolicy(
    rawPath: string,
    aclPolicy: ObjectAclPolicy
  ): Promise<string> {
    if (this.isLocal) {
      return this.normalizeObjectEntityPath(rawPath);
    }
    
    const normalizedPath = this.normalizeObjectEntityPath(rawPath);
    if (!normalizedPath.startsWith("/")) {
      return normalizedPath;
    }

    const objectFile = await this.getObjectEntityFile(normalizedPath);
    await setObjectAclPolicy(objectFile, aclPolicy);
    return normalizedPath;
  }

  async canAccessObjectEntity({
    userId,
    objectFile,
    requestedPermission,
  }: {
    userId?: string;
    objectFile: File;
    requestedPermission?: ObjectPermission;
  }): Promise<boolean> {
    if (this.isLocal) {
      return true;
    }
    
    return canAccessObject({
      userId,
      objectFile,
      requestedPermission: requestedPermission ?? ObjectPermission.READ,
    });
  }

  isLocalMode(): boolean {
    return this.isLocal;
  }
}

function parseObjectPath(path: string): {
  bucketName: string;
  objectName: string;
} {
  if (!path.startsWith("/")) {
    path = `/${path}`;
  }
  const pathParts = path.split("/");
  if (pathParts.length < 3) {
    throw new Error("Invalid path: must contain at least a bucket name");
  }

  const bucketName = pathParts[1];
  const objectName = pathParts.slice(2).join("/");

  return {
    bucketName,
    objectName,
  };
}

async function signObjectURL({
  bucketName,
  objectName,
  method,
  ttlSec,
}: {
  bucketName: string;
  objectName: string;
  method: "GET" | "PUT" | "DELETE" | "HEAD";
  ttlSec: number;
}): Promise<string> {
  const request = {
    bucket_name: bucketName,
    object_name: objectName,
    method,
    expires_at: new Date(Date.now() + ttlSec * 1000).toISOString(),
  };
  const response = await fetch(
    `${REPLIT_SIDECAR_ENDPOINT}/object-storage/signed-object-url`,
    {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(request),
    }
  );
  if (!response.ok) {
    throw new Error(
      `Failed to sign object URL, errorcode: ${response.status}, ` +
        `make sure you're running on Replit`
    );
  }

  const { signed_url: signedURL } = await response.json();
  return signedURL;
}
