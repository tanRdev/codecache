export type ShellBuiltin = "exit" | "help" | "clear" | "status";

export interface ShellCommandResult {
  kind: "command";
  argv: string[];
}

export interface ShellBuiltinResult {
  kind: "builtin";
  builtin: ShellBuiltin;
}

export type ShellInputResolution = ShellCommandResult | ShellBuiltinResult;

interface SlashCommandDefinition {
  aliases?: string[];
  argv?: string[];
  builtin?: ShellBuiltin;
  description: string;
  group: string;
  invocation: string;
}

const slashCommandDefinitions: SlashCommandDefinition[] = [
  {
    invocation: "/help",
    builtin: "help",
    description: "Show interactive shell help",
    group: "Shell",
  },
  {
    invocation: "/status",
    builtin: "status",
    description: "Show current auth and profile status",
    group: "Shell",
  },
  {
    invocation: "/clear",
    builtin: "clear",
    description: "Clear the terminal",
    group: "Shell",
  },
  {
    invocation: "/exit",
    aliases: ["/quit"],
    builtin: "exit",
    description: "Exit the shell",
    group: "Shell",
  },
  {
    invocation: "/login",
    aliases: ["/auth"],
    argv: ["auth", "login"],
    description: "Sign in with the browser and save a remote profile",
    group: "Auth",
  },
  {
    invocation: "/whoami",
    argv: ["auth", "whoami"],
    description: "Show the current signed-in identity",
    group: "Auth",
  },
  {
    invocation: "/logout",
    argv: ["auth", "logout"],
    description: "Sign out of the current CLI profile",
    group: "Auth",
  },
  {
    invocation: "/profiles",
    argv: ["profile", "list"],
    description: "List saved CLI profiles",
    group: "Auth",
  },
  {
    invocation: "/use-profile",
    argv: ["profile", "use"],
    description: "Switch the active CLI profile",
    group: "Auth",
  },
  {
    invocation: "/snippet create",
    aliases: ["/add"],
    argv: ["snippet", "create"],
    description: "Create a snippet from a file or multiline prompt",
    group: "Snippets",
  },
  {
    invocation: "/snippet list",
    aliases: ["/snippets"],
    argv: ["snippet", "list"],
    description: "List snippets, optionally filtered by a query",
    group: "Snippets",
  },
  {
    invocation: "/snippet search",
    aliases: ["/search"],
    argv: ["snippet", "search"],
    description: "Search snippets by text or tags",
    group: "Snippets",
  },
  {
    invocation: "/snippet get",
    aliases: ["/get"],
    argv: ["snippet", "get"],
    description: "Show a single snippet",
    group: "Snippets",
  },
  {
    invocation: "/snippet update",
    argv: ["snippet", "update"],
    description: "Update a snippet title, notes, tags, or code",
    group: "Snippets",
  },
  {
    invocation: "/snippet delete",
    aliases: ["/rm"],
    argv: ["snippet", "delete"],
    description: "Delete a snippet",
    group: "Snippets",
  },
  {
    invocation: "/attachment add",
    argv: ["attachment", "add"],
    description: "Upload an attachment to a snippet",
    group: "Attachments",
  },
  {
    invocation: "/attachment list",
    argv: ["attachment", "list"],
    description: "List attachments for a snippet",
    group: "Attachments",
  },
  {
    invocation: "/attachment get",
    argv: ["attachment", "get"],
    description: "Download an attachment",
    group: "Attachments",
  },
  {
    invocation: "/attachment delete",
    argv: ["attachment", "delete"],
    description: "Delete an attachment",
    group: "Attachments",
  },
  {
    invocation: "/storage get",
    argv: ["storage", "get"],
    description: "Show the active storage backend",
    group: "Storage",
  },
  {
    invocation: "/storage set",
    argv: ["storage", "set"],
    description: "Change the active storage backend",
    group: "Storage",
  },
  {
    invocation: "/storage validate",
    argv: ["storage", "validate"],
    description: "Validate a storage backend configuration",
    group: "Storage",
  },
];

function getDefinitionInvocations(definition: SlashCommandDefinition) {
  return [definition.invocation, ...(definition.aliases ?? [])];
}

function getAllSlashInvocations() {
  return slashCommandDefinitions
    .flatMap((definition) => getDefinitionInvocations(definition))
    .sort();
}

export function listSlashCommands() {
  return slashCommandDefinitions.map((definition) => ({
    invocation: definition.invocation,
    aliases: definition.aliases ?? [],
    description: definition.description,
    group: definition.group,
  }));
}

function stripOuterQuotes(value: string) {
  if (
    (value.startsWith('"') && value.endsWith('"')) ||
    (value.startsWith("'") && value.endsWith("'"))
  ) {
    return value.slice(1, -1);
  }

  return value;
}

export function tokenizeShellInput(input: string) {
  const matches = input.match(/"(?:\\.|[^"\\])*"|'(?:\\.|[^'\\])*'|\S+/g) ?? [];
  return matches.map((token) => stripOuterQuotes(token));
}

export function resolveShellInput(input: string): ShellInputResolution {
  const tokens = tokenizeShellInput(input.trim());
  const [head] = tokens;

  if (!head) {
    return { kind: "builtin", builtin: "help" };
  }

  const definition = slashCommandDefinitions
    .flatMap((item) =>
      getDefinitionInvocations(item).map((invocation) => ({
        definition: item,
        invocation,
      }))
    )
    .filter(({ invocation }) => {
      const invocationTokens = tokenizeShellInput(invocation);

      if (invocationTokens.length > tokens.length) {
        return false;
      }

      return invocationTokens.every((token, index) => token === tokens[index]);
    })
    .sort((left, right) => tokenizeShellInput(right.invocation).length - tokenizeShellInput(left.invocation).length)[0];

  if (definition?.definition.builtin) {
    return {
      kind: "builtin",
      builtin: definition.definition.builtin,
    };
  }

  if (definition?.definition.argv) {
    const invocationTokens = tokenizeShellInput(definition.invocation);

    return {
      kind: "command",
      argv: [...definition.definition.argv, ...tokens.slice(invocationTokens.length)],
    };
  }

  return {
    kind: "command",
    argv: tokens,
  };
}

export function getSlashCommandSuggestions(prefix: string) {
  const normalizedPrefix = prefix.trim().toLowerCase();

  return getAllSlashInvocations()
    .filter((alias) => alias.startsWith(normalizedPrefix))
    .sort();
}

export function renderShellHelp() {
  const groups = new Map<string, SlashCommandDefinition[]>();

  slashCommandDefinitions.forEach((definition) => {
    const entries = groups.get(definition.group) ?? [];
    entries.push(definition);
    groups.set(definition.group, entries);
  });

  const lines = [
    "Cache interactive shell",
    "",
    "Type a slash command or a normal CLI command.",
    "Press Tab after typing / to see suggestions.",
  ];

  groups.forEach((definitions, group) => {
    lines.push("", `${group}:`);
    definitions.forEach((definition) => {
      lines.push(`  ${definition.invocation.padEnd(22, " ")} ${definition.description}`);
    });
  });

  lines.push(
    "",
    "Tip: browser auto-open is disabled. Cache prints the login URL for manual opening."
  );

  return lines.join("\n");
}

export function completeShellInput(line: string): [string[], string] {
  const trimmed = line.trimStart();

  if (!trimmed.startsWith("/")) {
    return [[], line];
  }

  const suggestions = getSlashCommandSuggestions(trimmed);
  return [suggestions.length > 0 ? suggestions : getAllSlashInvocations(), trimmed];
}
