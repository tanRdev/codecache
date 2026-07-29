"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { Effect } from "effect";
import { isCacheError } from "@/lib/core/errors";
import {
  createSnippet as createSnippetRecord,
  deleteSnippet as deleteSnippetRecord,
  getSnippetById,
  updateSnippet as updateSnippetRecord,
} from "@/lib/core/services/snippets";
import {
  createActionFailure,
  requireUserIdEffect,
  runServerAction,
  tryPromiseEffect,
} from "@/lib/effect/server-actions";

export interface CreateSnippetInput {
  title: string;
  description?: string;
  notes?: string;
  language: string;
  code: string;
  tags: string[];
}

export interface CreateSnippetResult {
  success: boolean;
  snippetId?: string;
  error?: string;
}

export interface UpdateSnippetInput {
  title?: string;
  description?: string;
  notes?: string;
  language?: string;
  code?: string;
  tags?: string[];
}

export interface UpdateSnippetResult {
  success: boolean;
  error?: string;
}

export interface DeleteSnippetResult {
  success: boolean;
  error?: string;
}

export interface GetSnippetResult {
  success: boolean;
  snippet?: {
    id: string;
    title: string;
    description: string | null;
    notes: string | null;
    language: string;
    code: string;
    tags: string[];
    created_at: string;
    updated_at: string;
  };
  error?: string;
}

export async function getSnippet(snippetId: string): Promise<GetSnippetResult> {
  return runServerAction<NonNullable<Awaited<ReturnType<typeof getSnippetById>>>, unknown, GetSnippetResult>({
    effect: Effect.gen(function* () {
      const userId = yield* requireUserIdEffect("You must be signed in to view this snippet");
      const snippet = yield* tryPromiseEffect(() => getSnippetById({ userId }, snippetId));

      if (!snippet) {
        return yield* Effect.fail(new Error("Snippet not found"));
      }

      return snippet;
    }),
    onSuccess: (snippet) => ({
      success: true,
      snippet: {
        id: snippet.id,
        title: snippet.title,
        description: snippet.description,
        notes: snippet.notes,
        language: snippet.language,
        code: snippet.code,
        tags: snippet.tags,
        created_at: snippet.created_at,
        updated_at: snippet.updated_at,
      },
    }),
    onFailure: (error) => createActionFailure(error, "An unexpected error occurred"),
  });
}

/**
 * Server action to create a new snippet with tags
 */
export async function createSnippet(
  input: CreateSnippetInput
): Promise<CreateSnippetResult> {
  return runServerAction<Awaited<ReturnType<typeof createSnippetRecord>>, unknown, CreateSnippetResult>({
    effect: Effect.gen(function* () {
      const userId = yield* requireUserIdEffect("You must be signed in to create a snippet");
      const result = yield* tryPromiseEffect(() => createSnippetRecord({ userId }, input));

      yield* Effect.sync(() => {
        revalidatePath("/dashboard");
      });

      return result;
    }).pipe(
      Effect.tapError((error) =>
        Effect.sync(() => {
          if (isCacheError(error)) {
            return;
          }

          console.error("Unexpected error creating snippet:", error);
        })
      )
    ),
    onSuccess: (result) => ({ success: true, snippetId: result.id }),
    onFailure: (error) => createActionFailure(error, "An unexpected error occurred"),
  });
}

/**
 * Server action to create a snippet and redirect to the detail page
 */
export async function createSnippetAndRedirect(
  input: CreateSnippetInput
): Promise<void> {
  const result = await createSnippet(input);

  if (result.success && result.snippetId) {
    redirect(`/snippets/${result.snippetId}`);
  }

  // If not successful, the error is returned but we can't redirect
  // The form component will handle displaying the error
}

/**
 * Server action to update a snippet
 */
export async function updateSnippet(
  snippetId: string,
  input: UpdateSnippetInput
): Promise<UpdateSnippetResult> {
  return runServerAction<void, unknown, UpdateSnippetResult>({
    effect: Effect.gen(function* () {
      const userId = yield* requireUserIdEffect("You must be signed in to update a snippet");
      yield* tryPromiseEffect(() => updateSnippetRecord({ userId }, snippetId, input));

      yield* Effect.sync(() => {
        revalidatePath("/dashboard");
        revalidatePath(`/snippets/${snippetId}`);
      });

      return undefined;
    }).pipe(
      Effect.tapError((error) =>
        Effect.sync(() => {
          if (isCacheError(error)) {
            return;
          }

          console.error("Unexpected error updating snippet:", error);
        })
      )
    ),
    onSuccess: () => ({ success: true }),
    onFailure: (error) => createActionFailure(error, "An unexpected error occurred"),
  });
}

/**
 * Server action to delete a snippet
 */
export async function deleteSnippet(
  snippetId: string
): Promise<DeleteSnippetResult> {
  return runServerAction<void, unknown, DeleteSnippetResult>({
    effect: Effect.gen(function* () {
      const userId = yield* requireUserIdEffect("You must be signed in to delete a snippet");
      yield* tryPromiseEffect(() => deleteSnippetRecord({ userId }, snippetId));

      yield* Effect.sync(() => {
        revalidatePath("/dashboard");
        revalidatePath(`/snippets/${snippetId}`);
      });

      return undefined;
    }).pipe(
      Effect.tapError((error) =>
        Effect.sync(() => {
          if (isCacheError(error)) {
            return;
          }

          console.error("Unexpected error deleting snippet:", error);
        })
      )
    ),
    onSuccess: () => ({ success: true }),
    onFailure: (error) => createActionFailure(error, "An unexpected error occurred"),
  });
}
