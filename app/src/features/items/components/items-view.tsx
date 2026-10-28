"use client";

import { useEffect, useState, type ReactNode } from "react";
import { EmptyState } from "@/components/layout/empty-state";
import { ErrorState } from "@/components/layout/error-state";
import { PageHeader } from "@/components/layout/page-header";
import type { Category, Item, User } from "@/types/domain";
import { useItems } from "../api";
import { SEARCH_DEBOUNCE_MS } from "../constants";
import { AddItemDialog } from "./add-item-dialog";
import { ItemCard, ItemCardSkeleton } from "./item-card";
import { ItemFilters } from "./item-filters";

const STRINGS = {
  title: "Catalogue",
  memberDescription: "Request equipment. An admin approves it before you can pick it up.",
  adminDescription: "Manage the equipment members can request.",
  emptyTitle: "No items in the catalogue",
  emptyAdminDescription: "Add the first item to get started.",
  emptyMemberDescription: "Ask an admin to add equipment.",
  noResultsTitle: "No items match",
  noResultsDescription: "Try a different search or category.",
  listLabel: "Items",
};

type CategoryFilter = Category | "all";

function useDebouncedValue<T>(value: T, delayMs: number): T {
  const [debounced, setDebounced] = useState(value);
  useEffect(() => {
    const handle = setTimeout(() => setDebounced(value), delayMs);
    return () => clearTimeout(handle);
  }, [value, delayMs]);
  return debounced;
}

type ItemsViewProps = {
  user: User;
  memberAction?: (item: Item) => ReactNode;
};

export function ItemsView({ user, memberAction }: ItemsViewProps) {
  const [query, setQuery] = useState("");
  const [category, setCategory] = useState<CategoryFilter>("all");
  const debouncedQuery = useDebouncedValue(query, SEARCH_DEBOUNCE_MS);
  const items = useItems({ query: debouncedQuery, category });
  const filtersActive = debouncedQuery.trim() !== "" || category !== "all";
  const isAdmin = user.role === "admin";

  return (
    <>
      <PageHeader
        title={STRINGS.title}
        description={isAdmin ? STRINGS.adminDescription : STRINGS.memberDescription}
        actions={isAdmin ? <AddItemDialog /> : null}
      />
      <ItemFilters query={query} onQueryChange={setQuery} category={category} onCategoryChange={setCategory} />

      {items.isPending ? (
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3" aria-busy="true" data-testid="item-list-loading">
          {Array.from({ length: 6 }, (_, index) => (
            <ItemCardSkeleton key={index} />
          ))}
        </div>
      ) : items.isError ? (
        <ErrorState error={items.error} onRetry={() => items.refetch()} />
      ) : items.data.length === 0 ? (
        <EmptyState
          title={filtersActive ? STRINGS.noResultsTitle : STRINGS.emptyTitle}
          description={
            filtersActive ? STRINGS.noResultsDescription : isAdmin ? STRINGS.emptyAdminDescription : STRINGS.emptyMemberDescription
          }
        />
      ) : (
        <ul className="grid list-none gap-4 sm:grid-cols-2 lg:grid-cols-3" aria-label={STRINGS.listLabel} data-testid="item-list">
          {items.data.map((item) => (
            <li key={item.id}>
              <ItemCard item={item} user={user} memberAction={memberAction} />
            </li>
          ))}
        </ul>
      )}
    </>
  );
}
