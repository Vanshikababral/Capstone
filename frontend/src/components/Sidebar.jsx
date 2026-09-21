import { NavLink, Link } from 'react-router-dom';
import {
  LayoutDashboard,
  FileText,
  Gavel,
  ShieldCheck,
  ClipboardCheck,
  BarChart3,
  LogOut,
  X,
  PanelLeftClose,
  PanelLeftOpen,
} from 'lucide-react';

/* ------------------------------------------------------------------ */
/*  Navigation model — single source of truth for sidebar items       */
/* ------------------------------------------------------------------ */
const NAV_ITEMS = [
  { to: '/dashboard',  label: 'Dashboard',     icon: LayoutDashboard },
  { to: '/tenders',    label: 'Tenders',       icon: FileText },
  { to: '/bids',       label: 'Bids',          icon: Gavel },
  { to: '/compliance', label: 'Compliance',    icon: ShieldCheck },
  { to: '/review',     label: 'Review Cases',  icon: ClipboardCheck },
  { to: '/reports',    label: 'Reports',       icon: BarChart3 },
];

/* ------------------------------------------------------------------ */
/*  NavLink className resolver                                        */
/* ------------------------------------------------------------------ */
const navLinkClass = ({ isActive }) => {
  const base =
    'group relative flex items-center gap-3 rounded-md px-3 py-2 text-sm font-medium transition-colors focus:outline-none focus-visible:ring-2 focus-visible:ring-amber-500 focus-visible:ring-offset-2 focus-visible:ring-offset-emerald-900';
  return isActive
    ? `${base} bg-emerald-800 text-white`
    : `${base} text-emerald-100/80 hover:bg-emerald-800/70 hover:text-white`;
};

const navLinkClassCollapsed =
  'group relative flex h-10 w-10 items-center justify-center rounded-md text-emerald-100/80 transition-colors hover:bg-emerald-800/70 hover:text-white focus:outline-none focus-visible:ring-2 focus-visible:ring-amber-500 focus-visible:ring-offset-2 focus-visible:ring-offset-emerald-900';

/* ------------------------------------------------------------------ */
/*  Sidebar                                                           */
/* ------------------------------------------------------------------ */
export default function Sidebar({
  isCollapsed = false,
  isMobileOpen = false,
  onClose,
  onNavigate,
  onToggleCollapse,
}) {
  /* Mobile drawer is always expanded — collapse only applies on desktop */
  const collapsed = isCollapsed && !isMobileOpen;

  return (
    <>
      {/* Mobile backdrop */}
      {isMobileOpen && (
        <div
          className="fixed inset-0 z-40 bg-emerald-950/50 backdrop-blur-sm lg:hidden"
          onClick={onClose}
          aria-hidden="true"
        />
      )}

      <aside
        id="app-sidebar"
        aria-label="Primary navigation"
        className={[
          'fixed inset-y-0 left-0 z-50 flex min-h-0 flex-col border-r border-emerald-800 bg-emerald-900 transition-[transform,width] duration-200 ease-out',
          collapsed ? 'w-16' : 'w-64',
          isMobileOpen ? 'translate-x-0' : '-translate-x-full',
          'lg:sticky lg:top-0 lg:h-screen lg:translate-x-0',
        ].join(' ')}
      >
        {/* ---------- Brand header ---------- */}
        <div
          className={[
            'flex h-16 flex-shrink-0 items-center border-b border-emerald-800',
            collapsed ? 'justify-center px-2' : 'justify-between px-4',
          ].join(' ')}
        >
          <Link
            to="/dashboard"
            aria-label="BidSentinel home"
            className="flex items-center gap-2.5 rounded-md focus:outline-none focus-visible:ring-2 focus-visible:ring-amber-500 focus-visible:ring-offset-2 focus-visible:ring-offset-emerald-900"
          >
            <span
              className="inline-flex h-8 w-8 flex-shrink-0 items-center justify-center rounded-md bg-white text-emerald-800"
              aria-hidden="true"
            >
              <ShieldCheck className="h-4 w-4" />
            </span>
            {!collapsed && (
              <span className="flex min-w-0 flex-col leading-tight">
                <span className="truncate text-sm font-semibold tracking-tight text-white">
                  BidSentinel
                </span>
                <span className="truncate text-[10.5px] font-medium uppercase tracking-wider text-emerald-100/70">
                  GeM Compliance
                </span>
              </span>
            )}
          </Link>

          {isMobileOpen && (
            <button
              type="button"
              onClick={onClose}
              aria-label="Close navigation"
              className="inline-flex h-8 w-8 items-center justify-center rounded-md text-emerald-100/70 transition-colors hover:bg-emerald-800 hover:text-white focus:outline-none focus-visible:ring-2 focus-visible:ring-amber-500 lg:hidden"
            >
              <X className="h-4 w-4" aria-hidden="true" />
            </button>
          )}
        </div>

        {/* ---------- Navigation ---------- */}
        <nav
          aria-label="Main"
          className="min-h-0 flex-1 overflow-y-auto overflow-x-hidden px-2 py-4"
        >
          <ul className="flex flex-col gap-1">
            {NAV_ITEMS.map((item) => {
              const Icon = item.icon;
              return (
                <li key={item.to}>
                  <NavLink
                    to={item.to}
                    onClick={onNavigate}
                    end={item.to === '/dashboard'}
                    className={collapsed ? navLinkClassCollapsed : navLinkClass}
                    title={collapsed ? item.label : undefined}
                    aria-label={collapsed ? item.label : undefined}
                  >
                    {({ isActive }) => (
                      <>
                        {/* Active accent rail */}
                        {isActive && (
                          <span
                            className={[
                              'absolute left-0 top-1/2 h-6 w-0.5 -translate-y-1/2 rounded-r bg-amber-500',
                              collapsed ? '-left-1' : '',
                            ].join(' ')}
                            aria-hidden="true"
                          />
                        )}
                        <Icon
                          className="h-4.5 w-4.5 flex-shrink-0"
                          style={{ width: 18, height: 18 }}
                          aria-hidden="true"
                        />
                        {!collapsed && (
                          <span className="truncate">{item.label}</span>
                        )}
                      </>
                    )}
                  </NavLink>
                </li>
              );
            })}
          </ul>
        </nav>

        {/* ---------- Footer / Logout ---------- */}
        <div className="sticky bottom-0 z-10 flex-shrink-0 border-t border-emerald-800 bg-emerald-900 p-3">
          {!collapsed && (
            <div className="mb-3 px-2 text-[10px] leading-relaxed text-emerald-100/65">
              <p className="font-semibold uppercase tracking-wider text-emerald-100/80">
                Government e-Marketplace
              </p>
              <p>Transparent · Efficient · Inclusive</p>
            </div>
          )}
          <button
            type="button"
            onClick={() => {
              /* Logout handler intentionally not implemented */
            }}
            title={collapsed ? 'Sign out' : undefined}
            aria-label={collapsed ? 'Sign out' : undefined}
            className={[
              'group flex w-full items-center gap-3 rounded-md text-sm font-medium text-emerald-100/80 transition-colors',
              'hover:bg-red-500/10 hover:text-red-200 focus:outline-none focus-visible:ring-2 focus-visible:ring-amber-500 focus-visible:ring-offset-2 focus-visible:ring-offset-emerald-900',
              collapsed
                ? 'h-10 w-10 justify-center'
                : 'px-3 py-2',
            ].join(' ')}
          >
            <LogOut
              className="flex-shrink-0"
              style={{ width: 18, height: 18 }}
              aria-hidden="true"
            />
            {!collapsed && <span className="truncate">Sign out</span>}
          </button>
          {!isMobileOpen && (
            <button
              type="button"
              onClick={onToggleCollapse}
              aria-label={collapsed ? 'Expand sidebar' : 'Collapse sidebar'}
              aria-pressed={collapsed}
              title={collapsed ? 'Expand sidebar' : 'Collapse sidebar'}
              className="mt-1 hidden h-9 w-full items-center justify-center gap-2 rounded-md text-emerald-100/70 transition-colors hover:bg-emerald-800 hover:text-white focus:outline-none focus-visible:ring-2 focus-visible:ring-amber-500 lg:flex"
            >
              {collapsed ? (
                <PanelLeftOpen className="h-4 w-4" aria-hidden="true" />
              ) : (
                <PanelLeftClose className="h-4 w-4" aria-hidden="true" />
              )}
              {!collapsed && <span className="text-xs">Collapse sidebar</span>}
            </button>
          )}
        </div>
      </aside>
    </>
  );
}