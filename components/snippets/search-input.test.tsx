import { act, fireEvent, render, screen } from "@testing-library/react";
import { beforeEach, describe, expect, it, vi } from "vitest";
import { SearchInput } from "./search-input";

const push = vi.fn();
const replace = vi.fn();
const useSearchParamsMock = vi.fn();

vi.mock("next/navigation", () => ({
  useRouter: () => ({
    push,
    replace,
  }),
  useSearchParams: () => useSearchParamsMock(),
}));

describe("SearchInput", () => {
  beforeEach(() => {
    push.mockReset();
    replace.mockReset();
    useSearchParamsMock.mockReset();
    vi.useRealTimers();
  });

  it("disables native search field controls that cause layout shift", () => {
    useSearchParamsMock.mockReturnValue(new URLSearchParams(""));

    render(<SearchInput />);

    expect(
      screen.getByRole("searchbox", {
        name: "Search snippets",
      }).className
    ).toContain("[&::-webkit-search-cancel-button]:appearance-none");
  });

  it("debounces dashboard navigation while typing", () => {
    vi.useFakeTimers();
    useSearchParamsMock.mockReturnValue(new URLSearchParams(""));

    render(<SearchInput />);

    fireEvent.change(
      screen.getByRole("searchbox", {
        name: "Search snippets",
      }),
      {
        target: { value: "Python" },
      }
    );

    expect(replace).not.toHaveBeenCalled();

    act(() => {
      vi.advanceTimersByTime(180);
    });

    expect(replace).toHaveBeenCalledWith("/dashboard?q=Python");
  });

  it("keeps the full typed query during rapid input", () => {
    vi.useFakeTimers();
    useSearchParamsMock.mockReturnValue(new URLSearchParams(""));

    render(<SearchInput />);

    const input = screen.getByRole("searchbox", {
      name: "Search snippets",
    });

    fireEvent.change(input, { target: { value: "P" } });
    fireEvent.change(input, { target: { value: "Py" } });
    fireEvent.change(input, { target: { value: "Pyt" } });
    fireEvent.change(input, { target: { value: "Pyth" } });
    fireEvent.change(input, { target: { value: "Pytho" } });
    fireEvent.change(input, { target: { value: "Python" } });

    expect(input).toHaveValue("Python");

    act(() => {
      vi.advanceTimersByTime(180);
    });

    expect(replace).toHaveBeenCalledTimes(1);
    expect(replace).toHaveBeenCalledWith("/dashboard?q=Python");
  });

  it("keeps the field value in sync after clearing the query param", () => {
    useSearchParamsMock.mockReturnValue(new URLSearchParams("q=Python"));

    const view = render(<SearchInput />);
    const input = screen.getByRole("searchbox", {
      name: "Search snippets",
    });

    expect(input).toHaveValue("Python");

    useSearchParamsMock.mockReturnValue(new URLSearchParams(""));
    view.rerender(<SearchInput />);

    expect(
      screen.getByRole("searchbox", {
        name: "Search snippets",
      })
    ).toHaveValue("");
  });

  it("pushes an empty dashboard URL when the query is cleared", () => {
    vi.useFakeTimers();
    useSearchParamsMock.mockReturnValue(new URLSearchParams("q=Python"));

    render(<SearchInput />);

    fireEvent.click(
      screen.getByRole("button", {
        name: "Clear search",
      })
    );

    act(() => {
      vi.advanceTimersByTime(180);
    });

    expect(replace).toHaveBeenCalledWith("/dashboard");
  });
});
