export const ROLE_HOME = {
  ADMIN: '/dashboard',
  TENDER_MANAGER: '/tenders',
  BIDDER: '/bids',
  REVIEWER: '/review',
};

export const ROLE_NAVIGATION = {
  ADMIN: [
    { to: '/dashboard', label: 'Dashboard', icon: 'dashboard' },
    { to: '/admin/role-requests', label: 'Role Requests', icon: 'review' },
    { to: '/tenders', label: 'Tenders', icon: 'tenders' },
    { to: '/bids', label: 'Bids', icon: 'bids' },
    { to: '/compliance', label: 'Compliance', icon: 'compliance' },
    { to: '/review', label: 'Review Cases', icon: 'review' },
    { to: '/reports', label: 'Reports', icon: 'reports' },
  ],
  TENDER_MANAGER: [
    { to: '/tenders', label: 'Tenders', icon: 'tenders' },
    { to: '/bids', label: 'Bids', icon: 'bids' },
    { to: '/compliance', label: 'Compliance', icon: 'compliance' },
    { to: '/reports', label: 'Reports', icon: 'reports' },
  ],
  BIDDER: [
    { to: '/tenders', label: 'Browse Tenders', icon: 'tenders' },
    { to: '/bids', label: 'My Bids', icon: 'bids' },
    { to: '/compliance', label: 'My Compliance', icon: 'compliance' },
    { to: '/reports', label: 'My Reports', icon: 'reports' },
  ],
  REVIEWER: [
    { to: '/tenders', label: 'Tenders', icon: 'tenders' },
    { to: '/bids', label: 'Bids', icon: 'bids' },
    { to: '/compliance', label: 'Compliance', icon: 'compliance' },
    { to: '/review', label: 'Review Cases', icon: 'review' },
    { to: '/reports', label: 'Reports', icon: 'reports' },
  ],
};

export const ROLE_PERMISSIONS = {
  dashboard: ['ADMIN'],
  roleRequests: ['ADMIN'],
  tenders: ['ADMIN', 'TENDER_MANAGER', 'BIDDER', 'REVIEWER'],
  createTender: ['ADMIN', 'TENDER_MANAGER'],
  bids: ['ADMIN', 'TENDER_MANAGER', 'BIDDER', 'REVIEWER'],
  compliance: ['ADMIN', 'TENDER_MANAGER', 'BIDDER', 'REVIEWER'],
  reviews: ['ADMIN', 'REVIEWER'],
  reports: ['ADMIN', 'TENDER_MANAGER', 'BIDDER', 'REVIEWER'],
};
