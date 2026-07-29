import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import { AdminAuthProvider } from "./auth/AdminAuthProvider";
import { AdminApp } from "./AdminApp";
import "./styles.css";
createRoot(document.getElementById("admin-root")!).render(<StrictMode><AdminAuthProvider><AdminApp /></AdminAuthProvider></StrictMode>);
