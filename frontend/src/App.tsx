import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { CombinedProvider } from "@/contexts/CombinedProvider";
import { ProtectedRoute } from "@/components/auth/ProtectedRoute";
import { UserRole } from "@/types/srwa-contracts";
import { FEATURES } from "@/lib/constants/features";
import Index from "./pages/Index";
import Markets from "./pages/markets/Markets";
import Portfolio from "./pages/portfolio/Portfolio";
import MarketDetail from "./pages/MarketDetail";
import KYC from "./pages/KYC";
import Admin from "./pages/Admin";
import Docs from "./pages/Docs";
import NotFound from "./pages/NotFound";
import Home from "./pages/Home";
import Register from "./pages/Register";
import SRWAIssuance from "./pages/SRWAIssuance";
import SRWADemo from "./pages/SRWADemo";
import SRWATestForm from "./pages/SRWATestForm";
import KYCEligibility from "./pages/KYCEligibility";
import OracleNav from "./pages/OracleNav";
import Pools from "./pages/Pools";
import CreatePool from "./pages/CreatePool";
import PoolDetail from "./pages/PoolDetail";
import Optimizer from "./pages/Optimizer";
import Dashboards from "./pages/Dashboards";
import Dashboard from "./pages/Dashboard";
import DashboardOverview from "./pages/dashboard/DashboardOverview";
import DashboardMarkets from "./pages/dashboard/DashboardMarkets";
import DashboardPortfolio from "./pages/dashboard/DashboardPortfolio";
import UnifiedDashboard from "./pages/dashboard/UnifiedDashboard";
import Investor from "./pages/Investor";

const App = () => (
  <CombinedProvider>
    <Toaster />
    <Sonner />
    <BrowserRouter>
      <Routes>
        {/* Public routes - always available */}
        <Route path="/" element={<Index />} />
        <Route path="/home" element={<Home />} />
        <Route path="/docs" element={<Docs />} />

        {/* Demo/Test routes - always public */}
        <Route path="/srwa-demo" element={<SRWADemo />} />
        <Route path="/srwa-test" element={<SRWATestForm />} />

        {/* Feature-gated routes - only available when VITE_ENABLE_DASHBOARD=true (development) */}
        {FEATURES.DASHBOARD && (
          <>
            {/* Registration route - requires wallet but not registration */}
            <Route path="/register" element={<Register />} />

            {/* Investor routes - PUBLIC in dev for easy testing */}
            <Route path="/markets" element={<Markets />} />
            <Route path="/market/:id" element={<MarketDetail />} />
            <Route path="/portfolio" element={<Portfolio />} />
            <Route path="/investor" element={<Investor />} />

            {/* Dashboard routes - Unified structure */}
            <Route path="/dashboard" element={<UnifiedDashboard />} />
            <Route path="/dashboard/overview" element={<DashboardOverview />} />
            <Route path="/dashboard/markets" element={<DashboardMarkets />} />
            <Route path="/dashboard/portfolio" element={<DashboardPortfolio />} />

            {/* Legacy dashboard routes */}
            <Route path="/dashboard-old" element={<Dashboard />} />
            <Route path="/dashboards" element={<Dashboards />} />
            <Route path="/pools" element={<Pools />} />
            <Route path="/pool/:id" element={<PoolDetail />} />
            <Route path="/kyc" element={<KYC />} />
            <Route path="/kyc-eligibility" element={<KYCEligibility />} />
            <Route path="/optimizer" element={<Optimizer />} />
            <Route path="/oracle-nav" element={<OracleNav />} />

            {/* Issuer routes - still protected by role */}
            <Route
              path="/srwa-issuance"
              element={
                <ProtectedRoute allowedRoles={[UserRole.Issuer, UserRole.Admin]}>
                  <SRWAIssuance />
                </ProtectedRoute>
              }
            />
            <Route
              path="/create-pool"
              element={
                <ProtectedRoute allowedRoles={[UserRole.Issuer, UserRole.Admin]}>
                  <CreatePool />
                </ProtectedRoute>
              }
            />

            {/* Admin routes - still protected by role */}
            <Route
              path="/admin"
              element={
                <ProtectedRoute allowedRoles={[UserRole.Admin]}>
                  <Admin />
                </ProtectedRoute>
              }
            />
          </>
        )}

        {/* ADD ALL CUSTOM ROUTES ABOVE THE CATCH-ALL "*" ROUTE */}
        <Route path="*" element={<NotFound />} />
      </Routes>
    </BrowserRouter>
  </CombinedProvider>
);

export default App;
