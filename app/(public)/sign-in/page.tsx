"use client";

import { Suspense, useEffect, useState, type FormEvent } from "react";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { CircleNotch } from "@phosphor-icons/react";
import { CacheBrand } from "@/components/cache-brand";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { getAuthSetup, signIn, signInWithSetupToken } from "@/app/actions/auth";
import { isMarketingDeployment } from "@/lib/deployment-mode";

const SAFE_PATH = /^\/[a-zA-Z0-9\-._~!$&'()*+,;=:@?#%]*$/;

function getSafeRedirectTarget(callbackUrl: string): string {
  return SAFE_PATH.test(callbackUrl) && !callbackUrl.startsWith("//") ? callbackUrl : "/dashboard";
}

export default function SignInPage() {
  return (
    <Suspense fallback={<div className="flex min-h-screen items-center justify-center">Loading…</div>}>
      <SignInContent />
    </Suspense>
  );
}

function SignInContent() {
  const marketingDeployment = isMarketingDeployment();
  const router = useRouter();
  const searchParams = useSearchParams();
  const callbackUrl = searchParams.get("callbackUrl") || "/dashboard";
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [setupToken, setSetupToken] = useState("");
  const [authSetup, setAuthSetup] = useState<{ ownerExists: boolean; setupEnabled: boolean } | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [loginMode, setLoginMode] = useState<"password" | "setup-token">("password");
  const statusMessage = isLoading ? "Signing in…" : null;

  useEffect(() => {
    if (marketingDeployment) {
      return;
    }

    void getAuthSetup().then((result) => {
      setAuthSetup(result);
    });
  }, [marketingDeployment]);

  const ownerExists = authSetup?.ownerExists ?? null;

  if (marketingDeployment) {
    return (
      <main className="min-h-screen bg-background text-foreground">
        <div className="mx-auto flex min-h-screen w-full max-w-5xl flex-col justify-center px-6 py-10 md:px-8 lg:px-10">
          <div className="mx-auto w-full max-w-md rounded-[28px] border border-border-subtle bg-card p-6 shadow-[0_28px_80px_rgba(0,0,0,0.24)] sm:p-8">
            <header className="mb-8 space-y-4">
              <CacheBrand href="/" showDescriptor={false} />
              <div className="space-y-2">
                <p className="text-[11px] uppercase tracking-[0.28em] text-primary">Marketing deployment</p>
                <h1 className="font-heading text-[30px] leading-[1.12] font-medium tracking-[-0.03em] text-foreground">
                  Sign in locally.
                </h1>
                <p className="text-[14px] leading-7 text-muted-foreground">
                  This deployment is landing page only. Run Cache locally or on your own server for the real app.
                </p>
              </div>
            </header>

            <div className="space-y-4">
              <div className="rounded-xl border border-border-subtle bg-muted/35 px-4 py-3 text-[13px] leading-6 text-muted-foreground">
                Start local Cache, open <code>http://127.0.0.1:3000/sign-in</code>, and use full web UI there. Deployed site does not load snippet data.
              </div>
              <div className="flex flex-col gap-3 sm:flex-row">
                <Link href="/docs/getting-started/installation" className="inline-flex h-11 items-center justify-center rounded-xl border border-primary bg-primary px-4 text-[14px] font-medium text-background">
                  Read local setup docs
                </Link>
              </div>
            </div>
          </div>
        </div>
      </main>
    );
  }

  async function handlePasswordSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();

    if (!authSetup?.ownerExists) {
      return;
    }

    setIsLoading(true);
    setError(null);

    const result = await signIn({ email, password });

    setIsLoading(false);

    if (!result.success) {
      setError(result.error ?? "Authentication failed");
      return;
    }

    router.push(getSafeRedirectTarget(callbackUrl));
    router.refresh();
  }

  async function handleSetupTokenSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();

    setIsLoading(true);
    setError(null);

    const result = await signInWithSetupToken({ setupToken });

    setIsLoading(false);

    if (!result.success) {
      setError(result.error ?? "Authentication failed");
      return;
    }

    router.push(getSafeRedirectTarget(callbackUrl));
    router.refresh();
  }

  return (
    <main className="min-h-screen bg-background text-foreground">
      <div className="mx-auto flex min-h-screen w-full max-w-5xl flex-col justify-center px-6 py-10 md:px-8 lg:px-10">
        <div className="mx-auto w-full max-w-md rounded-[28px] border border-border-subtle bg-card p-6 shadow-[0_28px_80px_rgba(0,0,0,0.24)] sm:p-8">
          <header className="mb-8 space-y-4">
            <CacheBrand href="/" showDescriptor={false} />
            <div className="space-y-2">
              <p className="text-[11px] uppercase tracking-[0.28em] text-primary">
                {ownerExists === false ? "Instance setup required" : "Sign in"}
              </p>
              <h1 className="font-heading text-[30px] leading-[1.12] font-medium tracking-[-0.03em] text-foreground">
                {ownerExists === false ? "Owner account not initialized." : "Welcome back."}
              </h1>
              <p className="text-[14px] leading-7 text-muted-foreground">
                {ownerExists === false
                  ? "This deployment does not have an owner yet. Only the operator can initialize it."
                  : "Use local owner credentials to open your library."}
              </p>
            </div>
          </header>

          {ownerExists === false ? (
            <div className="space-y-4">
              <div className="rounded-xl border border-border-subtle bg-muted/35 px-4 py-3 text-[13px] leading-6 text-muted-foreground">
                {authSetup?.setupEnabled
                  ? "Open operator setup and enter the server setup token to create the first owner account."
                  : "This server has no OWNER_SETUP_TOKEN configured yet. Set it in environment, restart app, then open setup."}
              </div>
              <div className="flex flex-col gap-3 sm:flex-row">
                <Link href="/setup" className="inline-flex h-11 items-center justify-center rounded-xl border border-primary bg-primary px-4 text-[14px] font-medium text-background">
                  Open setup
                </Link>
                <Link href="/docs/getting-started/installation" className="inline-flex h-11 items-center justify-center rounded-xl border border-border-subtle px-4 text-[14px] font-medium text-foreground">
                  Read setup docs
                </Link>
              </div>
            </div>
          ) : (
          <div className="space-y-5">
            <p aria-live="polite" className="sr-only">
              {statusMessage}
            </p>

            {authSetup?.setupEnabled && (
              <div className="flex rounded-xl border border-border-subtle bg-muted/35 p-1">
                <button
                  type="button"
                  onClick={() => setLoginMode("password")}
                  aria-pressed={loginMode === "password"}
                  aria-controls="password-sign-in-form"
                  className={`flex-1 rounded-lg px-3 py-2 text-[12px] font-medium transition-colors ${
                    loginMode === "password"
                      ? "bg-card text-foreground shadow-sm"
                      : "text-muted-foreground hover:text-foreground"
                  }`}
                >
                  Email & Password
                </button>
                <button
                  type="button"
                  onClick={() => setLoginMode("setup-token")}
                  aria-pressed={loginMode === "setup-token"}
                  aria-controls="setup-token-sign-in-form"
                  className={`flex-1 rounded-lg px-3 py-2 text-[12px] font-medium transition-colors ${
                    loginMode === "setup-token"
                      ? "bg-card text-foreground shadow-sm"
                      : "text-muted-foreground hover:text-foreground"
                  }`}
                >
                  Setup Token
                </button>
              </div>
            )}

            {error ? (
              <p role="alert" className="rounded-xl border border-destructive/30 bg-destructive/15 px-3 py-2.5 text-[13px] leading-6 text-destructive">
                {error}
              </p>
            ) : null}

            {loginMode === "password" ? (
              <form id="password-sign-in-form" onSubmit={handlePasswordSubmit} className="space-y-5">
                <div className="flex flex-col gap-2">
                  <label htmlFor="email" className="text-[11px] uppercase tracking-[0.24em] text-muted-foreground">
                    Email
                  </label>
                  <Input
                    id="email"
                    name="email"
                    type="email"
                    placeholder="you@example.com"
                    value={email}
                    onChange={(event) => setEmail(event.target.value)}
                    required
                    disabled={isLoading}
                    autoComplete="email"
                    spellCheck={false}
                    className="h-11 rounded-xl border-border-subtle bg-muted/55 px-4 text-[14px]"
                  />
                </div>

                <div className="flex flex-col gap-2">
                  <label htmlFor="password" className="text-[11px] uppercase tracking-[0.24em] text-muted-foreground">
                    Password
                  </label>
                  <Input
                    id="password"
                    name="password"
                    type="password"
                    placeholder="••••••••••••"
                    value={password}
                    onChange={(event) => setPassword(event.target.value)}
                    required
                    minLength={12}
                    disabled={isLoading}
                    autoComplete="current-password"
                    className="h-11 rounded-xl border-border-subtle bg-muted/55 px-4 text-[14px]"
                  />
                </div>

                <Button type="submit" disabled={isLoading || ownerExists === null} size="lg" className="h-11 w-full rounded-xl text-[14px]">
                  {isLoading ? (
                    <>
                      <CircleNotch aria-hidden="true" className="mr-2 size-4 animate-spin" weight="bold" />
                      Signing in…
                    </>
                  ) : (
                    "Sign In"
                  )}
                </Button>
              </form>
            ) : (
              <form id="setup-token-sign-in-form" onSubmit={handleSetupTokenSubmit} className="space-y-5">
                <div className="flex flex-col gap-2">
                  <label htmlFor="setup-token" className="text-[11px] uppercase tracking-[0.24em] text-muted-foreground">
                    Setup Token
                  </label>
                  <Input
                    id="setup-token"
                    name="setup-token"
                    type="password"
                    placeholder="Enter your setup token"
                    value={setupToken}
                    onChange={(event) => setSetupToken(event.target.value)}
                    required
                    disabled={isLoading}
                    autoComplete="off"
                    className="h-11 rounded-xl border-border-subtle bg-muted/55 px-4 text-[14px]"
                  />
                </div>

                <Button type="submit" disabled={isLoading || ownerExists === null} size="lg" className="h-11 w-full rounded-xl text-[14px]">
                  {isLoading ? (
                    <>
                      <CircleNotch aria-hidden="true" className="mr-2 size-4 animate-spin" weight="bold" />
                      Signing in…
                    </>
                  ) : (
                    "Sign In with Token"
                  )}
                </Button>
              </form>
            )}
          </div>
          )}
        </div>
      </div>
    </main>
  );
}
