"use server";

import { redirect } from "next/navigation";
import { timingSafeEqual } from "node:crypto";
import { bootstrapOwnerAccount, isOwnerConfigured, signInWithPassword, signInWithSetupTokenToSession, signOut } from "@/lib/auth";
import { getEnv } from "@/lib/env";

export interface AuthSetupResult {
  ownerExists: boolean;
  setupEnabled: boolean;
}

export interface AuthActionResult {
  success: boolean;
  error?: string;
}

function isValidSetupToken(input: string) {
  const configuredToken = getEnv().OWNER_SETUP_TOKEN;

  if (!configuredToken) {
    throw new Error("OWNER_SETUP_TOKEN must be configured before creating the first owner");
  }

  const providedToken = input.trim();

  if (!providedToken) {
    throw new Error("Owner setup token is required");
  }

  const expected = Buffer.from(configuredToken);
  const provided = Buffer.from(providedToken);

  if (expected.length !== provided.length || !timingSafeEqual(expected, provided)) {
    throw new Error("Owner setup token is invalid");
  }
}

function validateCredentials(email: string, password: string) {
  const trimmedEmail = email.trim();
  const trimmedPassword = password.trim();

  if (!trimmedEmail) {
    throw new Error("Email is required");
  }

  if (!trimmedPassword) {
    throw new Error("Password is required");
  }

  if (trimmedPassword.length < 12) {
    throw new Error("Password must be at least 12 characters");
  }

  return {
    email: trimmedEmail,
    password: trimmedPassword,
  };
}

export async function getAuthSetup(): Promise<AuthSetupResult> {
  return {
    ownerExists: await isOwnerConfigured(),
    setupEnabled: Boolean(getEnv().OWNER_SETUP_TOKEN),
  };
}

export async function createOwner(input: { email: string; password: string; setupToken: string }): Promise<AuthActionResult> {
  try {
    const credentials = validateCredentials(input.email, input.password);
    isValidSetupToken(input.setupToken);
    await bootstrapOwnerAccount(credentials);
    return { success: true };
  } catch (error) {
    return {
      success: false,
      error: error instanceof Error ? error.message : "Failed to create owner account",
    };
  }
}

export async function signIn(input: { email: string; password: string }): Promise<AuthActionResult> {
  try {
    const email = input.email.trim();
    const password = input.password.trim();

    if (!email) {
      throw new Error("Email is required");
    }

    if (!password) {
      throw new Error("Password is required");
    }

    await signInWithPassword({ email, password });
    return { success: true };
  } catch (error) {
    return {
      success: false,
      error: error instanceof Error ? error.message : "Failed to sign in",
    };
  }
}

export async function signInWithSetupToken(input: { setupToken: string }): Promise<AuthActionResult> {
  try {
    const configuredToken = getEnv().OWNER_SETUP_TOKEN;

    if (!configuredToken) {
      throw new Error("OWNER_SETUP_TOKEN is not configured on this server");
    }

    const providedToken = input.setupToken.trim();

    if (!providedToken) {
      throw new Error("Setup token is required");
    }

    const expected = Buffer.from(configuredToken);
    const provided = Buffer.from(providedToken);

    if (expected.length !== provided.length || !timingSafeEqual(expected, provided)) {
      throw new Error("Setup token is invalid");
    }

    const ownerExists = await isOwnerConfigured();

    if (!ownerExists) {
      throw new Error("No owner account exists yet. Complete setup first.");
    }

    await signInWithSetupTokenToSession();
    return { success: true };
  } catch (error) {
    return {
      success: false,
      error: error instanceof Error ? error.message : "Failed to sign in with setup token",
    };
  }
}

export async function signOutAction() {
  await signOut();
  redirect("/sign-in");
}
