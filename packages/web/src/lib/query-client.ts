import { QueryClient } from "@tanstack/react-query";

/**
 * Singleton React Query client shared between the tRPC provider
 * and any direct useQuery/useMutation calls.
 */
export const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 1000 * 60, // 1 min — adjust per use case
      retry: 1,
    },
  },
});
