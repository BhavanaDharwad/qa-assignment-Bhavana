import type { UseMutationOptions } from "@tanstack/react-query";

/** Options a caller may pass to a mutation hook, minus the parts the hook owns. */
export type MutationConfig<TData, TVariables, TError = Error> = Omit<
  UseMutationOptions<TData, TError, TVariables>,
  "mutationFn" | "mutationKey"
>;
