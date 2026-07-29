import { readFile } from "node:fs/promises";
import { getDefaultDatabasePath, updateProfile, type CacheProfile } from "@/cli/config";
import { createHttpClient } from "@/cli/http-client";
import type { AttachmentDownloadTarget, StorageBackend } from "@/lib/storage/types";
import {
  deleteAttachment,
  getAttachmentDownload,
  listSnippetAttachments,
  uploadAttachment,
} from "@/lib/core/services/attachments";
import {
  createSnippet,
  deleteSnippet,
  getSnippet,
  listSnippets,
  updateSnippet,
} from "@/lib/core/services/snippets";
import { configureLocalStorage, ensureLocalUser } from "@/lib/storage/sqlite";
function createDirectContext(profile: Extract<CacheProfile, { mode: "direct" }>) {
  return {
    backend: profile.backend,
    localProfileName: profile.name,
    userId: profile.userId,
  };
}

export interface CacheRuntime {
  attachmentDelete(attachmentId: string): Promise<unknown>;
  attachmentDownload(attachmentId: string): Promise<AttachmentDownloadTarget>;
  attachmentList(snippetId: string): Promise<unknown>;
  attachmentUpload(snippetId: string, filePath: string, mimeType?: string): Promise<unknown>;
  profileInfo(): Promise<unknown>;
  snippetCreate(input: {
    code: string;
    description?: string;
    language: string;
    notes?: string;
    tags: string[];
    title: string;
  }): Promise<unknown>;
  snippetDelete(snippetId: string): Promise<unknown>;
  snippetGet(snippetId: string): Promise<unknown>;
  snippetList(query?: string, tags?: string[]): Promise<unknown>;
  snippetUpdate(snippetId: string, input: Record<string, unknown>): Promise<unknown>;
  storageGet(): Promise<unknown>;
  storageSet(input: { backend: string }): Promise<unknown>;
  storageValidate(): Promise<unknown>;
}

function parseStorageBackend(backend: string): StorageBackend {
  if (backend === "sqlite") {
    return backend;
  }

  throw new Error(`Unsupported backend: ${backend}`);
}

function guessMimeType(filePath: string) {
  if (filePath.endsWith(".png")) {
    return "image/png";
  }

  if (filePath.endsWith(".jpg") || filePath.endsWith(".jpeg")) {
    return "image/jpeg";
  }

  if (filePath.endsWith(".md")) {
    return "text/markdown";
  }

  if (filePath.endsWith(".json")) {
    return "application/json";
  }

  if (filePath.endsWith(".pdf")) {
    return "application/pdf";
  }

  return "text/plain";
}

export function createRuntime(profile: CacheProfile): CacheRuntime {
  if (profile.mode === "direct") {
    const context = createDirectContext(profile);
    const databasePath = profile.databasePath ?? getDefaultDatabasePath(profile.name);
    configureLocalStorage({
      databasePath,
      attachmentsRoot: profile.attachmentsRoot,
    });
    let ready: Promise<void> | undefined;
    const ensureReady = () => {
      ready ??= ensureLocalUser(profile.userId);
      return ready;
    };

    return {
      async profileInfo() {
        await ensureReady();
        return {
          mode: profile.mode,
          name: profile.name,
          userId: profile.userId,
          backend: profile.backend,
          databasePath,
        };
      },
      async snippetCreate(input) {
        await ensureReady();
        const created = await createSnippet(context, input);
        return created && typeof created === "object" && "id" in created && typeof created.id === "string"
          ? getSnippet(context, created.id)
          : created;
      },
      async snippetList(query, tags) {
        await ensureReady();
        return listSnippets(context, { query, tags });
      },
      async snippetGet(snippetId) {
        await ensureReady();
        return getSnippet(context, snippetId);
      },
      async snippetUpdate(snippetId, input) {
        await ensureReady();
        return updateSnippet(context, snippetId, input);
      },
      async snippetDelete(snippetId) {
        await ensureReady();
        return deleteSnippet(context, snippetId);
      },
      async attachmentList(snippetId) {
        await ensureReady();
        return listSnippetAttachments(context, snippetId);
      },
      async attachmentUpload(snippetId, filePath, mimeType) {
        await ensureReady();
        const content = await readFile(filePath);
        const fileName = filePath.split("/").pop() ?? filePath;

        return uploadAttachment(context, {
          snippetId,
          fileName,
          fileSize: content.byteLength,
          mimeType: mimeType ?? guessMimeType(filePath),
          content: new Uint8Array(content),
        });
      },
      async attachmentDownload(attachmentId) {
        await ensureReady();
        return getAttachmentDownload(context, attachmentId);
      },
      async attachmentDelete(attachmentId) {
        await ensureReady();
        return deleteAttachment(context, attachmentId);
      },
      async storageGet() {
        await ensureReady();
        return {
          mode: "direct",
          activeBackend: profile.backend,
          connectionString: null,
          databasePath,
          attachmentsRoot: profile.attachmentsRoot ?? null,
        };
      },
      async storageSet(input) {
        const backend = parseStorageBackend(input.backend);

        const nextProfile = await updateProfile(profile.name, (currentProfile) => {
          if (currentProfile.mode !== "direct") {
            return currentProfile;
          }

          return {
            ...currentProfile,
            backend,
            connectionString: undefined,
          };
        });

        return {
          success: true,
          profile: nextProfile,
        };
      },
      async storageValidate() {
        await ensureReady();
        return {
          valid: true,
          backend: profile.backend,
          databasePath,
        };
      },
    };
  }

  const client = createHttpClient(profile.appUrl, profile.token);

  return {
    async profileInfo() {
      const info = await client.get<{ userId: string }>("/api/v1/auth/whoami");
      return { mode: profile.mode, name: profile.name, appUrl: profile.appUrl, ...info };
    },
    async snippetCreate(input) {
      const created = await client.post<{ id?: string }>("/api/v1/snippets", input);
      return created.id
        ? client.get(`/api/v1/snippets/${created.id}`)
        : created;
    },
    async snippetList(query, tags) {
      const search = new URLSearchParams();

      if (query) {
        search.set("query", query);
      }

      (tags ?? []).forEach((tag) => {
        search.append("tag", tag);
      });

      const suffix = search.toString();
      return client.get(`/api/v1/snippets${suffix ? `?${suffix}` : ""}`);
    },
    async snippetGet(snippetId) {
      return client.get(`/api/v1/snippets/${snippetId}`);
    },
    async snippetUpdate(snippetId, input) {
      return client.patch(`/api/v1/snippets/${snippetId}`, input);
    },
    async snippetDelete(snippetId) {
      return client.delete(`/api/v1/snippets/${snippetId}`);
    },
    async attachmentList(snippetId) {
      return client.get(`/api/v1/snippets/${snippetId}/attachments`);
    },
    async attachmentUpload(snippetId, filePath, mimeType) {
      const content = await readFile(filePath);
      const fileName = filePath.split("/").pop() ?? filePath;
      const form = new FormData();
      const file = new File([content], fileName, { type: mimeType ?? guessMimeType(filePath) });
      form.set("file", file);
      form.set("mimeType", mimeType ?? file.type);
      return client.postForm(`/api/v1/snippets/${snippetId}/attachments`, form);
    },
    async attachmentDownload(attachmentId) {
      return client.get(`/api/v1/attachments/${attachmentId}`);
    },
    async attachmentDelete(attachmentId) {
      return client.delete(`/api/v1/attachments/${attachmentId}`);
    },
    async storageGet() {
      return client.get("/api/v1/storage");
    },
    async storageSet(input) {
      return client.post("/api/v1/storage", input);
    },
    async storageValidate() {
      return client.get("/api/ready");
    },
  };
}
