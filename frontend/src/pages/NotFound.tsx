import { useLocation } from "react-router-dom";
import { useEffect } from "react";

const NotFound = () => {
  const location = useLocation();

  useEffect(() => {
    console.error("404 Error: User attempted to access non-existent route:", location.pathname);
  }, [location.pathname]);

  return (
    <div className="flex min-h-screen items-center justify-center bg-background">
      <div className="text-center space-y-6">
        <div className="space-y-2">
          <h1 className="text-display-2 font-semibold text-fg-primary">404</h1>
          <p className="text-h3 text-fg-secondary">Page not found</p>
          <p className="text-body-1 text-fg-muted max-w-md mx-auto">
            The page you're looking for doesn't exist or has been moved.
          </p>
        </div>
        <a 
          href="/" 
          className="inline-flex items-center justify-center px-6 py-3 text-body-2 font-medium text-primary-foreground bg-primary hover:bg-brand-600 rounded-xl transition-colors focus-ring"
        >
          Return to Home
        </a>
      </div>
    </div>
  );
};

export default NotFound;
