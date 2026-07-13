// Runs once when the app mounts: tries to silently trade the httpOnly
// refresh cookie for a new access token, then loads the profile. If
// there's no valid cookie (fresh visitor, expired session) it just
// falls through to the login page - this is expected, not an error.
import { useEffect, type ReactNode } from "react";
import { useAuthStore } from "@/stores/auth.store";
import { silentRefresh, fetchMe } from "./api";

export function AuthBootstrap({ children }: { children: ReactNode }) {
  const { isBootstrapping, setBootstrapping, setAuth, clear } = useAuthStore();

  useEffect(() => {
    (async () => {
      try {
        const accessToken = await silentRefresh();
        useAuthStore.getState().setAccessToken(accessToken);
        const user = await fetchMe();
        setAuth(user, accessToken);
      } catch {
        clear();
      } finally {
        setBootstrapping(false);
      }
    })();
    // eslint-disable-next-line react-hooks/exhaustive-deps
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
