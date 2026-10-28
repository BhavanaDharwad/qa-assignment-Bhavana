import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { apiRequest, type ApiError } from "@/lib/api-client";
import { SESSION_QUERY_KEY } from "@/lib/query-client";
import type { MutationConfig } from "@/lib/react-query";
import type { SignInInput, User } from "@/types/domain";

export const sessionKeys = {
  me: SESSION_QUERY_KEY,
};

export function getSession(signal?: AbortSignal): Promise<{ user: User | null }> {
  return apiRequest<{ user: User | null }>("/api/auth/me", { signal });
}

export function useSession() {
  return useQuery({
    queryKey: sessionKeys.me,
    queryFn: ({ signal }) => getSession(signal),
    select: (data) => data.user,
    staleTime: Infinity,
  });
}

export function signIn(input: SignInInput): Promise<User> {
  return apiRequest<User>("/api/auth/sign-in", { method: "POST", body: input });
}

export function useSignIn(config: MutationConfig<User, SignInInput, ApiError> = {}) {
  const queryClient = useQueryClient();
  return useMutation<User, ApiError, SignInInput>({
    mutationKey: ["session", "sign-in"],
    mutationFn: signIn,
    ...config,
    onSuccess: async (user, ...rest) => {
      queryClient.clear();
      queryClient.setQueryData(sessionKeys.me, { user });
      await config.onSuccess?.(user, ...rest);
    },
  });
}

export function signOut(): Promise<{ ok: boolean }> {
  return apiRequest<{ ok: boolean }>("/api/auth/sign-out", { method: "POST" });
}

export function useSignOut(config: MutationConfig<{ ok: boolean }, void, ApiError> = {}) {
  const queryClient = useQueryClient();
  return useMutation<{ ok: boolean }, ApiError, void>({
    mutationKey: ["session", "sign-out"],
    mutationFn: signOut,
    ...config,
    onSuccess: async (...args) => {
      queryClient.clear();
      queryClient.setQueryData(sessionKeys.me, { user: null });
      await config.onSuccess?.(...args);
    },
  });
}
