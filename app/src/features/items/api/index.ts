import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { apiRequest, type ApiError } from "@/lib/api-client";
import type { MutationConfig } from "@/lib/react-query";
import type { Category, Item, NewItem } from "@/types/domain";

export type ItemListFilter = { query: string; category: Category | "all" };

export const itemKeys = {
  all: ["items"] as const,
  lists: () => [...itemKeys.all, "list"] as const,
  list: (filter: ItemListFilter) => [...itemKeys.lists(), filter] as const,
};

export function getItems(filter: ItemListFilter, signal?: AbortSignal): Promise<{ items: Item[] }> {
  const params = new URLSearchParams();
  if (filter.query.trim()) params.set("q", filter.query.trim());
  if (filter.category !== "all") params.set("category", filter.category);
  const suffix = params.size > 0 ? `?${params.toString()}` : "";
  return apiRequest<{ items: Item[] }>(`/api/items${suffix}`, { signal });
}

export function useItems(filter: ItemListFilter) {
  return useQuery({
    queryKey: itemKeys.list(filter),
    queryFn: ({ signal }) => getItems(filter, signal),
    select: (data) => data.items,
  });
}

export function createItem(input: NewItem): Promise<Item> {
  return apiRequest<Item>("/api/items", { method: "POST", body: input });
}

export function useCreateItem(config: MutationConfig<Item, NewItem, ApiError> = {}) {
  const queryClient = useQueryClient();
  return useMutation<Item, ApiError, NewItem>({
    mutationKey: ["items", "create"],
    mutationFn: createItem,
    ...config,
    onSuccess: async (...args) => {
      await queryClient.invalidateQueries({ queryKey: itemKeys.all });
      await config.onSuccess?.(...args);
    },
  });
}

export function deleteItem(id: string): Promise<void> {
  return apiRequest<void>(`/api/items/${encodeURIComponent(id)}`, { method: "DELETE" });
}

export function useDeleteItem(config: MutationConfig<void, string, ApiError> = {}) {
  const queryClient = useQueryClient();
  return useMutation<void, ApiError, string>({
    mutationKey: ["items", "delete"],
    mutationFn: deleteItem,
    ...config,
    onSuccess: async (...args) => {
      await queryClient.invalidateQueries({ queryKey: itemKeys.all });
      await config.onSuccess?.(...args);
    },
  });
}
