import type { Snippet } from "@/lib/db";

export type StorageBackend = "sqlite";

export type StorageStatus = "ready";

export interface StorageBackendOption {
  id: StorageBackend;
  label: string;
  description: string;
  privacy: string;
  attachments: string;
  advanced: boolean;
  available: boolean;
  statusNote: string | null;
}

export interface EffectiveStorageSettings {
  activeBackend: StorageBackend;
  availableBackends: StorageBackendOption[];
  backendLabel: string;
  publicConfig: Record<string, unknown> | null;
  status: StorageStatus;
  lastValidatedAt: string | null;
  lastError: string | null;
}

export interface SnippetRecord extends Snippet {
  tags: string[];
}

export interface SearchSnippetsInput {
  query?: string;
  tags?: string[];
}

export interface CreateSnippetRecordInput {
  id: string;
  userId: string;
  title: string;
  description: string | null;
  notes: string | null;
  language: string;
  code: string;
  tags: string[];
}

export interface UpdateSnippetRecordInput {
  title?: string;
  description?: string | null;
  notes?: string | null;
  language?: string;
  code?: string;
  tags?: string[];
}

export interface CreateAttachmentRecordInput {
  id: string;
  snippetId: string;
  userId: string;
  fileName: string;
  fileSize: number;
  mimeType: string;
  storageKey: string;
}

export interface PendingAttachmentUploadRecord {
  fileId: string;
  userId: string;
  snippetId: string;
  storageKey: string;
  fileName: string;
  fileSize: number;
  mimeType: string;
  expiresAt: string;
}

export interface AttachmentDownloadTarget {
  kind: "blob";
  fileName?: string;
  mimeType?: string;
  contentBase64?: string;
}
