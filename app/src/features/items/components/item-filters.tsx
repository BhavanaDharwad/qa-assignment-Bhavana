"use client";

import { SearchIcon } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import type { Category } from "@/types/domain";
import { CATEGORY_EMOJI, CATEGORY_LABELS, CATEGORY_ORDER } from "../constants";

const STRINGS = {
  searchLabel: "Search items",
  searchPlaceholder: "Search by name",
  filterLabel: "Filter by category",
  all: "All",
};

type CategoryFilter = Category | "all";

type ItemFiltersProps = {
  query: string;
  onQueryChange: (query: string) => void;
  category: CategoryFilter;
  onCategoryChange: (category: CategoryFilter) => void;
};

function isCategoryFilter(value: unknown): value is CategoryFilter {
  return value === "all" || (typeof value === "string" && (CATEGORY_ORDER as string[]).includes(value));
}

export function ItemFilters({ query, onQueryChange, category, onCategoryChange }: ItemFiltersProps) {
  return (
    <div className="mb-6 flex flex-wrap items-center justify-between gap-3">
      <div className="relative w-full max-w-sm">
        <SearchIcon className="pointer-events-none absolute top-1/2 left-2.5 size-4 -translate-y-1/2 text-muted-foreground" aria-hidden />
        <Input
          type="search"
          aria-label={STRINGS.searchLabel}
          placeholder={STRINGS.searchPlaceholder}
          value={query}
          onChange={(event) => onQueryChange(event.target.value)}
          className="pl-8"
        />
      </div>
      <Tabs
        value={category}
        onValueChange={(value) => {
          if (isCategoryFilter(value)) onCategoryChange(value);
        }}
      >
        <TabsList aria-label={STRINGS.filterLabel}>
          <TabsTrigger value="all">{STRINGS.all}</TabsTrigger>
          {CATEGORY_ORDER.map((value) => (
            <TabsTrigger key={value} value={value}>
              <span aria-hidden>{CATEGORY_EMOJI[value]}</span>
              {CATEGORY_LABELS[value]}
            </TabsTrigger>
          ))}
        </TabsList>
      </Tabs>
    </div>
  );
}
