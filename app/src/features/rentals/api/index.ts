import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { apiRequest, type ApiError } from "@/lib/api-client";
import type { MutationConfig } from "@/lib/react-query";
import type { Rental, RentalStatus } from "@/types/domain";

export const rentalKeys = {
  all: ["rentals"] as const,
  lists: () => [...rentalKeys.all, "list"] as const,
  list: (status: RentalStatus | "all") => [...rentalKeys.lists(), status] as const,
};

/** Items change status with every rental action, so both caches are invalidated together. */
const RELATED_KEYS = [rentalKeys.all, ["items"] as const];

export function getRentals(status: RentalStatus | "all", signal?: AbortSignal): Promise<{ items: Rental[] }> {
  const suffix = status === "all" ? "" : `?status=${status}`;
  return apiRequest<{ items: Rental[] }>(`/api/rentals${suffix}`, { signal });
}

export function useRentals(status: RentalStatus | "all", options: { enabled?: boolean } = {}) {
  return useQuery({
    queryKey: rentalKeys.list(status),
    queryFn: ({ signal }) => getRentals(status, signal),
    select: (data) => data.items,
    enabled: options.enabled ?? true,
  });
}

function useInvalidateRelated() {
  const queryClient = useQueryClient();
  return async () => {
    await Promise.all(RELATED_KEYS.map((queryKey) => queryClient.invalidateQueries({ queryKey })));
  };
}

export function requestRental(itemId: string): Promise<Rental> {
  return apiRequest<Rental>("/api/rentals", { method: "POST", body: { itemId } });
}

export function useRequestRental(config: MutationConfig<Rental, string, ApiError> = {}) {
  const invalidate = useInvalidateRelated();
  return useMutation<Rental, ApiError, string>({
    mutationKey: ["rentals", "request"],
    mutationFn: requestRental,
    ...config,
    onSuccess: (...args) => config.onSuccess?.(...args),
    // Refetch on success and on failure: a rejected action means the view was
    // stale, and the server state is the truth.
    onSettled: async (...args) => {
      await invalidate();
      await config.onSettled?.(...args);
    },
  });
}

export type RentalAction = "approve" | "reject" | "return" | "confirm-return";
export type RentalActionVariables = { rentalId: string; action: RentalAction };

export function performRentalAction({ rentalId, action }: RentalActionVariables): Promise<Rental> {
  return apiRequest<Rental>(`/api/rentals/${encodeURIComponent(rentalId)}/${action}`, { method: "POST" });
}

export function useRentalAction(config: MutationConfig<Rental, RentalActionVariables, ApiError> = {}) {
  const invalidate = useInvalidateRelated();
  return useMutation<Rental, ApiError, RentalActionVariables>({
    mutationKey: ["rentals", "action"],
    mutationFn: performRentalAction,
    ...config,
    onSuccess: (...args) => config.onSuccess?.(...args),
    onSettled: async (...args) => {
      await invalidate();
      await config.onSettled?.(...args);
    },
  });
}
