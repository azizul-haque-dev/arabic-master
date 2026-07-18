// falls through to the login page - this is expected, not an error.
import { useAuthStore } from "@/stores/auth.store";
import { useEffect, type ReactNode } from "react";
import { fetchMe } from "./api";

export function AuthBootstrap({ children }: { children: ReactNode }) {
  const { isBootstrapping, setBootstrapping, setUser, clear } = useAuthStore();

  useEffect(() => {
    (async () => {
      try {
        const user = await fetchMe();
        setUser(user);
      } catch {
        clear();
      } finally {
        setBootstrapping(false);
      }
    })();
  }, []);

  if (isBootstrapping) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-background text-sm text-muted">
        Loading…
      </div>
    );
  }

  return <>{children}</>;
}
