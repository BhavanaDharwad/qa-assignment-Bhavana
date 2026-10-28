"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { PackageIcon } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { useSession, useSignOut } from "@/features/auth/api";
import { cn } from "@/lib/utils";

const STRINGS = {
  appName: "Kit Desk",
  items: "Catalogue",
  rentals: "Rentals",
  signOut: "Sign out",
  signingOut: "Signing out…",
  admin: "Admin",
  member: "Member",
};

const NAV: { href: string; label: string }[] = [
  { href: "/items", label: STRINGS.items },
  { href: "/rentals", label: STRINGS.rentals },
];

export function AppShell({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const router = useRouter();
  const session = useSession();
  const signOut = useSignOut({ onSuccess: () => router.replace("/sign-in") });
  const user = session.data ?? null;

  return (
    <>
      <header className="border-b bg-card">
        <div className="mx-auto flex h-14 w-full max-w-5xl items-center justify-between px-4">
          <div className="flex items-center gap-6">
            <Link href="/items" className="flex items-center gap-2 font-semibold" aria-label={STRINGS.appName}>
              <PackageIcon className="size-5" aria-hidden />
              {STRINGS.appName}
            </Link>
            {user ? (
              <nav aria-label="Main" className="flex items-center gap-4">
                {NAV.map((entry) => {
                  const active = pathname.startsWith(entry.href);
                  return (
                    <Link
                      key={entry.href}
                      href={entry.href}
                      aria-current={active ? "page" : undefined}
                      className={cn("text-sm text-muted-foreground hover:text-foreground", active && "font-medium text-foreground")}
                    >
                      {entry.label}
                    </Link>
                  );
                })}
              </nav>
            ) : null}
          </div>
          {user ? (
            <div className="flex items-center gap-3" data-testid="session-info">
              <span className="text-sm" data-testid="session-name">
                {user.name}
              </span>
              <Badge variant={user.role === "admin" ? "default" : "secondary"} data-testid="session-role" data-role={user.role}>
                {user.role === "admin" ? STRINGS.admin : STRINGS.member}
              </Badge>
              <Button variant="outline" size="sm" onClick={() => signOut.mutate()} disabled={signOut.isPending}>
                {signOut.isPending ? STRINGS.signingOut : STRINGS.signOut}
              </Button>
            </div>
          ) : null}
        </div>
      </header>
      <main className="mx-auto w-full max-w-5xl flex-1 px-4 py-8">{children}</main>
    </>
  );
}
