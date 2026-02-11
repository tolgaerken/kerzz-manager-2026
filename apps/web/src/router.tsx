import { createRootRoute, createRoute, createRouter, redirect } from "@tanstack/react-router";
import { LoginPage } from "./pages/LoginPage";
import { DashboardPage } from "./pages/DashboardPage";
import { ContractsPage } from "./pages/ContractsPage";
import { CustomersPage } from "./pages/CustomersPage";
import { LicensesPage } from "./pages/LicensesPage";
import { HardwareProductsPage } from "./pages/HardwareProductsPage";
import { SoftwareProductsPage } from "./pages/SoftwareProductsPage";
import { SalesDashboardPage } from "./pages/SalesDashboardPage";
import { LeadsPage } from "./pages/LeadsPage";
import { OffersPage } from "./pages/OffersPage";
import { SalesPage } from "./pages/SalesPage";
import { PipelineKanbanPage } from "./pages/PipelineKanbanPage";
import { IntegratorPage } from "./pages/IntegratorPage";
import { InvoicesPage } from "./pages/InvoicesPage";
import { PaymentsPage } from "./pages/PaymentsPage";
import { AutomatedPaymentsPage } from "./pages/AutomatedPaymentsPage";
import { BankTransactionsPage } from "./pages/BankTransactionsPage";
import { SystemLogsPage } from "./pages/SystemLogsPage";
import { NotificationSettingsPage } from "./pages/NotificationSettingsPage";
import { EDocCreditsPage } from "./pages/EDocCreditsPage";
import { EDocMembersPage } from "./pages/EDocMembersPage";
import { EInvoicePricesPage } from "./pages/EInvoicePricesPage";
import { ContractInvoicesPage } from "./pages/ContractInvoicesPage";
import { ContractCashRegistersPage } from "./pages/ContractCashRegistersPage";
import { ContractSupportsPage } from "./pages/ContractSupportsPage";
import { ContractVersionsPage } from "./pages/ContractVersionsPage";
import { ContractSaasPage } from "./pages/ContractSaasPage";
import { ContractDocumentsPage } from "./pages/ContractDocumentsPage";
import { PublicPaymentFormPage } from "./pages/PublicPaymentFormPage";
import { PublicPaymentOkPage } from "./pages/PublicPaymentOkPage";
import { PublicPaymentErrorPage } from "./pages/PublicPaymentErrorPage";
import { UsersPage } from "./pages/UsersPage";
import { DashboardLayout } from "./components/layout";
import { useAuthStore } from "./features/auth";
import { AUTH_CONSTANTS } from "./features/auth/constants/auth.constants";

// Auth kontrolü
const checkAuth = () => {
  const { authStatus, setUserInfo } = useAuthStore.getState();
  
  if (!authStatus) {
    const stored = localStorage.getItem(AUTH_CONSTANTS.STORAGE_KEYS.USER_INFO);
    if (!stored) {
      throw redirect({ to: "/login" });
    }
    
    // localStorage'dan userInfo'yu store'a yükle
    try {
      const parsed = JSON.parse(stored);
      if (parsed?.token) {
        setUserInfo(parsed.token);
      }
    } catch {
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
  component: SalesDashboardPage,
});

// Pipeline: Leads page
const leadsRoute = createRoute({
  getParentRoute: () => dashboardLayoutRoute,
  path: "/leads",
  component: LeadsPage,
});

// Pipeline: Offers page
const offersRoute = createRoute({
  getParentRoute: () => dashboardLayoutRoute,
  path: "/offers",
  component: OffersPage,
});

// Pipeline: Sales page
const pipelineSalesRoute = createRoute({
  getParentRoute: () => dashboardLayoutRoute,
  path: "/pipeline/sales",
  component: SalesPage,
});

// Pipeline: Kanban page
const pipelineKanbanRoute = createRoute({
  getParentRoute: () => dashboardLayoutRoute,
  path: "/pipeline/kanban",
  component: PipelineKanbanPage,
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

// Automated Payments page
const automatedPaymentsRoute = createRoute({
  getParentRoute: () => dashboardLayoutRoute,
  path: "/finance/automated-payments",
  component: AutomatedPaymentsPage,
});

// Bank Transactions page
const bankTransactionsRoute = createRoute({
  getParentRoute: () => dashboardLayoutRoute,
  path: "/finance/bank-transactions",
  component: BankTransactionsPage,
});

// Contract Invoices page
const contractInvoicesRoute = createRoute({
  getParentRoute: () => dashboardLayoutRoute,
  path: "/contract-invoices",
  component: ContractInvoicesPage,
});

// Contract Cash Registers page
const contractCashRegistersRoute = createRoute({
  getParentRoute: () => dashboardLayoutRoute,
  path: "/contracts/cash-registers",
  component: ContractCashRegistersPage,
});

// Contract Supports page
const contractSupportsRoute = createRoute({
  getParentRoute: () => dashboardLayoutRoute,
  path: "/contracts/supports",
  component: ContractSupportsPage,
});

// Contract Versions page
const contractVersionsRoute = createRoute({
  getParentRoute: () => dashboardLayoutRoute,
  path: "/contracts/versions",
  component: ContractVersionsPage,
});

// Contract SaaS page
const contractSaasRoute = createRoute({
  getParentRoute: () => dashboardLayoutRoute,
  path: "/contracts/saas",
  component: ContractSaasPage,
});

// Contract Documents page
const contractDocumentsRoute = createRoute({
  getParentRoute: () => dashboardLayoutRoute,
  path: "/contracts/documents",
  component: ContractDocumentsPage,
});

// E-Document Credits page
const eDocCreditsRoute = createRoute({
  getParentRoute: () => dashboardLayoutRoute,
  path: "/e-documents/credits",
  component: EDocCreditsPage,
});

// E-Document Members page
const eDocMembersRoute = createRoute({
  getParentRoute: () => dashboardLayoutRoute,
  path: "/e-documents/members",
  component: EDocMembersPage,
});

// E-Invoice Prices page
const eInvoicePricesRoute = createRoute({
  getParentRoute: () => dashboardLayoutRoute,
  path: "/e-documents/invoice-prices",
  component: EInvoicePricesPage,
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

// Users page
const usersRoute = createRoute({
  getParentRoute: () => dashboardLayoutRoute,
  path: "/system/users",
  component: UsersPage,
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
    contractCashRegistersRoute,
    contractSupportsRoute,
    contractVersionsRoute,
    contractSaasRoute,
    contractDocumentsRoute,
    customersRoute,
    licensesRoute,
    hardwareProductsRoute,
    softwareProductsRoute,
    salesRoute,
    leadsRoute,
    offersRoute,
    pipelineSalesRoute,
    pipelineKanbanRoute,
    integratorRoute,
    contractInvoicesRoute,
    invoicesRoute,
    paymentsRoute,
    automatedPaymentsRoute,
    bankTransactionsRoute,
    eDocCreditsRoute,
    eDocMembersRoute,
    eInvoicePricesRoute,
    systemLogsRoute,
    notificationSettingsRoute,
    usersRoute,
  ]),
]);

export const router = createRouter({ routeTree });

declare module "@tanstack/react-router" {
  interface Register {
    router: typeof router;
  }
}
