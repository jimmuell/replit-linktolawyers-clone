import { randomUUID } from "crypto";
import { mkdir, writeFile, stat } from "fs/promises";
import { existsSync } from "fs";
import path from "path";
import {
  ObjectAclPolicy,
  ObjectPermission,
} from "./objectAcl.js";
import type { StorageProvider, StorageObjectDescriptor } from "./storageTypes.js";

const LOCAL_STORAGE_BASE = path.join(process.cwd(), 'local-storage');
const PUBLIC_DIR = path.join(LOCAL_STORAGE_BASE, 'public');
const PRIVATE_DIR = path.join(LOCAL_STORAGE_BASE, 'private');

export class ObjectNotFoundError extends Error {
  constructor() {
    super("Object not found");
    this.name = "ObjectNotFoundError";
    Object.setPrototypeOf(this, ObjectNotFoundError.prototype);
  }
}

interface LocalFileMetadata {
  path: string;
  aclPolicy?: ObjectAclPolicy;
  contentType?: string;
  size?: number;
}

// Simple metadata store (in production, you might use a database)
const fileMetadata = new Map<string, LocalFileMetadata>();

/**
 * Local file storage service for development
 * Stores files in local filesystem instead of cloud object storage
 */
export class LocalFileStorageService implements StorageProvider {
  constructor() {
    this.ensureDirectories();
  }

  private async ensureDirectories() {
    try {
      await mkdir(PUBLIC_DIR, { recursive: true });
      await mkdir(PRIVATE_DIR, { recursive: true });
      await mkdir(path.join(PRIVATE_DIR, 'uploads'), { recursive: true });
    } catch (error) {
      console.error('Error creating local storage directories:', error);
    }
  }

  getPublicObjectSearchPaths(): Array<string> {
    return [PUBLIC_DIR];
  }

  getPrivateObjectDir(): string {
    return PRIVATE_DIR;
  }


  async getObjectEntityUploadURL(): Promise<string> {
    const objectId = randomUUID();
    const relativePath = `uploads/${objectId}`;
    
    // Return a local path identifier that the upload handler will recognize
    return `/local-upload/${relativePath}`;
  }

  async getObjectEntityFile(objectPath: string): Promise<StorageObjectDescriptor> {
    if (!objectPath.startsWith("/objects/")) {
      throw new ObjectNotFoundError();
    }

    const entityId = objectPath.slice("/objects/".length);
    const filePath = path.join(PRIVATE_DIR, entityId);

    if (!existsSync(filePath)) {
      throw new ObjectNotFoundError();
    }

    // Get metadata
    const metadata = fileMetadata.get(filePath);
    const stats = await stat(filePath);

    return {
      kind: "local",
      localPath: filePath,
      metadata: {
        contentType: metadata?.contentType,
        size: stats.size,
        aclPolicy: metadata?.aclPolicy,
      },
    };
  }

  normalizeObjectEntityPath(rawPath: string): string {
    // If it's already a normalized path, return it
    if (rawPath.startsWith("/objects/")) {
      return rawPath;
    }

    // If it's a local upload path
    if (rawPath.startsWith("/local-upload/")) {
      const relativePath = rawPath.slice("/local-upload/".length);
      return `/objects/${relativePath}`;
    }

    // Otherwise return as-is
    return rawPath;
  }

  async trySetObjectEntityAclPolicy(
    rawPath: string,
    aclPolicy: ObjectAclPolicy
  ): Promise<string> {
    const normalizedPath = this.normalizeObjectEntityPath(rawPath);
    
    if (!normalizedPath.startsWith("/objects/")) {
      return normalizedPath;
    }

    const entityId = normalizedPath.slice("/objects/".length);
    const filePath = path.join(PRIVATE_DIR, entityId);

    if (existsSync(filePath)) {
      const metadata = fileMetadata.get(filePath) || { path: filePath };
      metadata.aclPolicy = aclPolicy;
      fileMetadata.set(filePath, metadata);
    }

    return normalizedPath;
  }

  async canAccessObjectEntity({
    userId,
    descriptor,
    requestedPermission,
  }: {
    userId?: string;
    descriptor: StorageObjectDescriptor;
    requestedPermission?: ObjectPermission;
  }): Promise<boolean> {
    if (descriptor.kind !== "local") {
      return false;
    }

    const aclPolicy = descriptor.metadata?.aclPolicy;
    
    // If no ACL policy is set, default to public for blog images
    if (!aclPolicy) {
      return requestedPermission === ObjectPermission.READ;
    }

    // If it's public, allow read access
    if (aclPolicy.visibility === "public" && requestedPermission === ObjectPermission.READ) {
      return true;
    }

    // Check if user is the owner
    if (userId && aclPolicy.owner === userId) {
      return true;
    }

    // For local storage, we'll keep access control simple
    return false;
  }

  /**
   * Save uploaded file to local storage
   */
  async saveUploadedFile(
    relativePath: string,
    buffer: Buffer,
    contentType?: string,
    aclPolicy?: ObjectAclPolicy
  ): Promise<string> {
    const fullPath = path.join(PRIVATE_DIR, relativePath);
    const dir = path.dirname(fullPath);

    await mkdir(dir, { recursive: true });
    await writeFile(fullPath, buffer);

    // Store metadata with ACL policy
    const stats = await stat(fullPath);
    fileMetadata.set(fullPath, {
      path: fullPath,
      contentType,
      size: stats.size,
      aclPolicy: aclPolicy || {
        owner: "admin",
        visibility: "public", // Default to public for blog images
      },
    });

    return `/objects/${relativePath}`;
  }

}
