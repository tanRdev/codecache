import type { StorageBackend } from "@/lib/storage/types";

export interface CacheContext {
  backend?: StorageBackend;
  connectionString?: string;
  localProfileName?: string;
  userId: string;
}
