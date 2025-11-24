import { ObjectStorageService } from "./objectStorage.js";
import { LocalFileStorageService } from "./localFileStorage.js";
import { isReplitEnvironment } from "./env.js";

/**
 * Type that represents either storage service
 */
export type StorageService = ObjectStorageService | LocalFileStorageService;

// Singleton instances
let storageServiceInstance: StorageService | null = null;

/**
 * Factory function to get the appropriate storage service singleton
 * Returns ObjectStorageService on Replit, LocalFileStorageService locally
 */
export function getStorageService(): StorageService {
  if (!storageServiceInstance) {
    if (isReplitEnvironment()) {
      storageServiceInstance = new ObjectStorageService();
    } else {
      storageServiceInstance = new LocalFileStorageService();
    }
  }
  return storageServiceInstance;
}
