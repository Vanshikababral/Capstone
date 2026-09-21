import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { Link, useLocation } from 'react-router-dom';
import {
  Bell,
  Menu,
  User,
  ChevronDown,
  ShieldCheck,
  Search,
  LogOut,
  Settings,
} from 'lucide-react';

/* ------------------------------------------------------------------ */
/*  Mock data — swap for API-driven sources in future iterations      */
/* ------------------------------------------------------------------ */
const MOCK_USER = {
  name: 'Procurement Admin',
  role: 'Compliance Analyst',
  initials: 'PA',
};

const MOCK_NOTIFICATIONS = [
  {
    id: 'n1',
    tone: 'amber',
    title: 'Bid compliance review pending',
    detail: 'GeM/2024/BID/00921 — 3 clauses flagged',
    time: '12m ago',
  },
  {
    id: 'n2',
    tone: 'red',
    title: 'Critical mismatch detected',
    detail: 'Vendor GSTIN verification failed for Tender 882',
    time: '1h ago',
  },
  {
    id: 'n3',
    tone: 'emerald',
    title: 'Verification batch approved',
    detail: '18 documents cleared by auto-compliance engine',
    time: '3h ago',
  },
];

const NOTIFICATION_COUNT = 3;

/* ------------------------------------------------------------------ */
/*  Route → Title map (fallback when `title` prop is omitted)         */
/* ------------------------------------------------------------------ */
const ROUTE_TITLES = {
  dashboard: 'Dashboard',
  bids: 'Bids',
  verification: 'Verification Queue',
  compliance: 'Compliance Rules',
  analytics: 'Analytics',
  documents: 'Document Vault',
  vendors: 'Vendors',
  settings: 'Settings',
};

const deriveTitleFromPath = (pathname) => {
  const seg = pathname.split('/').filter(Boolean)[0];
  if (!seg) return 'Dashboard';
  return (
    ROUTE_TITLES[seg] ??
    seg.replace(/-/g, ' ').replace(/\b\w/g, (c) => c.toUpperCase())
  );
};

/* ------------------------------------------------------------------ */
/*  Tone mapping for notification indicator colors                    */
/* ------------------------------------------------------------------ */
const TONE_DOT = {
  amber: 'bg-amber-500',
  red: 'bg-red-600',
  emerald: 'bg-emerald-600',
};

/* ------------------------------------------------------------------ */
/*  Reusable outside-click hook                                       */
/* ------------------------------------------------------------------ */
const useOutsideClick = (ref, handler, enabled = true) => {
  useEffect(() => {
    if (!enabled) return;
    const listener = (event) => {
      const el = ref.current;
      if (!el || el.contains(event.target)) return;
      handler(event);
    };
    document.addEventListener('mousedown', listener);
    document.addEventListener('touchstart', listener);
    return () => {
      document.removeEventListener('mousedown', listener);
      document.removeEventListener('touchstart', listener);
    };
  }, [ref, handler, enabled]);
};

/* ------------------------------------------------------------------ */
/*  Navbar                                                            */
/* ------------------------------------------------------------------ */
export default function Navbar({ onMobileMenuToggle, title }) {
  const { pathname } = useLocation();

  const [notifOpen, setNotifOpen] = useState(false);
  const [userOpen, setUserOpen] = useState(false);

  const notifRef = useRef(null);
  const userRef = useRef(null);

  const resolvedTitle = useMemo(
    () => title ?? deriveTitleFromPath(pathname),
    [title, pathname]
  );

  const closeAll = useCallback(() => {
    setNotifOpen(false);
    setUserOpen(false);
  }, []);

  useOutsideClick(notifRef, () => setNotifOpen(false), notifOpen);
  useOutsideClick(userRef, () => setUserOpen(false), userOpen);

  /* Esc closes any open dropdown */
  useEffect(() => {
    const onKey = (event) => {
      if (event.key === 'Escape') closeAll();
    };
    document.addEventListener('keydown', onKey);
    return () => document.removeEventListener('keydown', onKey);
  }, [closeAll]);

  const toggleNotifications = () => {
    setUserOpen(false);
    setNotifOpen((prev) => !prev);
  };

  const toggleUserMenu = () => {
    setNotifOpen(false);
    setUserOpen((prev) => !prev);
  };

  return (
    <header
      role="banner"
      className="sticky top-0 z-30 flex h-16 w-full items-center gap-3 border-b border-slate-300 bg-white px-3 shadow-sm sm:px-5 lg:px-7"
    >
      {/* ---------- Left: mobile menu + brand + title ---------- */}
      <div className="flex min-w-0 flex-1 items-center gap-3">
        {typeof onMobileMenuToggle === 'function' && (
          <button
            type="button"
            onClick={onMobileMenuToggle}
            aria-label="Open navigation menu"
            aria-controls="app-sidebar"
            className="inline-flex h-9 w-9 items-center justify-center rounded-md text-emerald-700 transition-colors hover:bg-emerald-50 hover:text-emerald-900 focus:outline-none focus-visible:ring-2 focus-visible:ring-emerald-600 focus-visible:ring-offset-1 lg:hidden"
          >
            <Menu className="h-5 w-5" aria-hidden="true" />
          </button>
        )}

        <Link
          to="/dashboard"
          className="flex items-center gap-2 rounded-md focus:outline-none focus-visible:ring-2 focus-visible:ring-emerald-600 focus-visible:ring-offset-1"
          aria-label="BidSentinel home"
        >
          <span className="inline-flex h-8 w-8 items-center justify-center rounded-md bg-emerald-700 text-white">
            <ShieldCheck className="h-4 w-4" aria-hidden="true" />
          </span>
          <span className="hidden flex-col leading-tight sm:flex">
            <span className="text-sm font-semibold tracking-tight text-slate-900">
              BidSentinel
            </span>
            <span className="text-[10.5px] font-medium uppercase tracking-wider text-slate-500">
              GeM Compliance
            </span>
          </span>
        </Link>

        <span
          className="mx-1 hidden h-6 w-px bg-slate-200 md:inline-block"
          aria-hidden="true"
        />

        <h1 className="hidden truncate text-sm font-semibold text-slate-700 md:block">
          {resolvedTitle}
        </h1>
      </div>

      {/* ---------- Center: search ---------- */}
      <div className="hidden max-w-md flex-1 items-center lg:flex">
        <label htmlFor="navbar-search" className="sr-only">
          Search bids, vendors, documents
        </label>
        <div className="relative w-full">
          <span className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-3 text-slate-400">
            <Search className="h-4 w-4" aria-hidden="true" />
          </span>
          <input
            id="navbar-search"
            type="search"
            autoComplete="off"
            placeholder="Search bids, tenders, documents..."
            className="h-9 w-full rounded-md border border-slate-300 bg-white pl-9 pr-12 text-sm text-slate-800 placeholder:text-slate-500 transition-colors focus:border-emerald-600 focus:bg-white focus:outline-none focus:ring-2 focus:ring-emerald-600/20"
          />
          <kbd className="pointer-events-none absolute inset-y-0 right-2 my-auto flex h-5 items-center rounded border border-slate-200 bg-white px-1.5 font-mono text-[10px] font-medium text-slate-500">
            ⌘K
          </kbd>
        </div>
      </div>

      {/* ---------- Right: notifications + user ---------- */}
      <div className="flex items-center gap-1 sm:gap-2">
        {/* Notifications */}
        <div className="relative" ref={notifRef}>
          <button
            type="button"
            onClick={toggleNotifications}
            aria-haspopup="menu"
            aria-expanded={notifOpen}
            aria-controls="navbar-notifications"
            aria-label={`Notifications, ${NOTIFICATION_COUNT} unread`}
            className="relative inline-flex h-9 w-9 items-center justify-center rounded-md text-emerald-800 transition-colors hover:bg-emerald-50 hover:text-emerald-950 focus:outline-none focus-visible:ring-2 focus-visible:ring-emerald-600 focus-visible:ring-offset-1"
          >
            <Bell className="h-5 w-5" aria-hidden="true" />
            {NOTIFICATION_COUNT > 0 && (
              <span
                className="absolute -right-0.5 -top-0.5 inline-flex h-4 min-w-[16px] items-center justify-center rounded-full bg-amber-500 px-1 text-[10px] font-semibold leading-none text-white ring-2 ring-white"
                aria-hidden="true"
              >
                {NOTIFICATION_COUNT > 9 ? '9+' : NOTIFICATION_COUNT}
              </span>
            )}
          </button>

          {notifOpen && (
            <div
              id="navbar-notifications"
              role="menu"
              aria-label="Notifications"
              className="absolute right-0 mt-2 w-80 origin-top-right overflow-hidden rounded-md border border-slate-200 bg-white shadow-lg focus:outline-none"
            >
              <div className="flex items-center justify-between border-b border-slate-100 px-3 py-2">
                <span className="text-xs font-semibold uppercase tracking-wider text-slate-500">
                  Notifications
                </span>
                <span className="rounded-full bg-amber-50 px-2 py-0.5 text-[10.5px] font-semibold text-amber-600">
                  {NOTIFICATION_COUNT} new
                </span>
              </div>

              <ul className="max-h-80 divide-y divide-slate-100 overflow-y-auto">
                {MOCK_NOTIFICATIONS.map((item) => (
                  <li key={item.id}>
                    <button
                      type="button"
                      role="menuitem"
                      className="flex w-full items-start gap-3 px-3 py-2.5 text-left transition-colors hover:bg-slate-50 focus:bg-slate-50 focus:outline-none"
                    >
                      <span
                        className={`mt-1.5 h-2 w-2 flex-shrink-0 rounded-full ${
                          TONE_DOT[item.tone] ?? 'bg-slate-400'
                        }`}
                        aria-hidden="true"
                      />
                      <span className="min-w-0 flex-1">
                        <span className="block truncate text-[13px] font-medium text-slate-800">
                          {item.title}
                        </span>
                        <span className="mt-0.5 block truncate text-[11.5px] text-slate-500">
                          {item.detail}
                        </span>
                      </span>
                      <span className="flex-shrink-0 text-[10.5px] text-slate-400">
                        {item.time}
                      </span>
                    </button>
                  </li>
                ))}
              </ul>

              <div className="border-t border-slate-100 bg-slate-50 px-3 py-2 text-center">
                <button
                  type="button"
                  className="text-[12px] font-semibold text-emerald-600 transition-colors hover:text-emerald-700 focus:outline-none focus-visible:underline"
                >
                  View all notifications
                </button>
              </div>
            </div>
          )}
        </div>

        {/* User menu */}
        <div className="relative" ref={userRef}>
          <button
            type="button"
            onClick={toggleUserMenu}
            aria-haspopup="menu"
            aria-expanded={userOpen}
            aria-controls="navbar-user-menu"
            className="inline-flex items-center gap-2 rounded-md border border-slate-200 bg-white py-1 pl-1 pr-2 text-left transition-colors hover:bg-slate-50 focus:outline-none focus-visible:ring-2 focus-visible:ring-emerald-600 focus-visible:ring-offset-1"
          >
            <span
              className="inline-flex h-7 w-7 items-center justify-center rounded-full bg-slate-900 text-[11px] font-semibold text-white"
              aria-hidden="true"
            >
              {MOCK_USER.initials}
            </span>
            <span className="hidden flex-col leading-tight sm:flex">
              <span className="max-w-[140px] truncate text-[12px] font-semibold text-slate-800">
                {MOCK_USER.name}
              </span>
              <span className="max-w-[140px] truncate text-[10.5px] text-slate-500">
                {MOCK_USER.role}
              </span>
            </span>
            <ChevronDown
              className={`h-4 w-4 flex-shrink-0 text-slate-400 transition-transform ${
                userOpen ? 'rotate-180' : ''
              }`}
              aria-hidden="true"
            />
          </button>

          {userOpen && (
            <div
              id="navbar-user-menu"
              role="menu"
              aria-label="User menu"
              className="absolute right-0 mt-2 w-64 origin-top-right overflow-hidden rounded-md border border-slate-200 bg-white shadow-lg focus:outline-none"
            >
              <div className="flex items-center gap-3 border-b border-slate-100 px-3 py-3">
                <span
                  className="inline-flex h-9 w-9 items-center justify-center rounded-full bg-slate-900 text-[12px] font-semibold text-white"
                  aria-hidden="true"
                >
                  {MOCK_USER.initials}
                </span>
                <span className="flex min-w-0 flex-col leading-tight">
                  <span className="truncate text-[13px] font-semibold text-slate-800">
                    {MOCK_USER.name}
                  </span>
                  <span className="truncate text-[11px] text-slate-500">
                    {MOCK_USER.role}
                  </span>
                </span>
              </div>

              <div className="py-1">
                <button
                  type="button"
                  role="menuitem"
                  className="flex w-full items-center gap-2.5 px-3 py-2 text-left text-[13px] text-slate-700 transition-colors hover:bg-slate-50 focus:bg-slate-50 focus:outline-none"
                >
                  <User
                    className="h-4 w-4 flex-shrink-0 text-slate-400"
                    aria-hidden="true"
                  />
                  Profile
                </button>
                <button
                  type="button"
                  role="menuitem"
                  className="flex w-full items-center gap-2.5 px-3 py-2 text-left text-[13px] text-slate-700 transition-colors hover:bg-slate-50 focus:bg-slate-50 focus:outline-none"
                >
                  <Settings
                    className="h-4 w-4 flex-shrink-0 text-slate-400"
                    aria-hidden="true"
                  />
                  Settings
                </button>
              </div>

              <div className="border-t border-slate-100 py-1">
                <button
                  type="button"
                  role="menuitem"
                  className="flex w-full items-center gap-2.5 px-3 py-2 text-left text-[13px] font-medium text-red-600 transition-colors hover:bg-red-50 focus:bg-red-50 focus:outline-none"
                >
                  <LogOut
                    className="h-4 w-4 flex-shrink-0 text-red-600"
                    aria-hidden="true"
                  />
                  Sign out
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </header>
  );
}