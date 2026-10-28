"use client";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { formatDateTime } from "@/lib/format";
import type { Rental, User } from "@/types/domain";
import { RENTAL_STATUS_CLASSES, RENTAL_STATUS_LABELS } from "../constants";
import type { RentalAction } from "../api";

const STRINGS = {
  requestedBy: "Requested by",
  requestedAt: "Requested",
  approve: "Approve",
  reject: "Reject",
  return: "Return",
  confirmReturn: "Confirm return",
  working: "Working…",
};

type RentalRowProps = {
  rental: Rental;
  user: User;
  pendingAction: RentalAction | null;
  onAction: (rental: Rental, action: RentalAction) => void;
};

/** Which buttons a role sees for a rental in a given status. */
function actionsFor(rental: Rental, user: User): Array<{ action: RentalAction; label: string; variant: "default" | "outline" | "destructive" }> {
  if (user.role === "admin") {
    if (rental.status === "requested") {
      return [
        { action: "approve", label: STRINGS.approve, variant: "default" },
        { action: "reject", label: STRINGS.reject, variant: "outline" },
      ];
    }
    if (rental.status === "return-pending") return [{ action: "confirm-return", label: STRINGS.confirmReturn, variant: "default" }];
    return [];
  }
  if (rental.status === "approved") return [{ action: "return", label: STRINGS.return, variant: "outline" }];
  return [];
}

export function RentalRow({ rental, user, pendingAction, onAction }: RentalRowProps) {
  const actions = actionsFor(rental, user);
  return (
    <li
      data-testid="rental-row"
      data-rental-id={rental.id}
      data-status={rental.status}
      className="flex flex-wrap items-center justify-between gap-3 rounded-lg border px-4 py-3 text-sm"
    >
      <div className="grid gap-1">
        <span className="font-medium" data-testid="rental-item-name">
          {rental.itemName}
        </span>
        <span className="text-xs text-muted-foreground">
          {user.role === "admin" ? (
            <>
              {STRINGS.requestedBy} <span data-testid="rental-member-name">{rental.memberName}</span> ·{" "}
            </>
          ) : null}
          {STRINGS.requestedAt} <time dateTime={rental.requestedAt}>{formatDateTime(rental.requestedAt)}</time>
        </span>
      </div>
      <div className="flex items-center gap-2">
        <Badge variant="outline" className={RENTAL_STATUS_CLASSES[rental.status]} data-testid="rental-status" data-status={rental.status}>
          {RENTAL_STATUS_LABELS[rental.status]}
        </Badge>
        {actions.map(({ action, label, variant }) => (
          <Button
            key={action}
            size="sm"
            variant={variant}
            disabled={pendingAction !== null}
            aria-label={`${label} ${rental.itemName}`}
            onClick={() => onAction(rental, action)}
          >
            {pendingAction === action ? STRINGS.working : label}
          </Button>
        ))}
      </div>
    </li>
  );
}
