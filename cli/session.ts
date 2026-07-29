import type { CacheProfile } from "@/cli/config";

export interface SessionIdentity {
  userId?: string;
}

export interface SessionStatus {
  authenticated: boolean;
  identity: SessionIdentity | null;
  profile: CacheProfile | null;
}

export function getInteractivePrompt(status: SessionStatus) {
  void status;
  return "> ";
}

export function renderSessionStatus(status: SessionStatus) {
  const lines = ["Cache shell", ""];

  if (!status.profile) {
    lines.push("Status: not configured");
    lines.push("Run /login to connect a remote profile or /help for more commands.");
    return lines.join("\n");
  }

  lines.push(`Profile: ${status.profile.name}`);
  lines.push(`Mode: ${status.profile.mode}`);

  if (status.profile.mode === "remote") {
    lines.push(`App: ${status.profile.appUrl}`);
  }

  if (status.authenticated) {
    lines.push(`Signed in: ${status.identity?.userId ?? "yes"}`);
  } else {
    lines.push("Signed in: no");
    lines.push("Run /login to start the browser sign-in flow.");
  }

  lines.push("Type /help to see slash commands.");

  return lines.join("\n");
}
