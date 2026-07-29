import { mkdir, readFile, rename, writeFile } from "node:fs/promises";
import os from "node:os";
import path from "node:path";
import { Effect } from "effect";
import type { StorageBackend } from "@/lib/storage/types";
import { ConfigError, FileSystemError, tryFileRead, tryFileWrite, tryParseJson } from "@/lib/effect/cli";

export type ProfileMode = "direct" | "remote";

export interface DirectProfile {
  attachmentsRoot?: string;
  backend: StorageBackend;
  connectionString?: string;
  databasePath?: string;
  name: string;
  mode: "direct";
  userId: string;
}

export interface RemoteProfile {
  name: string;
  mode: "remote";
  appUrl: string;
  token: string;
}

export type CacheProfile = DirectProfile | RemoteProfile;

interface CacheConfigFile {
  currentProfileName: string | null;
  profiles: CacheProfile[];
}

function getConfigDir() {
  if (process.env.CACHE_CLI_CONFIG_DIR) {
    return process.env.CACHE_CLI_CONFIG_DIR;
  }

  if (process.platform === "darwin") {
    return path.join(os.homedir(), "Library", "Application Support", "Cache");
  }

  if (process.platform === "win32") {
    return path.join(process.env.LOCALAPPDATA ?? os.homedir(), "Cache");
  }

  return path.join(process.env.XDG_CONFIG_HOME ?? path.join(os.homedir(), ".config"), "cache");
}

function getConfigPath() {
  return path.join(getConfigDir(), "profiles.json");
}

function getDefaultDataRoot() {
  if (process.platform === "darwin") {
    return path.join(os.homedir(), "Library", "Application Support", "Cache");
  }

  if (process.platform === "win32") {
    return path.join(process.env.LOCALAPPDATA ?? os.homedir(), "Cache");
  }

  return path.join(process.env.XDG_DATA_HOME ?? path.join(os.homedir(), ".local", "share"), "cache");
}

export function getDefaultDatabasePath(profileName = "local") {
  const safeName = profileName.replace(/[^a-zA-Z0-9._-]/g, "-") || "local";
  return path.join(getDefaultDataRoot(), `${safeName}.sqlite`);
}

async function readConfig(): Promise<CacheConfigFile> {
  try {
    const content = await readFile(getConfigPath(), "utf8");
    const parsed = JSON.parse(content);

    if (!parsed || typeof parsed !== "object") {
      return { currentProfileName: null, profiles: [] };
    }

    const currentProfileName = typeof parsed.currentProfileName === "string"
      ? parsed.currentProfileName
      : null;

    const rawProfiles: unknown[] = Array.isArray(parsed.profiles) ? parsed.profiles : [];
    const profiles = rawProfiles.filter((profile): profile is CacheProfile => {
      if (!profile || typeof profile !== "object") {
        return false;
      }

      if (!("name" in profile) || !("mode" in profile)) {
        return false;
      }

      if (profile.mode === "direct") {
        return "userId" in profile;
      }

      if (profile.mode === "remote") {
        return "appUrl" in profile && "token" in profile;
      }

      return false;
    });

    return {
      currentProfileName,
      profiles,
    };
  } catch (error) {
    if (error && typeof error === "object" && "code" in error && error.code === "ENOENT") {
      return { currentProfileName: null, profiles: [] };
    }

    throw new Error(
      `Unable to read Cache configuration at ${getConfigPath()}: ${
        error instanceof Error ? error.message : "unknown error"
      }`
    );
  }
}

function readConfigEffect(): Effect.Effect<CacheConfigFile, FileSystemError> {
  const configPath = getConfigPath();

  return tryFileRead(configPath).pipe(
    Effect.flatMap((content) => tryParseJson<CacheConfigFile>(content, configPath)),
    Effect.flatMap((parsed) => {
      if (!parsed || typeof parsed !== "object") {
        return Effect.succeed({ currentProfileName: null, profiles: [] });
      }

      const currentProfileName = typeof parsed.currentProfileName === "string"
        ? parsed.currentProfileName
        : null;

      const rawProfiles: unknown[] = Array.isArray(parsed.profiles) ? parsed.profiles : [];
      const profiles = rawProfiles.filter((profile): profile is CacheProfile => {
        if (!profile || typeof profile !== "object") {
          return false;
        }

        if (!("name" in profile) || !("mode" in profile)) {
          return false;
        }

        if (profile.mode === "direct") {
          return "userId" in profile;
        }

        if (profile.mode === "remote") {
          return "appUrl" in profile && "token" in profile;
        }

        return false;
      });

      return Effect.succeed({
        currentProfileName,
        profiles,
      });
    }),
    Effect.catchAll((error) => {
      // If file doesn't exist or is invalid, return empty config
      if (error.operation === "read" || error.operation === "parse") {
        return Effect.succeed({ currentProfileName: null, profiles: [] });
      }
      return Effect.fail(error);
    })
  );
}

async function writeConfig(config: CacheConfigFile) {
  await mkdir(getConfigDir(), { recursive: true });
  const configPath = getConfigPath();
  const temporaryPath = `${configPath}.${process.pid}.tmp`;
  await writeFile(temporaryPath, `${JSON.stringify(config, null, 2)}\n`, {
    encoding: "utf8",
    mode: 0o600,
  });
  await rename(temporaryPath, configPath);
}

function writeConfigEffect(config: CacheConfigFile): Effect.Effect<void, FileSystemError> {
  const configPath = getConfigPath();
  const content = `${JSON.stringify(config, null, 2)}\n`;

  return tryFileWrite(configPath, content);
}

function normalizeRemoteProfile(profile: RemoteProfile): RemoteProfile {
  return {
    ...profile,
    appUrl: new URL(profile.appUrl).toString(),
  };
}

export async function listProfiles() {
  const config = await readConfig();
  return config.profiles;
}

export function listProfilesEffect(): Effect.Effect<CacheProfile[], FileSystemError> {
  return readConfigEffect().pipe(
    Effect.map((config) => config.profiles)
  );
}

export async function createProfile(profile: CacheProfile) {
  const config = await readConfig();
  const nextProfile = profile.mode === "remote" ? normalizeRemoteProfile(profile) : profile;
  const remainingProfiles = config.profiles.filter((item) => item.name !== nextProfile.name);
  const nextConfig: CacheConfigFile = {
    currentProfileName: config.currentProfileName ?? nextProfile.name,
    profiles: [...remainingProfiles, nextProfile],
  };

  await writeConfig(nextConfig);

  return nextProfile;
}

export function createProfileEffect(
  profile: CacheProfile
): Effect.Effect<CacheProfile, FileSystemError> {
  const nextProfile = profile.mode === "remote" ? normalizeRemoteProfile(profile) : profile;

  return readConfigEffect().pipe(
    Effect.flatMap((config) => {
      const remainingProfiles = config.profiles.filter((item) => item.name !== nextProfile.name);
      const nextConfig: CacheConfigFile = {
        currentProfileName: config.currentProfileName ?? nextProfile.name,
        profiles: [...remainingProfiles, nextProfile],
      };

      return writeConfigEffect(nextConfig).pipe(
        Effect.map(() => nextProfile)
      );
    })
  );
}

export async function setCurrentProfile(profileName: string) {
  const config = await readConfig();
  const match = config.profiles.find((profile) => profile.name === profileName);

  if (!match) {
    throw new Error(`Profile not found: ${profileName}`);
  }

  await writeConfig({
    ...config,
    currentProfileName: profileName,
  });

  return match;
}

export function setCurrentProfileEffect(
  profileName: string
): Effect.Effect<CacheProfile, ConfigError | FileSystemError> {
  return Effect.gen(function* () {
    const config = yield* readConfigEffect();
    const match = config.profiles.find((profile) => profile.name === profileName);

    if (!match) {
      return yield* Effect.fail(
        new ConfigError({
          code: "profile_not_found",
          message: `Profile not found: ${profileName}`,
        })
      );
    }

    yield* writeConfigEffect({
      ...config,
      currentProfileName: profileName,
    });

    return match;
  });
}

export async function getCurrentProfile() {
  const config = await readConfig();

  if (!config.currentProfileName) {
    return null;
  }

  return config.profiles.find((profile) => profile.name === config.currentProfileName) ?? null;
}

export function getCurrentProfileEffect(): Effect.Effect<CacheProfile | null, FileSystemError> {
  return readConfigEffect().pipe(
    Effect.map((config) => {
      if (!config.currentProfileName) {
        return null;
      }

      return config.profiles.find((profile) => profile.name === config.currentProfileName) ?? null;
    })
  );
}

export async function getProfile(profileName: string) {
  const config = await readConfig();
  return config.profiles.find((profile) => profile.name === profileName) ?? null;
}

export function getProfileEffect(
  profileName: string
): Effect.Effect<CacheProfile | null, FileSystemError> {
  return readConfigEffect().pipe(
    Effect.map((config) =>
      config.profiles.find((profile) => profile.name === profileName) ?? null
    )
  );
}

export async function updateProfile(profileName: string, updater: (profile: CacheProfile) => CacheProfile) {
  const config = await readConfig();
  const match = config.profiles.find((profile) => profile.name === profileName);

  if (!match) {
    throw new Error(`Profile not found: ${profileName}`);
  }

  const nextProfile = updater(match);
  const profiles = config.profiles.map((profile) =>
    profile.name === profileName ? nextProfile : profile
  );

  await writeConfig({
    currentProfileName: config.currentProfileName,
    profiles,
  });

  return nextProfile;
}

export function updateProfileEffect(
  profileName: string,
  updater: (profile: CacheProfile) => CacheProfile
): Effect.Effect<CacheProfile, ConfigError | FileSystemError> {
  return Effect.gen(function* () {
    const config = yield* readConfigEffect();
    const match = config.profiles.find((profile) => profile.name === profileName);

    if (!match) {
      return yield* Effect.fail(
        new ConfigError({
          code: "profile_not_found",
          message: `Profile not found: ${profileName}`,
        })
      );
    }

    const nextProfile = updater(match);
    const profiles = config.profiles.map((profile) =>
      profile.name === profileName ? nextProfile : profile
    );

    yield* writeConfigEffect({
      currentProfileName: config.currentProfileName,
      profiles,
    });

    return nextProfile;
  });
}

export async function deleteProfile(profileName: string) {
  const config = await readConfig();
  const profiles = config.profiles.filter((profile) => profile.name !== profileName);
  const currentProfileName = config.currentProfileName === profileName
    ? profiles[0]?.name ?? null
    : config.currentProfileName;

  await writeConfig({
    currentProfileName,
    profiles,
  });
}

export function deleteProfileEffect(
  profileName: string
): Effect.Effect<void, FileSystemError> {
  return readConfigEffect().pipe(
    Effect.flatMap((config) => {
      const profiles = config.profiles.filter((profile) => profile.name !== profileName);
      const currentProfileName = config.currentProfileName === profileName
        ? profiles[0]?.name ?? null
        : config.currentProfileName;

      return writeConfigEffect({
        currentProfileName,
        profiles,
      });
    })
  );
}
