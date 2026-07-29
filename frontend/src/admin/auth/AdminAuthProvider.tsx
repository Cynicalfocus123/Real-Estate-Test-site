import { createContext, useContext, useEffect, useMemo, useState, type ReactNode } from "react";
import { adminApi, adminSession } from "../api/adminApi";
import type { AdminUser } from "../api/adminTypes";

type AuthState = { user: AdminUser | null; loading: boolean; error: string | null; login: (email: string, password: string) => Promise<void>; bootstrap: (email: string, password: string, fullName: string) => Promise<void>; logout: () => void; bootstrapRequired: boolean };
const AdminAuthContext = createContext<AuthState | null>(null);

export function AdminAuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<AdminUser | null>(null); const [loading, setLoading] = useState(true); const [error, setError] = useState<string | null>(null); const [bootstrapRequired, setBootstrapRequired] = useState(false);
  useEffect(() => { let active = true; Promise.all([adminApi.bootstrapStatus(), adminSession.token ? adminApi.me() : Promise.resolve(null)]).then(([bootstrap, me]) => { if (!active) return; setBootstrapRequired(!bootstrap.headAdminExists); setUser(me?.user ?? null); }).catch((cause: Error & { status?: number }) => { if (!active) return; if (cause.status === 401 || cause.status === 403) { adminSession.token = null; setUser(null); } else setError("Session check failed. Your saved session was kept."); }).finally(() => active && setLoading(false)); return () => { active = false; }; }, []);
  const value = useMemo<AuthState>(() => ({ user, loading, error, bootstrapRequired, logout() { adminSession.token = null; setUser(null); }, async login(email, password) { setError(null); const result = await adminApi.login(email, password); adminSession.token = result.token; setUser(result.user); }, async bootstrap(email, password, fullName) { setError(null); const result = await adminApi.registerHeadAdmin({ email, password, fullName }); adminSession.token = result.token; setUser(result.user); setBootstrapRequired(false); } }), [user, loading, error, bootstrapRequired]);
  return <AdminAuthContext.Provider value={value}>{children}</AdminAuthContext.Provider>;
}
export function useAdminAuth() { const value = useContext(AdminAuthContext); if (!value) throw new Error("AdminAuthProvider missing"); return value; }
