import { patchRuntime } from "./services/web-llm/runtime-shims";
patchRuntime();

import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import App from "./App.tsx";
import "./GlobalStyles.css";

// Suppress benign ResizeObserver errors
const originalError = console.error;
console.error = (...args) => {
  if (
    typeof args[0] === "string" &&
    (args[0].includes(
      "ResizeObserver loop completed with undelivered notifications.",
    ) ||
      args[0].includes("ResizeObserver loop limit exceeded"))
  ) {
    return;
  }
  originalError.call(console, ...args);
};

window.addEventListener("error", (e) => {
  if (
    e.message ===
      "ResizeObserver loop completed with undelivered notifications." ||
    e.message === "ResizeObserver loop limit exceeded"
  ) {
    e.stopImmediatePropagation();
    e.preventDefault();
  }
});

createRoot(document.getElementById("root")!).render(
  <StrictMode>
    <App />
  </StrictMode>,
);
