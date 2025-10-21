import { Link, useLocation } from 'react-router-dom';
import { WalletMultiButton } from '@solana/wallet-adapter-react-ui';
import './Navigation.css';

export function Navigation() {
  const location = useLocation();

  return (
    <nav className="navigation">
      <div className="nav-container">
        <div className="nav-brand">
          <h2>SRWA Protocol</h2>
        </div>
        <div className="nav-links">
          <Link to="/" className={location.pathname === '/' ? 'active' : ''}>
            Home
          </Link>
          <Link to="/issuer" className={location.pathname === '/issuer' ? 'active' : ''}>
            Issuer
          </Link>
          <Link to="/investor" className={location.pathname === '/investor' ? 'active' : ''}>
            Investor
          </Link>
          <Link to="/admin" className={location.pathname === '/admin' ? 'active' : ''}>
            Admin
          </Link>
        </div>
        <div className="nav-wallet">
          <WalletMultiButton />
        </div>
      </div>
    </nav>
  );
}
