"use client";

import Script from "next/script";

type ReactGrabEnv = {
  NEXT_PUBLIC_ENABLE_REACT_GRAB?: string;
  NODE_ENV?: string;
};

export function shouldLoadReactGrab(env: ReactGrabEnv) {
  return env.NODE_ENV === "development" && env.NEXT_PUBLIC_ENABLE_REACT_GRAB === "true";
}

export function ReactGrabLoader() {
  if (!shouldLoadReactGrab(process.env)) {
    return null;
  }

  return (
    <Script
      id="react-grab-loader"
      src="https://unpkg.com/react-grab/dist/index.global.js"
      crossOrigin="anonymous"
      strategy="afterInteractive"
    />
  );
}
