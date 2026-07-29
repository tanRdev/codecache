import type { CacheContext } from "@/lib/core/context";
import { createNotFoundError, createValidationError } from "@/lib/core/errors";
import * as sqlite from "@/lib/storage/sqlite";
import type {
  SearchSnippetsInput,
  SnippetRecord,
  UpdateSnippetRecordInput,
} from "@/lib/storage/types";

export interface CreateSnippetInput {
  title: string;
  description?: string;
  notes?: string;
  language: string;
  code: string;
  tags: string[];
}

const SNIPPET_LIMITS = {
  code: 1_000_000,
  description: 500,
  notes: 10_000,
  tag: 50,
  tags: 20,
  title: 200,
} as const;

function requireValue(value: string, message: string) {
  if (!value.trim()) {
    throw createValidationError(message);
  }

  return value.trim();
}

function requireCode(value: string) {
  if (!value.trim()) {
    throw createValidationError("Code is required");
  }

  return value;
}

function trimNullable(value: string | undefined) {
  const trimmed = value?.trim();
  return trimmed ? trimmed : null;
}

function validateLength(value: string | null | undefined, maximum: number, label: string) {
  if (value !== null && value !== undefined && value.length > maximum) {
    throw createValidationError(`${label} must be ${maximum} characters or fewer`);
  }
}

function validateTags(tags: string[] | undefined) {
  if (!tags) {
    return;
  }

  if (tags.length > SNIPPET_LIMITS.tags) {
    throw createValidationError(`Maximum ${SNIPPET_LIMITS.tags} tags allowed`);
  }

  for (const tag of tags) {
    validateLength(tag, SNIPPET_LIMITS.tag, "Each tag");
  }
}

export async function createSnippet(context: CacheContext, input: CreateSnippetInput) {
  const title = requireValue(input.title, "Title is required");
  const description = trimNullable(input.description);
  const notes = trimNullable(input.notes);
  const language = requireValue(input.language, "Language is required");
  const code = requireCode(input.code);

  validateLength(title, SNIPPET_LIMITS.title, "Title");
  validateLength(description, SNIPPET_LIMITS.description, "Description");
  validateLength(notes, SNIPPET_LIMITS.notes, "Notes");
  validateLength(code, SNIPPET_LIMITS.code, "Code");
  validateTags(input.tags);

  return sqlite.createSnippet({
    id: crypto.randomUUID(),
    userId: context.userId,
    title,
    description,
    notes,
    language,
    code,
    tags: input.tags,
  });
}

export async function updateSnippet(
  context: CacheContext,
  snippetId: string,
  input: UpdateSnippetRecordInput
) {
  const title = input.title !== undefined
    ? requireValue(input.title, "Title is required")
    : undefined;
  const description = input.description !== undefined
    ? trimNullable(input.description ?? undefined)
    : undefined;
  const notes = input.notes !== undefined
    ? trimNullable(input.notes ?? undefined)
    : undefined;
  const language = input.language !== undefined
    ? requireValue(input.language, "Language is required")
    : undefined;
  const code = input.code !== undefined ? requireCode(input.code) : undefined;

  validateLength(title, SNIPPET_LIMITS.title, "Title");
  validateLength(description, SNIPPET_LIMITS.description, "Description");
  validateLength(notes, SNIPPET_LIMITS.notes, "Notes");
  validateLength(code, SNIPPET_LIMITS.code, "Code");
  validateTags(input.tags);

  const updated = await sqlite.updateSnippet(context.userId, snippetId, {
    title,
    description,
    notes,
    language,
    code,
    tags: input.tags,
  });

  if (!updated) {
    throw createNotFoundError("Snippet not found or access denied");
  }

  return { success: true };
}

export async function deleteSnippet(context: CacheContext, snippetId: string) {
  const deleted = await sqlite.deleteSnippet(context.userId, snippetId);

  if (!deleted) {
    throw createNotFoundError("Snippet not found or access denied");
  }

  return { success: true };
}

export async function getSnippet(context: CacheContext, snippetId: string): Promise<SnippetRecord> {
  const snippet = await sqlite.getSnippetById(context.userId, snippetId);

  if (!snippet) {
    throw createNotFoundError("Snippet not found");
  }

  return snippet;
}

export async function getSnippetById(context: CacheContext, snippetId: string): Promise<SnippetRecord | null> {
  return sqlite.getSnippetById(context.userId, snippetId);
}

export async function listSnippets(context: CacheContext, input?: SearchSnippetsInput) {
  return sqlite.listSnippets(context.userId, input);
}

export async function getSnippetTags(context: CacheContext, snippetId: string) {
  return sqlite.getSnippetTags(snippetId);
}

export async function getUserTags(context: CacheContext) {
  return sqlite.getUserTags(context.userId);
}
