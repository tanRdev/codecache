"use client";

import { Suspense, useEffect, useState, type FormEvent } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { CircleNotch } from "@phosphor-icons/react";
import { CacheBrand } from "@/components/cache-brand";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { createOwner, getAuthSetup } from "@/app/actions/auth";
import { isMarketingDeployment } from "@/lib/deployment-mode";

export default function SetupPage() {
  return (
    <Suspense fallback={<div className="flex min-h-screen items-center justify-center">Loading…</div>}>
      <SetupContent />
    </Suspense>
  );
}

function SetupContent() {
  const marketingDeployment = isMarketingDeployment();
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [setupToken, setSetupToken] = useState("");
  const [authSetup, setAuthSetup] = useState<{ ownerExists: boolean; setupEnabled: boolean } | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const statusMessage = authSetup === null
    ? "Loading setup status…"
    : isLoading
      ? "Creating owner…"
      : null;

  useEffect(() => {
    if (marketingDeployment) {
      return;
    }

    void getAuthSetup().then((result) => {
      setAuthSetup(result);
    });
  }, [marketingDeployment]);

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
                  Setup stays local.
                </h1>
                <p className="text-[14px] leading-7 text-muted-foreground">
                  First owner account must be created on your local or self-hosted Cache app, not on a marketing-only deployment.
                </p>
              </div>
            </header>

            <div className="space-y-4">
              <div className="rounded-xl border border-border-subtle bg-muted/35 px-4 py-3 text-[13px] leading-6 text-muted-foreground">
                Run local Cache, open <code>http://127.0.0.1:3000/setup</code>, and finish owner setup there. Deployed landing page does not host setup or snippet UI.
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

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setIsLoading(true);
    setError(null);

    const result = await createOwner({ email, password, setupToken });

    setIsLoading(false);

    if (!result.success) {
      setError(result.error ?? "Owner setup failed");
      return;
    }

    router.push("/dashboard");
    router.refresh();
  }

  return (
    <main className="min-h-screen bg-background text-foreground">
      <div className="mx-auto flex min-h-screen w-full max-w-5xl flex-col justify-center px-6 py-10 md:px-8 lg:px-10">
        <div className="mx-auto w-full max-w-md rounded-[28px] border border-border-subtle bg-card p-6 shadow-[0_28px_80px_rgba(0,0,0,0.24)] sm:p-8">
          <p aria-live="polite" className="sr-only">
            {statusMessage}
          </p>

          <header className="mb-8 space-y-4">
            <CacheBrand href="/" showDescriptor={false} />
            <div className="space-y-2">
              <p className="text-[11px] uppercase tracking-[0.28em] text-primary">Operator setup</p>
              <h1 className="font-heading text-[30px] leading-[1.12] font-medium tracking-[-0.03em] text-foreground">
                Create first owner.
              </h1>
              <p className="text-[14px] leading-7 text-muted-foreground">
                Use server setup token to initialize first owner account for this deployment.
              </p>
            </div>
          </header>

          {authSetup === null ? (
            <div className="flex items-center justify-center py-8">
              <CircleNotch aria-hidden="true" className="size-6 animate-spin text-muted-foreground" weight="bold" />
              <span className="sr-only">Loading setup status…</span>
            </div>
          ) : authSetup.ownerExists ? (
            <div className="space-y-4">
              <div className="rounded-xl border border-border-subtle bg-muted/35 px-4 py-3 text-[13px] leading-6 text-muted-foreground">
                Owner already exists for this deployment.
              </div>
              <Link href="/sign-in" className="inline-flex h-11 w-full items-center justify-center rounded-xl border border-primary bg-primary px-4 text-[14px] font-medium text-background">
                Go to sign in
              </Link>
            </div>
          ) : !authSetup.setupEnabled ? (
            <div className="space-y-4">
              <div className="rounded-xl border border-destructive/30 bg-destructive/10 px-4 py-3 text-[13px] leading-6 text-destructive">
                OWNER_SETUP_TOKEN is not configured. Add it to environment, restart app, then return here.
              </div>
              <Link href="/docs/getting-started/installation" className="inline-flex h-11 w-full items-center justify-center rounded-xl border border-border-subtle px-4 text-[14px] font-medium text-foreground">
                Read installation docs
              </Link>
            </div>
          ) : (
            <form onSubmit={handleSubmit} className="space-y-5">
              <div className="flex flex-col gap-2">
                <label htmlFor="email" className="text-[11px] uppercase tracking-[0.24em] text-muted-foreground">
                  Email
                </label>
                <Input
                  id="email"
                  name="email"
                  type="email"
                  value={email}
                  onChange={(event) => setEmail(event.target.value)}
                  required
                  autoComplete="email"
                  spellCheck={false}
                  disabled={isLoading}
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
                  value={password}
                  onChange={(event) => setPassword(event.target.value)}
                  required
                  minLength={12}
                  autoComplete="new-password"
                  disabled={isLoading}
                  className="h-11 rounded-xl border-border-subtle bg-muted/55 px-4 text-[14px]"
                />
              </div>

              <div className="flex flex-col gap-2">
                <label htmlFor="setup-token" className="text-[11px] uppercase tracking-[0.24em] text-muted-foreground">
                  Setup token
                </label>
                <Input
                  id="setup-token"
                  name="setup-token"
                  type="password"
                  value={setupToken}
                  onChange={(event) => setSetupToken(event.target.value)}
                  required
                  autoComplete="off"
                  disabled={isLoading}
                  className="h-11 rounded-xl border-border-subtle bg-muted/55 px-4 text-[14px]"
                />
              </div>

              {error ? (
                <p role="alert" className="rounded-xl border border-destructive/30 bg-destructive/15 px-3 py-2.5 text-[13px] leading-6 text-destructive">
                  {error}
                </p>
              ) : null}

              <Button type="submit" disabled={isLoading} size="lg" className="h-11 w-full rounded-xl text-[14px]">
                {isLoading ? (
                  <>
                    <CircleNotch aria-hidden="true" className="mr-2 size-4 animate-spin" weight="bold" />
                    Creating owner…
                  </>
                ) : (
                  "Create Owner"
                )}
              </Button>
            </form>
          )}
        </div>
      </div>
    </main>
  );
}
