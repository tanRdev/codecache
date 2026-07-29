import { index, integer, sqliteTable, text, uniqueIndex } from "drizzle-orm/sqlite-core";

export const usersTable = sqliteTable(
  "users",
  {
    id: text("id").primaryKey(),
    email: text("email").notNull(),
    password_hash: text("password_hash").notNull(),
    created_at: text("created_at").notNull(),
    updated_at: text("updated_at").notNull(),
  },
  (table) => ({
    emailUniqueIdx: uniqueIndex("users_email_unique_idx").on(table.email),
  })
);

export const sessionsTable = sqliteTable(
  "sessions",
  {
    id: text("id").primaryKey(),
    user_id: text("user_id").notNull().references(() => usersTable.id, { onDelete: "cascade" }),
    expires_at: text("expires_at").notNull(),
    created_at: text("created_at").notNull(),
  },
  (table) => ({
    userIdIdx: index("sessions_user_id_idx").on(table.user_id),
  })
);

export const snippetsTable = sqliteTable(
  "snippets",
  {
    id: text("id").primaryKey(),
    user_id: text("user_id").notNull().references(() => usersTable.id, { onDelete: "cascade" }),
    title: text("title").notNull(),
    description: text("description"),
    notes: text("notes"),
    language: text("language").notNull(),
    code: text("code").notNull(),
    search_text: text("search_text").notNull(),
    created_at: text("created_at").notNull(),
    updated_at: text("updated_at").notNull(),
  },
  (table) => ({
    userIdIdx: index("snippets_user_id_idx").on(table.user_id),
  })
);

export const snippetTagsTable = sqliteTable(
  "snippet_tags",
  {
    id: text("id").primaryKey(),
    snippet_id: text("snippet_id").notNull().references(() => snippetsTable.id, { onDelete: "cascade" }),
    tag: text("tag").notNull(),
    created_at: text("created_at").notNull(),
  },
  (table) => ({
    snippetIdIdx: index("snippet_tags_snippet_id_idx").on(table.snippet_id),
  })
);

export const attachmentsTable = sqliteTable(
  "attachments",
  {
    id: text("id").primaryKey(),
    snippet_id: text("snippet_id").notNull().references(() => snippetsTable.id, { onDelete: "cascade" }),
    storage_key: text("storage_key").notNull(),
    file_name: text("file_name").notNull(),
    file_size: integer("file_size").notNull(),
    mime_type: text("mime_type").notNull(),
    created_at: text("created_at").notNull(),
  },
  (table) => ({
    snippetIdIdx: index("attachments_snippet_id_idx").on(table.snippet_id),
  })
);

export const pendingAttachmentUploadsTable = sqliteTable(
  "pending_attachment_uploads",
  {
    file_id: text("file_id").primaryKey(),
    user_id: text("user_id").notNull().references(() => usersTable.id, { onDelete: "cascade" }),
    snippet_id: text("snippet_id").notNull().references(() => snippetsTable.id, { onDelete: "cascade" }),
    storage_key: text("storage_key").notNull(),
    file_name: text("file_name").notNull(),
    file_size: integer("file_size").notNull(),
    mime_type: text("mime_type").notNull(),
    expires_at: text("expires_at").notNull(),
    created_at: text("created_at").notNull(),
  }
);

export const apiTokensTable = sqliteTable(
  "api_tokens",
  {
    id: text("id").primaryKey(),
    user_id: text("user_id").notNull().references(() => usersTable.id, { onDelete: "cascade" }),
    name: text("name").notNull(),
    token_prefix: text("token_prefix").notNull(),
    token_hash: text("token_hash").notNull(),
    last_used_at: text("last_used_at"),
    created_at: text("created_at").notNull(),
    updated_at: text("updated_at").notNull(),
  },
  (table) => ({
    tokenHashUniqueIdx: uniqueIndex("api_tokens_token_hash_unique_idx").on(table.token_hash),
    userIdIdx: index("api_tokens_user_id_idx").on(table.user_id),
  })
);

export const browserLoginExchangesTable = sqliteTable(
  "browser_login_exchanges",
  {
    id: text("id").primaryKey(),
    user_id: text("user_id").notNull().references(() => usersTable.id, { onDelete: "cascade" }),
    code_hash: text("code_hash").notNull(),
    encrypted_payload: text("encrypted_payload").notNull(),
    expires_at: text("expires_at").notNull(),
    consumed_at: text("consumed_at"),
    created_at: text("created_at").notNull(),
  },
  (table) => ({
    codeHashUniqueIdx: uniqueIndex("browser_login_exchanges_code_hash_unique_idx").on(table.code_hash),
    userIdIdx: index("browser_login_exchanges_user_id_idx").on(table.user_id),
  })
);
