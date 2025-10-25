import { Header } from '@/components/layout/Header';
import { InvestorDashboard } from '@/components/srwa/InvestorDashboard';

export default function Investor() {
  return (
    <div className="min-h-screen bg-background">
      <Header />
      <InvestorDashboard />
    </div>
  );
}
