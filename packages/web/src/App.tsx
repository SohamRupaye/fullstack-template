import { useState } from "react";
import { QueryClientProvider } from "@tanstack/react-query";
import { httpLink, splitLink } from "@trpc/client";
import superjson from "superjson";
import { trpcReact, getToken } from "./lib/trpc";
import { queryClient } from "./lib/query-client";

/**
 * TRPCProviders — wire up React Query + tRPC hooks.
 *
 * Kept here (not in main.tsx) so main.tsx stays clean.
 * Wrap your router / layout / context providers inside this.
 */
function TRPCProviders({ children }: { children: React.ReactNode }) {
  const [trpcClient] = useState(() =>
    trpcReact.createClient({
      transformer: superjson,
      links: [
        splitLink({
          condition: () => !!getToken(),
          true: httpLink({
            url: "/api/trpc",
            headers: () => ({ Authorization: `Bearer ${getToken()}` }),
          }),
          false: httpLink({ url: "/api/trpc" }),
        }),
      ],
    })
  );

  return (
    <trpcReact.Provider client={trpcClient} queryClient={queryClient}>
      <QueryClientProvider client={queryClient}>{children}</QueryClientProvider>
    </trpcReact.Provider>
  );
}

// ---------------------------------------------------------------------------
// Health check example — delete once you paste your real app here
// ---------------------------------------------------------------------------
function HealthCheck() {
  const { data, isLoading } = trpcReact.health.useQuery();
  if (isLoading) return <p>Connecting to server…</p>;
  return (
    <p>
      Server status: {data?.status} ({data?.time?.toString()})
    </p>
  );
}

export default function App() {
  return (
    <TRPCProviders>
      {/* Replace the content below with your own router / layout */}
      <HealthCheck />
    </TRPCProviders>
  );
}
