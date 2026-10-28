"use client";

import { RequireSession } from "@/features/auth/components/require-session";
import { ItemsView } from "@/features/items/components/items-view";
import { RequestItemButton } from "@/features/rentals/components/request-item-button";

/** Composes the items and rentals features: the member action on a card is a rental request. */
export function ItemsPageClient() {
  return (
    <RequireSession>
      {(user) => <ItemsView user={user} memberAction={(item) => <RequestItemButton item={item} />} />}
    </RequireSession>
  );
}
