import { mkdir, readFile, rename, rm, writeFile } from "node:fs/promises";
import path from "node:path";
import { and, desc, eq, inArray, sql } from "drizzle-orm";
import { getDb, setDatabasePathOverride } from "@/lib/drizzle";
import {
  attachmentsTable,
  pendingAttachmentUploadsTable,
  snippetTagsTable,
  snippetsTable,
  usersTable,
} from "@/lib/drizzle/schema";
import { getEnv } from "@/lib/env";
import type { Attachment } from "@/lib/db";
import type {
  CreateAttachmentRecordInput,
  CreateSnippetRecordInput,
  PendingAttachmentUploadRecord,
  SearchSnippetsInput,
  SnippetRecord,
  UpdateSnippetRecordInput,
} from "@/lib/storage/types";

type SnippetRow = typeof snippetsTable.$inferSelect;

let attachmentsRootOverride: string | undefined;

export function configureLocalStorage(input: {
  attachmentsRoot?: string;
  databasePath: string;
}) {
  setDatabasePathOverride(input.databasePath);
  attachmentsRootOverride =
    input.attachmentsRoot ?? path.join(path.dirname(input.databasePath), "attachments");
}

export async function ensureLocalUser(userId: string) {
  const now = new Date().toISOString();

  await getDb()
    .insert(usersTable)
    .values({
      id: userId,
      email: `local-${userId}@cache.invalid`,
      password_hash: "local-profile",
      created_at: now,
      updated_at: now,
    })
    .onConflictDoNothing();
}

function normalizeTags(tags: string[]) {
  return tags.map((tag) => tag.trim().toLowerCase()).filter(Boolean);
}

/**
 * Escapes LIKE wildcards (and the escape character itself) so user-supplied
 * search terms are matched literally. Paired with `ESCAPE '\'` in the query.
 */
function escapeLikeTerm(term: string) {
  return term.replace(/[\\%_]/g, (char) => `\\${char}`);
}

function buildSearchText(input: {
  code: string;
  description: string | null;
  language: string;
  notes: string | null;
  tags: string[];
  title: string;
}) {
  return [
    input.title,
    input.description ?? "",
    input.notes ?? "",
    input.language,
    input.code,
    ...input.tags,
  ]
    .join(" ")
    .trim()
    .toLowerCase();
}

function toSnippetRecord(snippet: SnippetRow, tags: string[]): SnippetRecord {
  return {
    id: snippet.id,
    user_id: snippet.user_id,
    title: snippet.title,
    description: snippet.description,
    notes: snippet.notes,
    language: snippet.language,
    code: snippet.code,
    search_text: snippet.search_text,
    created_at: snippet.created_at,
    updated_at: snippet.updated_at,
    tags,
  };
}

function getAttachmentsRoot() {
  if (attachmentsRootOverride) {
    return attachmentsRootOverride;
  }

  return getEnv().ATTACHMENTS_ROOT ?? path.join(path.dirname(getEnv().SQLITE_DATABASE_PATH), "attachments");
}

function getAttachmentPath(storageKey: string) {
  const root = path.resolve(getAttachmentsRoot());
  const attachmentPath = path.resolve(root, storageKey);

  if (attachmentPath !== root && !attachmentPath.startsWith(`${root}${path.sep}`)) {
    throw new Error("Attachment storage key escapes the configured attachment directory");
  }

  return attachmentPath;
}

async function getSnippetTagsByIds(snippetIds: string[]) {
  const tagMap = new Map<string, string[]>();

  if (snippetIds.length === 0) {
    return tagMap;
  }

  const db = getDb();
  const rows = await db
    .select({ snippetId: snippetTagsTable.snippet_id, tag: snippetTagsTable.tag })
    .from(snippetTagsTable)
    .where(inArray(snippetTagsTable.snippet_id, snippetIds))
    .orderBy(snippetTagsTable.created_at);

  for (const row of rows) {
    const tags = tagMap.get(row.snippetId);
    if (tags) {
      tags.push(row.tag);
      continue;
    }
    tagMap.set(row.snippetId, [row.tag]);
  }

  return tagMap;
}

async function getOwnedSnippet(userId: string, snippetId: string) {
  const db = getDb();
  const rows = await db
    .select()
    .from(snippetsTable)
    .where(and(eq(snippetsTable.id, snippetId), eq(snippetsTable.user_id, userId)))
    .limit(1);

  return rows[0] ?? null;
}

async function getOwnedAttachment(userId: string, attachmentId: string) {
  const db = getDb();
  const rows = await db
    .select({
      id: attachmentsTable.id,
      snippet_id: attachmentsTable.snippet_id,
      storage_key: attachmentsTable.storage_key,
      file_name: attachmentsTable.file_name,
      file_size: attachmentsTable.file_size,
      mime_type: attachmentsTable.mime_type,
      created_at: attachmentsTable.created_at,
      user_id: snippetsTable.user_id,
    })
    .from(attachmentsTable)
    .innerJoin(snippetsTable, eq(snippetsTable.id, attachmentsTable.snippet_id))
    .where(and(eq(attachmentsTable.id, attachmentId), eq(snippetsTable.user_id, userId)))
    .limit(1);

  const row = rows[0];

  if (!row) {
    return null;
  }

  return {
    id: row.id,
    snippet_id: row.snippet_id,
    storage_key: row.storage_key,
    file_name: row.file_name,
    file_size: row.file_size,
    mime_type: row.mime_type,
    created_at: row.created_at,
  } satisfies Attachment;
}

export async function listSnippets(userId: string, input?: SearchSnippetsInput) {
  const db = getDb();
  const filters = [eq(snippetsTable.user_id, userId)];
  const query = input?.query?.trim();

  if (query) {
    for (const term of query.toLowerCase().split(/\s+/).filter(Boolean)) {
      filters.push(
        sql`${snippetsTable.search_text} LIKE ${`%${escapeLikeTerm(term)}%`} ESCAPE '\\'`
      );
    }
  }

  if (input?.tags && input.tags.length > 0) {
    const tagRows = await db
      .select({ snippetId: snippetTagsTable.snippet_id })
      .from(snippetTagsTable)
      .where(inArray(snippetTagsTable.tag, normalizeTags(input.tags)));

    const snippetIds = [...new Set(tagRows.map((row) => row.snippetId))];

    if (snippetIds.length === 0) {
      return [];
    }

    filters.push(inArray(snippetsTable.id, snippetIds));
  }

  const rows = await db
    .select()
    .from(snippetsTable)
    .where(and(...filters))
    .orderBy(desc(snippetsTable.created_at));

  const tagsBySnippetId = await getSnippetTagsByIds(rows.map((row) => row.id));

  return rows.map((row) => toSnippetRecord(row, tagsBySnippetId.get(row.id) ?? []));
}

export async function getUserTags(userId: string) {
  const db = getDb();
  const snippetRows = await db
    .select({ id: snippetsTable.id })
    .from(snippetsTable)
    .where(eq(snippetsTable.user_id, userId));

  if (snippetRows.length === 0) {
    return [];
  }

  const rows = await db
    .select({ tag: snippetTagsTable.tag })
    .from(snippetTagsTable)
    .where(inArray(snippetTagsTable.snippet_id, snippetRows.map((row) => row.id)))
    .orderBy(snippetTagsTable.tag);

  return [...new Set(rows.map((row) => row.tag))];
}

export async function getSnippetTags(snippetId: string) {
  const db = getDb();
  const rows = await db
    .select({ tag: snippetTagsTable.tag })
    .from(snippetTagsTable)
    .where(eq(snippetTagsTable.snippet_id, snippetId))
    .orderBy(snippetTagsTable.created_at);

  return rows.map((row) => row.tag);
}

export async function getSnippetById(userId: string, snippetId: string): Promise<SnippetRecord | null> {
  const snippet = await getOwnedSnippet(userId, snippetId);

  if (!snippet) {
    return null;
  }

  const tags = await getSnippetTags(snippetId);
  return toSnippetRecord(snippet, tags);
}

export async function createSnippet(input: CreateSnippetRecordInput) {
  const db = getDb();
  const now = new Date().toISOString();
  const tags = normalizeTags(input.tags);

  db.transaction((tx) => {
    tx.insert(snippetsTable).values({
      id: input.id,
      user_id: input.userId,
      title: input.title,
      description: input.description,
      notes: input.notes,
      language: input.language,
      code: input.code,
      search_text: buildSearchText({
        code: input.code,
        description: input.description,
        language: input.language,
        notes: input.notes,
        tags,
        title: input.title,
      }),
      created_at: now,
      updated_at: now,
    }).run();

    if (tags.length > 0) {
      tx.insert(snippetTagsTable).values(
        tags.map((tag) => ({
          id: crypto.randomUUID(),
          snippet_id: input.id,
          tag,
          created_at: now,
        }))
      ).run();
    }
  });

  return { id: input.id };
}

export async function updateSnippet(userId: string, snippetId: string, input: UpdateSnippetRecordInput) {
  const db = getDb();
  const existing = await getOwnedSnippet(userId, snippetId);

  if (!existing) {
    return false;
  }

  const title = input.title ?? existing.title;
  const description = input.description !== undefined ? input.description : existing.description;
  const notes = input.notes !== undefined ? input.notes : existing.notes;
  const language = input.language ?? existing.language;
  const code = input.code ?? existing.code;
  const tags = input.tags !== undefined
    ? normalizeTags(input.tags)
    : await getSnippetTags(snippetId);

  db.transaction((tx) => {
    tx.update(snippetsTable)
      .set({
        title,
        description,
        notes,
        language,
        code,
        search_text: buildSearchText({
          code,
          description,
          language,
          notes,
          tags,
          title,
        }),
        updated_at: new Date().toISOString(),
      })
      .where(and(eq(snippetsTable.id, snippetId), eq(snippetsTable.user_id, userId)))
      .run();

    if (input.tags !== undefined) {
      tx.delete(snippetTagsTable).where(eq(snippetTagsTable.snippet_id, snippetId)).run();
      if (tags.length > 0) {
        const now = new Date().toISOString();
        tx.insert(snippetTagsTable).values(
          tags.map((tag) => ({
            id: crypto.randomUUID(),
            snippet_id: snippetId,
            tag,
            created_at: now,
          }))
        ).run();
      }
    }
  });

  return true;
}

export async function deleteSnippet(userId: string, snippetId: string) {
  const existing = await getOwnedSnippet(userId, snippetId);

  if (!existing) {
    return false;
  }

  const attachments = await listAttachments(userId, snippetId);

  // Delete the row first (attachment rows cascade); a filesystem failure during
  // cleanup below can only orphan files, never rows pointing at missing files.
  const db = getDb();
  await db.delete(snippetsTable).where(and(eq(snippetsTable.id, snippetId), eq(snippetsTable.user_id, userId)));

  for (const attachment of attachments) {
    await rm(getAttachmentPath(attachment.storage_key), { force: true });
  }

  return true;
}

export async function listAttachments(userId: string, snippetId: string) {
  const snippet = await getOwnedSnippet(userId, snippetId);

  if (!snippet) {
    return [];
  }

  const db = getDb();
  return db
    .select()
    .from(attachmentsTable)
    .where(eq(attachmentsTable.snippet_id, snippetId))
    .orderBy(desc(attachmentsTable.created_at));
}

export async function getAttachmentById(userId: string, attachmentId: string) {
  return getOwnedAttachment(userId, attachmentId);
}

export async function saveAttachment(input: CreateAttachmentRecordInput) {
  const db = getDb();
  await db.insert(attachmentsTable).values({
    id: input.id,
    snippet_id: input.snippetId,
    storage_key: input.storageKey,
    file_name: input.fileName,
    file_size: input.fileSize,
    mime_type: input.mimeType,
    created_at: new Date().toISOString(),
  });

  const attachment = await getAttachmentById(input.userId, input.id);

  if (!attachment) {
    throw new Error("Failed to save attachment");
  }

  return attachment;
}

export async function savePendingAttachmentUpload(input: PendingAttachmentUploadRecord) {
  const db = getDb();
  db.transaction((tx) => {
    tx.delete(pendingAttachmentUploadsTable).where(eq(pendingAttachmentUploadsTable.file_id, input.fileId)).run();
    tx.insert(pendingAttachmentUploadsTable).values({
      file_id: input.fileId,
      user_id: input.userId,
      snippet_id: input.snippetId,
      storage_key: input.storageKey,
      file_name: input.fileName,
      file_size: input.fileSize,
      mime_type: input.mimeType,
      expires_at: input.expiresAt,
      created_at: new Date().toISOString(),
    }).run();
  });
}

export async function getPendingAttachmentUpload(userId: string, fileId: string) {
  const db = getDb();
  const rows = await db
    .select()
    .from(pendingAttachmentUploadsTable)
    .where(and(eq(pendingAttachmentUploadsTable.file_id, fileId), eq(pendingAttachmentUploadsTable.user_id, userId)))
    .limit(1);

  const upload = rows[0];

  if (!upload) {
    return null;
  }

  if (new Date(upload.expires_at).getTime() <= Date.now()) {
    await deletePendingAttachmentUpload(userId, fileId);
    return null;
  }

  return {
    fileId: upload.file_id,
    userId: upload.user_id,
    snippetId: upload.snippet_id,
    storageKey: upload.storage_key,
    fileName: upload.file_name,
    fileSize: upload.file_size,
    mimeType: upload.mime_type,
    expiresAt: upload.expires_at,
  };
}

export async function deletePendingAttachmentUpload(userId: string, fileId: string) {
  const db = getDb();
  await db
    .delete(pendingAttachmentUploadsTable)
    .where(and(eq(pendingAttachmentUploadsTable.file_id, fileId), eq(pendingAttachmentUploadsTable.user_id, userId)));
}

export async function storeAttachmentBinary(
  _userId: string,
  _attachmentId: string,
  storageKey: string,
  content: Uint8Array,
) {
  const absolutePath = getAttachmentPath(storageKey);
  const temporaryPath = `${absolutePath}.${crypto.randomUUID()}.tmp`;
  await mkdir(path.dirname(absolutePath), { recursive: true });

  try {
    await writeFile(temporaryPath, Buffer.from(content), { mode: 0o600 });
    await rename(temporaryPath, absolutePath);
  } catch (error) {
    await rm(temporaryPath, { force: true });
    throw error;
  }
}

export async function deleteAttachment(userId: string, attachmentId: string) {
  const attachment = await getOwnedAttachment(userId, attachmentId);

  if (!attachment) {
    return false;
  }

  // Delete the row first so a filesystem failure below can only orphan the
  // file, never leave a row pointing at a missing file.
  const db = getDb();
  await db.delete(attachmentsTable).where(eq(attachmentsTable.id, attachmentId));

  await rm(getAttachmentPath(attachment.storage_key), { force: true });
  return true;
}

export async function getAttachmentDownloadTarget(userId: string, attachmentId: string) {
  const attachment = await getOwnedAttachment(userId, attachmentId);

  if (!attachment) {
    return null;
  }

  const content = await readFile(getAttachmentPath(attachment.storage_key));

  return {
    kind: "blob" as const,
    fileName: attachment.file_name,
    mimeType: attachment.mime_type,
    contentBase64: content.toString("base64"),
  };
}
