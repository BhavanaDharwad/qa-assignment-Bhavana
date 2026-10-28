"use client";

import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import type { Item } from "@/types/domain";
import { useRequestRental } from "../api";

const STRINGS = {
  request: "Request",
  requesting: "Requesting…",
  unavailable: "Unavailable",
  success: (name: string) => `Requested "${name}". Waiting for approval.`,
  failure: "Could not request the item",
  label: (name: string) => `Request ${name}`,
};

/** Member-side action rendered on an item card. Only available items can be requested. */
export function RequestItemButton({ item }: { item: Item }) {
  const request = useRequestRental({
    onSuccess: (rental) => toast.success(STRINGS.success(rental.itemName)),
    onError: (error) => toast.error(STRINGS.failure, { description: error.message }),
  });
  const available = item.status === "available";
  return (
    <Button
      size="sm"
      aria-label={STRINGS.label(item.name)}
      disabled={!available || request.isPending}
      onClick={() => request.mutate(item.id)}
    >
      {request.isPending ? STRINGS.requesting : available ? STRINGS.request : STRINGS.unavailable}
    </Button>
  );
}
