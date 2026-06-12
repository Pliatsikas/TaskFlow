import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useRouter } from "next/navigation";
import { api } from "@/lib/api";
import { useAuthStore } from "@/store/auth.store";
import { connectSocket, disconnectSocket } from "@/lib/socket";
import type { User, LoginRequest, RegisterRequest, ApiResponse, AuthTokens } from "@taskflow/shared";

// ─── Query keys (centralised to avoid typos) ──────────────────────────────────
export const authKeys = {
  me: ["auth", "me"] as const,
};

// ─── Current user ─────────────────────────────────────────────────────────────
export function useMe() {
  const accessToken = useAuthStore((s) => s.accessToken);
  return useQuery({
    queryKey: authKeys.me,
    queryFn: async () => {
      const { data } = await api.get<ApiResponse<User>>("/auth/me");
      return data.data;
    },
    enabled: !!accessToken, // only run if logged in
    staleTime: 5 * 60 * 1000,
  });
}

// ─── Login ────────────────────────────────────────────────────────────────────
export function useLogin() {
  const { setAuth } = useAuthStore();
  const router = useRouter();

  return useMutation({
    mutationFn: async (body: LoginRequest) => {
      const { data } = await api.post<ApiResponse<{ user: User } & AuthTokens>>("/auth/login", body);
      return data.data;
    },
    onSuccess: ({ user, accessToken }) => {
      setAuth(user, accessToken);
      connectSocket();
      router.push("/dashboard");
    },
  });
}

// ─── Register ─────────────────────────────────────────────────────────────────
export function useRegister() {
  const { setAuth } = useAuthStore();
  const router = useRouter();

  return useMutation({
    mutationFn: async (body: RegisterRequest) => {
      const { data } = await api.post<ApiResponse<{ user: User } & AuthTokens>>("/auth/register", body);
      return data.data;
    },
    onSuccess: ({ user, accessToken }) => {
      setAuth(user, accessToken);
      connectSocket();
      router.push("/dashboard");
    },
  });
}

// ─── Logout ───────────────────────────────────────────────────────────────────
export function useLogout() {
  const { logout } = useAuthStore();
  const router = useRouter();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: () => api.post("/auth/logout"),
    onSettled: () => {
      logout();
      disconnectSocket();
      queryClient.clear();
      router.push("/auth/login");
    },
  });
}
