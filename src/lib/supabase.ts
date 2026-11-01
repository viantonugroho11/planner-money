import { createBrowserClient } from "@supabase/ssr";

export function createClient() {
  return createBrowserClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
  );
}

// Singleton for client-side use
let _client: ReturnType<typeof createClient> | null = null;

export const supabase = (() => {
  if (typeof window === "undefined") return createClient();
  if (!_client) _client = createClient();
  return _client;
})();
