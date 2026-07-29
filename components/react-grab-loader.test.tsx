import { render, screen } from "@testing-library/react";
import { beforeEach, describe, expect, it, vi } from "vitest";
import { ReactGrabLoader, shouldLoadReactGrab } from "./react-grab-loader";

vi.mock("next/script", () => ({
  default: ({ src, strategy, crossOrigin }: { src?: string; strategy?: string; crossOrigin?: string }) => (
    <div
      data-testid="react-grab-script"
      data-src={src}
      data-strategy={strategy}
      data-cross-origin={crossOrigin}
    />
  ),
}));

describe("shouldLoadReactGrab", () => {
  beforeEach(() => {
    delete process.env.NEXT_PUBLIC_ENABLE_REACT_GRAB;
    Reflect.set(process.env, "NODE_ENV", "test");
  });

  it("stays disabled by default in development", () => {
    expect(
      shouldLoadReactGrab({
        NODE_ENV: "development",
      })
    ).toBe(false);
  });

  it("requires an explicit opt-in flag", () => {
    expect(
      shouldLoadReactGrab({
        NODE_ENV: "development",
        NEXT_PUBLIC_ENABLE_REACT_GRAB: "true",
      })
    ).toBe(true);
  });

  it("never loads outside development", () => {
    expect(
      shouldLoadReactGrab({
        NODE_ENV: "production",
        NEXT_PUBLIC_ENABLE_REACT_GRAB: "true",
      })
    ).toBe(false);
  });

  it("uses the documented global script in development when enabled", () => {
    Reflect.set(process.env, "NODE_ENV", "development");
    process.env.NEXT_PUBLIC_ENABLE_REACT_GRAB = "true";

    render(<ReactGrabLoader />);

    expect(screen.getByTestId("react-grab-script")).toHaveAttribute(
      "data-src",
      "https://unpkg.com/react-grab/dist/index.global.js"
    );
    expect(screen.getByTestId("react-grab-script")).toHaveAttribute(
      "data-strategy",
      "afterInteractive"
    );
    expect(screen.getByTestId("react-grab-script")).toHaveAttribute("data-cross-origin", "anonymous");
  });
});
