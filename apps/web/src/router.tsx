import { createRootRoute, createRoute, createRouter, redirect } from "@tanstack/react-router";
import { LoginPage } from "./pages/LoginPage";
import { DashboardPage } from "./pages/DashboardPage";
import { ContractsPage } from "./pages/ContractsPage";
import { CustomersPage } from "./pages/CustomersPage";
import { CustomerSegmentsPage } from "./pages/CustomerSegmentsPage";
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
import { ReceivablesPage } from "./pages/ReceivablesPage";
import { InflationRatesPage } from "./pages/InflationRatesPage";
import { SystemLogsPage } from "./pages/SystemLogsPage";
import { NotificationSettingsPage } from "./pages/NotificationSettingsPage";
import { EDocCreditsPage } from "./pages/EDocCreditsPage";
import { EDocMembersPage } from "./pages/EDocMembersPage";
import { EInvoicePricesPage } from "./pages/EInvoicePricesPage";
import { EDocStatusesPage } from "./pages/EDocStatusesPage";
import { ContractInvoicesPage } from "./pages/ContractInvoicesPage";
import { ContractCashRegistersPage } from "./pages/ContractCashRegistersPage";
import { ContractSupportsPage } from "./pages/ContractSupportsPage";
import { ContractVersionsPage } from "./pages/ContractVersionsPage";
import { ContractSaasPage } from "./pages/ContractSaasPage";
import { ContractDocumentsPage } from "./pages/ContractDocumentsPage";
import { ProratedReportPage } from "./pages/ProratedReportPage";
import { PendingInstallationsPage } from "./pages/PendingInstallationsPage";
import { UninvoicedItemsPage } from "./pages/UninvoicedItemsPage";
import { PublicPaymentFormPage } from "./pages/PublicPaymentFormPage";
import { PublicPaymentOkPage } from "./pages/PublicPaymentOkPage";
import { PublicPaymentErrorPage } from "./pages/PublicPaymentErrorPage";
import { PublicContractPaymentPage } from "./pages/PublicContractPaymentPage";
import { UsersPage } from "./pages/UsersPage";
import { CompanyManagementPage } from "./pages/CompanyManagementPage";
import { WelcomePage } from "./pages/WelcomePage";
import {
  SsoManagementPage,
  ApplicationsPage,
  RolesPage,
  PermissionsPage,
  UsersPage as SsoUsersPage,
  ApiKeysPage
} from "./features/sso-management";
import { BossUsersPage } from "./features/boss-users";
import { EmployeeProfilesPage } from "./pages/EmployeeProfilesPage";
import { FeedbackPage } from "./pages/FeedbackPage";
import { MyProfilePage } from "./pages/MyProfilePage";
import {
  OrgDepartmentsPage,
  OrgTitlesPage,
  OrgLocationsPage,
} from "./features/employee-org-lookup";
import { DashboardLayout } from "./components/layout";
import { useAuthStore } from "./features/auth";
import { AUTH_CONSTANTS } from "./features/auth/constants/auth.constants";
import { PERMISSIONS } from "./features/auth/constants/permissions";
import { performAutoLogin } from "./features/auth/services/authInitService";

/**
 * Auth kontrolü — ilk yüklemede SSO autoLogin ile token doğrular,
 * yeni token ve güncel yetkileri alır. Sonraki navigasyonlarda
 * sadece store'daki authStatus kontrolü yapar.
 */
const checkAuth = async () => {
  const { authStatus, authInitialized } = useAuthStore.getState();

  // Oturum zaten doğrulanmış — geçiş yap
  if (authInitialized && authStatus) {
    return;
  }

  // İlk yükleme — autoLogin ile token'ı SSO'dan doğrula
  if (!authInitialized) {
    const hasStoredData = localStorage.getItem(AUTH_CONSTANTS.STORAGE_KEYS.USER_INFO);
    if (!hasStoredData) {
      useAuthStore.getState().setAuthInitialized(true);
      throw redirect({ to: "/login" });
    }

    try {
      await performAutoLogin();
      // performAutoLogin → setUserInfo → authInitialized=true, authStatus=true
      return;
    } catch {
      useAuthStore.getState().setAuthInitialized(true);
      localStorage.removeItem(AUTH_CONSTANTS.STORAGE_KEYS.USER_INFO);
      throw redirect({ to: "/login" });
    }
  }

  // authInitialized=true ama authStatus=false (logout sonrası)
  throw redirect({ to: "/login" });
};

/**
 * İzin kontrolü yapan yardımcı fonksiyon
 * Kullanıcının belirtilen izne sahip olup olmadığını kontrol eder
 * Admin kullanıcıları tüm izinlere sahiptir
 */
const checkPermission = (permission: string) => {
  const { hasPermission } = useAuthStore.getState();
  if (!hasPermission(permission)) {
    throw redirect({ to: "/welcome" });
  }
};

/**
 * Birden fazla izinden herhangi birine sahip olma kontrolü (OR mantığı)
 * Örn: Dashboard sayfaları hem kendi modül izni hem de DASHBOARD_VIEW ile erişilebilir
 */
const checkAnyPermission = (...permissions: string[]) => {
  const { hasAnyPermission } = useAuthStore.getState();
  if (!hasAnyPermission(...permissions)) {
    throw redirect({ to: "/welcome" });
  }
};

/**
 * Admin kontrolü yapan yardımcı fonksiyon
 * Sadece admin kullanıcılarına erişim izni verir
 */
const checkAdmin = () => {
  const { isAdmin } = useAuthStore.getState();
  if (!isAdmin) {
    throw redirect({ to: "/welcome" });
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

// Welcome page (no permission required, just auth)
const welcomeRoute = createRoute({
  getParentRoute: () => dashboardLayoutRoute,
  path: "/welcome",
  component: WelcomePage,
});

// Dashboard page
const dashboardRoute = createRoute({
  getParentRoute: () => dashboardLayoutRoute,
  path: "/dashboard",
  beforeLoad: () => checkPermission(PERMISSIONS.DASHBOARD_VIEW),
  component: DashboardPage,
});

// Contracts page
const contractsRoute = createRoute({
  getParentRoute: () => dashboardLayoutRoute,
  path: "/contracts",
  beforeLoad: () => checkPermission(PERMISSIONS.CONTRACT_MENU),
  component: ContractsPage,
});

// Customers page
const customersRoute = createRoute({
  getParentRoute: () => dashboardLayoutRoute,
  path: "/customers",
  beforeLoad: () => checkPermission(PERMISSIONS.CUSTOMER_MENU),
  component: CustomersPage,
});

// Customer Segments page
const customerSegmentsRoute = createRoute({
  getParentRoute: () => dashboardLayoutRoute,
  path: "/customer-segments",
  beforeLoad: () => checkPermission(PERMISSIONS.CUSTOMER_MENU),
  component: CustomerSegmentsPage,
});

// Licenses page
const licensesRoute = createRoute({
  getParentRoute: () => dashboardLayoutRoute,
  path: "/licenses",
  beforeLoad: () => checkPermission(PERMISSIONS.LICENSE_MENU),
  component: LicensesPage,
});

// Sales Dashboard — SALES_MENU veya DASHBOARD_VIEW yetkisi ile erişilebilir
const salesRoute = createRoute({
  getParentRoute: () => dashboardLayoutRoute,
  path: "/sales",
  beforeLoad: () => checkAnyPermission(PERMISSIONS.SALES_MENU, PERMISSIONS.DASHBOARD_VIEW),
  component: SalesDashboardPage,
});

// Pipeline: Leads page
const leadsRoute = createRoute({
  getParentRoute: () => dashboardLayoutRoute,
  path: "/leads",
  beforeLoad: () => checkPermission(PERMISSIONS.SALES_MENU),
  component: LeadsPage,
});

// Pipeline: Offers page
const offersRoute = createRoute({
  getParentRoute: () => dashboardLayoutRoute,
  path: "/offers",
  beforeLoad: () => checkPermission(PERMISSIONS.SALES_MENU),
  component: OffersPage,
});

// Pipeline: Sales page
const pipelineSalesRoute = createRoute({
  getParentRoute: () => dashboardLayoutRoute,
  path: "/pipeline/sales",
  beforeLoad: () => checkPermission(PERMISSIONS.SALES_MENU),
  component: SalesPage,
});

// Pipeline: Kanban page
const pipelineKanbanRoute = createRoute({
  getParentRoute: () => dashboardLayoutRoute,
  path: "/pipeline/kanban",
  beforeLoad: () => checkPermission(PERMISSIONS.SALES_MENU),
  component: PipelineKanbanPage,
});

// Integrator page
const integratorRoute = createRoute({
  getParentRoute: () => dashboardLayoutRoute,
  path: "/integrator",
  beforeLoad: () => checkPermission(PERMISSIONS.SALES_MENU),
  component: IntegratorPage,
});

// Hardware Products page
const hardwareProductsRoute = createRoute({
  getParentRoute: () => dashboardLayoutRoute,
  path: "/products/hardware",
  beforeLoad: () => checkPermission(PERMISSIONS.SALES_MENU),
  component: HardwareProductsPage,
});

// Software Products page
const softwareProductsRoute = createRoute({
  getParentRoute: () => dashboardLayoutRoute,
  path: "/products/software",
  beforeLoad: () => checkPermission(PERMISSIONS.SALES_MENU),
  component: SoftwareProductsPage,
});

// Invoices page
const invoicesRoute = createRoute({
  getParentRoute: () => dashboardLayoutRoute,
  path: "/finance/invoices",
  beforeLoad: () => checkPermission(PERMISSIONS.FINANCE_MENU),
  component: InvoicesPage,
});

// Payments page (admin)
const paymentsRoute = createRoute({
  getParentRoute: () => dashboardLayoutRoute,
  path: "/finance/payments",
  beforeLoad: () => checkPermission(PERMISSIONS.FINANCE_MENU),
  component: PaymentsPage,
});

// Automated Payments page
const automatedPaymentsRoute = createRoute({
  getParentRoute: () => dashboardLayoutRoute,
  path: "/finance/automated-payments",
  beforeLoad: () => checkPermission(PERMISSIONS.FINANCE_MENU),
  component: AutomatedPaymentsPage,
});

// Bank Transactions page
const bankTransactionsRoute = createRoute({
  getParentRoute: () => dashboardLayoutRoute,
  path: "/finance/bank-transactions",
  beforeLoad: () => checkPermission(PERMISSIONS.FINANCE_MENU),
  component: BankTransactionsPage,
});

// Receivables page
const receivablesRoute = createRoute({
  getParentRoute: () => dashboardLayoutRoute,
  path: "/finance/receivables",
  beforeLoad: () => checkPermission(PERMISSIONS.FINANCE_MENU),
  component: ReceivablesPage,
});

// Inflation Rates page
const inflationRatesRoute = createRoute({
  getParentRoute: () => dashboardLayoutRoute,
  path: "/finance/inflation-rates",
  beforeLoad: () => checkPermission(PERMISSIONS.FINANCE_MENU),
  component: InflationRatesPage,
});

// Contract Invoices page
const contractInvoicesRoute = createRoute({
  getParentRoute: () => dashboardLayoutRoute,
  path: "/contract-invoices",
  beforeLoad: () => checkPermission(PERMISSIONS.CONTRACT_MENU),
  component: ContractInvoicesPage,
});

// Contract Cash Registers page — dashboard sekmesi var, DASHBOARD_VIEW ile de erişilebilir
const contractCashRegistersRoute = createRoute({
  getParentRoute: () => dashboardLayoutRoute,
  path: "/contracts/cash-registers",
  beforeLoad: () => checkAnyPermission(PERMISSIONS.CONTRACT_MENU, PERMISSIONS.DASHBOARD_VIEW),
  component: ContractCashRegistersPage,
});

// Contract Supports page — dashboard sekmesi var, DASHBOARD_VIEW ile de erişilebilir
const contractSupportsRoute = createRoute({
  getParentRoute: () => dashboardLayoutRoute,
  path: "/contracts/supports",
  beforeLoad: () => checkAnyPermission(PERMISSIONS.CONTRACT_MENU, PERMISSIONS.DASHBOARD_VIEW),
  component: ContractSupportsPage,
});

// Contract Versions page — dashboard sekmesi var, DASHBOARD_VIEW ile de erişilebilir
const contractVersionsRoute = createRoute({
  getParentRoute: () => dashboardLayoutRoute,
  path: "/contracts/versions",
  beforeLoad: () => checkAnyPermission(PERMISSIONS.CONTRACT_MENU, PERMISSIONS.DASHBOARD_VIEW),
  component: ContractVersionsPage,
});

// Contract SaaS page — dashboard sekmesi var, DASHBOARD_VIEW ile de erişilebilir
const contractSaasRoute = createRoute({
  getParentRoute: () => dashboardLayoutRoute,
  path: "/contracts/saas",
  beforeLoad: () => checkAnyPermission(PERMISSIONS.CONTRACT_MENU, PERMISSIONS.DASHBOARD_VIEW),
  component: ContractSaasPage,
});

// Contract Documents page
const contractDocumentsRoute = createRoute({
  getParentRoute: () => dashboardLayoutRoute,
  path: "/contracts/documents",
  beforeLoad: () => checkPermission(PERMISSIONS.CONTRACT_MENU),
  component: ContractDocumentsPage,
});

// Prorated Report (Kıst Raporu) page
const proratedReportRoute = createRoute({
  getParentRoute: () => dashboardLayoutRoute,
  path: "/contracts/prorated-report",
  beforeLoad: () => checkPermission(PERMISSIONS.CONTRACT_MENU),
  component: ProratedReportPage,
});

// Pending Installations (Kurulum Bekleyen Ürünler) page
const pendingInstallationsRoute = createRoute({
  getParentRoute: () => dashboardLayoutRoute,
  path: "/contracts/pending-installations",
  beforeLoad: () => checkPermission(PERMISSIONS.CONTRACT_MENU),
  component: PendingInstallationsPage,
});

// Uninvoiced Items (Faturaya Dahil Edilmemiş Kalemler) page
const uninvoicedItemsRoute = createRoute({
  getParentRoute: () => dashboardLayoutRoute,
  path: "/contracts/uninvoiced-items",
  beforeLoad: () => checkPermission(PERMISSIONS.CONTRACT_MENU),
  component: UninvoicedItemsPage,
});

// E-Document Credits page
const eDocCreditsRoute = createRoute({
  getParentRoute: () => dashboardLayoutRoute,
  path: "/e-documents/credits",
  beforeLoad: () => checkPermission(PERMISSIONS.EDOC_MENU),
  component: EDocCreditsPage,
});

// E-Document Members page
const eDocMembersRoute = createRoute({
  getParentRoute: () => dashboardLayoutRoute,
  path: "/e-documents/members",
  beforeLoad: () => checkPermission(PERMISSIONS.EDOC_MENU),
  component: EDocMembersPage,
});

// E-Invoice Prices page
const eInvoicePricesRoute = createRoute({
  getParentRoute: () => dashboardLayoutRoute,
  path: "/e-documents/invoice-prices",
  beforeLoad: () => checkPermission(PERMISSIONS.EDOC_MENU),
  component: EInvoicePricesPage,
});

// E-Document Statuses page
const eDocStatusesRoute = createRoute({
  getParentRoute: () => dashboardLayoutRoute,
  path: "/e-documents/statuses",
  beforeLoad: () => checkPermission(PERMISSIONS.EDOC_MENU),
  component: EDocStatusesPage,
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

// Public contract payment page (no auth)
const publicContractPaymentRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: "/kontrat-odeme/$linkId",
  component: PublicContractPaymentPage,
});

// System Logs page
const systemLogsRoute = createRoute({
  getParentRoute: () => dashboardLayoutRoute,
  path: "/system/logs",
  beforeLoad: () => checkPermission(PERMISSIONS.SYSTEM_MENU),
  component: SystemLogsPage,
});

// Users page
const usersRoute = createRoute({
  getParentRoute: () => dashboardLayoutRoute,
  path: "/system/users",
  beforeLoad: () => checkPermission(PERMISSIONS.SYSTEM_MENU),
  component: UsersPage,
});

// Company Management page
const companyManagementRoute = createRoute({
  getParentRoute: () => dashboardLayoutRoute,
  path: "/system/companies",
  beforeLoad: () => checkPermission(PERMISSIONS.SYSTEM_MENU),
  component: CompanyManagementPage,
});

// Notification Settings page
const notificationSettingsRoute = createRoute({
  getParentRoute: () => dashboardLayoutRoute,
  path: "/system/notifications",
  beforeLoad: () => checkPermission(PERMISSIONS.NOTIFICATION_MENU),
  component: NotificationSettingsPage,
});

// SSO Management Dashboard — SSO_MANAGEMENT_MENU veya DASHBOARD_VIEW yetkisi ile erişilebilir
const ssoManagementRoute = createRoute({
  getParentRoute: () => dashboardLayoutRoute,
  path: "/sso-management",
  beforeLoad: () => checkAnyPermission(PERMISSIONS.SSO_MANAGEMENT_MENU, PERMISSIONS.DASHBOARD_VIEW),
  component: SsoManagementPage,
});

const ssoApplicationsRoute = createRoute({
  getParentRoute: () => dashboardLayoutRoute,
  path: "/sso-management/apps",
  beforeLoad: () => checkPermission(PERMISSIONS.SSO_MANAGEMENT_MENU),
  component: ApplicationsPage,
});

const ssoRolesRoute = createRoute({
  getParentRoute: () => dashboardLayoutRoute,
  path: "/sso-management/roles",
  beforeLoad: () => checkPermission(PERMISSIONS.SSO_MANAGEMENT_MENU),
  component: RolesPage,
});

const ssoPermissionsRoute = createRoute({
  getParentRoute: () => dashboardLayoutRoute,
  path: "/sso-management/perms",
  beforeLoad: () => checkPermission(PERMISSIONS.SSO_MANAGEMENT_MENU),
  component: PermissionsPage,
});

const ssoUsersRoute = createRoute({
  getParentRoute: () => dashboardLayoutRoute,
  path: "/sso-management/users",
  beforeLoad: () => checkPermission(PERMISSIONS.SSO_MANAGEMENT_MENU),
  component: SsoUsersPage,
});

const ssoApiKeysRoute = createRoute({
  getParentRoute: () => dashboardLayoutRoute,
  path: "/sso-management/api-keys",
  beforeLoad: () => checkPermission(PERMISSIONS.SSO_MANAGEMENT_MENU),
  component: ApiKeysPage,
});

// Boss Users page
const bossUsersRoute = createRoute({
  getParentRoute: () => dashboardLayoutRoute,
  path: "/boss-users",
  beforeLoad: () => checkPermission(PERMISSIONS.SSO_MANAGEMENT_MENU),
  component: BossUsersPage,
});

// Employee Profiles page (Admin/İK)
const employeeProfilesRoute = createRoute({
  getParentRoute: () => dashboardLayoutRoute,
  path: "/employee-profiles",
  beforeLoad: () => checkPermission(PERMISSIONS.EMPLOYEE_PROFILE_MENU),
  component: EmployeeProfilesPage,
});

// My Profile page (Self-Service - tüm giriş yapmış kullanıcılar)
const myProfileRoute = createRoute({
  getParentRoute: () => dashboardLayoutRoute,
  path: "/my-profile",
  component: MyProfilePage,
});

// Org Lookup pages (Departman, Ünvan, Lokasyon tanımları)
const orgDepartmentsRoute = createRoute({
  getParentRoute: () => dashboardLayoutRoute,
  path: "/org-lookups/departments",
  beforeLoad: () => checkPermission(PERMISSIONS.EMPLOYEE_PROFILE_MENU),
  component: OrgDepartmentsPage,
});

const orgTitlesRoute = createRoute({
  getParentRoute: () => dashboardLayoutRoute,
  path: "/org-lookups/titles",
  beforeLoad: () => checkPermission(PERMISSIONS.EMPLOYEE_PROFILE_MENU),
  component: OrgTitlesPage,
});

const orgLocationsRoute = createRoute({
  getParentRoute: () => dashboardLayoutRoute,
  path: "/org-lookups/locations",
  beforeLoad: () => checkPermission(PERMISSIONS.EMPLOYEE_PROFILE_MENU),
  component: OrgLocationsPage,
});

// Feedback page
const feedbackRoute = createRoute({
  getParentRoute: () => dashboardLayoutRoute,
  path: "/feedbacks",
  beforeLoad: () => checkPermission(PERMISSIONS.FEEDBACK_MENU),
  component: FeedbackPage,
});

// Index redirect — dashboard yetkisi varsa oraya, yoksa welcome'a
const indexRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: "/",
  beforeLoad: () => {
    const { hasPermission } = useAuthStore.getState();
    const target = hasPermission(PERMISSIONS.DASHBOARD_VIEW) ? "/dashboard" : "/welcome";
    throw redirect({ to: target });
  },
});

const routeTree = rootRoute.addChildren([
  indexRoute,
  loginRoute,
  publicPaymentFormRoute,
  publicPaymentOkRoute,
  publicPaymentErrorRoute,
  publicContractPaymentRoute,
  dashboardLayoutRoute.addChildren([
    welcomeRoute,
    dashboardRoute,
    contractsRoute,
    contractCashRegistersRoute,
    contractSupportsRoute,
    contractVersionsRoute,
    contractSaasRoute,
    contractDocumentsRoute,
    proratedReportRoute,
    pendingInstallationsRoute,
    uninvoicedItemsRoute,
    customersRoute,
    customerSegmentsRoute,
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
    receivablesRoute,
    inflationRatesRoute,
    eDocCreditsRoute,
    eDocMembersRoute,
    eInvoicePricesRoute,
    eDocStatusesRoute,
    systemLogsRoute,
    notificationSettingsRoute,
    usersRoute,
    companyManagementRoute,
    ssoManagementRoute,
    ssoApplicationsRoute,
    ssoRolesRoute,
    ssoPermissionsRoute,
    ssoUsersRoute,
    ssoApiKeysRoute,
    bossUsersRoute,
    employeeProfilesRoute,
    myProfileRoute,
    orgDepartmentsRoute,
    orgTitlesRoute,
    orgLocationsRoute,
    feedbackRoute,
  ]),
]);

export const router = createRouter({ routeTree });

declare module "@tanstack/react-router" {
  interface Register {
    router: typeof router;
  }
}
