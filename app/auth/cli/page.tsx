import { redirect } from "next/navigation";
import type { Metadata } from "next";
import { auth } from "@/lib/auth";

export const metadata: Metadata = {
  title: "CLI Authentication",
  description: "Authenticate the Cache CLI through your browser.",
};

interface CliAuthPageProps {
  searchParams: Promise<{
    callback?: string;
    name?: string;
  }>;
}

function buildSearchString(callback: string, name?: string) {
  const params = new URLSearchParams();
  params.set("callback", callback);

  if (name?.trim()) {
    params.set("name", name.trim());
  }

  return params.toString();
}

export default async function CliAuthPage({ searchParams }: CliAuthPageProps) {
  const params = await searchParams;
  const callback = params.callback;

  if (!callback) {
    return (
      <main className="flex min-h-screen items-center justify-center bg-background px-6 text-foreground">
        <div className="max-w-md border border-border bg-muted p-8 text-center">
          <p className="text-[11px] uppercase tracking-[0.22em] text-primary">CLI auth</p>
          <h1 className="mt-4 text-2xl font-semibold tracking-tight">Missing callback</h1>
          <p className="mt-3 text-sm leading-6 text-muted-foreground">
            Open this route from the Cache CLI so it can finish the browser login flow.
          </p>
        </div>
      </main>
    );
  }

  const queryString = buildSearchString(callback, params.name);
  const session = await auth();

  if (!session?.user?.id) {
    redirect(`/sign-in?callbackUrl=${encodeURIComponent(`/auth/cli?${queryString}`)}`);
  }

  redirect(`/api/v1/auth/browser-login?${queryString}`);
}
