import { BrowserRouter, Routes, Route } from 'react-router-dom';
import { WalletProvider } from './components/common/WalletProvider';
import { ProgramProvider } from './contexts/ProgramContext';
import { Navigation } from './components/common/Navigation';
import { Home } from './pages/Home';
import { IssuerWizard } from './components/issuer/IssuerWizard';
import { InvestorDashboard } from './components/investor/InvestorDashboard';
import { AdminPanel } from './components/admin/AdminPanel';
import './App.css';

function App() {
  return (
    <BrowserRouter>
      <WalletProvider>
        <ProgramProvider>
          <div className="app">
            <Navigation />
            <main className="main-content">
              <Routes>
                <Route path="/" element={<Home />} />
                <Route path="/issuer" element={<IssuerWizard />} />
                <Route path="/investor" element={<InvestorDashboard />} />
                <Route path="/admin" element={<AdminPanel />} />
              </Routes>
            </main>
            <footer className="footer">
              <p>SRWA Protocol - Security Tokens on Solana</p>
              <p>Built with Anchor Framework</p>
            </footer>
          </div>
        </ProgramProvider>
      </WalletProvider>
    </BrowserRouter>
  );
}

export default App;
