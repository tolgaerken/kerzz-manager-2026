import React from "react";
import ReactDOM from "react-dom/client";
import { RouterProvider } from "@tanstack/react-router";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { ReactQueryDevtools } from "@tanstack/react-query-devtools";
import { router } from "./router";
import { ThemeProvider } from "./theme";
import { SocketProvider } from "./providers/SocketProvider";
import { LookupProvider } from "./providers/LookupProvider";
import "./i18n";
import "@kerzz/grid/styles.css";
import "./index.css";

const queryClient = new QueryClient();

const rootElement = document.getElementById("root");

if (!rootElement) {
  throw new Error("Root element bulunamadi.");
}

ReactDOM.createRoot(rootElement).render(
  <React.StrictMode>
    <QueryClientProvider client={queryClient}>
      <SocketProvider>
        <LookupProvider>
          <ThemeProvider>
            <RouterProvider router={router} />
          </ThemeProvider>
        </LookupProvider>
      </SocketProvider>
      <ReactQueryDevtools initialIsOpen={false} />
    </QueryClientProvider>
  </React.StrictMode>
);
