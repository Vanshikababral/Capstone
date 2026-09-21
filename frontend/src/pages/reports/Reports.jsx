import { useCallback, useEffect, useMemo, useState } from 'react';
import {
  BarChart3,
  TrendingUp,
  FileText,
  CheckCircle2,
  XCircle,
  AlertTriangle,
  Download,
  RefreshCw,
  Search,
  Filter,
  Calendar,
  Building2,
  ShieldCheck,
  Clock,
  Eye,
  ArrowUpRight,
  Info,
  Layers,
} from 'lucide-react';

/* ================================================================== */
/*  MOCK DATA — analytics source of truth                             */
/* ================================================================== */

const DATE_RANGE_OPTIONS = [
  { value: '7d', label: 'Last 7 Days', multiplier: 0.25 },
  { value: '30d', label: 'Last 30 Days', multiplier: 1 },
  { value: '90d', label: 'Last 90 Days', multiplier: 2.6 },
  { value: 'year', label: 'This Year', multiplier: 8.4 },
];

const BASE_KPIS = {
  tendersMonitored: 1284,
  bidsProcessed: 4870,
  documentsEvaluated: 12408,
  complianceScore: 82,
  compliantBids: 3421,
  nonCompliantBids: 1189,
  reviewRequired: 260,
  reviewResolutionRate: 91,
};

const COMPLIANCE_DISTRIBUTION = [
  { key: 'compliant', label: 'Compliant', count: 3421, tone: 'emerald' },
  { key: 'non-compliant', label: 'Non-Compliant', count: 1189, tone: 'red' },
  { key: 'review', label: 'Requires Review', count: 260, tone: 'amber' },
];

const TREND_PERIODS = [
  { period: 'Week 1', compliant: 412, nonCompliant: 148, review: 32 },
  { period: 'Week 2', compliant: 486, nonCompliant: 172, review: 41 },
  { period: 'Week 3', compliant: 524, nonCompliant: 156, review: 38 },
  { period: 'Week 4', compliant: 601, nonCompliant: 198, review: 52 },
  { period: 'Week 5', compliant: 655, nonCompliant: 218, review: 48 },
  { period: 'Week 6', compliant: 743, nonCompliant: 297, review: 49 },
];

const CATEGORY_MATRIX = [
  {
    id: 'gst',
    name: 'GST Registration',
    checked: 4820,
    satisfied: 4188,
    failed: 342,
    review: 290,
  },
  {
    id: 'pan',
    name: 'PAN Verification',
    checked: 4870,
    satisfied: 4821,
    failed: 24,
    review: 25,
  },
  {
    id: 'msme',
    name: 'MSME / Udyam Certificate',
    checked: 2140,
    satisfied: 1845,
    failed: 142,
    review: 153,
  },
  {
    id: 'itr',
    name: 'Income Tax Return (ITR)',
    checked: 4620,
    satisfied: 3902,
    failed: 418,
    review: 300,
  },
  {
    id: 'financial',
    name: 'Financial Eligibility & Turnover',
    checked: 4210,
    satisfied: 3621,
    failed: 348,
    review: 241,
  },
  {
    id: 'technical',
    name: 'Technical & Experience Criteria',
    checked: 3980,
    satisfied: 3412,
    failed: 372,
    review: 196,
  },
  {
    id: 'integrity',
    name: 'Document Integrity & Validity',
    checked: 5110,
    satisfied: 4674,
    failed: 218,
    review: 218,
  },
];

const TENDER_PERFORMANCE = [
  {
    id: 'TNDR-2026-0142',
    title: 'Supply & Installation of Solar Micro-Grids',
    organization: 'Ministry of New & Renewable Energy',
    bids: 42,
    documents: 512,
    compliance: 88,
    flagged: 6,
    status: 'active',
  },
  {
    id: 'TNDR-2026-0138',
    title: 'Annual Maintenance of Network Infrastructure',
    organization: 'Indian Railways — Northern Zone',
    bids: 18,
    documents: 214,
    compliance: 74,
    flagged: 9,
    status: 'review',
  },
  {
    id: 'TNDR-2026-0129',
    title: 'Cloud Hosting & Managed Services — 3 Year Term',
    organization: 'Department of Telecommunications',
    bids: 27,
    documents: 388,
    compliance: 92,
    flagged: 2,
    status: 'closed',
  },
  {
    id: 'TNDR-2026-0121',
    title: 'Procurement of Medical Diagnostic Equipment',
    organization: 'AIIMS — New Delhi',
    bids: 61,
    documents: 744,
    compliance: 81,
    flagged: 12,
    status: 'active',
  },
  {
    id: 'TNDR-2026-0118',
    title: 'Facility Management Services — Regional Offices',
    organization: 'Ministry of Finance',
    bids: 9,
    documents: 96,
    compliance: 68,
    flagged: 7,
    status: 'review',
  },
  {
    id: 'TNDR-2026-0104',
    title: 'Construction of Boundary Wall & Security Post',
    organization: 'Ministry of Defence',
    bids: 34,
    documents: 402,
    compliance: 86,
    flagged: 4,
    status: 'active',
  },
  {
    id: 'TNDR-2026-0097',
    title: 'Consulting Services — Digital Transformation Roadmap',
    organization: 'NITI Aayog',
    bids: 12,
    documents: 168,
    compliance: 79,
    flagged: 5,
    status: 'completed',
  },
  {
    id: 'TNDR-2026-0088',
    title: 'Network Security Audit & Penetration Testing',
    organization: 'Ministry of Home Affairs',
    bids: 15,
    documents: 186,
    compliance: 90,
    flagged: 3,
    status: 'active',
  },
];

const REVIEW_METRICS = {
  totalFlagged: 260,
  pending: 41,
  resolved: 198,
  escalated: 21,
  avgResolutionTime: '1.4 Hours',
  highPriorityFlagged: 68,
};

const RECENT_REPORTS = [
  {
    id: 'RPT-2026-0042',
    name: 'Monthly GeM Compliance Audit — January 2026',
    generatedAt: '2026-01-09 09:15 IST',
    generatedBy: 'Ananya Sharma',
    format: 'PDF',
    size: '2.4 MB',
  },
  {
    id: 'RPT-2026-0041',
    name: 'Tender Evaluation Summary — Q3 FY25',
    generatedAt: '2026-01-08 17:42 IST',
    generatedBy: 'Rahul Verma',
    format: 'XLSX',
    size: '1.1 MB',
  },
  {
    id: 'RPT-2026-0040',
    name: 'Vendor Verification Exception Report',
    generatedAt: '2026-01-08 11:08 IST',
    generatedBy: 'Priya Mehta',
    format: 'PDF',
    size: '3.8 MB',
  },
  {
    id: 'RPT-2026-0039',
    name: 'HITL Review Turnaround — Weekly Digest',
    generatedAt: '2026-01-07 14:30 IST',
    generatedBy: 'Vikram Singh',
    format: 'PDF',
    size: '640 KB',
  },
  {
    id: 'RPT-2026-0038',
    name: 'Requirement Category Pass Rate Breakdown',
    generatedAt: '2026-01-06 10:22 IST',
    generatedBy: 'Ananya Sharma',
    format: 'XLSX',
    size: '892 KB',
  },
];

/* ================================================================== */
/*  CONFIG MAPS                                                       */
/* ================================================================== */

const TENDER_STATUS_CONFIG = {
  active: {
    label: 'Active',
    className: 'bg-emerald-50 text-emerald-700 border-emerald-200',
  },
  review: {
    label: 'Under Review',
    className: 'bg-amber-50 text-amber-700 border-amber-200',
  },
  completed: {
    label: 'Completed',
    className: 'bg-slate-100 text-slate-700 border-slate-200',
  },
  closed: {
    label: 'Closed',
    className: 'bg-slate-100 text-slate-600 border-slate-200',
  },
};

const TONE_MAP = {
  emerald: {
    bar: 'bg-emerald-600',
    softBar: 'bg-emerald-500',
    text: 'text-emerald-600',
    iconWrap: 'bg-emerald-50 text-emerald-600',
    badge: 'bg-emerald-50 text-emerald-700 border-emerald-200',
  },
  amber: {
    bar: 'bg-amber-500',
    softBar: 'bg-amber-500',
    text: 'text-amber-600',
    iconWrap: 'bg-amber-50 text-amber-600',
    badge: 'bg-amber-50 text-amber-700 border-amber-200',
  },
  red: {
    bar: 'bg-red-600',
    softBar: 'bg-red-500',
    text: 'text-red-600',
    iconWrap: 'bg-red-50 text-red-600',
    badge: 'bg-red-50 text-red-700 border-red-200',
  },
  slate: {
    bar: 'bg-slate-500',
    softBar: 'bg-slate-400',
    text: 'text-slate-700',
    iconWrap: 'bg-slate-100 text-slate-700',
    badge: 'bg-slate-100 text-slate-700 border-slate-200',
  },
};

const FORMAT_BADGE = {
  PDF: 'bg-red-50 text-red-700 border-red-200',
  XLSX: 'bg-emerald-50 text-emerald-700 border-emerald-200',
  CSV: 'bg-slate-100 text-slate-700 border-slate-200',
};

const TENDER_STATUS_TABS = [
  { id: 'all', label: 'All' },
  { id: 'active', label: 'Active' },
  { id: 'completed', label: 'Completed' },
  { id: 'review', label: 'Under Review' },
  { id: 'closed', label: 'Closed' },
];

/* ================================================================== */
/*  HELPERS                                                           */
/* ================================================================== */

const cx = (...parts) => parts.filter(Boolean).join(' ');

const formatNumber = (value) =>
  typeof value === 'number' ? value.toLocaleString('en-IN') : String(value);

const scaleMetric = (value, multiplier) => Math.round(value * multiplier);

const formatTimestampNow = () => {
  const now = new Date();
  const pad = (n) => String(n).padStart(2, '0');
  return `${now.getFullYear()}-${pad(now.getMonth() + 1)}-${pad(now.getDate())} ${pad(
    now.getHours()
  )}:${pad(now.getMinutes())} IST`;
};

/* ================================================================== */
/*  PRIMITIVES                                                        */
/* ================================================================== */

function TrendBadge({ value, direction = 'up' }) {
  if (!value) return null;
  const isUp = direction === 'up';
  return (
    <span
      className={cx(
        'inline-flex items-center gap-0.5 rounded-full px-1.5 py-0.5 text-[10.5px] font-semibold',
        isUp ? 'bg-emerald-50 text-emerald-600' : 'bg-red-50 text-red-600'
      )}
    >
      <ArrowUpRight
        className={cx('h-3 w-3', isUp ? '' : 'rotate-90')}
        aria-hidden="true"
      />
      {value}
    </span>
  );
}

function KpiCard({ label, value, Icon, tone, trend, suffix = '' }) {
  const toneConfig = TONE_MAP[tone] ?? TONE_MAP.slate;
  return (
    <article
      aria-label={`${label}: ${formatNumber(value)}${suffix}`}
      className="relative flex flex-col overflow-hidden rounded-lg border border-slate-200 bg-white p-4 shadow-sm transition-shadow hover:shadow-md"
    >
      <div className="mb-3 flex items-start justify-between gap-3">
        <span className="text-[11px] font-semibold uppercase tracking-wider text-slate-500">
          {label}
        </span>
        <span
          className={cx(
            'inline-flex h-8 w-8 flex-shrink-0 items-center justify-center rounded-md',
            toneConfig.iconWrap
          )}
          aria-hidden="true"
        >
          <Icon className="h-4 w-4" />
        </span>
      </div>

      <div className="flex items-baseline gap-2">
        <span className="text-2xl font-semibold leading-none tabular-nums tracking-tight text-slate-900">
          {formatNumber(value)}
          {suffix}
        </span>
        {trend ? <TrendBadge value={trend} /> : null}
      </div>
    </article>
  );
}

/* ================================================================== */
/*  PAGE HEADER                                                       */
/* ================================================================== */

function PageHeader({
  dateRange,
  onDateRangeChange,
  onRefresh,
  onExport,
  refreshing,
  lastUpdated,
}) {
  return (
    <div className="flex flex-col gap-4">
      <div className="flex flex-col gap-4 lg:flex-row lg:items-start lg:justify-between">
        <div className="min-w-0">
          <p className="text-[11px] font-semibold uppercase tracking-[0.15em] text-emerald-600">
            Analytics Console
          </p>
          <h1 className="mt-1 text-xl font-semibold tracking-tight text-slate-900 sm:text-2xl">
            Reports & Analytics
          </h1>
          <p className="mt-1 max-w-2xl text-[13px] leading-relaxed text-slate-600">
            Executive overview of procurement activity, verification
            performance, requirement pass rates, and review turnaround times.
          </p>
          {lastUpdated ? (
            <p className="mt-1.5 flex items-center gap-1.5 text-[11.5px] text-slate-500">
              <Clock className="h-3 w-3" aria-hidden="true" />
              Last refreshed {lastUpdated}
            </p>
          ) : null}
        </div>

        <div className="flex flex-wrap items-center gap-2">
          <div className="relative">
            <span className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-3 text-slate-400">
              <Calendar className="h-3.5 w-3.5" aria-hidden="true" />
            </span>
            <label htmlFor="date-range" className="sr-only">
              Date range
            </label>
            <select
              id="date-range"
              value={dateRange}
              onChange={(event) => onDateRangeChange(event.target.value)}
              className="h-9 cursor-pointer appearance-none rounded-md border border-slate-200 bg-white pl-9 pr-8 text-[12.5px] font-semibold text-slate-800 shadow-sm transition-colors focus:border-emerald-600 focus:outline-none focus:ring-2 focus:ring-emerald-600/20"
            >
              {DATE_RANGE_OPTIONS.map((option) => (
                <option key={option.value} value={option.value}>
                  {option.label}
                </option>
              ))}
            </select>
          </div>

          <button
            type="button"
            onClick={onRefresh}
            disabled={refreshing}
            className="inline-flex h-9 items-center gap-2 rounded-md border border-slate-200 bg-white px-3 text-[12.5px] font-semibold text-slate-700 shadow-sm transition-colors hover:bg-slate-50 focus:outline-none focus-visible:ring-2 focus-visible:ring-emerald-600 focus-visible:ring-offset-1 disabled:cursor-not-allowed disabled:opacity-60"
          >
            <RefreshCw
              className={cx('h-3.5 w-3.5', refreshing ? 'animate-spin' : '')}
              aria-hidden="true"
            />
            {refreshing ? 'Refreshing…' : 'Refresh Data'}
          </button>

          <button
            type="button"
            onClick={onExport}
            className="inline-flex h-9 items-center gap-2 rounded-md bg-emerald-600 px-3.5 text-[12.5px] font-semibold text-white shadow-sm transition-colors hover:bg-emerald-700 focus:outline-none focus-visible:ring-2 focus-visible:ring-emerald-600 focus-visible:ring-offset-2"
          >
            <Download className="h-3.5 w-3.5" aria-hidden="true" />
            Export Report
          </button>
        </div>
      </div>
    </div>
  );
}

/* ================================================================== */
/*  COMPLIANCE DISTRIBUTION                                           */
/* ================================================================== */

function ComplianceDistribution({ total, segments }) {
  return (
    <section
      aria-label="Compliance distribution"
      className="rounded-lg border border-slate-200 bg-white p-5 shadow-sm"
    >
      <header className="mb-4 flex items-start justify-between gap-4">
        <div>
          <h2 className="text-[13.5px] font-semibold text-slate-900">
            Compliance Distribution
          </h2>
          <p className="mt-0.5 text-[12px] text-slate-500">
            Bid status breakdown across {formatNumber(total)} evaluated
            submissions
          </p>
        </div>
        <span className="hidden items-center gap-1.5 rounded-full border border-amber-200 bg-amber-50 px-2 py-0.5 text-[10.5px] font-semibold uppercase tracking-wider text-amber-700 sm:inline-flex">
          <Info className="h-3 w-3" aria-hidden="true" />
          Mock Data
        </span>
      </header>

      <div
        role="img"
        aria-label={segments
          .map((s) => `${s.label}: ${formatNumber(s.count)} bids`)
          .join(', ')}
        className="mb-5 flex h-3 w-full overflow-hidden rounded-full bg-slate-100"
      >
        {segments.map((seg) => {
          const pct = total > 0 ? (seg.count / total) * 100 : 0;
          return (
            <span
              key={seg.key}
              style={{ width: `${pct}%` }}
              className={cx('block h-full', TONE_MAP[seg.tone].bar)}
            />
          );
        })}
      </div>

      <ul className="grid grid-cols-1 gap-3 sm:grid-cols-3">
        {segments.map((seg) => {
          const pct = total > 0 ? (seg.count / total) * 100 : 0;
          const toneConfig = TONE_MAP[seg.tone];
          return (
            <li
              key={seg.key}
              className="rounded-md border border-slate-200 bg-slate-50 p-3"
            >
              <div className="flex items-center gap-2">
                <span
                  className={cx('inline-block h-2.5 w-2.5 rounded-sm', toneConfig.bar)}
                  aria-hidden="true"
                />
                <span className="text-[11.5px] font-semibold text-slate-700">
                  {seg.label}
                </span>
              </div>
              <p className="mt-2 text-xl font-semibold tabular-nums tracking-tight text-slate-900">
                {formatNumber(seg.count)}
              </p>
              <p className={cx('mt-0.5 text-[11px] font-semibold', toneConfig.text)}>
                {pct.toFixed(1)}% of total
              </p>
            </li>
          );
        })}
      </ul>
    </section>
  );
}

/* ================================================================== */
/*  HISTORICAL TREND                                                  */
/* ================================================================== */

function HistoricalTrend({ periods }) {
  const totals = useMemo(
    () =>
      periods.map((p) => p.compliant + p.nonCompliant + p.review),
    [periods]
  );
  const maxTotal = Math.max(...totals, 1);

  return (
    <section
      aria-label="Historical compliance trend"
      className="rounded-lg border border-slate-200 bg-white p-5 shadow-sm"
    >
      <header className="mb-4 flex flex-wrap items-start justify-between gap-3">
        <div>
          <h2 className="text-[13.5px] font-semibold text-slate-900">
            Compliance Trend
          </h2>
          <p className="mt-0.5 text-[12px] text-slate-500">
            Periodic evaluation volume — grouped by outcome
          </p>
        </div>
        <ul className="flex flex-wrap items-center gap-3 text-[11px] font-semibold text-slate-600">
          <li className="inline-flex items-center gap-1.5">
            <span className="inline-block h-2.5 w-2.5 rounded-sm bg-emerald-500" aria-hidden="true" />
            Compliant
          </li>
          <li className="inline-flex items-center gap-1.5">
            <span className="inline-block h-2.5 w-2.5 rounded-sm bg-red-500" aria-hidden="true" />
            Non-Compliant
          </li>
          <li className="inline-flex items-center gap-1.5">
            <span className="inline-block h-2.5 w-2.5 rounded-sm bg-amber-500" aria-hidden="true" />
            Review
          </li>
        </ul>
      </header>

      <div className="overflow-x-auto">
        <div className="flex min-w-[560px] items-end gap-3">
          {periods.map((period) => {
            const total = period.compliant + period.nonCompliant + period.review;
            const totalHeightPct = (total / maxTotal) * 100;
            const compliantPct = total > 0 ? (period.compliant / total) * 100 : 0;
            const nonCompliantPct = total > 0 ? (period.nonCompliant / total) * 100 : 0;
            const reviewPct = total > 0 ? (period.review / total) * 100 : 0;

            return (
              <div
                key={period.period}
                className="flex flex-1 flex-col items-center gap-2"
                title={`${period.period} — Compliant: ${period.compliant}, Non-Compliant: ${period.nonCompliant}, Review: ${period.review}`}
              >
                <span className="text-[10.5px] font-semibold tabular-nums text-slate-500">
                  {formatNumber(total)}
                </span>
                <div
                  style={{ height: `${Math.max(totalHeightPct, 6)}%`, minHeight: 40 }}
                  className="relative flex w-full max-w-[64px] flex-col overflow-hidden rounded-md bg-slate-100"
                  role="img"
                  aria-label={`${period.period} total ${total} bids`}
                >
                  <span
                    style={{ height: `${compliantPct}%` }}
                    className="block w-full bg-emerald-500"
                  />
                  <span
                    style={{ height: `${nonCompliantPct}%` }}
                    className="block w-full bg-red-500"
                  />
                  <span
                    style={{ height: `${reviewPct}%` }}
                    className="block w-full bg-amber-500"
                  />
                </div>
                <span className="text-[11px] font-medium text-slate-600">
                  {period.period}
                </span>
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
}

/* ================================================================== */
/*  CATEGORY MATRIX                                                   */
/* ================================================================== */

function CategoryMatrix({ categories }) {
  return (
    <section
      aria-label="Compliance performance by requirement category"
      className="overflow-hidden rounded-lg border border-slate-200 bg-white shadow-sm"
    >
      <header className="border-b border-slate-200 px-5 py-4">
        <h2 className="text-[13.5px] font-semibold text-slate-900">
          Compliance by Requirement Category
        </h2>
        <p className="mt-0.5 text-[12px] text-slate-500">
          Check volume, pass rate, and review load across requirement types
        </p>
      </header>

      <div className="overflow-x-auto">
        <table className="w-full min-w-[820px] border-collapse text-left text-[12.5px]">
          <caption className="sr-only">
            Compliance check volume, pass rate, and review counts per
            requirement category
          </caption>
          <thead>
            <tr className="border-b border-slate-200 bg-slate-50 text-[11px] font-semibold uppercase tracking-wider text-slate-500">
              <th scope="col" className="px-5 py-2.5">Category</th>
              <th scope="col" className="px-5 py-2.5 text-right">Checked</th>
              <th scope="col" className="px-5 py-2.5 text-right">Satisfied</th>
              <th scope="col" className="px-5 py-2.5 text-right">Failed</th>
              <th scope="col" className="px-5 py-2.5 text-right">Review</th>
              <th scope="col" className="px-5 py-2.5 w-[200px]">Pass Rate</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100">
            {categories.map((cat) => {
              const passRate =
                cat.checked > 0 ? (cat.satisfied / cat.checked) * 100 : 0;
              const barTone =
                passRate >= 90
                  ? 'bg-emerald-500'
                  : passRate >= 75
                  ? 'bg-amber-500'
                  : 'bg-red-500';
              return (
                <tr
                  key={cat.id}
                  className="transition-colors hover:bg-slate-50/70"
                >
                  <td className="px-5 py-3">
                    <span className="inline-flex items-center gap-2 font-medium text-slate-800">
                      <Layers
                        className="h-3.5 w-3.5 flex-shrink-0 text-slate-400"
                        aria-hidden="true"
                      />
                      {cat.name}
                    </span>
                  </td>
                  <td className="px-5 py-3 text-right tabular-nums text-slate-700">
                    {formatNumber(cat.checked)}
                  </td>
                  <td className="px-5 py-3 text-right tabular-nums font-semibold text-emerald-700">
                    {formatNumber(cat.satisfied)}
                  </td>
                  <td className="px-5 py-3 text-right tabular-nums font-semibold text-red-700">
                    {formatNumber(cat.failed)}
                  </td>
                  <td className="px-5 py-3 text-right tabular-nums font-semibold text-amber-700">
                    {formatNumber(cat.review)}
                  </td>
                  <td className="px-5 py-3">
                    <div className="flex items-center gap-2">
                      <div className="h-1.5 flex-1 overflow-hidden rounded-full bg-slate-100">
                        <div
                          style={{ width: `${passRate}%` }}
                          className={cx('h-full rounded-full', barTone)}
                        />
                      </div>
                      <span className="w-12 text-right text-[11.5px] font-semibold tabular-nums text-slate-700">
                        {passRate.toFixed(1)}%
                      </span>
                    </div>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </section>
  );
}

/* ================================================================== */
/*  TENDER PERFORMANCE TABLE                                          */
/* ================================================================== */

function TenderPerformanceTable({ tenders }) {
  const [search, setSearch] = useState('');
  const [statusTab, setStatusTab] = useState('all');

  const filtered = useMemo(() => {
    const q = search.trim().toLowerCase();
    return tenders.filter((t) => {
      const matchesSearch =
        q === '' ||
        t.id.toLowerCase().includes(q) ||
        t.title.toLowerCase().includes(q) ||
        t.organization.toLowerCase().includes(q);
      const matchesStatus = statusTab === 'all' || t.status === statusTab;
      return matchesSearch && matchesStatus;
    });
  }, [tenders, search, statusTab]);

  return (
    <section
      aria-label="Tender-level performance analytics"
      className="overflow-hidden rounded-lg border border-slate-200 bg-white shadow-sm"
    >
      <header className="flex flex-col gap-3 border-b border-slate-200 p-5 lg:flex-row lg:items-center lg:justify-between">
        <div>
          <h2 className="text-[13.5px] font-semibold text-slate-900">
            Tender Performance
          </h2>
          <p className="mt-0.5 text-[12px] text-slate-500">
            Per-tender compliance score, document volume, and flagged reviews
          </p>
        </div>

        <div className="flex flex-col gap-2 sm:flex-row sm:items-center">
          <div className="relative">
            <span className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-3 text-slate-400">
              <Search className="h-3.5 w-3.5" aria-hidden="true" />
            </span>
            <label htmlFor="tender-search" className="sr-only">
              Search tenders
            </label>
            <input
              id="tender-search"
              type="search"
              value={search}
              onChange={(event) => setSearch(event.target.value)}
              placeholder="Search ID, title, or organization…"
              autoComplete="off"
              className="h-9 w-full rounded-md border border-slate-200 bg-white pl-9 pr-3 text-[12.5px] text-slate-900 placeholder:text-slate-400 transition-colors focus:border-emerald-600 focus:outline-none focus:ring-2 focus:ring-emerald-600/20 sm:w-64"
            />
          </div>
        </div>
      </header>

      {/* Status tabs */}
      <div className="flex gap-1 overflow-x-auto border-b border-slate-200 px-5 py-2">
        {TENDER_STATUS_TABS.map((tab) => {
          const isActive = tab.id === statusTab;
          const count =
            tab.id === 'all'
              ? tenders.length
              : tenders.filter((t) => t.status === tab.id).length;
          return (
            <button
              key={tab.id}
              type="button"
              onClick={() => setStatusTab(tab.id)}
              aria-pressed={isActive}
              className={cx(
                'inline-flex flex-shrink-0 items-center gap-1.5 whitespace-nowrap rounded-md px-3 py-1.5 text-[12px] font-semibold transition-colors focus:outline-none focus-visible:ring-2 focus-visible:ring-emerald-600 focus-visible:ring-offset-1',
                isActive
                  ? 'bg-slate-900 text-white'
                  : 'text-slate-600 hover:bg-slate-100 hover:text-slate-900'
              )}
            >
              <Filter className="h-3 w-3" aria-hidden="true" />
              {tab.label}
              <span
                className={cx(
                  'rounded-full px-1.5 py-0.5 text-[10px] font-semibold',
                  isActive
                    ? 'bg-white/20 text-white'
                    : 'bg-slate-100 text-slate-600'
                )}
              >
                {count}
              </span>
            </button>
          );
        })}
      </div>

      {filtered.length === 0 ? (
        <div className="flex flex-col items-center gap-2 px-6 py-12 text-center">
          <span
            className="inline-flex h-10 w-10 items-center justify-center rounded-md bg-slate-100 text-slate-500"
            aria-hidden="true"
          >
            <Search className="h-5 w-5" />
          </span>
          <p className="text-[13px] font-semibold text-slate-800">
            No tenders match your filters
          </p>
          <p className="text-[12px] text-slate-500">
            Try adjusting the search terms or status tab.
          </p>
        </div>
      ) : (
        <div className="overflow-x-auto">
          <table className="w-full min-w-[1024px] border-collapse text-left text-[12.5px]">
            <caption className="sr-only">
              Tender-level analytics with compliance score and flagged review
              counts
            </caption>
            <thead>
              <tr className="border-b border-slate-200 bg-slate-50 text-[11px] font-semibold uppercase tracking-wider text-slate-500">
                <th scope="col" className="px-5 py-2.5">Tender ID</th>
                <th scope="col" className="px-5 py-2.5">Title</th>
                <th scope="col" className="px-5 py-2.5">Organization</th>
                <th scope="col" className="px-5 py-2.5 text-right">Bids</th>
                <th scope="col" className="px-5 py-2.5 text-right">Docs</th>
                <th scope="col" className="px-5 py-2.5 w-[180px]">Compliance</th>
                <th scope="col" className="px-5 py-2.5 text-right">Flagged</th>
                <th scope="col" className="px-5 py-2.5">Status</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {filtered.map((tender) => {
                const statusConfig =
                  TENDER_STATUS_CONFIG[tender.status] ??
                  TENDER_STATUS_CONFIG.active;
                const barTone =
                  tender.compliance >= 90
                    ? 'bg-emerald-500'
                    : tender.compliance >= 75
                    ? 'bg-amber-500'
                    : 'bg-red-500';
                return (
                  <tr
                    key={tender.id}
                    className="transition-colors hover:bg-slate-50/70"
                  >
                    <td className="whitespace-nowrap px-5 py-3 font-mono text-[11.5px] font-semibold text-slate-700">
                      {tender.id}
                    </td>
                    <td className="max-w-[280px] px-5 py-3">
                      <span className="line-clamp-1 font-medium text-slate-800">
                        {tender.title}
                      </span>
                    </td>
                    <td className="max-w-[220px] px-5 py-3">
                      <span className="inline-flex items-center gap-1.5 text-slate-700">
                        <Building2
                          className="h-3.5 w-3.5 flex-shrink-0 text-slate-400"
                          aria-hidden="true"
                        />
                        <span className="line-clamp-1">
                          {tender.organization}
                        </span>
                      </span>
                    </td>
                    <td className="px-5 py-3 text-right tabular-nums font-medium text-slate-800">
                      {formatNumber(tender.bids)}
                    </td>
                    <td className="px-5 py-3 text-right tabular-nums text-slate-600">
                      {formatNumber(tender.documents)}
                    </td>
                    <td className="px-5 py-3">
                      <div className="flex items-center gap-2">
                        <div className="h-1.5 flex-1 overflow-hidden rounded-full bg-slate-100">
                          <div
                            style={{ width: `${tender.compliance}%` }}
                            className={cx('h-full rounded-full', barTone)}
                          />
                        </div>
                        <span className="w-9 text-right text-[11.5px] font-semibold tabular-nums text-slate-700">
                          {tender.compliance}%
                        </span>
                      </div>
                    </td>
                    <td className="px-5 py-3 text-right tabular-nums font-semibold text-amber-700">
                      {formatNumber(tender.flagged)}
                    </td>
                    <td className="whitespace-nowrap px-5 py-3">
                      <span
                        className={cx(
                          'inline-flex items-center rounded-full border px-2 py-0.5 text-[10.5px] font-semibold uppercase tracking-wider',
                          statusConfig.className
                        )}
                      >
                        {statusConfig.label}
                      </span>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      )}
    </section>
  );
}

/* ================================================================== */
/*  REVIEW METRICS                                                    */
/* ================================================================== */

function ReviewMetrics({ metrics }) {
  const cards = [
    {
      id: 'total',
      label: 'Total Flagged',
      value: metrics.totalFlagged,
      Icon: AlertTriangle,
      tone: 'slate',
    },
    {
      id: 'pending',
      label: 'Pending Reviews',
      value: metrics.pending,
      Icon: Clock,
      tone: 'amber',
    },
    {
      id: 'resolved',
      label: 'Resolved',
      value: metrics.resolved,
      Icon: CheckCircle2,
      tone: 'emerald',
    },
    {
      id: 'escalated',
      label: 'Escalated',
      value: metrics.escalated,
      Icon: XCircle,
      tone: 'red',
    },
    {
      id: 'highPriority',
      label: 'High Priority',
      value: metrics.highPriorityFlagged,
      Icon: ShieldCheck,
      tone: 'red',
    },
  ];

  return (
    <section
      aria-label="Human review and risk resolution metrics"
      className="rounded-lg border border-slate-200 bg-white p-5 shadow-sm"
    >
      <header className="mb-4 flex flex-wrap items-start justify-between gap-3">
        <div>
          <h2 className="text-[13.5px] font-semibold text-slate-900">
            Human Review & Risk Resolution
          </h2>
          <p className="mt-0.5 text-[12px] text-slate-500">
            Human-in-the-loop adjudication metrics across the review queue
          </p>
        </div>
        <div className="inline-flex items-center gap-2 rounded-md border border-emerald-200 bg-emerald-50 px-3 py-1.5">
          <Clock className="h-3.5 w-3.5 text-emerald-600" aria-hidden="true" />
          <span className="text-[11px] font-semibold uppercase tracking-wider text-emerald-700">
            Avg Resolution
          </span>
          <span className="text-[13px] font-semibold text-emerald-700">
            {metrics.avgResolutionTime}
          </span>
        </div>
      </header>

      <ul className="grid grid-cols-2 gap-3 lg:grid-cols-5">
        {cards.map((card) => {
          const CardIcon = card.Icon;
          const toneConfig = TONE_MAP[card.tone];
          return (
            <li
              key={card.id}
              className="rounded-md border border-slate-200 bg-slate-50 p-3"
            >
              <div className="flex items-center justify-between gap-2">
                <span className="text-[10.5px] font-semibold uppercase tracking-wider text-slate-500">
                  {card.label}
                </span>
                <span
                  className={cx(
                    'inline-flex h-6 w-6 flex-shrink-0 items-center justify-center rounded-md',
                    toneConfig.iconWrap
                  )}
                  aria-hidden="true"
                >
                  <CardIcon className="h-3 w-3" />
                </span>
              </div>
              <p className="mt-1.5 text-xl font-semibold tabular-nums tracking-tight text-slate-900">
                {formatNumber(card.value)}
              </p>
            </li>
          );
        })}
      </ul>
    </section>
  );
}

/* ================================================================== */
/*  RECENT REPORTS LOG                                                */
/* ================================================================== */

function RecentReportsLog({ reports, onAction }) {
  return (
    <section
      aria-label="Recently generated reports"
      className="overflow-hidden rounded-lg border border-slate-200 bg-white shadow-sm"
    >
      <header className="flex flex-wrap items-start justify-between gap-3 border-b border-slate-200 px-5 py-4">
        <div>
          <h2 className="text-[13.5px] font-semibold text-slate-900">
            Recently Generated Reports
          </h2>
          <p className="mt-0.5 text-[12px] text-slate-500">
            Auditable compliance exports ready for download
          </p>
        </div>
        <span className="inline-flex items-center gap-1 rounded-full border border-slate-200 bg-slate-50 px-2 py-0.5 text-[10px] font-semibold uppercase tracking-wider text-slate-600">
          <FileText className="h-3 w-3" aria-hidden="true" />
          {reports.length} files
        </span>
      </header>

      <ul className="divide-y divide-slate-100">
        {reports.map((report) => {
          const formatClass = FORMAT_BADGE[report.format] ?? FORMAT_BADGE.CSV;
          return (
            <li
              key={report.id}
              className="flex flex-col gap-3 p-4 sm:flex-row sm:items-center sm:justify-between sm:px-5"
            >
              <div className="flex min-w-0 items-start gap-3">
                <span
                  className="inline-flex h-9 w-9 flex-shrink-0 items-center justify-center rounded-md bg-slate-100 text-slate-600"
                  aria-hidden="true"
                >
                  <FileText className="h-4 w-4" />
                </span>
                <div className="min-w-0">
                  <p className="truncate text-[13px] font-semibold text-slate-800">
                    {report.name}
                  </p>
                  <div className="mt-0.5 flex flex-wrap items-center gap-x-3 gap-y-1 text-[11px] text-slate-500">
                    <span className="font-mono">{report.id}</span>
                    <span aria-hidden="true">·</span>
                    <span>{report.generatedAt}</span>
                    <span aria-hidden="true">·</span>
                    <span>By {report.generatedBy}</span>
                    <span aria-hidden="true">·</span>
                    <span>{report.size}</span>
                  </div>
                </div>
              </div>

              <div className="flex flex-shrink-0 items-center gap-2">
                <span
                  className={cx(
                    'inline-flex items-center rounded border px-2 py-0.5 text-[10.5px] font-semibold uppercase tracking-wider',
                    formatClass
                  )}
                >
                  {report.format}
                </span>
                <button
                  type="button"
                  onClick={() => onAction(`Previewing ${report.name}`)}
                  aria-label={`View ${report.name}`}
                  className="inline-flex h-8 w-8 items-center justify-center rounded-md border border-slate-200 bg-white text-slate-600 transition-colors hover:bg-slate-50 focus:outline-none focus-visible:ring-2 focus-visible:ring-emerald-600 focus-visible:ring-offset-1"
                >
                  <Eye className="h-3.5 w-3.5" aria-hidden="true" />
                </button>
                <button
                  type="button"
                  onClick={() => onAction(`Downloading ${report.name}`)}
                  aria-label={`Download ${report.name}`}
                  className="inline-flex h-8 items-center gap-1.5 rounded-md border border-slate-200 bg-white px-2.5 text-[12px] font-semibold text-slate-700 transition-colors hover:bg-slate-50 focus:outline-none focus-visible:ring-2 focus-visible:ring-emerald-600 focus-visible:ring-offset-1"
                >
                  <Download className="h-3.5 w-3.5" aria-hidden="true" />
                  Download
                </button>
              </div>
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

export default function Reports() {
  const [dateRange, setDateRange] = useState('30d');
  const [refreshing, setRefreshing] = useState(false);
  const [lastUpdated, setLastUpdated] = useState(null);
  const [toast, setToast] = useState(null);

  /* Toast auto-dismiss */
  useEffect(() => {
    if (!toast) return;
    const timeout = setTimeout(() => setToast(null), 2800);
    return () => clearTimeout(timeout);
  }, [toast]);

  /* Date-range multiplier drives KPI scaling */
  const multiplier = useMemo(() => {
    const option = DATE_RANGE_OPTIONS.find((o) => o.value === dateRange);
    return option?.multiplier ?? 1;
  }, [dateRange]);

  /* ---------------- Derived KPIs ---------------- */
  const kpis = useMemo(() => {
    const scaled = {
      tendersMonitored: scaleMetric(BASE_KPIS.tendersMonitored, multiplier),
      bidsProcessed: scaleMetric(BASE_KPIS.bidsProcessed, multiplier),
      documentsEvaluated: scaleMetric(
        BASE_KPIS.documentsEvaluated,
        multiplier
      ),
      complianceScore: BASE_KPIS.complianceScore,
      compliantBids: scaleMetric(BASE_KPIS.compliantBids, multiplier),
      nonCompliantBids: scaleMetric(
        BASE_KPIS.nonCompliantBids,
        multiplier
      ),
      reviewRequired: scaleMetric(BASE_KPIS.reviewRequired, multiplier),
      reviewResolutionRate: BASE_KPIS.reviewResolutionRate,
    };

    return [
      {
        id: 'tenders',
        label: 'Tenders Monitored',
        value: scaled.tendersMonitored,
        Icon: FileText,
        tone: 'slate',
        trend: '+4.2%',
      },
      {
        id: 'bids',
        label: 'Bids Processed',
        value: scaled.bidsProcessed,
        Icon: Layers,
        tone: 'slate',
        trend: '+8.7%',
      },
      {
        id: 'documents',
        label: 'Documents Evaluated',
        value: scaled.documentsEvaluated,
        Icon: FileText,
        tone: 'slate',
        trend: '+15.3%',
      },
      {
        id: 'score',
        label: 'Overall Compliance Score',
        value: scaled.complianceScore,
        Icon: ShieldCheck,
        tone: 'emerald',
        trend: '+2.1%',
        suffix: '%',
      },
      {
        id: 'compliant',
        label: 'Compliant Bids',
        value: scaled.compliantBids,
        Icon: CheckCircle2,
        tone: 'emerald',
        trend: '+6.4%',
      },
      {
        id: 'nonCompliant',
        label: 'Non-Compliant Bids',
        value: scaled.nonCompliantBids,
        Icon: XCircle,
        tone: 'red',
        trend: '-1.8%',
      },
      {
        id: 'review',
        label: 'Review Required',
        value: scaled.reviewRequired,
        Icon: AlertTriangle,
        tone: 'amber',
        trend: '+12',
      },
      {
        id: 'resolution',
        label: 'Review Resolution Rate',
        value: scaled.reviewResolutionRate,
        Icon: TrendingUp,
        tone: 'emerald',
        trend: '+3.2%',
        suffix: '%',
      },
    ];
  }, [multiplier]);

  /* ---------------- Compliance distribution ---------------- */
  const distribution = useMemo(() => {
    const segments = COMPLIANCE_DISTRIBUTION.map((seg) => ({
      ...seg,
      count: scaleMetric(seg.count, multiplier),
    }));
    const total = segments.reduce((sum, s) => sum + s.count, 0);
    return { total, segments };
  }, [multiplier]);

  /* ---------------- Trend periods scaled ---------------- */
  const trendPeriods = useMemo(
    () =>
      TREND_PERIODS.map((p) => ({
        period: p.period,
        compliant: scaleMetric(p.compliant, multiplier),
        nonCompliant: scaleMetric(p.nonCompliant, multiplier),
        review: scaleMetric(p.review, multiplier),
      })),
    [multiplier]
  );

  /* ---------------- Category matrix scaled ---------------- */
  const categoryMatrix = useMemo(
    () =>
      CATEGORY_MATRIX.map((c) => ({
        ...c,
        checked: scaleMetric(c.checked, multiplier),
        satisfied: scaleMetric(c.satisfied, multiplier),
        failed: scaleMetric(c.failed, multiplier),
        review: scaleMetric(c.review, multiplier),
      })),
    [multiplier]
  );

  /* ---------------- Handlers ---------------- */
  const handleRefresh = useCallback(async () => {
    setRefreshing(true);
    await new Promise((resolve) => setTimeout(resolve, 800));
    setRefreshing(false);
    setLastUpdated(formatTimestampNow());
    setToast({ type: 'success', message: 'Analytics data refreshed.' });
  }, []);

  const handleExport = useCallback(() => {
    setToast({
      type: 'success',
      message: 'Export queued. Download will begin shortly.',
    });
  }, []);

  const handleReportAction = useCallback((message) => {
    setToast({ type: 'success', message });
  }, []);

  return (
    <div className="flex flex-col gap-5">
      {/* Toast */}
      {toast ? (
        <div
          role="status"
          aria-live="polite"
          className="fixed bottom-5 right-5 z-50 flex max-w-sm items-start gap-2.5 rounded-md border border-emerald-200 bg-emerald-50 px-3 py-2.5 text-[12.5px] text-emerald-700 shadow-lg"
        >
          <CheckCircle2
            className="mt-0.5 h-4 w-4 flex-shrink-0"
            aria-hidden="true"
          />
          <span>{toast.message}</span>
        </div>
      ) : null}

      {/* Header */}
      <PageHeader
        dateRange={dateRange}
        onDateRangeChange={setDateRange}
        onRefresh={handleRefresh}
        onExport={handleExport}
        refreshing={refreshing}
        lastUpdated={lastUpdated}
      />

      {/* KPI grid */}
      <section aria-label="Key performance indicators">
        <ul className="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-4">
          {kpis.map((kpi) => (
            <li key={kpi.id}>
              <KpiCard
                label={kpi.label}
                value={kpi.value}
                Icon={kpi.Icon}
                tone={kpi.tone}
                trend={kpi.trend}
                suffix={kpi.suffix}
              />
            </li>
          ))}
        </ul>
      </section>

      {/* Distribution + trend side by side */}
      <div className="grid grid-cols-1 gap-4 lg:grid-cols-2">
        <ComplianceDistribution
          total={distribution.total}
          segments={distribution.segments}
        />
        <HistoricalTrend periods={trendPeriods} />
      </div>

      {/* Category matrix */}
      <CategoryMatrix categories={categoryMatrix} />

      {/* Tender performance */}
      <TenderPerformanceTable tenders={TENDER_PERFORMANCE} />

      {/* Review metrics */}
      <ReviewMetrics metrics={REVIEW_METRICS} />

      {/* Recent reports log */}
      <RecentReportsLog
        reports={RECENT_REPORTS}
        onAction={handleReportAction}
      />

      {/* Prototype disclaimer */}
      <p className="flex items-start gap-1.5 rounded-md border border-slate-200 bg-slate-50 p-3 text-[11px] leading-relaxed text-slate-500">
        <Info className="mt-0.5 h-3 w-3 flex-shrink-0" aria-hidden="true" />
        All compliance metrics, risk scores, and trend figures shown above are
        mock/prototype verification data generated for demonstration purposes.
        They are decision-support analytics and do not constitute official GeM
        scoring or legally binding determinations.
      </p>
    </div>
  );
}