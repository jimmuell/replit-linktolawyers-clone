import { Response } from "express";
import { ObjectAclPolicy, ObjectPermission } from "./objectAcl.js";

/**
 * Discriminated union for storage object descriptors
 * Each storage provider returns one of these variants
 */
export type StorageObjectDescriptor =
  | {
      kind: "replit";
      file: any; // Google Cloud Storage File object
      metadata?: {
        contentType?: string;
        size?: number;
        aclPolicy?: ObjectAclPolicy;
      };
    }
  | {
      kind: "local";
      localPath: string;
      metadata?: {
        contentType?: string;
        size?: number;
        aclPolicy?: ObjectAclPolicy;
      };
    };

/**
 * Unified storage provider interface
 * Both Replit Object Storage and Local File Storage implement this
 */
export interface StorageProvider {
  /**
   * Get the file descriptor for an object path
   */
  getObjectEntityFile(objectPath: string): Promise<StorageObjectDescriptor>;

  /**
   * Set ACL policy for an object
   */
  trySetObjectEntityAclPolicy(
    rawPath: string,
    aclPolicy: ObjectAclPolicy
  ): Promise<string>;

  /**
   * Check if a user can access an object
   */
  canAccessObjectEntity(params: {
    userId?: string;
    descriptor: StorageObjectDescriptor;
    requestedPermission?: ObjectPermission;
  }): Promise<boolean>;

  /**
   * Get upload URL for new uploads
   */
  getObjectEntityUploadURL(): Promise<string>;

  /**
   * Normalize object path
   */
  normalizeObjectEntityPath(rawPath: string): string;
}

/**
 * Helper to stream a storage object to the response
 * Handles both Replit and local storage descriptors
 */
export async function streamStorageObject(
  descriptor: StorageObjectDescriptor,
  res: Response,
  cacheTtlSec: number = 3600
): Promise<void> {
  const isPublic = descriptor.metadata?.aclPolicy?.visibility === "public";
  
  // Set response headers
  res.set({
    "Content-Type": descriptor.metadata?.contentType || "application/octet-stream",
    "Content-Length": descriptor.metadata?.size?.toString() || "",
    "Cache-Control": `${isPublic ? "public" : "private"}, max-age=${cacheTtlSec}`,
  });

  if (descriptor.kind === "replit") {
    // Stream from Google Cloud Storage
    const stream = descriptor.file.createReadStream();
    
    stream.on("error", (err: Error) => {
      console.error("Stream error:", err);
      if (!res.headersSent) {
        res.status(500).json({ error: "Error streaming file" });
      }
    });

    stream.pipe(res);
  } else {
    // Stream from local filesystem
    const { createReadStream, existsSync } = await import("fs");
    const { stat } = await import("fs/promises");

    if (!existsSync(descriptor.localPath)) {
      res.status(404).json({ error: 'File not found' });
      return;
    }

    const stats = await stat(descriptor.localPath);
    res.set("Content-Length", stats.size.toString());

    const stream = createReadStream(descriptor.localPath);

    stream.on("error", (err: Error) => {
      console.error("Stream error:", err);
      if (!res.headersSent) {
        res.status(500).json({ error: "Error streaming file" });
      }
    });

    stream.pipe(res);
  }
}

/**
 * Build public URL for an object
 * Always returns /images/:path format for consistency
 */
export function buildPublicObjectUrl(objectPath: string): string {
  // Normalize the path to always use /images/ prefix
  if (objectPath.startsWith("/objects/")) {
    return `/images${objectPath.replace("/objects", "")}`;
  }
  return objectPath;
}
