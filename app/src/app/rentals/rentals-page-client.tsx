"use client";

import { RequireSession } from "@/features/auth/components/require-session";
import { RentalsView } from "@/features/rentals/components/rentals-view";

export function RentalsPageClient() {
  return <RequireSession>{(user) => <RentalsView user={user} />}</RequireSession>;
}
