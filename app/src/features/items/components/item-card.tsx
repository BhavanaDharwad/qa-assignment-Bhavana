"use client";

import type { ReactNode } from "react";
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { pastelFromString } from "@/lib/format";
import type { Item, User } from "@/types/domain";
import { CategoryBadge, ItemStatusBadge } from "./badges";
import { RemoveItemButton } from "./remove-item-dialog";

type ItemCardProps = {
  item: Item;
  user: User;
  /** Member-side action, supplied by the route so the items feature stays independent of rentals. */
  memberAction?: (item: Item) => ReactNode;
};

export function ItemCard({ item, user, memberAction }: ItemCardProps) {
  return (
    <Card data-testid="item-card" data-item-id={item.id} data-status={item.status} className="flex flex-col">
      <CardHeader>
        <CardTitle className="text-base leading-snug" data-testid="item-name">
          {item.name}
        </CardTitle>
      </CardHeader>
      <CardContent className="flex flex-1 items-center gap-2">
        <CategoryBadge category={item.category} />
        <ItemStatusBadge status={item.status} />
      </CardContent>
      <CardFooter
        className="flex items-center justify-end gap-2 rounded-b-xl"
        style={{ backgroundColor: pastelFromString(`${item.id}:${item.name}`) }}
        data-testid="item-footer"
      >
        {user.role === "member" ? memberAction?.(item) : null}
        {user.role === "admin" ? <RemoveItemButton item={item} /> : null}
      </CardFooter>
    </Card>
  );
}

export function ItemCardSkeleton() {
  return (
    <Card data-testid="item-card-skeleton" aria-hidden className="animate-pulse">
      <CardHeader>
        <div className="h-4 w-3/4 rounded bg-muted" />
      </CardHeader>
      <CardContent>
        <div className="h-5 w-24 rounded bg-muted" />
      </CardContent>
      <CardFooter>
        <div className="h-7 w-20 rounded bg-muted" />
      </CardFooter>
    </Card>
  );
}
