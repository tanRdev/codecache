import { completeShellInput, listSlashCommands } from "@/cli/shell";
import type { SessionStatus } from "@/cli/session";

const RESET = "\x1b[0m";
const BOLD = "\x1b[1m";
const WHITE = "\x1b[37m";
const ORANGE = "\x1b[38;5;214m";
const GRAY = "\x1b[38;5;245m";

function supportsAnsi() {
  return Boolean(process.stdout.isTTY && process.env.TERM !== "dumb");
}

function colorize(text: string, color: string) {
  if (!supportsAnsi()) {
    return text;
  }

  return `${color}${text}${RESET}`;
}

function pad(text: string, width: number) {
  return text.length >= width ? text : `${text}${" ".repeat(width - text.length)}`;
}

export function formatBanner() {
  const lines = [
    `${colorize("CACHE", `${BOLD}${ORANGE}`)} ${colorize("interactive cli", GRAY)}`,
    colorize("A snippet vault for your terminal - browser login, slash commands, and direct actions.", GRAY),
    colorize("Primary command: cache", GRAY),
  ];

  return lines;
}

export function formatStatusCard(status: SessionStatus) {
  const title = colorize("Session", `${BOLD}${WHITE}`);
  const lines = [title];

  if (!status.profile) {
    lines.push(`${colorize("State", GRAY)}   ${colorize("Not configured", GRAY)}`);
    lines.push(`${colorize("Next", GRAY)}    Run ${colorize("/login", WHITE)} or ${colorize("/help", WHITE)} to get started.`);
    return lines;
  }

  lines.push(`${colorize("Profile", GRAY)} ${status.profile.name}`);
  lines.push(`${colorize("Mode", GRAY)}    ${status.profile.mode}`);

  if (status.profile.mode === "remote") {
    lines.push(`${colorize("App", GRAY)}     ${status.profile.appUrl}`);
  }

  lines.push(
    `${colorize("Auth", GRAY)}    ${status.authenticated ? colorize("Signed in", ORANGE) : colorize("Needs login", GRAY)}`
  );

  if (status.identity?.userId) {
    lines.push(`${colorize("User", GRAY)}    ${status.identity.userId}`);
  }

  return lines;
}

export function formatSuggestions(input: string, selectedIndex?: number) {
  if (!input.trim().startsWith("/")) {
    return [];
  }

  const completions = completeShellInput(input.trim())[0];
  const commandList = listSlashCommands();
  const suggestions = completions
    .map((candidate) =>
      commandList.find((command) => command.invocation === candidate || command.aliases.includes(candidate))
    )
    .filter((command): command is ReturnType<typeof listSlashCommands>[number] => Boolean(command));

  const uniqueSuggestions = suggestions.filter(
    (command, index, array) => array.findIndex((item) => item.invocation === command.invocation) === index
  );

  if (uniqueSuggestions.length === 0) {
    return [colorize("No matching slash commands.", GRAY)];
  }

  const width = Math.max(...uniqueSuggestions.map((suggestion) => suggestion.invocation.length), 12);
  return uniqueSuggestions.slice(0, 8).map((suggestion, index) => {
    const isSelected = selectedIndex !== undefined && index === selectedIndex;
    const invocation = colorize(pad(suggestion.invocation, width), isSelected ? `${BOLD}${ORANGE}` : WHITE);
    const description = colorize(suggestion.description, GRAY);
    return `  ${invocation}  ${description}`;
  });
}

export function formatHelpPanel() {
  const groups = new Map<string, ReturnType<typeof listSlashCommands>>();

  listSlashCommands().forEach((command) => {
    const existing = groups.get(command.group) ?? [];
    existing.push(command);
    groups.set(command.group, existing);
  });

  const lines = [colorize("Slash Commands", `${BOLD}${WHITE}`)];

  groups.forEach((commands, group) => {
    lines.push("", colorize(group, `${BOLD}${ORANGE}`));
    commands.forEach((command) => {
      lines.push(`  ${colorize(pad(command.invocation, 20), WHITE)} ${colorize(command.description, GRAY)}`);
    });
  });

  lines.push(
    "",
    colorize("Tip", `${BOLD}${ORANGE}`),
    colorize("Browser auto-open is disabled. Cache only prints the login URL for manual opening.", GRAY)
  );

  return lines;
}

export function formatActivityLog(lines: string[]) {
  const header = colorize("Activity", `${BOLD}${WHITE}`);
  const content = lines.length > 0 ? lines : [colorize("No commands yet. Try /help, /login, or /snippet list.", GRAY)];
  return [header, ...content.slice(-10)];
}

export function formatShellFrame(input: string, status: SessionStatus, activity: string[]) {
  return [
    ...formatBanner(),
    "",
    ...formatStatusCard(status),
    "",
    ...formatActivityLog(activity),
  ];
}

export function formatSuggestionsBelowInput(input: string, selectedIndex?: number) {
  const suggestions = formatSuggestions(input, selectedIndex);

  if (suggestions.length === 0) {
    return [];
  }

  return ["", colorize("Slash commands", `${BOLD}${WHITE}`), ...suggestions];
}

export function formatSuccessMessage(message: string) {
  return colorize(message, ORANGE);
}

export function formatErrorMessage(message: string) {
  return colorize(message, ORANGE);
}
