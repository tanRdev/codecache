"use server";

import { Effect } from "effect";
import { eq } from "drizzle-orm";
import { checkRateLimit } from "@/lib/rate-limit";
import { getDb } from "@/lib/drizzle";
import { usersTable } from "@/lib/drizzle/schema";
import { signOut } from "@/lib/auth";
import {
  createActionFailure,
  requireUserIdEffect,
  runServerAction,
  tryPromiseEffect,
} from "@/lib/effect/server-actions";

export interface DeleteAccountResult {
  success: boolean;
  message?: string;
  error?: string;
}

export async function deleteAccount(): Promise<DeleteAccountResult> {
  return runServerAction<void, unknown, DeleteAccountResult>({
    effect: Effect.gen(function* () {
      const userId = yield* requireUserIdEffect("You must be signed in to delete your account");
      const rl = checkRateLimit(`account-delete:${userId}`, 3, 60 * 60 * 1000);

      if (!rl.allowed) {
        throw new Error("Too many deletion attempts. Please try again later.");
      }

      yield* tryPromiseEffect(async () => {
        const db = getDb();
        await db.delete(usersTable).where(eq(usersTable.id, userId));
        await signOut();
      });
    }).pipe(
      Effect.tapError((error) =>
        Effect.sync(() => {
          console.error("Error deleting account:", error);
        })
      )
    ),
    onSuccess: () => ({ success: true, message: "Account deleted successfully" }),
    onFailure: (error) => createActionFailure(error, "Failed to delete account"),
  });
}
