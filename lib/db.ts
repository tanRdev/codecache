import type { InferInsertModel, InferSelectModel } from "drizzle-orm";
import {
  apiTokensTable,
  attachmentsTable,
  browserLoginExchangesTable,
  pendingAttachmentUploadsTable,
  sessionsTable,
  snippetTagsTable,
  snippetsTable,
  usersTable,
} from "@/lib/drizzle/schema";

export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[];

export type User = InferSelectModel<typeof usersTable>;
export type Session = InferSelectModel<typeof sessionsTable>;
export type Snippet = InferSelectModel<typeof snippetsTable>;
export type SnippetTag = InferSelectModel<typeof snippetTagsTable>;
export type Attachment = Omit<InferSelectModel<typeof attachmentsTable>, "file_size"> & {
  file_size: number;
};
export type PendingAttachmentUpload = Omit<InferSelectModel<typeof pendingAttachmentUploadsTable>, "file_size"> & {
  file_size: number;
};
export type ApiToken = InferSelectModel<typeof apiTokensTable>;
export type BrowserLoginExchange = InferSelectModel<typeof browserLoginExchangesTable>;

export type NewUser = InferInsertModel<typeof usersTable>;
export type NewSession = InferInsertModel<typeof sessionsTable>;
export type NewSnippet = InferInsertModel<typeof snippetsTable>;
export type UpdateSnippet = Partial<NewSnippet>;
export type NewSnippetTag = InferInsertModel<typeof snippetTagsTable>;
export type NewAttachment = InferInsertModel<typeof attachmentsTable>;
export type NewPendingAttachmentUpload = InferInsertModel<typeof pendingAttachmentUploadsTable>;
export type NewApiToken = InferInsertModel<typeof apiTokensTable>;
export type NewBrowserLoginExchange = InferInsertModel<typeof browserLoginExchangesTable>;
