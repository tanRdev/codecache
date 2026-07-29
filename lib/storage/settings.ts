import { getEnv } from "@/lib/env";
import type { EffectiveStorageSettings, StorageBackendOption } from "@/lib/storage/types";

export function getStorageBackendLabel() {
  return "SQLite";
}

export function getStorageBackendOptions(): StorageBackendOption[] {
  return [
    {
      id: "sqlite",
      label: "SQLite",
      description: "App data and snippets live in local SQLite. Attachments stay on local filesystem.",
      privacy: "Your self-hosted server",
      attachments: "Local files",
      advanced: false,
      available: true,
      statusNote: null,
    },
  ];
}

export async function getEffectiveStorageSettings(userId: string): Promise<EffectiveStorageSettings> {
  void userId;
  return {
    activeBackend: "sqlite",
    availableBackends: getStorageBackendOptions(),
    backendLabel: getStorageBackendLabel(),
    publicConfig: {
      databasePath: getEnv().SQLITE_DATABASE_PATH,
      attachmentsRoot: getEnv().ATTACHMENTS_ROOT ?? null,
    },
    status: "ready",
    lastValidatedAt: null,
    lastError: null,
  };
}
