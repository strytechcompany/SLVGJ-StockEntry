import { createContext, useCallback, useContext, useEffect, useMemo, useState } from "react";
import { getToken, setToken as persistToken, setUnauthorizedHandler } from "../api/http";
import { logout as apiLogout } from "../api/auth.api";

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [token, setTokenState] = useState(() => getToken());

  const login = useCallback((newToken) => {
    persistToken(newToken);
    setTokenState(newToken);
  }, []);

  const logout = useCallback(async () => {
    try { await apiLogout(); } catch { /* ignore */ }
    persistToken("");
    setTokenState("");
  }, []);

  // If any HTTP call returns 401, blow away the session.
  useEffect(() => {
    setUnauthorizedHandler(() => {
      persistToken("");
      setTokenState("");
    });
    return () => setUnauthorizedHandler(null);
  }, []);

  const value = useMemo(
    () => ({ token, isAuthed: Boolean(token), login, logout }),
    [token, login, logout]
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error("useAuth must be used within AuthProvider");
  return ctx;
}
