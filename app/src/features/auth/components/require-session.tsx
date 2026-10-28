"use client";

import { useRouter } from "next/navigation";
import { useEffect, type ReactNode } from "react";
import { ErrorState } from "@/components/layout/error-state";
import { Skeleton } from "@/components/ui/skeleton";
import type { User } from "@/types/domain";
import { useSession } from "../api";

/**
 * Renders children only with a signed-in user. Redirects to /sign-in otherwise.
 * The session is fetched over the network like everything else.
 */
export function RequireSession({ children }: { children: (user: User) => ReactNode }) {
  const router = useRouter();
  const session = useSession();
  const signedOut = session.isSuccess && session.data === null;

  useEffect(() => {
    if (signedOut) router.replace("/sign-in");
  }, [signedOut, router]);

  if (session.isError) {
    return <ErrorState error={session.error} onRetry={() => session.refetch()} />;
  }
  if (session.isPending || session.data === null) {
    return (
      <div className="grid gap-4" aria-busy="true" data-testid="session-loading">
        <Skeleton className="h-8 w-1/3" />
        <Skeleton className="h-40 w-full" />
      </div>
    );
  }
  return <>{children(session.data)}</>;
}
