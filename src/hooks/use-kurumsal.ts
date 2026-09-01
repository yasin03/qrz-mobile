import { useQuery } from "@tanstack/react-query";
import { api } from "@/lib/axios";
import { useAuthStore } from "@/stores/auth-store";

export function useBolumler() {
  const isAuthenticated = useAuthStore((state) => state.isAuthenticated);
  const token = useAuthStore((state) => state.user?.token);

  return useQuery({
    queryKey: ["bolumler"],
    queryFn: async () => {
      const response = await api.post<any[]>("/api/kurumsal");
      return response.data;
    },
    enabled: isAuthenticated && !!token,
    staleTime: 5 * 60 * 1000,
  });
}
