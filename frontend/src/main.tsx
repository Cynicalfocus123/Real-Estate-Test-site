import React from "react";
import ReactDOM from "react-dom/client";
import { App } from "./App";
import { CustomerAuthProvider } from "./auth/CustomerAuthProvider";
import "./styles.css";

ReactDOM.createRoot(document.getElementById("root")!).render(
  <React.StrictMode>
    <CustomerAuthProvider><App /></CustomerAuthProvider>
  </React.StrictMode>,
);
