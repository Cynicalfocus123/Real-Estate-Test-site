import type { ReactNode } from "react";
export function LoadingState() { return <p className="admin-muted">Loading authoritative data…</p>; }
export function ErrorNotice({ children }: { children: ReactNode }) { return <p className="admin-error">{children}</p>; }
export function EmptyState({ children }: { children: ReactNode }) { return <div className="admin-empty">{children}</div>; }
export function FormSection({ title, children }: { title: string; children: ReactNode }) { return <section className="admin-section"><h2>{title}</h2><div className="admin-fields">{children}</div></section>; }
