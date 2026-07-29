const LOCAL_REDIRECT_ORIGIN = "http://cache.local";

export function getSafeRedirectTarget(
  callbackUrl: string | null | undefined,
  fallback = "/dashboard",
) {
  if (!callbackUrl || !callbackUrl.startsWith("/") || callbackUrl.startsWith("//")) {
    return fallback;
  }

  try {
    const target = new URL(callbackUrl, LOCAL_REDIRECT_ORIGIN);

    if (target.origin !== LOCAL_REDIRECT_ORIGIN) {
      return fallback;
    }

    const normalizedTarget = `${target.pathname}${target.search}${target.hash}`;

    if (normalizedTarget.startsWith("//")) {
      return fallback;
    }

    return normalizedTarget;
  } catch {
    return fallback;
  }
}
