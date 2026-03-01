import { createTRPCClient, httpLink, splitLink } from "@trpc/client";
import { createTRPCReact } from "@trpc/react-query";
import type { AppRouter } from "server";
import superjson from "superjson";

// ---------------------------------------------------------------------------
// Token helpers — swap localStorage for js-cookie if you prefer
// ---------------------------------------------------------------------------
export const getToken = (): string | null => localStorage.getItem("token");
export const saveToken = (token: string): void =>
  localStorage.setItem("token", token);
export const removeToken = (): void => localStorage.removeItem("token");
export const isLoggedIn = (): boolean => !!getToken();

// Shared link config (reused by both clients)
const links = [
  splitLink({
    condition: () => !!getToken(),
    true: httpLink({
      url: "/api/trpc",
      headers: () => ({ Authorization: `Bearer ${getToken()}` }),
    }),
    false: httpLink({ url: "/api/trpc" }),
  }),
];

// ---------------------------------------------------------------------------
// 1. Vanilla client — imperative calls outside React (services, utils)
//
//    import trpc from "@/lib/trpc";
//    const data = await trpc.health.query();
// ---------------------------------------------------------------------------
const trpc = createTRPCClient<AppRouter>({ transformer: superjson, links });

export default trpc;

// ---------------------------------------------------------------------------
// 2. React hooks client — useQuery / useMutation inside components
//
//    import { trpcReact } from "@/lib/trpc";
//    const { data, isLoading } = trpcReact.health.useQuery();
//    const login = trpcReact.auth.login.useMutation();
//
//    Requires <TRPCProviders> (from App.tsx) as an ancestor.
// ---------------------------------------------------------------------------
export const trpcReact = createTRPCReact<AppRouter>();
