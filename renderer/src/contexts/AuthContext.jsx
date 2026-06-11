import { createContext, useCallback, useContext, useEffect, useMemo, useState } from "react";
import { getToken, setToken as persistToken, setUnauthorizedHandler } from "../api/http";
import { logout as apiLogout } from "../api/auth.api";

const AuthContext = createContext(null);

const NAME_KEY = "se_staff_name";

function getStoredName() {
  try { return localStorage.getItem(NAME_KEY) || ""; } catch { return ""; }
}
function setStoredName(name) {
  try { name ? localStorage.setItem(NAME_KEY, name) : localStorage.removeItem(NAME_KEY); } catch { /* ignore */ }
}

export function AuthProvider({ children }) {
  const [token, setTokenState] = useState(() => getToken());
  const [staffName, setStaffNameState] = useState(() => getStoredName());

  const login = useCallback((newToken, name) => {
    persistToken(newToken);
    setTokenState(newToken);
    if (name) {
      setStoredName(name);
      setStaffNameState(name);
    }
  }, []);

  const logout = useCallback(async () => {
    try { await apiLogout(); } catch { /* ignore */ }
    persistToken("");
    setTokenState("");
    setStoredName("");
    setStaffNameState("");
  }, []);

  // If any HTTP call returns 401, blow away the session.
  useEffect(() => {
    setUnauthorizedHandler(() => {
      persistToken("");
      setTokenState("");
      setStoredName("");
      setStaffNameState("");
    });
    return () => setUnauthorizedHandler(null);
  }, []);

  const value = useMemo(
    () => ({ token, isAuthed: Boolean(token), login, logout, staffName }),
    [token, login, logout, staffName]
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error("useAuth must be used within AuthProvider");
  return ctx;
}
