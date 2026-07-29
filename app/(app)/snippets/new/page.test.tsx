import { describe, expect, it, vi } from "vitest";
import NewSnippetPage from "./page";

vi.mock("@/components/storage-badge", () => ({
  StorageBadge: ({ backend }: { backend: string }) => <div>{backend}</div>,
}));

vi.mock("@/components/snippets", () => ({
  CreateSnippetForm: () => <div>Create form</div>,
}));

describe("new snippet page", () => {
  it("renders page", async () => {
    const page = await NewSnippetPage();

    expect(page).toBeTruthy();
  });
});
