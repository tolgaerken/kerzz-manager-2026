import { createRootRoute, createRoute, createRouter, redirect } from "@tanstack/react-router";
import { LoginPage } from "./pages/LoginPage";
import { DashboardPage } from "./pages/DashboardPage";
import { ContractsPage } from "./pages/ContractsPage";
import { CustomersPage } from "./pages/CustomersPage";
import { LicensesPage } from "./pages/LicensesPage";
import { HardwareProductsPage } from "./pages/HardwareProductsPage";
import { SoftwareProductsPage } from "./pages/SoftwareProductsPage";
import { SalesPage } from "./pages/SalesPage";
import { IntegratorPage } from "./pages/IntegratorPage";
import { InvoicesPage } from "./pages/InvoicesPage";
import { PaymentsPage } from "./pages/PaymentsPage";
import { SystemLogsPage } from "./pages/SystemLogsPage";
import { NotificationSettingsPage } from "./pages/NotificationSettingsPage";
import { PublicPaymentFormPage } from "./pages/PublicPaymentFormPage";
import { PublicPaymentOkPage } from "./pages/PublicPaymentOkPage";
import { PublicPaymentErrorPage } from "./pages/PublicPaymentErrorPage";
import { DashboardLayout } from "./components/layout";
import { useAuthStore } from "./features/auth";
import { AUTH_CONSTANTS } from "./features/auth/constants/auth.constants";

// Auth kontrolü
const checkAuth = () => {
  const authStatus = useAuthStore.getState().authStatus;
  
  if (!authStatus) {
    const stored = localStorage.getItem(AUTH_CONSTANTS.STORAGE_KEYS.USER_INFO);
    if (!stored) {
      throw redirect({ to: "/login" });
    }
  }
};

const rootRoute = createRootRoute();

// Login route (public)
const loginRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: "/login",
  component: LoginPage,
});

// Dashboard layout route (protected)
const dashboardLayoutRoute = createRoute({
  getParentRoute: () => rootRoute,
  id: "dashboard-layout",
  beforeLoad: checkAuth,
  component: DashboardLayout,
});

// Dashboard page
const dashboardRoute = createRoute({
  getParentRoute: () => dashboardLayoutRoute,
  path: "/dashboard",
  component: DashboardPage,
});

// Contracts page
const contractsRoute = createRoute({
  getParentRoute: () => dashboardLayoutRoute,
  path: "/contracts",
  component: ContractsPage,
});

// Customers page
const customersRoute = createRoute({
  getParentRoute: () => dashboardLayoutRoute,
  path: "/customers",
  component: CustomersPage,
});

// Licenses page
const licensesRoute = createRoute({
  getParentRoute: () => dashboardLayoutRoute,
  path: "/licenses",
  component: LicensesPage,
});

// Sales page
const salesRoute = createRoute({
  getParentRoute: () => dashboardLayoutRoute,
  path: "/sales",
  component: SalesPage,
});

// Integrator page
const integratorRoute = createRoute({
  getParentRoute: () => dashboardLayoutRoute,
  path: "/integrator",
  component: IntegratorPage,
});

// Hardware Products page
const hardwareProductsRoute = createRoute({
  getParentRoute: () => dashboardLayoutRoute,
  path: "/products/hardware",
  component: HardwareProductsPage,
});

// Software Products page
const softwareProductsRoute = createRoute({
  getParentRoute: () => dashboardLayoutRoute,
  path: "/products/software",
  component: SoftwareProductsPage,
});

// Invoices page
const invoicesRoute = createRoute({
  getParentRoute: () => dashboardLayoutRoute,
  path: "/finance/invoices",
  component: InvoicesPage,
});

// Payments page (admin)
const paymentsRoute = createRoute({
  getParentRoute: () => dashboardLayoutRoute,
  path: "/finance/payments",
  component: PaymentsPage,
});

// Public payment form (no auth)
const publicPaymentFormRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: "/odeme/$linkId",
  component: PublicPaymentFormPage,
});

// Public payment success (no auth)
const publicPaymentOkRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: "/payment_ok/$id",
  component: PublicPaymentOkPage,
});

// Public payment error (no auth)
const publicPaymentErrorRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: "/payment_error/$id",
  component: PublicPaymentErrorPage,
});

// System Logs page
const systemLogsRoute = createRoute({
  getParentRoute: () => dashboardLayoutRoute,
  path: "/system/logs",
  component: SystemLogsPage,
});

// Notification Settings page
const notificationSettingsRoute = createRoute({
  getParentRoute: () => dashboardLayoutRoute,
  path: "/system/notifications",
  component: NotificationSettingsPage,
});

// Index redirect
const indexRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: "/",
  beforeLoad: () => {
    throw redirect({ to: "/dashboard" });
  },
});

const routeTree = rootRoute.addChildren([
  indexRoute,
  loginRoute,
  publicPaymentFormRoute,
  publicPaymentOkRoute,
  publicPaymentErrorRoute,
  dashboardLayoutRoute.addChildren([
    dashboardRoute,
    contractsRoute,
    customersRoute,
    licensesRoute,
    hardwareProductsRoute,
    softwareProductsRoute,
    salesRoute,
    integratorRoute,
    invoicesRoute,
    paymentsRoute,
    systemLogsRoute,
    notificationSettingsRoute,
  ]),
]);

export const router = createRouter({ routeTree });

declare module "@tanstack/react-router" {
  interface Register {
    router: typeof router;
  }
}
