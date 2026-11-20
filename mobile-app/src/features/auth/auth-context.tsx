import {
  createContext,
  useContext,
  useEffect,
  useState,
  type ReactNode,
} from "react";
import {
  restoreSession,
  signIn as signInWithPassword,
  signOut as signOutSession,
  type AuthUser,
} from "./auth-client";

interface AuthContextValue {
  user: AuthUser | null;
  isLoading: boolean;
  restoreError: string | null;
  signIn: (email: string, password: string) => Promise<void>;
  signOut: () => Promise<void>;
}

const AuthContext = createContext<AuthContextValue | null>(null);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<AuthUser | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [restoreError, setRestoreError] = useState<string | null>(null);

  useEffect(() => {
    let active = true;
    void restoreSession()
      .then((restoredUser) => {
        if (active) setUser(restoredUser);
      })
      .catch((error: unknown) => {
        if (active) {
          setUser(null);
          setRestoreError(
            error instanceof Error
              ? error.message
              : "Unable to restore your session.",
          );
        }
      })
      .finally(() => {
        if (active) setIsLoading(false);
      });

    return () => {
      active = false;
    };
  }, []);

  async function signIn(email: string, password: string): Promise<void> {
    const signedInUser = await signInWithPassword(email, password);
    setUser(signedInUser);
  }

  async function signOut(): Promise<void> {
    try {
      await signOutSession();
    } finally {
      setUser(null);
    }
  }

  return (
    <AuthContext.Provider
      value={{ user, isLoading, restoreError, signIn, signOut }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth(): AuthContextValue {
  const context = useContext(AuthContext);
  if (!context) throw new Error("useAuth must be used within AuthProvider");
  return context;
}
