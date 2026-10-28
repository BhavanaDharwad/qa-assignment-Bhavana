import { MutationCache, QueryCache, QueryClient } from "@tanstack/react-query";
import { ApiError } from "./api-client";

/** Query key of the current session. Lives here so the client can drop it on a 401 from any call. */
export const SESSION_QUERY_KEY = ["session", "me"] as const;

function shouldRetry(failureCount: number, error: unknown): boolean {
  if (error instanceof ApiError && error.status < 500) return false;
  return failureCount < 1;
}

export function createQueryClient(): QueryClient {
  // A 401 from any endpoint means the session is gone (signed out elsewhere,
  // or the store was reset). Drop the cached session so RequireSession
  // redirects to the sign-in page instead of showing a dead error state.
  const onError = (error: unknown) => {
    if (error instanceof ApiError && error.status === 401) {
      queryClient.setQueryData(SESSION_QUERY_KEY, { user: null });
    }
  };
  const queryClient: QueryClient = new QueryClient({
    queryCache: new QueryCache({ onError }),
    mutationCache: new MutationCache({ onError }),
    defaultOptions: {
      queries: {
        retry: shouldRetry,
        staleTime: 0,
        refetchOnWindowFocus: false,
      },
      mutations: {
        retry: false,
      },
    },
  });
  return queryClient;
}
