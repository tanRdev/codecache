export function isMockModeEnabled(): boolean {
  return process.env.NEXT_PUBLIC_MOCK_MODE === "true" || process.env.MOCK_MODE === "true";
}

export const isMockMode = isMockModeEnabled();

export function enableMockMode(): void {
  process.env.NEXT_PUBLIC_MOCK_MODE = "true";
}

export function disableMockMode(): void {
  process.env.NEXT_PUBLIC_MOCK_MODE = "false";
}
