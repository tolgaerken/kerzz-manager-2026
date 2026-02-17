import React from "react";
import ReactDOM from "react-dom/client";
import { RouterProvider } from "@tanstack/react-router";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { ReactQueryDevtools } from "@tanstack/react-query-devtools";
import toast, { Toaster } from "react-hot-toast";
import { router } from "./router";
import { ThemeProvider } from "./theme";
import { SocketProvider } from "./providers/SocketProvider";
import { LookupProvider } from "./providers/LookupProvider";
import "./i18n";
import "@kerzz/grid/styles.css";
import "./index.css";

const queryClient = new QueryClient({
  defaultOptions: {
    mutations: {
      onError: (error) => {
        const message =
          error instanceof Error ? error.message : "Bir hata oluştu";
        toast.error(message);
      },
    },
  },
});

const rootElement = document.getElementById("root");

if (!rootElement) {
  throw new Error("Root element bulunamadi.");
}

ReactDOM.createRoot(rootElement).render(
  <React.StrictMode>
    <QueryClientProvider client={queryClient}>
      <ThemeProvider>
        <SocketProvider>
          <LookupProvider>
            <RouterProvider router={router} />
          </LookupProvider>
        </SocketProvider>
      </ThemeProvider>
      <ReactQueryDevtools initialIsOpen={false} />
      <Toaster
        position="top-right"
        toastOptions={{
          duration: 4000,
          style: {
            background: "var(--color-surface-elevated)",
            color: "var(--color-foreground)",
            border: "1px solid var(--color-border)",
          },
          error: {
            iconTheme: {
              primary: "var(--color-error)",
              secondary: "var(--color-surface-elevated)",
            },
          },
        }}
      />
    </QueryClientProvider>
  </React.StrictMode>
);
