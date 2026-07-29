import { readFile, writeFile } from "node:fs/promises";
import path from "node:path";
import {
  buildBrowserLoginUrl,
  exchangeBrowserLoginCode,
  startAuthCallbackServer,
} from "@/cli/browser-auth";
import {
  createProfile,
  deleteProfile,
  getCurrentProfile,
  getDefaultDatabasePath,
  listProfiles,
  setCurrentProfile,
  type CacheProfile,
} from "@/cli/config";
import {
  createPromptSession,
  createShellSession,
  isInteractiveSession,
  supportsInteractiveShell,
  type CompletionState,
} from "@/cli/interactive";
import { printError, printSuccess, renderSuccess, resolveOutputFormat } from "@/cli/output";
import { createRuntime } from "@/cli/runtime";
import { resolveShellInput, getSlashCommandSuggestions } from "@/cli/shell";
import { renderSessionStatus } from "@/cli/session";
import {
  formatErrorMessage,
  formatHelpPanel,
  formatShellFrame,
  formatSuccessMessage,
  formatSuggestionsBelowInput,
} from "@/cli/ui";
import type { StorageBackend } from "@/lib/storage/types";

function clampActivity(activity: string[], nextLine: string) {
  return [...activity, nextLine].slice(-20);
}

function renderShell(shell: { write(message: string): void }, status: Awaited<ReturnType<typeof getInteractiveSessionStatus>>, input: string, activity: string[]) {
  const frame = formatShellFrame(input, status, activity);
  process.stdout.write("\x1Bc");
  shell.write(`${frame.join("\n")}\n\n`);
}

function renderPrompt(shell: { write(message: string): void }, prompt: string, input: string) {
  shell.write(`${prompt}${input}`);
}

interface ParsedArgs {
  flags: Map<string, string[]>;
  positionals: string[];
}

const CLI_VERSION = "0.2.0";

function getHelpText() {
  return `Cache — your personal code library, on your machine.

Usage:
  cache init [--name local] [--database /path/to/cache.sqlite]
  cache add <file|-> [--title "Title"] [--tag tag]
  cache search [query] [--tag tag]
  cache get <snippet-id>
  cache snippet update <snippet-id> [file] [options]
  cache rm <snippet-id>
  cache attachment add|list|get|delete
  cache profile list|use|show
  cache storage get|set|validate
  cache auth login|logout|whoami

Global options:
  --profile <name>        Use a profile without changing the default
  --format human|json|jsonl
  --help
  --version

Run \`cache\` without arguments in a terminal to open the interactive shell.`;
}

function sanitizeProfile(profile: CacheProfile | null) {
  if (!profile) {
    return null;
  }

  if (profile.mode === "remote") {
    return {
      name: profile.name,
      mode: profile.mode,
      appUrl: profile.appUrl,
      token: "[hidden]",
    };
  }

  return profile;
}

function sanitizeProfiles(profiles: CacheProfile[]) {
  return profiles.map((profile) => sanitizeProfile(profile));
}

function parseBackend(value: string): StorageBackend {
  if (value === "sqlite") {
    return value;
  }

  throw new Error(`Unsupported backend: ${value}`);
}

function parseArgs(argv: string[]): ParsedArgs {
  const flags = new Map<string, string[]>();
  const positionals: string[] = [];
  let positionalOnly = false;

  for (let index = 0; index < argv.length; index += 1) {
    const token = argv[index];

    if (token === "--") {
      positionalOnly = true;
      continue;
    }

    if (positionalOnly || !token.startsWith("--")) {
      positionals.push(token);
      continue;
    }

    const flag = token.slice(2);
    const equalsIndex = flag.indexOf("=");
    const name = equalsIndex === -1 ? flag : flag.slice(0, equalsIndex);
    const inlineValue = equalsIndex === -1 ? undefined : flag.slice(equalsIndex + 1);
    const nextToken = argv[index + 1];
    const values = flags.get(name) ?? [];

    if (inlineValue !== undefined) {
      values.push(inlineValue);
      flags.set(name, values);
      continue;
    }

    if (nextToken !== undefined && !nextToken.startsWith("--")) {
      values.push(nextToken);
      flags.set(name, values);
      index += 1;
      continue;
    }

    values.push("true");
    flags.set(name, values);
  }

  return { flags, positionals };
}

function getFlag(args: ParsedArgs, name: string) {
  return args.flags.get(name)?.at(-1);
}

function getFlags(args: ParsedArgs, name: string) {
  return args.flags.get(name) ?? [];
}

async function getInteractiveSessionStatus() {
  const profile = await getCurrentProfile();

  if (!profile) {
    return {
      authenticated: false,
      identity: null,
      profile: null,
    } as const;
  }

  try {
    const runtime = createRuntime(profile);
    const info = await runtime.profileInfo();
    const identity = info && typeof info === "object" && "userId" in info
      ? { userId: typeof info.userId === "string" ? info.userId : undefined }
      : null;

    return {
      authenticated: true,
      identity,
      profile,
    } as const;
  } catch {
    return {
      authenticated: false,
      identity: null,
      profile,
    } as const;
  }
}

async function handleInteractiveLogin() {
  const currentProfile = await getCurrentProfile();
  const appUrl = currentProfile?.mode === "remote"
    ? currentProfile.appUrl
    : process.env.NEXT_PUBLIC_APP_URL ?? "http://localhost:3000";
    const callbackSession = await startAuthCallbackServer();

  try {
    const loginUrl = buildBrowserLoginUrl(appUrl, callbackSession.callbackUrl, currentProfile?.name ?? "default");
    process.stdout.write(`Browser login URL:\n${loginUrl}\n`);

    process.stdout.write("Auto-open is disabled. Paste the URL into a browser if needed.\n");

    const code = await callbackSession.codePromise;
    const exchange = await exchangeBrowserLoginCode(appUrl, code);
    const profile = await createProfile({
      name: currentProfile?.name ?? "default",
      mode: "remote",
      appUrl,
      token: exchange.token,
    });
    await setCurrentProfile(profile.name);
    return profile;
  } finally {
    await callbackSession.close();
  }
}

function isManualAuthFlow(argv: string[]) {
  return argv.some((token, index, values) =>
    token === "--token" ||
    token.startsWith("--token=") ||
    token === "--base-url" ||
    token.startsWith("--base-url=") ||
    values[index - 1] === "--token" ||
    values[index - 1] === "--base-url"
  );
}

function shouldConfirmDestructiveCommand(argv: string[]) {
  return (
    argv[0] === "rm" ||
    (argv[0] === "snippet" && argv[1] === "delete") ||
    (argv[0] === "attachment" && argv[1] === "delete")
  );
}

function getDestructiveCommandLabel(argv: string[]) {
  return argv.join(" ");
}

export async function runInteractiveShell() {
  const shell = createShellSession();

  try {
    let status = await getInteractiveSessionStatus();
    let activity: string[] = [formatSuccessMessage("Ready. Use /help to explore commands or /login to connect.")];
    renderShell(shell, status, "", activity);

    while (true) {
      const line = await shell.readLine((input: string, completion?: CompletionState) => {
        renderShell(shell, status, input, activity);
        renderPrompt(shell, "> ", input);
        const suggestions = formatSuggestionsBelowInput(
          input,
          completion?.selectedIndex
        );
        if (suggestions.length > 0) {
          shell.write(suggestions.join("\n") + "\n");
        }
      }, getSlashCommandSuggestions);

      if (!line) {
        continue;
      }

      if (line === "/") {
        activity = formatHelpPanel();
        renderShell(shell, status, line, activity);
        continue;
      }

      if (line === "/status") {
        status = await getInteractiveSessionStatus();
        activity = clampActivity(activity, formatSuccessMessage(renderSessionStatus(status)));
        renderShell(shell, status, line, activity);
        continue;
      }

      const resolved = resolveShellInput(line);

      if (resolved.kind === "builtin") {
        if (resolved.builtin === "exit") {
          break;
        }

        if (resolved.builtin === "help") {
          activity = formatHelpPanel();
          renderShell(shell, status, line, activity);
          continue;
        }

        if (resolved.builtin === "clear") {
          status = await getInteractiveSessionStatus();
          activity = [formatSuccessMessage("Cleared the screen.")];
          renderShell(shell, status, "", activity);
          continue;
        }
      }

      if (resolved.kind === "command" && resolved.argv[0] === "auth" && resolved.argv[1] === "login") {
        try {
          if (isManualAuthFlow(resolved.argv)) {
            const result = await runCli(resolved.argv);
            activity = clampActivity(activity, renderSuccess(result, "human").trim());
            status = await getInteractiveSessionStatus();
            renderShell(shell, status, line, activity);
            continue;
          }

          const profile = await handleInteractiveLogin();
          activity = clampActivity(activity, formatSuccessMessage(`Signed in as profile ${profile.name}.`));
          status = await getInteractiveSessionStatus();
          renderShell(shell, status, line, activity);
        } catch (error) {
          activity = clampActivity(
            activity,
            formatErrorMessage(error instanceof Error ? error.message : "Login failed")
          );
          renderShell(shell, status, line, activity);
        }
        continue;
      }

      if (resolved.kind === "command" && shouldConfirmDestructiveCommand(resolved.argv)) {
        const confirmed = await shell.confirm(
          `Run destructive command: ${getDestructiveCommandLabel(resolved.argv)}?`,
          false
        );

        if (!confirmed) {
          activity = clampActivity(activity, formatErrorMessage("Cancelled."));
          renderShell(shell, status, line, activity);
          continue;
        }
      }

      try {
        const result = await runCli(resolved.kind === "command" ? resolved.argv : []);
        activity = clampActivity(activity, renderSuccess(result, "human").trim());
        status = await getInteractiveSessionStatus();
        renderShell(shell, status, line, activity);
      } catch (error) {
        activity = clampActivity(
          activity,
          formatErrorMessage(error instanceof Error ? error.message : "Unexpected error")
        );
        renderShell(shell, status, line, activity);
      }
    }
  } finally {
    shell.close();
  }
}

async function readSource(source?: string) {
  if (source && source !== "-") {
    return readFile(source, "utf8");
  }

  if (!process.stdin.isTTY) {
    const chunks: Buffer[] = [];

    for await (const chunk of process.stdin) {
      chunks.push(Buffer.isBuffer(chunk) ? chunk : Buffer.from(chunk));
    }

    return Buffer.concat(chunks).toString("utf8");
  }

  throw new Error("Provide a file path or pipe content via stdin");
}

function detectLanguage(source?: string) {
  if (!source || source === "-") {
    return "text";
  }

  const extension = path.extname(source).replace(/^\./, "");
  return extension || "text";
}

function readTags(args: ParsedArgs) {
  const repeatedTags = getFlags(args, "tag");
  const joinedTags = getFlag(args, "tags");
  const csvTags = joinedTags ? joinedTags.split(",").map((tag) => tag.trim()).filter(Boolean) : [];
  return [...repeatedTags, ...csvTags];
}

async function requireProfile(args: ParsedArgs): Promise<CacheProfile> {
  const requestedProfile = getFlag(args, "profile");

  if (requestedProfile) {
    const profiles = await listProfiles();
    const profile = profiles.find((item) => item.name === requestedProfile);

    if (profile) {
      return profile;
    }

    throw new Error(`Profile not found: ${requestedProfile}`);
  }

  const profile = await getCurrentProfile();

  if (!profile) {
    throw new Error("No active profile. Run `cache init` or `cache auth login` first.");
  }

  return profile;
}

async function handleInit(args: ParsedArgs) {
  const defaultUserId = crypto.randomUUID();
  const prompt = isInteractiveSession() ? createPromptSession() : null;
  let name = getFlag(args, "name") ?? "local";
  let userId = getFlag(args, "user-id") ?? defaultUserId;
  let backendFlag = getFlag(args, "backend") ?? "sqlite";
  let databasePath = path.resolve(getFlag(args, "database") ?? getDefaultDatabasePath(name));

  try {
    if (prompt && !getFlag(args, "name") && !getFlag(args, "user-id") && !getFlag(args, "backend")) {
      name = await prompt.ask("Profile name", name);
      databasePath = getDefaultDatabasePath(name);
      backendFlag = await prompt.choose(
        "Select a storage backend",
        ["sqlite"],
        backendFlag
      );

      userId = await prompt.ask("User id", userId);
      databasePath = path.resolve(await prompt.ask("Database path", databasePath));
    }
  } finally {
    prompt?.close();
  }

  const backend = parseBackend(backendFlag);

  const profile = await createProfile({
    name,
    mode: "direct",
    backend,
    connectionString: undefined,
    databasePath,
    userId,
  });
  await setCurrentProfile(profile.name);
  return sanitizeProfile(profile);
}

async function handleAuth(args: ParsedArgs) {
  const subcommand = args.positionals[1] ?? "whoami";

  if (subcommand === "login") {
    const interactive = isInteractiveSession();
    let name = getFlag(args, "name") ?? "remote";
    let appUrl = getFlag(args, "base-url") ?? "http://localhost:3000";
    let token = getFlag(args, "token");

    if ((!appUrl || !token) && interactive && !token) {
      const prompt = createPromptSession();

      try {
        if (!getFlag(args, "name")) {
          name = await prompt.ask("Profile name", name);
        }

        if (!getFlag(args, "base-url")) {
          appUrl = await prompt.ask("Cache app URL", appUrl);
        }

        process.stdout.write("Starting browser login flow...\n");

        const callbackSession = await startAuthCallbackServer();

        try {
          const loginUrl = buildBrowserLoginUrl(appUrl, callbackSession.callbackUrl, name);
          process.stdout.write(`Browser login URL:\n${loginUrl}\n`);

          process.stdout.write("Auto-open is disabled. Paste the URL into a browser if needed.\n");

          const code = await callbackSession.codePromise;
          const exchange = await exchangeBrowserLoginCode(appUrl, code);
          token = exchange.token;
        } finally {
          await callbackSession.close();
        }
      } finally {
        prompt.close();
      }
    }

    if (!appUrl || !token) {
      throw new Error("`cache auth login` requires --base-url and --token, or an interactive TTY for browser login");
    }

    const profile = await createProfile({
      name,
      mode: "remote",
      appUrl,
      token,
    });
    await setCurrentProfile(profile.name);
    return sanitizeProfile(profile);
  }

  if (subcommand === "logout") {
    const profile = await requireProfile(args);
    await deleteProfile(profile.name);
    return { success: true, deletedProfile: profile.name };
  }

  if (subcommand !== "whoami") {
    throw new Error(`Unknown auth command: ${subcommand}`);
  }

  const profile = await requireProfile(args);
  const runtime = createRuntime(profile);
  return runtime.profileInfo();
}

async function handleProfile(args: ParsedArgs) {
  const subcommand = args.positionals[1] ?? "show";

  if (subcommand === "list") {
    return sanitizeProfiles(await listProfiles());
  }

  if (subcommand === "use") {
    let name = args.positionals[2];

    if (!name && isInteractiveSession()) {
      const prompt = createPromptSession();

      try {
        const profiles = await listProfiles();

        if (profiles.length === 0) {
          throw new Error("No profiles are configured yet");
        }

        name = await prompt.choose(
          "Choose a profile",
          profiles.map((profile) => profile.name),
          profiles[0]?.name
        );
      } finally {
        prompt.close();
      }
    }

    if (!name) {
      throw new Error("`cache profile use` requires a profile name");
    }

    return sanitizeProfile(await setCurrentProfile(name));
  }

  if (subcommand === "show") {
    return sanitizeProfile(await getCurrentProfile());
  }

  throw new Error(`Unknown profile command: ${subcommand}`);
}

async function handleSnippet(args: ParsedArgs, alias?: "create" | "search" | "get" | "delete") {
  const profile = await requireProfile(args);
  const runtime = createRuntime(profile);
  const subcommand = alias ?? args.positionals[1] ?? "list";

  if (subcommand === "create") {
    const source = args.positionals[2];
    const interactive = isInteractiveSession();

    if (!source && interactive) {
      const prompt = createPromptSession();

      try {
        const title = await prompt.ask("Title", "Untitled snippet");
        const language = await prompt.ask("Language", "text");
        const description = await prompt.ask("Description", "");
        const notes = await prompt.ask("Notes", "");
        const tagsValue = await prompt.ask("Tags (comma-separated)", "");
        const code = await prompt.askMultiline("Paste snippet code", ".");

        return runtime.snippetCreate({
          title,
          description: description || undefined,
          notes: notes || undefined,
          language,
          code,
          tags: tagsValue ? tagsValue.split(",").map((tag) => tag.trim()).filter(Boolean) : [],
        });
      } finally {
        prompt.close();
      }
    }

    const code = await readSource(source);
    const title = getFlag(args, "title") ?? (source && source !== "-" ? path.basename(source) : "stdin-snippet");

    return runtime.snippetCreate({
      title,
      description: getFlag(args, "description"),
      notes: getFlag(args, "notes"),
      language: getFlag(args, "language") ?? detectLanguage(source),
      code,
      tags: readTags(args),
    });
  }

  if (subcommand === "get") {
    const snippetId = args.positionals[2];

    if (!snippetId) {
      throw new Error("`cache snippet get` requires a snippet id");
    }

    return runtime.snippetGet(snippetId);
  }

  if (subcommand === "update") {
    const snippetId = args.positionals[2];

    if (!snippetId) {
      throw new Error("`cache snippet update` requires a snippet id");
    }

    const source = args.positionals[3];
    const input: Record<string, unknown> = {
      title: getFlag(args, "title"),
      description: getFlag(args, "description"),
      notes: getFlag(args, "notes"),
      language: getFlag(args, "language"),
      tags: args.flags.has("tag") || args.flags.has("tags") ? readTags(args) : undefined,
    };

    if (source) {
      input.code = await readSource(source);
      input.language = input.language ?? detectLanguage(source);
    }

    return runtime.snippetUpdate(snippetId, input);
  }

  if (subcommand === "delete") {
    const snippetId = args.positionals[2];

    if (!snippetId) {
      throw new Error("`cache snippet delete` requires a snippet id");
    }

    return runtime.snippetDelete(snippetId);
  }

  if (subcommand !== "list" && subcommand !== "search") {
    throw new Error(`Unknown snippet command: ${subcommand}`);
  }

  const query = alias === "search"
    ? args.positionals[1]
    : args.positionals[2];
  return runtime.snippetList(query, readTags(args));
}

async function handleAttachments(args: ParsedArgs) {
  const profile = await requireProfile(args);
  const runtime = createRuntime(profile);
  const subcommand = args.positionals[1] ?? "list";

  if (subcommand === "add") {
    const snippetId = args.positionals[2];
    const filePath = args.positionals[3];

    if (!snippetId || !filePath) {
      throw new Error("`cache attachment add` requires a snippet id and file path");
    }

    return runtime.attachmentUpload(snippetId, filePath, getFlag(args, "mime-type"));
  }

  if (subcommand === "get") {
    const attachmentId = args.positionals[2];

    if (!attachmentId) {
      throw new Error("`cache attachment get` requires an attachment id");
    }

    const target = await runtime.attachmentDownload(attachmentId);
    const outputPath = getFlag(args, "output");

    if (!outputPath) {
      return {
        fileName: target.fileName ?? null,
        mimeType: target.mimeType ?? null,
        download: "Pass --output <path> to write this attachment to disk.",
      };
    }

    if (target.kind === "blob" && target.contentBase64) {
      await writeFile(outputPath, Buffer.from(target.contentBase64, "base64"));
      return { success: true, outputPath };
    }

    throw new Error("Attachment download target is not available");
  }

  if (subcommand === "delete") {
    const attachmentId = args.positionals[2];

    if (!attachmentId) {
      throw new Error("`cache attachment delete` requires an attachment id");
    }

    return runtime.attachmentDelete(attachmentId);
  }

  if (subcommand !== "list") {
    throw new Error(`Unknown attachment command: ${subcommand}`);
  }

  const snippetId = args.positionals[2];

  if (!snippetId) {
    throw new Error("`cache attachment list` requires a snippet id");
  }

  return runtime.attachmentList(snippetId);
}

async function handleStorage(args: ParsedArgs) {
  const profile = await requireProfile(args);
  const runtime = createRuntime(profile);
  const subcommand = args.positionals[1] ?? "get";

  if (subcommand === "validate") {
    return runtime.storageValidate();
  }

  if (subcommand === "set") {
    let backend = getFlag(args, "backend") ?? args.positionals[2];

    if (!backend && isInteractiveSession()) {
      const prompt = createPromptSession();

      try {
        backend = await prompt.choose(
          "Choose a storage backend",
          ["sqlite"],
          "sqlite"
        );
      } finally {
        prompt.close();
      }
    }

    if (!backend) {
      throw new Error("`cache storage set` requires a backend");
    }

    return runtime.storageSet({
      backend,
    });
  }

  if (subcommand === "get") {
    return runtime.storageGet();
  }

  throw new Error(`Unknown storage command: ${subcommand}`);
}

async function handleConfig(args: ParsedArgs) {
  const profile = await requireProfile(args);
  return sanitizeProfile(profile);
}

export async function runCli(argv: string[]) {
  const args = parseArgs(argv);
  const command = args.positionals[0] ?? "help";

  if (args.flags.has("version") || command === "version") {
    return CLI_VERSION;
  }

  if (args.flags.has("help") || command === "help") {
    return getHelpText();
  }

  if (command === "init") {
    return handleInit(args);
  }

  if (command === "auth") {
    return handleAuth(args);
  }

  if (command === "profile") {
    return handleProfile(args);
  }

  if (command === "snippet") {
    return handleSnippet(args);
  }

  if (command === "add") {
    return handleSnippet({ ...args, positionals: ["snippet", "create", ...args.positionals.slice(1)] }, "create");
  }

  if (command === "search") {
    return handleSnippet(args, "search");
  }

  if (command === "get") {
    return handleSnippet({ ...args, positionals: ["snippet", "get", ...args.positionals.slice(1)] }, "get");
  }

  if (command === "rm") {
    return handleSnippet({ ...args, positionals: ["snippet", "delete", ...args.positionals.slice(1)] }, "delete");
  }

  if (command === "attachment") {
    return handleAttachments(args);
  }

  if (command === "storage") {
    return handleStorage(args);
  }

  if (command === "config") {
    return handleConfig(args);
  }

  throw new Error(`Unknown command: ${command}`);
}

export async function main(argv = process.argv) {
  if (argv.slice(2).length === 0 && supportsInteractiveShell()) {
    await runInteractiveShell();
    return;
  }

  const args = parseArgs(argv.slice(2));
  const informational =
    args.flags.has("help") ||
    args.flags.has("version") ||
    args.positionals[0] === "help" ||
    args.positionals[0] === "version";
  const format = informational
    ? "human"
    : resolveOutputFormat(getFlag(args, "format"), Boolean(process.stdout.isTTY));

  try {
    const result = await runCli(argv.slice(2));
    printSuccess(result, format);
  } catch (error) {
    printError(error, format);
    process.exitCode = 1;
  }
}

void main();
