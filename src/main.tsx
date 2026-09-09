import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import { BrowserRouter } from "react-router-dom";
import App from "./App";
import { useAuthStore } from "./lib/stores/authStore";
import { useDirectoryStore } from "./lib/stores/directoryStore";
import { useDoctorQueueStore } from "./lib/stores/doctorQueueStore";
import { useTokenStore } from "./lib/stores/tokenStore";
import "./lib/i18n";
import "./index.css";

const queryClient = new QueryClient();

if (import.meta.env.DEV) {
  console.info("[MediKiosk] RBAC stores restored", { role: useAuthStore.getState().role, doctors: useDirectoryStore.getState().doctors.length, staff: useDirectoryStore.getState().staff.length, tokens: useTokenStore.getState().tokens.length, queueItems: useDoctorQueueStore.getState().items.length });
}

async function start() {
  if (import.meta.env.VITE_ENABLE_MSW !== "false") {
    const { worker } = await import("@/lib/api/mocks/browser");
    await worker.start({ onUnhandledRequest: "bypass" });
  }

  createRoot(document.getElementById("root")!).render(
    <StrictMode>
      <QueryClientProvider client={queryClient}>
        <BrowserRouter><App /></BrowserRouter>
      </QueryClientProvider>
    </StrictMode>,
  );
}

void start();
