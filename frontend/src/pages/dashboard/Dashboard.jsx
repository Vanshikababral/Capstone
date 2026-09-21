import { Link } from 'react-router-dom';
import {
  FileText,
  CheckCircle2,
  XCircle,
  AlertTriangle,
  FileSearch,
  Plus,
  ArrowUpRight,
  Clock,
  ShieldAlert,
  UploadCloud,
  BarChart3,
  RefreshCw,
  Layers,
} from 'lucide-react';

/* ================================================================== */
/*  MOCK DATA — replace with Django REST responses in future step     */
/* ================================================================== */

const SUMMARY_STATS = [
  {
    id: 'total-tenders',
    label: 'Total Tenders',
    value: 1284,
    tone: 'slate',
    Icon: Layers,
    delta: '+4.2%',
    deltaDir: 'up',
    hint: 'Across all GeM categories',
  },
  {
    id: 'active-tenders',
    label: 'Active Tenders',
    value: 312,
    tone: 'slate',
    Icon: FileText,
    delta: '+2.1%',
    deltaDir: 'up',
    hint: 'Open for bid submission',
  },
  {
    id: 'total-bids',
    label: 'Total Bids',
    value: 4870,
    tone: 'slate',
    Icon: FileText,
    delta: '+8.7%',
    deltaDir: 'up',
    hint: 'Submitted this quarter',
  },
  {
    id: 'documents-processed',
    label: 'Documents Processed',
    value: 12408,
    tone: 'slate',
    Icon: FileSearch,
    delta: '+15.3%',
    deltaDir: 'up',
    hint: 'Parsed by AI engine',
  },
  {
    id: 'compliant-bids',
    label: 'Compliant Bids',
    value: 3421,
    tone: 'emerald',
    Icon: CheckCircle2,
    delta: '+6.4%',
    deltaDir: 'up',
    hint: 'Auto-cleared, no flags',
  },
  {
    id: 'non-compliant-bids',
    label: 'Non-Compliant Bids',
    value: 1189,
    tone: 'red',
    Icon: XCircle,
    delta: '-1.8%',
    deltaDir: 'down',
    hint: 'Failed mandatory clauses',
  },
  {
    id: 'requires-review',
    label: 'Requires Review',
    value: 260,
    tone: 'amber',
    Icon: AlertTriangle,
    delta: '+12',
    deltaDir: 'up',
    hint: 'Awaiting human evaluation',
  },
];

const COMPLIANCE_BREAKDOWN = {
  total: 4870,
  segments: [
    {
      key: 'compliant',
      label: 'Compliant',
      count: 3421,
      tone: 'emerald',
    },
    {
      key: 'review',
      label: 'Requires Review',
      count: 260,
      tone: 'amber',
    },
    {
      key: 'non-compliant',
      label: 'Non-Compliant',
      count: 1189,
      tone: 'red',
    },
  ],
};

const RECENT_TENDERS = [
  {
    id: 'GEM/2024/B/5521091',
    title: 'Supply of Desktop Computers & Peripherals',
    org: 'Ministry of Education',
    deadline: '2025-01-14',
    bids: 42,
    status: 'active',
  },
  {
    id: 'GEM/2024/B/5518023',
    title: 'Annual Maintenance of Network Infrastructure',
    org: 'Indian Railways — Northern Zone',
    deadline: '2025-01-09',
    bids: 18,
    status: 'review',
  },
  {
    id: 'GEM/2024/B/5509887',
    title: 'Cloud Hosting & Managed Services — 3 Year Term',
    org: 'Department of Telecommunications',
    deadline: '2024-12-28',
    bids: 27,
    status: 'closed',
  },
  {
    id: 'GEM/2024/B/5503410',
    title: 'Procurement of Medical Diagnostic Equipment',
    org: 'AIIMS — New Delhi',
    deadline: '2025-01-22',
    bids: 61,
    status: 'active',
  },
  {
    id: 'GEM/2024/B/5498612',
    title: 'Facility Management Services — Regional Offices',
    org: 'Ministry of Finance',
    deadline: '2025-01-05',
    bids: 9,
    status: 'non-compliant',
  },
];

const COMPLIANCE_ACTIVITY = [
  {
    id: 'act-1',
    type: 'parsed',
    message: 'Document parsed',
    detail: 'Technical specification PDF — 42 pages indexed',
    ref: 'GEM/2024/B/5521091',
    time: '2 minutes ago',
  },
  {
    id: 'act-2',
    type: 'flagged',
    message: 'Human review flagged',
    detail: 'GSTIN mismatch detected in vendor declaration',
    ref: 'GEM/2024/B/5518023',
    time: '18 minutes ago',
  },
  {
    id: 'act-3',
    type: 'scored',
    message: 'Compliance score calculated',
    detail: 'Score 94% — 42/45 clauses satisfied',
    ref: 'GEM/2024/B/5521091',
    time: '34 minutes ago',
  },
  {
    id: 'act-4',
    type: 'parsed',
    message: 'Document parsed',
    detail: 'Financial bid sheet (XLSX) — 3 sheets extracted',
    ref: 'GEM/2024/B/5509887',
    time: '1 hour ago',
  },
  {
    id: 'act-5',
    type: 'flagged',
    message: 'Human review flagged',
    detail: 'Turnover certificate expiry within bid validity',
    ref: 'GEM/2024/B/5498612',
    time: '2 hours ago',
  },
];

const REVIEW_QUEUE = [
  {
    id: 'RC-1042',
    tenderId: 'GEM/2024/B/5518023',
    vendor: 'Netlink Systems Pvt Ltd',
    reason: 'GSTIN mismatch on submitted declaration',
    severity: 'high',
    waiting: '2h 14m',
  },
  {
    id: 'RC-1041',
    tenderId: 'GEM/2024/B/5498612',
    vendor: 'FacilityPro Services LLP',
    reason: 'Turnover certificate expires during contract term',
    severity: 'high',
    waiting: '4h 02m',
  },
  {
    id: 'RC-1039',
    tenderId: 'GEM/2024/B/5509887',
    vendor: 'CloudMatrix India',
    reason: 'Technical clause 4.3 requires manual clarification',
    severity: 'medium',
    waiting: '9h 30m',
  },
  {
    id: 'RC-1037',
    tenderId: 'GEM/2024/B/5503410',
    vendor: 'MediTech Distributors',
    reason: 'ISO certification document illegible — OCR failed',
    severity: 'medium',
    waiting: '1d 3h',
  },
];

const QUICK_ACTIONS = [
  {
    to: '/tenders',
    label: 'Upload Tender',
    description: 'Start a new GeM tender intake',
    Icon: UploadCloud,
    tone: 'emerald',
  },
  {
    to: '/review',
    label: 'Open Review Queue',
    description: 'Process pending human reviews',
    Icon: ShieldAlert,
    tone: 'amber',
  },
  {
    to: '/reports',
    label: 'Generate Report',
    description: 'Export compliance analytics',
    Icon: BarChart3,
    tone: 'slate',
  },
  {
    to: '/compliance',
    label: 'Refresh Rules',
    description: 'Sync latest GeM clause library',
    Icon: RefreshCw,
    tone: 'slate',
  },
];

/* ================================================================== */
/*  CONFIG MAPS                                                       */
/* ================================================================== */

const TONE_ICON = {
  slate: 'bg-slate-100 text-slate-700',
  emerald: 'bg-emerald-50 text-emerald-600',
  amber: 'bg-amber-50 text-amber-600',
  red: 'bg-red-50 text-red-600',
};

const TONE_BAR = {
  emerald: 'bg-emerald-600',
  amber: 'bg-amber-500',
  red: 'bg-red-600',
  slate: 'bg-slate-400',
};

const TONE_BADGE = {
  emerald: 'bg-emerald-50 text-emerald-700 border-emerald-200',
  amber: 'bg-amber-50 text-amber-700 border-amber-200',
  red: 'bg-red-50 text-red-700 border-red-200',
  slate: 'bg-slate-100 text-slate-700 border-slate-200',
};

const TENDER_STATUS = {
  active: { label: 'Active', tone: 'emerald' },
  review: { label: 'In Review', tone: 'amber' },
  closed: { label: 'Closed', tone: 'slate' },
  'non-compliant': { label: 'Non-Compliant', tone: 'red' },
};

const ACTIVITY_TYPE = {
  parsed: { label: 'Parsed', tone: 'slate', Icon: FileSearch },
  flagged: { label: 'Flagged', tone: 'amber', Icon: ShieldAlert },
  scored: { label: 'Scored', tone: 'emerald', Icon: CheckCircle2 },
};

const SEVERITY_TONE = {
  high: 'red',
  medium: 'amber',
  low: 'slate',
};

/* ================================================================== */
/*  HELPERS                                                           */
/* ================================================================== */

const formatNumber = (value) =>
  typeof value === 'number' ? value.toLocaleString('en-IN') : String(value);

const formatDate = (iso) => {
  try {
    return new Date(iso).toLocaleDateString('en-IN', {
      day: '2-digit',
      month: 'short',
      year: 'numeric',
    });
  } catch {
    return iso;
  }
};

const cx = (...parts) => parts.filter(Boolean).join(' ');

/* ================================================================== */
/*  SUB-COMPONENTS                                                    */
/* ================================================================== */

/* ---------------- A. Page header ---------------- */
function PageHeader() {
  return (
    <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
      <div className="min-w-0">
        <p className="text-[11px] font-semibold uppercase tracking-[0.15em] text-emerald-600">
          Overview
        </p>
        <h1 className="mt-1 text-xl font-semibold tracking-tight text-slate-900 sm:text-2xl">
          Compliance Dashboard
        </h1>
        <p className="mt-1 max-w-2xl text-[13px] leading-relaxed text-slate-600">
          Real-time view of tender intake, bid verification, and AI-driven
          compliance scoring across all monitored GeM procurement activities.
        </p>
      </div>

      <Link
        to="/tenders"
        className="inline-flex h-9 flex-shrink-0 items-center gap-2 self-start rounded-md bg-emerald-600 px-3.5 text-[13px] font-semibold text-white shadow-sm transition-colors hover:bg-emerald-700 focus:outline-none focus-visible:ring-2 focus-visible:ring-emerald-600 focus-visible:ring-offset-2"
      >
        <Plus className="h-4 w-4" aria-hidden="true" />
        Create Tender
      </Link>
    </div>
  );
}

/* ---------------- B. Stat card ---------------- */
function StatCard({ stat }) {
  const { label, value, tone, Icon, delta, deltaDir, hint } = stat;
  const deltaPositive = deltaDir === 'up';
  const deltaToneClass = deltaPositive
    ? 'text-emerald-600 bg-emerald-50'
    : 'text-red-600 bg-red-50';

  return (
    <article
      aria-label={`${label}: ${formatNumber(value)}${delta ? `, ${deltaDir} ${delta}` : ''}`}
      className="relative flex flex-col overflow-hidden rounded-lg border border-slate-200 bg-white p-4 shadow-sm transition-shadow hover:shadow-md"
    >
      <div className="mb-3 flex items-start justify-between gap-3">
        <span className="text-[11.5px] font-semibold uppercase tracking-wider text-slate-500">
          {label}
        </span>
        <span
          className={cx(
            'inline-flex h-8 w-8 flex-shrink-0 items-center justify-center rounded-md',
            TONE_ICON[tone] ?? TONE_ICON.slate
          )}
          aria-hidden="true"
        >
          <Icon className="h-4 w-4" />
        </span>
      </div>

      <div className="flex items-baseline gap-2">
        <span className="text-2xl font-semibold leading-none tabular-nums tracking-tight text-slate-900">
          {formatNumber(value)}
        </span>
        {delta ? (
          <span
            className={cx(
              'inline-flex items-center gap-0.5 rounded-full px-1.5 py-0.5 text-[10.5px] font-semibold',
              deltaToneClass
            )}
          >
            <ArrowUpRight
              className={cx(
                'h-3 w-3',
                deltaPositive ? '' : 'rotate-90'
              )}
              aria-hidden="true"
            />
            {delta}
          </span>
        ) : null}
      </div>

      {hint ? (
        <p className="mt-2 truncate text-[11.5px] text-slate-500">{hint}</p>
      ) : null}
    </article>
  );
}

/* ---------------- C. Compliance overview ---------------- */
function ComplianceOverview() {
  const { total, segments } = COMPLIANCE_BREAKDOWN;

  return (
    <section
      aria-label="Compliance distribution"
      className="rounded-lg border border-slate-200 bg-white p-5 shadow-sm"
    >
      <header className="mb-5 flex items-start justify-between gap-4">
        <div>
          <h2 className="text-sm font-semibold text-slate-900">
            Compliance Distribution
          </h2>
          <p className="mt-0.5 text-[12px] text-slate-500">
            Breakdown across {formatNumber(total)} evaluated bids this quarter
          </p>
        </div>
        <span className="hidden rounded-md border border-slate-200 bg-slate-50 px-2 py-1 text-[10.5px] font-semibold uppercase tracking-wider text-slate-600 sm:inline-block">
          Last 90 days
        </span>
      </header>

      {/* Segmented progress track */}
      <div
        role="img"
        aria-label={segments
          .map((s) => `${s.label}: ${s.count} bids`)
          .join(', ')}
        className="mb-4 flex h-3 w-full overflow-hidden rounded-full bg-slate-100"
      >
        {segments.map((seg) => {
          const pct = total > 0 ? (seg.count / total) * 100 : 0;
          return (
            <span
              key={seg.key}
              style={{ width: `${pct}%` }}
              className={cx('block h-full', TONE_BAR[seg.tone])}
            />
          );
        })}
      </div>

      {/* Legend */}
      <ul className="flex flex-col gap-3">
        {segments.map((seg) => {
          const pct = total > 0 ? (seg.count / total) * 100 : 0;
          return (
            <li
              key={seg.key}
              className="flex items-center justify-between gap-3 text-[12.5px]"
            >
              <span className="flex items-center gap-2 text-slate-700">
                <span
                  className={cx(
                    'inline-block h-2.5 w-2.5 rounded-sm',
                    TONE_BAR[seg.tone]
                  )}
                  aria-hidden="true"
                />
                {seg.label}
              </span>
              <span className="flex items-center gap-3">
                <span className="tabular-nums font-medium text-slate-900">
                  {formatNumber(seg.count)}
                </span>
                <span className="w-12 text-right tabular-nums text-slate-500">
                  {pct.toFixed(1)}%
                </span>
              </span>
            </li>
          );
        })}
      </ul>
    </section>
  );
}

/* ---------------- D. Status badge ---------------- */
function StatusBadge({ tone, children }) {
  return (
    <span
      className={cx(
        'inline-flex items-center rounded-full border px-2 py-0.5 text-[10.5px] font-semibold uppercase tracking-wider',
        TONE_BADGE[tone] ?? TONE_BADGE.slate
      )}
    >
      {children}
    </span>
  );
}

/* ---------------- E. Recent tenders table ---------------- */
function RecentTenders() {
  return (
    <section
      aria-label="Recent tenders"
      className="rounded-lg border border-slate-200 bg-white shadow-sm"
    >
      <header className="flex items-start justify-between gap-4 border-b border-slate-200 p-5">
        <div>
          <h2 className="text-sm font-semibold text-slate-900">
            Recent Tenders
          </h2>
          <p className="mt-0.5 text-[12px] text-slate-500">
            Latest intake across monitored procurement organisations
          </p>
        </div>
        <Link
          to="/tenders"
          className="hidden flex-shrink-0 items-center gap-1 text-[12px] font-semibold text-emerald-600 transition-colors hover:text-emerald-700 focus:outline-none focus-visible:underline sm:inline-flex"
        >
          View all
          <ArrowUpRight className="h-3.5 w-3.5" aria-hidden="true" />
        </Link>
      </header>

      <div className="overflow-x-auto">
        <table className="w-full min-w-[760px] border-collapse text-left text-[12.5px]">
          <caption className="sr-only">
            List of recently received tenders with status and bid counts
          </caption>
          <thead>
            <tr className="border-b border-slate-200 bg-slate-50 text-[11px] font-semibold uppercase tracking-wider text-slate-500">
              <th scope="col" className="px-5 py-2.5">
                Tender ID
              </th>
              <th scope="col" className="px-5 py-2.5">
                Title
              </th>
              <th scope="col" className="px-5 py-2.5">
                Organization
              </th>
              <th scope="col" className="px-5 py-2.5">
                Deadline
              </th>
              <th scope="col" className="px-5 py-2.5 text-right">
                Bids
              </th>
              <th scope="col" className="px-5 py-2.5">
                Status
              </th>
              <th scope="col" className="px-5 py-2.5 text-right">
                Action
              </th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100">
            {RECENT_TENDERS.map((tender) => {
              const status = TENDER_STATUS[tender.status] ?? TENDER_STATUS.active;
              return (
                <tr
                  key={tender.id}
                  className="transition-colors hover:bg-slate-50/70"
                >
                  <td className="whitespace-nowrap px-5 py-3 font-mono text-[11.5px] text-slate-700">
                    {tender.id}
                  </td>
                  <td className="max-w-[280px] px-5 py-3">
                    <span className="line-clamp-1 font-medium text-slate-800">
                      {tender.title}
                    </span>
                  </td>
                  <td className="px-5 py-3 text-slate-600">{tender.org}</td>
                  <td className="whitespace-nowrap px-5 py-3 text-slate-600">
                    <span className="inline-flex items-center gap-1.5">
                      <Clock
                        className="h-3.5 w-3.5 text-slate-400"
                        aria-hidden="true"
                      />
                      {formatDate(tender.deadline)}
                    </span>
                  </td>
                  <td className="px-5 py-3 text-right tabular-nums font-medium text-slate-800">
                    {formatNumber(tender.bids)}
                  </td>
                  <td className="px-5 py-3">
                    <StatusBadge tone={status.tone}>{status.label}</StatusBadge>
                  </td>
                  <td className="whitespace-nowrap px-5 py-3 text-right">
                    <Link
                      to={`/tenders/${tender.id}`}
                      className="inline-flex items-center gap-1 text-[12px] font-semibold text-emerald-600 transition-colors hover:text-emerald-700 focus:outline-none focus-visible:underline"
                    >
                      Open
                      <ArrowUpRight className="h-3.5 w-3.5" aria-hidden="true" />
                    </Link>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>

      <footer className="flex items-center justify-between border-t border-slate-200 px-5 py-3 sm:hidden">
        <Link
          to="/tenders"
          className="inline-flex items-center gap-1 text-[12px] font-semibold text-emerald-600"
        >
          View all tenders
          <ArrowUpRight className="h-3.5 w-3.5" aria-hidden="true" />
        </Link>
      </footer>
    </section>
  );
}

/* ---------------- F. Compliance activity ---------------- */
function ComplianceActivity() {
  return (
    <section
      aria-label="Recent compliance activity"
      className="rounded-lg border border-slate-200 bg-white shadow-sm"
    >
      <header className="border-b border-slate-200 p-5">
        <h2 className="text-sm font-semibold text-slate-900">
          Compliance Activity
        </h2>
        <p className="mt-0.5 text-[12px] text-slate-500">
          AI pipeline and human review events
        </p>
      </header>

      <ol className="divide-y divide-slate-100">
        {COMPLIANCE_ACTIVITY.map((event) => {
          const meta =
            ACTIVITY_TYPE[event.type] ?? ACTIVITY_TYPE.parsed;
          const EventIcon = meta.Icon;
          return (
            <li key={event.id} className="flex items-start gap-3 p-4">
              <span
                className={cx(
                  'mt-0.5 inline-flex h-7 w-7 flex-shrink-0 items-center justify-center rounded-md',
                  TONE_ICON[meta.tone]
                )}
                aria-hidden="true"
              >
                <EventIcon className="h-3.5 w-3.5" />
              </span>

              <div className="min-w-0 flex-1">
                <div className="flex flex-wrap items-center gap-2">
                  <span className="text-[12.5px] font-semibold text-slate-800">
                    {event.message}
                  </span>
                  <StatusBadge tone={meta.tone}>{meta.label}</StatusBadge>
                </div>
                <p className="mt-1 text-[12px] leading-relaxed text-slate-600">
                  {event.detail}
                </p>
                <div className="mt-1 flex flex-wrap items-center gap-3 text-[11px] text-slate-500">
                  <span className="font-mono">{event.ref}</span>
                  <span aria-hidden="true">·</span>
                  <span>{event.time}</span>
                </div>
              </div>
            </li>
          );
        })}
      </ol>

      <footer className="border-t border-slate-200 px-5 py-3">
        <Link
          to="/compliance"
          className="inline-flex items-center gap-1 text-[12px] font-semibold text-emerald-600 transition-colors hover:text-emerald-700 focus:outline-none focus-visible:underline"
        >
          View full activity log
          <ArrowUpRight className="h-3.5 w-3.5" aria-hidden="true" />
        </Link>
      </footer>
    </section>
  );
}

/* ---------------- G. Review queue ---------------- */
function ReviewQueue() {
  return (
    <section
      aria-label="Pending review cases"
      className="rounded-lg border border-slate-200 bg-white shadow-sm"
    >
      <header className="flex items-start justify-between gap-4 border-b border-slate-200 p-5">
        <div>
          <h2 className="text-sm font-semibold text-slate-900">
            Review Queue
          </h2>
          <p className="mt-0.5 text-[12px] text-slate-500">
            High-priority cases awaiting manual evaluator action
          </p>
        </div>
        <span className="inline-flex items-center rounded-full border border-amber-200 bg-amber-50 px-2 py-0.5 text-[10.5px] font-semibold uppercase tracking-wider text-amber-700">
          {REVIEW_QUEUE.length} pending
        </span>
      </header>

      <ul className="divide-y divide-slate-100">
        {REVIEW_QUEUE.map((item) => {
          const tone = SEVERITY_TONE[item.severity] ?? 'slate';
          return (
            <li
              key={item.id}
              className="flex flex-col gap-3 p-4 sm:flex-row sm:items-center sm:justify-between"
            >
              <div className="min-w-0 flex-1">
                <div className="flex flex-wrap items-center gap-2">
                  <span className="font-mono text-[11.5px] text-slate-500">
                    {item.id}
                  </span>
                  <StatusBadge tone={tone}>
                    {item.severity === 'high'
                      ? 'High'
                      : item.severity === 'medium'
                      ? 'Medium'
                      : 'Low'}
                  </StatusBadge>
                </div>
                <p className="mt-1 text-[12.5px] font-medium text-slate-800">
                  {item.vendor}
                </p>
                <p className="mt-0.5 text-[11.5px] leading-relaxed text-slate-600">
                  {item.reason}
                </p>
                <div className="mt-1 flex flex-wrap items-center gap-3 text-[11px] text-slate-500">
                  <span className="font-mono">{item.tenderId}</span>
                  <span aria-hidden="true">·</span>
                  <span className="inline-flex items-center gap-1">
                    <Clock className="h-3 w-3" aria-hidden="true" />
                    Waiting {item.waiting}
                  </span>
                </div>
              </div>

              <Link
                to={`/review/${item.id}`}
                className="inline-flex h-8 flex-shrink-0 items-center gap-1.5 self-start rounded-md border border-slate-200 bg-white px-3 text-[12px] font-semibold text-slate-700 shadow-sm transition-colors hover:border-emerald-500 hover:text-emerald-700 focus:outline-none focus-visible:ring-2 focus-visible:ring-emerald-600 focus-visible:ring-offset-1 sm:self-center"
              >
                Review case
                <ArrowUpRight className="h-3.5 w-3.5" aria-hidden="true" />
              </Link>
            </li>
          );
        })}
      </ul>

      <footer className="border-t border-slate-200 px-5 py-3">
        <Link
          to="/review"
          className="inline-flex items-center gap-1 text-[12px] font-semibold text-emerald-600 transition-colors hover:text-emerald-700 focus:outline-none focus-visible:underline"
        >
          Open full review queue
          <ArrowUpRight className="h-3.5 w-3.5" aria-hidden="true" />
        </Link>
      </footer>
    </section>
  );
}

/* ---------------- H. Quick actions ---------------- */
function QuickActions() {
  return (
    <section
      aria-label="Quick actions"
      className="rounded-lg border border-slate-200 bg-white p-5 shadow-sm"
    >
      <header className="mb-4">
        <h2 className="text-sm font-semibold text-slate-900">Quick Actions</h2>
        <p className="mt-0.5 text-[12px] text-slate-500">
          Common workspace shortcuts
        </p>
      </header>

      <ul className="grid grid-cols-1 gap-2 sm:grid-cols-2">
        {QUICK_ACTIONS.map((action) => {
          const ActionIcon = action.Icon;
          return (
            <li key={action.to}>
              <Link
                to={action.to}
                className="group flex items-start gap-3 rounded-md border border-slate-200 bg-white p-3 transition-colors hover:border-emerald-500 hover:bg-emerald-50/40 focus:outline-none focus-visible:ring-2 focus-visible:ring-emerald-600 focus-visible:ring-offset-1"
              >
                <span
                  className={cx(
                    'inline-flex h-8 w-8 flex-shrink-0 items-center justify-center rounded-md',
                    TONE_ICON[action.tone] ?? TONE_ICON.slate
                  )}
                  aria-hidden="true"
                >
                  <ActionIcon className="h-4 w-4" />
                </span>
                <span className="flex min-w-0 flex-col">
                  <span className="flex items-center gap-1 text-[12.5px] font-semibold text-slate-800 group-hover:text-emerald-700">
                    {action.label}
                    <ArrowUpRight
                      className="h-3 w-3 text-slate-400 transition-transform group-hover:-translate-y-0.5 group-hover:translate-x-0.5 group-hover:text-emerald-600"
                      aria-hidden="true"
                    />
                  </span>
                  <span className="mt-0.5 text-[11.5px] leading-relaxed text-slate-500">
                    {action.description}
                  </span>
                </span>
              </Link>
            </li>
          );
        })}
      </ul>
    </section>
  );
}

/* ================================================================== */
/*  PAGE                                                              */
/* ================================================================== */

export default function Dashboard() {
  return (
    <div className="flex flex-col gap-6">
      {/* A. Page header */}
      <PageHeader />

      {/* B. Summary stats grid */}
      <section aria-label="Summary statistics">
        <ul className="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
          {SUMMARY_STATS.map((stat) => (
            <li key={stat.id}>
              <StatCard stat={stat} />
            </li>
          ))}
        </ul>
      </section>

      {/* C + G: two-column split — left analytics, right quick actions */}
      <div className="grid grid-cols-1 gap-4 lg:grid-cols-3">
        <div className="lg:col-span-2">
          <ComplianceOverview />
        </div>
        <div className="lg:col-span-1">
          <QuickActions />
        </div>
      </div>

      {/* D. Recent tenders */}
      <RecentTenders />

      {/* E + F: activity log + review queue side by side */}
      <div className="grid grid-cols-1 gap-4 lg:grid-cols-2">
        <ComplianceActivity />
        <ReviewQueue />
      </div>
    </div>
  );
}