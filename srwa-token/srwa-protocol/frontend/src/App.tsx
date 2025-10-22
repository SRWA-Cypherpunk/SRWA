import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { CombinedProvider } from "@/contexts/CombinedProvider";
import { ProtectedRoute } from "@/components/auth/ProtectedRoute";
import { UserRole } from "@/types/srwa-contracts";
import Index from "./pages/Index";
import Markets from "./pages/Markets";
import Portfolio from "./pages/Portfolio";
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
import Investor from "./pages/Investor";

const App = () => (
  <CombinedProvider>
    <Toaster />
    <Sonner />
    <BrowserRouter>
      <Routes>
        {/* Public routes */}
        <Route path="/" element={<Index />} />
        <Route path="/home" element={<Home />} />
        <Route path="/docs" element={<Docs />} />

        {/* Registration route - requires wallet but not registration */}
        <Route path="/register" element={<Register />} />

        {/* Issuer routes */}
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

        {/* Investor routes */}
        <Route
          path="/investor"
          element={
            <ProtectedRoute allowedRoles={[UserRole.Investor, UserRole.Admin]}>
              <Investor />
            </ProtectedRoute>
          }
        />
        <Route
          path="/markets"
          element={
            <ProtectedRoute allowedRoles={[UserRole.Investor, UserRole.Admin]}>
              <Markets />
            </ProtectedRoute>
          }
        />
        <Route
          path="/market/:id"
          element={
            <ProtectedRoute allowedRoles={[UserRole.Investor, UserRole.Admin]}>
              <MarketDetail />
            </ProtectedRoute>
          }
        />
        <Route
          path="/portfolio"
          element={
            <ProtectedRoute allowedRoles={[UserRole.Investor, UserRole.Admin]}>
              <Portfolio />
            </ProtectedRoute>
          }
        />

        {/* Admin routes */}
        <Route
          path="/admin"
          element={
            <ProtectedRoute allowedRoles={[UserRole.Admin]}>
              <Admin />
            </ProtectedRoute>
          }
        />

        {/* Shared routes - all registered users */}
        <Route
          path="/pools"
          element={
            <ProtectedRoute>
              <Pools />
            </ProtectedRoute>
          }
        />
        <Route
          path="/pool/:id"
          element={
            <ProtectedRoute>
              <PoolDetail />
            </ProtectedRoute>
          }
        />
        <Route
          path="/dashboard"
          element={
            <ProtectedRoute>
              <Dashboard />
            </ProtectedRoute>
          }
        />
        <Route
          path="/dashboards"
          element={
            <ProtectedRoute>
              <Dashboards />
            </ProtectedRoute>
          }
        />
        <Route
          path="/kyc"
          element={
            <ProtectedRoute>
              <KYC />
            </ProtectedRoute>
          }
        />
        <Route
          path="/kyc-eligibility"
          element={
            <ProtectedRoute>
              <KYCEligibility />
            </ProtectedRoute>
          }
        />
        <Route
          path="/optimizer"
          element={
            <ProtectedRoute>
              <Optimizer />
            </ProtectedRoute>
          }
        />
        <Route
          path="/oracle-nav"
          element={
            <ProtectedRoute>
              <OracleNav />
            </ProtectedRoute>
          }
        />

        {/* Demo/Test routes - can be public or protected as needed */}
        <Route path="/srwa-demo" element={<SRWADemo />} />
        <Route path="/srwa-test" element={<SRWATestForm />} />

        {/* ADD ALL CUSTOM ROUTES ABOVE THE CATCH-ALL "*" ROUTE */}
        <Route path="*" element={<NotFound />} />
      </Routes>
    </BrowserRouter>
  </CombinedProvider>
);

export default App;
