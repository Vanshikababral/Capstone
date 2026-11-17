import { useCallback, useEffect, useState } from 'react';
import { Navigate, Outlet, useLocation, useNavigate } from 'react-router-dom';
import Navbar from '../components/Navbar';
import Sidebar from '../components/Sidebar';
import { clearAuthTokens, getAccessToken, getCurrentUser } from '../services/auth';
import { ROLE_HOME } from '../roleAccess';
import './AppLayout.css';

const useMediaQuery = (query) => {
  const [matches, setMatches] = useState(
    () => typeof window !== 'undefined' && window.matchMedia(query).matches
  );

  useEffect(() => {
    const mediaQuery = window.matchMedia(query);
    const handleChange = (event) => setMatches(event.matches);
    mediaQuery.addEventListener('change', handleChange);
    return () => mediaQuery.removeEventListener('change', handleChange);
  }, [query]);

  return matches;
};

const usePersistedState = (key, initialValue) => {
  const [value, setValue] = useState(() => {
    try {
      const savedValue = localStorage.getItem(key);
      return savedValue ? JSON.parse(savedValue) : initialValue;
    } catch {
      return initialValue;
    }
  });

  useEffect(() => {
    try {
      localStorage.setItem(key, JSON.stringify(value));
    } catch {
      // Local storage can be unavailable in privacy-restricted browsers.
    }
  }, [key, value]);

  return [value, setValue];
};

export default function AppLayout() {
  const navigate = useNavigate();
  const location = useLocation();
  const isMobile = useMediaQuery('(max-width: 1024px)');
  const [collapsed, setCollapsed] = usePersistedState('al:collapsed', false);
  const [mobileOpen, setMobileOpen] = useState(false);
  const [user, setUser] = useState(null);
  const [authChecked, setAuthChecked] = useState(false);

  useEffect(() => {
    let active = true;

    if (!getAccessToken()) {
      navigate('/login', { replace: true });
      return () => {
        active = false;
      };
    }

    getCurrentUser()
      .then((currentUser) => {
        if (active) setUser(currentUser);
      })
      .catch(() => {
        clearAuthTokens();
        if (active) navigate('/login', { replace: true });
      })
      .finally(() => {
        if (active) setAuthChecked(true);
      });

    return () => {
      active = false;
    };
  }, [navigate]);

  const handleSignOut = useCallback(() => {
    clearAuthTokens();
    setUser(null);
    navigate('/login', { replace: true });
  }, [navigate]);

  useEffect(() => {
    const handleKeyDown = (event) => {
      if ((event.metaKey || event.ctrlKey) && event.key.toLowerCase() === 'b') {
        event.preventDefault();
        setCollapsed((current) => !current);
      }
      if (event.key === 'Escape') setMobileOpen(false);
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [setCollapsed]);

  const effectiveCollapsed = !isMobile && collapsed;
  const isPendingApproval =
    user?.role_request_status === 'PENDING' && Boolean(user?.requested_role);

  if (!authChecked || !user) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-slate-50 text-sm text-slate-600">
        Checking your sign-in…
      </div>
    );
  }

  if (
    isPendingApproval &&
    location.pathname !== '/approval-pending'
  ) {
    return <Navigate to="/approval-pending" replace />;
  }

  if (!isPendingApproval && location.pathname === '/') {
    return <Navigate to={ROLE_HOME[user.role] || '/login'} replace />;
  }

  return (
    <div className="app-layout-shell">
      <Sidebar
        isCollapsed={effectiveCollapsed}
        isMobileOpen={mobileOpen}
        onClose={() => setMobileOpen(false)}
        onNavigate={() => setMobileOpen(false)}
        onToggleCollapse={() => setCollapsed((current) => !current)}
        onSignOut={handleSignOut}
        user={user}
      />

      <div className="app-layout-main">
        <Navbar
          onMobileMenuToggle={() => setMobileOpen(true)}
          onSignOut={handleSignOut}
          user={user}
        />
        <main className="app-layout-content" id="main-content" tabIndex={-1}>
          <Outlet context={user} />
        </main>
      </div>
    </div>
  );
}
