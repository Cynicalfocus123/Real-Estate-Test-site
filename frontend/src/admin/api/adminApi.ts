import { apiBaseUrl } from "../../config/runtime";
import type { AdminUser, Agent, PropertyDetail, PropertyPayload, PropertySummary, SellerApplication, StaffMember, Pagination } from "./adminTypes";

const tokenKey = "buyhomeforless.admin.token";
export const adminSession = { get token() { return sessionStorage.getItem(tokenKey); }, set token(value: string | null) { if (value) sessionStorage.setItem(tokenKey, value); else sessionStorage.removeItem(tokenKey); } };

async function request<T>(path: string, init: RequestInit = {}): Promise<T> {
  const headers = new Headers(init.headers); headers.set("Accept", "application/json"); if (init.body && !headers.has("Content-Type")) headers.set("Content-Type", "application/json"); if (adminSession.token) headers.set("Authorization", `Bearer ${adminSession.token}`);
  const response = await fetch(`${apiBaseUrl}${path}`, { ...init, headers });
  const payload = await response.json().catch(() => ({}));
  if (!response.ok) { const error = new Error(typeof payload?.error === "string" ? payload.error : "Request failed"); (error as Error & { status?: number }).status = response.status; throw error; }
  return payload as T;
}

export const adminApi = {
  login: (email: string, password: string) => request<{ token: string; user: AdminUser }>("/auth/login", { method: "POST", body: JSON.stringify({ email, password }) }),
  bootstrapStatus: () => request<{ headAdminExists: boolean }>("/auth/bootstrap-status"),
  registerHeadAdmin: (payload: { email: string; password: string; fullName: string }) => request<{ token: string; user: AdminUser }>("/auth/register", { method: "POST", body: JSON.stringify(payload) }),
  me: () => request<{ user: AdminUser }>("/auth/me"),
  overview: () => request<Record<string, unknown>>("/admin/dashboard/overview"),
  properties: (query: string) => request<{ items: PropertySummary[]; pagination: Pagination }>(`/admin/properties${query}`),
  property: (id: number) => request<PropertyDetail>(`/admin/properties/${id}`),
  createProperty: (payload: PropertyPayload) => request<{ id: number; property: PropertyDetail }>("/admin/properties", { method: "POST", body: JSON.stringify(payload) }),
  updateProperty: (id: number, payload: PropertyPayload) => request<{ id: number; property: PropertyDetail }>(`/admin/properties/${id}`, { method: "PATCH", body: JSON.stringify(payload) }),
  deleteProperty: (id: number) => request<{ id: number; status: string }>(`/admin/properties/${id}`, { method: "DELETE" }),
  agents: () => request<{ items: Agent[] }>("/admin/agents"),
  createAgent: (payload: Omit<Agent, "id" | "isActive" | "isVerified">) => request<{ id: number }>("/admin/agents", { method: "POST", body: JSON.stringify(payload) }),
  sellers: (query: string) => request<{ items: SellerApplication[]; pagination: Pagination }>(`/admin/seller-applications${query}`),
  sellerStatus: (id: number, status: string) => request<{ ok: boolean }>(`/admin/seller-applications/${id}/status`, { method: "PATCH", body: JSON.stringify({ status }) }),
  staff: () => request<{ items: StaffMember[] }>("/admin/employees"),
  updateAccount: (payload: Record<string, string>) => request<{ ok: boolean }>("/admin/account-settings", { method: "PATCH", body: JSON.stringify(payload) }),
};
