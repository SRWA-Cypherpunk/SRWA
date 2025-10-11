import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { WalletProvider } from "@/components/wallet/WalletProvider";
import Index from "./pages/Index";
import Markets from "./pages/Markets";
import Portfolio from "./pages/Portfolio";
import MarketDetail from "./pages/MarketDetail";
import KYC from "./pages/KYC";
import Admin from "./pages/Admin";
import Docs from "./pages/Docs";
import NotFound from "./pages/NotFound";
import Home from "./pages/Home";
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

const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <TooltipProvider>
      <WalletProvider>
        <Toaster />
        <Sonner />
        <BrowserRouter>
          <Routes>
            <Route path="/" element={<Index />} />
            <Route path="/home" element={<Home />} />
            <Route path="/srwa-issuance" element={<SRWAIssuance />} />
            <Route path="/srwa-demo" element={<SRWADemo />} />
            <Route path="/srwa-test" element={<SRWATestForm />} />
            <Route path="/kyc-eligibility" element={<KYCEligibility />} />
            <Route path="/oracle-nav" element={<OracleNav />} />
            <Route path="/pools" element={<Pools />} />
            <Route path="/create-pool" element={<CreatePool />} />
            <Route path="/pool/:id" element={<PoolDetail />} />
            <Route path="/optimizer" element={<Optimizer />} />
            <Route path="/dashboards" element={<Dashboards />} />
            <Route path="/dashboard" element={<Dashboard />} />

            <Route path="/markets" element={<Markets />} />
            <Route path="/market/:id" element={<MarketDetail />} />
            <Route path="/portfolio" element={<Portfolio />} />
            <Route path="/kyc" element={<KYC />} />
            <Route path="/admin" element={<Admin />} />
            <Route path="/docs" element={<Docs />} />
            {/* ADD ALL CUSTOM ROUTES ABOVE THE CATCH-ALL "*" ROUTE */}
            <Route path="*" element={<NotFound />} />
          </Routes>
        </BrowserRouter>
      </WalletProvider>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;
