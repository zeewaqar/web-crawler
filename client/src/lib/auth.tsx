// src/lib/auth.tsx
"use client";

import React, {createContext, useContext, useState, useEffect} from "react";

interface AuthContextValue {
  // undefined = loading, null = signed out, string = JWT
  token: string | null | undefined;
  setToken: (t: string | null) => void;
}

export const AuthCtx = createContext<AuthContextValue>({
  token: undefined,
  setToken: () => {},
});

export const useAuth = () => useContext(AuthCtx);

export function AuthProvider({children}: {children: React.ReactNode}) {
  // start undefined so we can show a spinner until we've read localStorage
  const [token, setToken] = useState<string | null | undefined>(undefined);

  // on mount, read localStorage once
  useEffect(() => {
    const saved = localStorage.getItem("jwt");
    setToken(saved || null);
  }, []);

  // keep localStorage in sync after hydration
  useEffect(() => {
    if (token === undefined) return; // still loading
    if (token) localStorage.setItem("jwt", token);
    else localStorage.removeItem("jwt");
  }, [token]);

  // ▶️ Listen for other tabs signing in/out
  useEffect(() => {
    const onStorage = (e: StorageEvent) => {
      if (e.key === "jwt") {
        setToken(e.newValue);
      }
    };
    window.addEventListener("storage", onStorage);
    return () => window.removeEventListener("storage", onStorage);
  }, []);

  return (
    <AuthCtx.Provider value={{token, setToken}}>{children}</AuthCtx.Provider>
  );
}
