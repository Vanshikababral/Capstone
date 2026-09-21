import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { Link } from 'react-router-dom';
import {
  FileText,
  Plus,
  Search,
  Filter,
  Download,
  Eye,
  CheckCircle2,
  Clock,
  AlertCircle,
  MoreVertical,
  Building2,
  ChevronLeft,
  ChevronRight,
  X,
  Sparkles,
} from 'lucide-react';

/* ================================================================== */
/*  MOCK DATA — replace with Django REST responses in future step     */
/* ================================================================== */

const TENDER_CATEGORIES = [
  { value: 'all', label: 'All Categories' },
  { value: 'it-hardware', label: 'IT Hardware' },
  { value: 'it-services', label: 'IT Services' },
  { value: 'medical', label: 'Medical Equipment' },
  { value: 'facility', label: 'Facility Management' },
  { value: 'civil', label: 'Civil Works' },
  { value: 'consulting', label: 'Consulting Services' },
];

const STATUS_OPTIONS = [
  { value: 'all', label: 'All Status' },
  { value: 'draft', label: 'Draft' },
  { value: 'active', label: 'Active' },
  { value: 'review', label: 'Under Review' },
  { value: 'closed', label: 'Closed' },
];

const MOCK_TENDERS = [
  {
    id: 'GEM/2024/B/5521091',
    title: 'Supply of Desktop Computers & Peripherals',
    category: 'it-hardware',
    categoryLabel: 'IT Hardware',
    agency: 'Ministry of Education',
    deadline: '2025-01-14',
    bids: 42,
    extraction: 'extracted',
    status: 'active',
    estimatedValue: '₹ 2.4 Cr',
    eligibility: [
      'Minimum 3 years of experience in supplying IT hardware to government bodies',
      'Annual turnover of at least ₹ 5 Cr in the last 3 financial years',
      'ISO 9001:2015 certification mandatory',
      'Authorised dealer / OEM partnership letter required',
    ],
    documents: [
      { name: 'GST Registration Certificate', mandatory: true },
      { name: 'PAN Card', mandatory: true },
      { name: 'ISO 9001:2015 Certificate', mandatory: true },
      { name: 'OEM Authorisation Letter', mandatory: true },
      { name: 'Last 3 Years Audited Financials', mandatory: true },
      { name: 'MSME Certificate', mandatory: false },
    ],
  },
  {
    id: 'GEM/2024/B/5518023',
    title: 'Annual Maintenance of Network Infrastructure',
    category: 'it-services',
    categoryLabel: 'IT Services',
    agency: 'Indian Railways — Northern Zone',
    deadline: '2025-01-09',
    bids: 18,
    extraction: 'extracted',
    status: 'review',
    estimatedValue: '₹ 88 L',
    eligibility: [
      'Registered service provider with minimum 5 years of AMC experience',
      'Certified engineers on payroll (CCNA / CCNP minimum)',
      'Local presence in the Northern Zone required',
    ],
    documents: [
      { name: 'GST Registration Certificate', mandatory: true },
      { name: 'Service Tax / GST Returns (last 4 quarters)', mandatory: true },
      { name: 'Engineer Certification Proofs', mandatory: true },
      { name: 'Local Office Address Proof', mandatory: true },
    ],
  },
  {
    id: 'GEM/2024/B/5509887',
    title: 'Cloud Hosting & Managed Services — 3 Year Term',
    category: 'it-services',
    categoryLabel: 'IT Services',
    agency: 'Department of Telecommunications',
    deadline: '2024-12-28',
    bids: 27,
    extraction: 'extracted',
    status: 'closed',
    estimatedValue: '₹ 12.6 Cr',
    eligibility: [
      'MeitY-empanelled cloud service provider',
      'ISO 27001 certification mandatory',
      'Data residency within India (as per DPDP Act 2023)',
    ],
    documents: [
      { name: 'MeitY Empanelment Certificate', mandatory: true },
      { name: 'ISO 27001 Certificate', mandatory: true },
      { name: 'Data Centre Compliance Declaration', mandatory: true },
    ],
  },
  {
    id: 'GEM/2024/B/5503410',
    title: 'Procurement of Medical Diagnostic Equipment',
    category: 'medical',
    categoryLabel: 'Medical Equipment',
    agency: 'AIIMS — New Delhi',
    deadline: '2025-01-22',
    bids: 61,
    extraction: 'pending',
    status: 'active',
    estimatedValue: '₹ 4.8 Cr',
    eligibility: [
      'CDSCO registration mandatory for all equipment',
      'Minimum 2 installations in government hospitals in last 3 years',
      'On-site service support within 24 hours',
    ],
    documents: [
      { name: 'CDSCO Registration Certificate', mandatory: true },
      { name: 'Installation Track Record', mandatory: true },
      { name: 'Service SLA Undertaking', mandatory: true },
      { name: 'Product Catalogue', mandatory: false },
    ],
  },
  {
    id: 'GEM/2024/B/5498612',
    title: 'Facility Management Services — Regional Offices',
    category: 'facility',
    categoryLabel: 'Facility Management',
    agency: 'Ministry of Finance',
    deadline: '2025-01-05',
    bids: 9,
    extraction: 'failed',
    status: 'draft',
    estimatedValue: '₹ 1.2 Cr',
    eligibility: [
      'Minimum 3 years of facility management experience',
      'EPF and ESI registration mandatory',
    ],
    documents: [
      { name: 'EPF Registration', mandatory: true },
      { name: 'ESI Registration', mandatory: true },
      { name: 'Labour License', mandatory: true },
    ],
  },
  {
    id: 'GEM/2024/B/5491023',
    title: 'Construction of Boundary Wall & Security Post',
    category: 'civil',
    categoryLabel: 'Civil Works',
    agency: 'Ministry of Defence',
    deadline: '2025-02-03',
    bids: 34,
    extraction: 'extracted',
    status: 'active',
    estimatedValue: '₹ 3.1 Cr',
    eligibility: [
      'CPWD Class A contractor registration',
      'Minimum 2 similar works of ₹ 2 Cr each in last 5 years',
      'Solvency certificate of ₹ 1 Cr',
    ],
    documents: [
      { name: 'CPWD Registration Certificate', mandatory: true },
      { name: 'Work Completion Certificates', mandatory: true },
      { name: 'Solvency Certificate', mandatory: true },
      { name: 'GST Registration Certificate', mandatory: true },
    ],
  },
  {
    id: 'GEM/2024/B/5487234',
    title: 'Consulting Services — Digital Transformation Roadmap',
    category: 'consulting',
    categoryLabel: 'Consulting Services',
    agency: 'NITI Aayog',
    deadline: '2025-01-18',
    bids: 12,
    extraction: 'extracted',
    status: 'review',
    estimatedValue: '₹ 76 L',
    eligibility: [
      'Big-4 or equivalent consulting firm',
      'Minimum 5 similar engagements with central government',
      'Dedicated team of at least 6 consultants',
    ],
    documents: [
      { name: 'Firm Registration Certificate', mandatory: true },
      { name: 'Project References', mandatory: true },
      { name: 'Team CVs', mandatory: true },
    ],
  },
  {
    id: 'GEM/2024/B/5480912',
    title: 'Supply of Laboratory Reagents — Annual Contract',
    category: 'medical',
    categoryLabel: 'Medical Equipment',
    agency: 'ICMR — Regional Centre',
    deadline: '2024-12-30',
    bids: 22,
    extraction: 'pending',
    status: 'closed',
    estimatedValue: '₹ 42 L',
    eligibility: [
      'Drug License for reagent distribution',
      'Cold chain logistics capability',
    ],
    documents: [
      { name: 'Drug License', mandatory: true },
      { name: 'Cold Chain SOP', mandatory: true },
    ],
  },
  {
    id: 'GEM/2024/B/5475541',
    title: 'Network Security Audit & Penetration Testing',
    category: 'it-services',
    categoryLabel: 'IT Services',
    agency: 'Ministry of Home Affairs',
    deadline: '2025-01-27',
    bids: 15,
    extraction: 'extracted',
    status: 'active',
    estimatedValue: '₹ 65 L',
    eligibility: [
      'CERT-In empanelled auditor',
      'Minimum 10 similar audits in last 3 years',
      'Team lead must hold OSCP or equivalent certification',
    ],
    documents: [
      { name: 'CERT-In Empanelment Certificate', mandatory: true },
      { name: 'Audit References', mandatory: true },
      { name: 'Team Certifications', mandatory: true },
    ],
  },
  {
    id: 'GEM/2024/B/5471122',
    title: 'Printing & Distribution of Training Manuals',
    category: 'facility',
    categoryLabel: 'Facility Management',
    agency: 'Department of Personnel & Training',
    deadline: '2025-01-11',
    bids: 7,
    extraction: 'extracted',
    status: 'draft',
    estimatedValue: '₹ 18 L',
    eligibility: [
      'Minimum 3 years of printing experience',
      'In-house offset printing capability',
    ],
    documents: [
      { name: 'GST Registration Certificate', mandatory: true },
      { name: 'Printing Facility Proof', mandatory: true },
    ],
  },
  {
    id: 'GEM/2024/B/5468890',
    title: 'Solar Panel Installation — Government Schools',
    category: 'civil',
    categoryLabel: 'Civil Works',
    agency: 'Ministry of New & Renewable Energy',
    deadline: '2025-02-15',
    bids: 0,
    extraction: 'pending',
    status: 'draft',
    estimatedValue: '₹ 6.2 Cr',
    eligibility: [
      'MNRE approved channel partner',
      'Minimum 5 MW cumulative installation experience',
    ],
    documents: [
      { name: 'MNRE Approval Certificate', mandatory: true },
      { name: 'Installation Track Record', mandatory: true },
    ],
  },
  {
    id: 'GEM/2024/B/5462011',
    title: 'Managed Print Services — 5 Year Contract',
    category: 'it-services',
    categoryLabel: 'IT Services',
    agency: 'Ministry of External Affairs',
    deadline: '2025-01-08',
    bids: 26,
    extraction: 'extracted',
    status: 'active',
    estimatedValue: '₹ 2.9 Cr',
    eligibility: [
      'OEM or authorised partner for managed print',
      'Pan-India service presence',
      'Minimum 3 government contracts of similar scope',
    ],
    documents: [
      { name: 'OEM Authorisation Letter', mandatory: true },
      { name: 'Service Network Declaration', mandatory: true },
      { name: 'Reference Contracts', mandatory: true },
    ],
  },
];

/* ================================================================== */
/*  CONFIG MAPS                                                       */
/* ================================================================== */

const STATUS_CONFIG = {
  draft: {
    label: 'Draft',
    tone: 'slate',
    className: 'bg-slate-100 text-slate-700 border-slate-200',
  },
  active: {
    label: 'Active',
    tone: 'emerald',
    className: 'bg-emerald-50 text-emerald-700 border-emerald-200',
  },
  review: {
    label: 'Under Review',
    tone: 'amber',
    className: 'bg-amber-50 text-amber-700 border-amber-200',
  },
  closed: {
    label: 'Closed',
    tone: 'slate',
    className: 'bg-slate-100 text-slate-600 border-slate-200',
  },
};

const EXTRACTION_CONFIG = {
  extracted: {
    label: 'Extracted',
    className: 'text-emerald-600',
    Icon: CheckCircle2,
  },
  pending: {
    label: 'Pending',
    className: 'text-amber-600',
    Icon: Clock,
  },
  failed: {
    label: 'Failed',
    className: 'text-red-600',
    Icon: AlertCircle,
  },
};

/* ================================================================== */
/*  HELPERS                                                           */
/* ================================================================== */

const cx = (...parts) => parts.filter(Boolean).join(' ');

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

/* ================================================================== */
/*  SUB-COMPONENTS                                                    */
/* ================================================================== */

/* ---------------- A. Page header ---------------- */
function PageHeader({ onCreate }) {
  return (
    <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
      <div className="min-w-0">
        <p className="text-[11px] font-semibold uppercase tracking-[0.15em] text-emerald-600">
          Procurement
        </p>
        <h1 className="mt-1 text-xl font-semibold tracking-tight text-slate-900 sm:text-2xl">
          Tender Management
        </h1>
        <p className="mt-1 max-w-2xl text-[13px] leading-relaxed text-slate-600">
          Central registry of all monitored GeM tenders — track bid intake,
          requirement extraction, and downstream compliance verification.
        </p>
      </div>

      <div className="flex flex-shrink-0 flex-wrap items-center gap-2">
        <button
          type="button"
          onClick={() => {
            /* Export handler intentionally not implemented — placeholder for CSV/PDF export */
          }}
          className="inline-flex h-9 items-center gap-2 rounded-md border border-slate-200 bg-white px-3 text-[13px] font-semibold text-slate-700 shadow-sm transition-colors hover:bg-slate-50 focus:outline-none focus-visible:ring-2 focus-visible:ring-emerald-600 focus-visible:ring-offset-1"
        >
          <Download className="h-4 w-4" aria-hidden="true" />
          Export
        </button>
        <button
          type="button"
          onClick={onCreate}
          className="inline-flex h-9 items-center gap-2 rounded-md bg-emerald-600 px-3.5 text-[13px] font-semibold text-white shadow-sm transition-colors hover:bg-emerald-700 focus:outline-none focus-visible:ring-2 focus-visible:ring-emerald-600 focus-visible:ring-offset-2"
        >
          <Plus className="h-4 w-4" aria-hidden="true" />
          Create New Tender
        </button>
      </div>
    </div>
  );
}

/* ---------------- B. Metric summary bar ---------------- */
function MetricBar({ metrics }) {
  return (
    <section aria-label="Tender summary metrics">
      <ul className="grid grid-cols-2 gap-3 lg:grid-cols-4">
        {metrics.map((metric) => {
          const MetricIcon = metric.Icon;
          return (
            <li
              key={metric.id}
              className="rounded-lg border border-slate-200 bg-white p-3.5 shadow-sm"
            >
              <div className="flex items-center justify-between gap-2">
                <span className="text-[11px] font-semibold uppercase tracking-wider text-slate-500">
                  {metric.label}
                </span>
                <span
                  className={cx(
                    'inline-flex h-7 w-7 flex-shrink-0 items-center justify-center rounded-md',
                    metric.tone === 'emerald'
                      ? 'bg-emerald-50 text-emerald-600'
                      : metric.tone === 'amber'
                      ? 'bg-amber-50 text-amber-600'
                      : metric.tone === 'red'
                      ? 'bg-red-50 text-red-600'
                      : 'bg-slate-100 text-slate-700'
                  )}
                  aria-hidden="true"
                >
                  <MetricIcon className="h-3.5 w-3.5" />
                </span>
              </div>
              <p className="mt-2 text-xl font-semibold tabular-nums tracking-tight text-slate-900">
                {formatNumber(metric.value)}
              </p>
              {metric.hint ? (
                <p className="mt-0.5 truncate text-[11px] text-slate-500">
                  {metric.hint}
                </p>
              ) : null}
            </li>
          );
        })}
      </ul>
    </section>
  );
}

/* ---------------- C. Status badge ---------------- */
function StatusBadge({ status }) {
  const config = STATUS_CONFIG[status] ?? STATUS_CONFIG.draft;
  return (
    <span
      className={cx(
        'inline-flex items-center rounded-full border px-2 py-0.5 text-[10.5px] font-semibold uppercase tracking-wider',
        config.className
      )}
    >
      {config.label}
    </span>
  );
}

/* ---------------- D. Extraction badge ---------------- */
function ExtractionBadge({ state }) {
  const config = EXTRACTION_CONFIG[state] ?? EXTRACTION_CONFIG.pending;
  const ExtractionIcon = config.Icon;
  return (
    <span
      className={cx(
        'inline-flex items-center gap-1 text-[11.5px] font-medium',
        config.className
      )}
    >
      <ExtractionIcon className="h-3.5 w-3.5" aria-hidden="true" />
      {config.label}
    </span>
  );
}

/* ---------------- E. Row actions menu ---------------- */
function RowActions({ tender, onPreview }) {
  const [open, setOpen] = useState(false);
  const menuRef = useRef(null);

  useEffect(() => {
    if (!open) return;
    const onDocClick = (event) => {
      if (!menuRef.current?.contains(event.target)) setOpen(false);
    };
    const onKey = (event) => {
      if (event.key === 'Escape') setOpen(false);
    };
    document.addEventListener('mousedown', onDocClick);
    document.addEventListener('keydown', onKey);
    return () => {
      document.removeEventListener('mousedown', onDocClick);
      document.removeEventListener('keydown', onKey);
    };
  }, [open]);

  return (
    <div className="relative" ref={menuRef}>
      <button
        type="button"
        onClick={() => setOpen((v) => !v)}
        aria-haspopup="menu"
        aria-expanded={open}
        aria-label={`Actions for ${tender.id}`}
        className="inline-flex h-7 w-7 items-center justify-center rounded-md text-slate-500 transition-colors hover:bg-slate-100 hover:text-slate-800 focus:outline-none focus-visible:ring-2 focus-visible:ring-emerald-600 focus-visible:ring-offset-1"
      >
        <MoreVertical className="h-4 w-4" aria-hidden="true" />
      </button>

      {open ? (
        <div
          role="menu"
          aria-label={`Actions for ${tender.id}`}
          className="absolute right-0 z-20 mt-1 w-56 overflow-hidden rounded-md border border-slate-200 bg-white py-1 shadow-lg"
        >
          <button
            type="button"
            role="menuitem"
            onClick={() => {
              onPreview(tender);
              setOpen(false);
            }}
            className="flex w-full items-center gap-2 px-3 py-2 text-left text-[12.5px] text-slate-700 transition-colors hover:bg-slate-50 focus:bg-slate-50 focus:outline-none"
          >
            <Eye className="h-3.5 w-3.5 text-slate-400" aria-hidden="true" />
            View Details
          </button>
          <Link
            to={`/bids?tender=${encodeURIComponent(tender.id)}`}
            role="menuitem"
            onClick={() => setOpen(false)}
            className="flex w-full items-center gap-2 px-3 py-2 text-left text-[12.5px] text-slate-700 transition-colors hover:bg-slate-50 focus:bg-slate-50 focus:outline-none"
          >
            <FileText className="h-3.5 w-3.5 text-slate-400" aria-hidden="true" />
            Process Bids
          </Link>
          <button
            type="button"
            role="menuitem"
            onClick={() => setOpen(false)}
            className="flex w-full items-center gap-2 px-3 py-2 text-left text-[12.5px] text-slate-700 transition-colors hover:bg-slate-50 focus:bg-slate-50 focus:outline-none"
          >
            <Sparkles className="h-3.5 w-3.5 text-slate-400" aria-hidden="true" />
            Extract Requirements
          </button>
        </div>
      ) : null}
    </div>
  );
}

/* ---------------- F. Filter panel ---------------- */
function FilterPanel({
  search,
  onSearchChange,
  status,
  onStatusChange,
  category,
  onCategoryChange,
  onClear,
  totalResults,
}) {
  const hasActiveFilter =
    search.trim() !== '' || status !== 'all' || category !== 'all';

  return (
    <section
      aria-label="Filter and search tenders"
      className="rounded-lg border border-slate-200 bg-white p-4 shadow-sm"
    >
      <div className="grid grid-cols-1 gap-3 md:grid-cols-12">
        {/* Search */}
        <div className="md:col-span-6 lg:col-span-5">
          <label
            htmlFor="tender-search"
            className="mb-1.5 block text-[11.5px] font-semibold uppercase tracking-wider text-slate-500"
          >
            Search
          </label>
          <div className="relative">
            <span className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-3 text-slate-400">
              <Search className="h-4 w-4" aria-hidden="true" />
            </span>
            <input
              id="tender-search"
              type="search"
              value={search}
              onChange={(event) => onSearchChange(event.target.value)}
              placeholder="Search by Tender ID, Title, or Organization…"
              autoComplete="off"
              className="h-9 w-full rounded-md border border-slate-200 bg-white pl-9 pr-3 text-[13px] text-slate-900 placeholder:text-slate-400 transition-colors focus:border-emerald-600 focus:outline-none focus:ring-2 focus:ring-emerald-600/20"
            />
          </div>
        </div>

        {/* Status */}
        <div className="md:col-span-3 lg:col-span-3">
          <label
            htmlFor="tender-status"
            className="mb-1.5 block text-[11.5px] font-semibold uppercase tracking-wider text-slate-500"
          >
            Status
          </label>
          <select
            id="tender-status"
            value={status}
            onChange={(event) => onStatusChange(event.target.value)}
            className="h-9 w-full cursor-pointer appearance-none rounded-md border border-slate-200 bg-white px-3 text-[13px] text-slate-900 transition-colors focus:border-emerald-600 focus:outline-none focus:ring-2 focus:ring-emerald-600/20"
          >
            {STATUS_OPTIONS.map((option) => (
              <option key={option.value} value={option.value}>
                {option.label}
              </option>
            ))}
          </select>
        </div>

        {/* Category */}
        <div className="md:col-span-3 lg:col-span-3">
          <label
            htmlFor="tender-category"
            className="mb-1.5 block text-[11.5px] font-semibold uppercase tracking-wider text-slate-500"
          >
            Category
          </label>
          <select
            id="tender-category"
            value={category}
            onChange={(event) => onCategoryChange(event.target.value)}
            className="h-9 w-full cursor-pointer appearance-none rounded-md border border-slate-200 bg-white px-3 text-[13px] text-slate-900 transition-colors focus:border-emerald-600 focus:outline-none focus:ring-2 focus:ring-emerald-600/20"
          >
            {TENDER_CATEGORIES.map((option) => (
              <option key={option.value} value={option.value}>
                {option.label}
              </option>
            ))}
          </select>
        </div>

        {/* Clear + result count */}
        <div className="flex items-end justify-between gap-3 md:col-span-12 lg:col-span-1">
          {hasActiveFilter ? (
            <button
              type="button"
              onClick={onClear}
              className="inline-flex h-9 items-center gap-1.5 rounded-md border border-slate-200 bg-white px-3 text-[12px] font-semibold text-slate-600 transition-colors hover:bg-slate-50 hover:text-slate-800 focus:outline-none focus-visible:ring-2 focus-visible:ring-emerald-600 focus-visible:ring-offset-1"
            >
              <X className="h-3.5 w-3.5" aria-hidden="true" />
              Clear
            </button>
          ) : null}
        </div>
      </div>

      <div className="mt-3 flex items-center justify-between border-t border-slate-100 pt-3">
        <p className="text-[12px] text-slate-500">
          Showing{' '}
          <span className="font-semibold text-slate-800">{totalResults}</span>{' '}
          {totalResults === 1 ? 'tender' : 'tenders'}
          {hasActiveFilter ? ' matching current filters' : ''}
        </p>
        <span className="hidden items-center gap-1.5 text-[11.5px] text-slate-500 sm:inline-flex">
          <Filter className="h-3.5 w-3.5" aria-hidden="true" />
          Refine by status or category
        </span>
      </div>
    </section>
  );
}

/* ---------------- G. Preview drawer ---------------- */
function PreviewDrawer({ tender, onClose }) {
  const drawerRef = useRef(null);

  useEffect(() => {
    if (!tender) return;
    const onKey = (event) => {
      if (event.key === 'Escape') onClose();
    };
    document.addEventListener('keydown', onKey);
    document.body.style.overflow = 'hidden';
    // Focus first focusable element in drawer
    const focusables = drawerRef.current?.querySelectorAll(
      'button, a, [tabindex]:not([tabindex="-1"])'
    );
    focusables?.[0]?.focus();
    return () => {
      document.removeEventListener('keydown', onKey);
      document.body.style.overflow = '';
    };
  }, [tender, onClose]);

  if (!tender) return null;

  const status = STATUS_CONFIG[tender.status] ?? STATUS_CONFIG.draft;

  return (
    <div className="fixed inset-0 z-50 flex">
      {/* Backdrop */}
      <div
        className="flex-1 bg-slate-900/50 backdrop-blur-sm"
        onClick={onClose}
        aria-hidden="true"
      />

      {/* Drawer */}
      <aside
        ref={drawerRef}
        role="dialog"
        aria-modal="true"
        aria-labelledby="preview-drawer-title"
        className="flex h-full w-full max-w-md flex-col bg-white shadow-2xl sm:max-w-lg"
      >
        {/* Header */}
        <header className="flex items-start justify-between gap-3 border-b border-slate-200 p-5">
          <div className="min-w-0">
            <p className="text-[11px] font-semibold uppercase tracking-wider text-slate-500">
              {tender.id}
            </p>
            <h2
              id="preview-drawer-title"
              className="mt-1 text-[15px] font-semibold leading-tight text-slate-900"
            >
              {tender.title}
            </h2>
            <div className="mt-2 flex flex-wrap items-center gap-2">
              <StatusBadge status={tender.status} />
              <span className="text-[11.5px] text-slate-500">
                {tender.categoryLabel}
              </span>
            </div>
          </div>
          <button
            type="button"
            onClick={onClose}
            aria-label="Close preview"
            className="inline-flex h-8 w-8 flex-shrink-0 items-center justify-center rounded-md text-slate-500 transition-colors hover:bg-slate-100 hover:text-slate-800 focus:outline-none focus-visible:ring-2 focus-visible:ring-emerald-600 focus-visible:ring-offset-1"
          >
            <X className="h-4 w-4" aria-hidden="true" />
          </button>
        </header>

        {/* Body */}
        <div className="flex-1 overflow-y-auto p-5">
          {/* Metadata grid */}
          <dl className="grid grid-cols-2 gap-3 rounded-md border border-slate-200 bg-slate-50 p-3">
            <div>
              <dt className="text-[10.5px] font-semibold uppercase tracking-wider text-slate-500">
                Procuring Agency
              </dt>
              <dd className="mt-0.5 flex items-center gap-1.5 text-[12.5px] font-medium text-slate-800">
                <Building2
                  className="h-3.5 w-3.5 flex-shrink-0 text-slate-400"
                  aria-hidden="true"
                />
                <span className="truncate">{tender.agency}</span>
              </dd>
            </div>
            <div>
              <dt className="text-[10.5px] font-semibold uppercase tracking-wider text-slate-500">
                Estimated Value
              </dt>
              <dd className="mt-0.5 text-[12.5px] font-medium text-slate-800">
                {tender.estimatedValue}
              </dd>
            </div>
            <div>
              <dt className="text-[10.5px] font-semibold uppercase tracking-wider text-slate-500">
                Submission Deadline
              </dt>
              <dd className="mt-0.5 flex items-center gap-1.5 text-[12.5px] font-medium text-slate-800">
                <Clock
                  className="h-3.5 w-3.5 flex-shrink-0 text-slate-400"
                  aria-hidden="true"
                />
                {formatDate(tender.deadline)}
              </dd>
            </div>
            <div>
              <dt className="text-[10.5px] font-semibold uppercase tracking-wider text-slate-500">
                Bids Received
              </dt>
              <dd className="mt-0.5 text-[12.5px] font-medium tabular-nums text-slate-800">
                {formatNumber(tender.bids)}
              </dd>
            </div>
          </dl>

          {/* Extraction status */}
          <div className="mt-5 flex items-center justify-between rounded-md border border-slate-200 bg-white p-3">
            <span className="text-[12px] font-semibold text-slate-700">
              Requirement Extraction
            </span>
            <ExtractionBadge state={tender.extraction} />
          </div>

          {/* Eligibility */}
          <section className="mt-6" aria-labelledby="preview-eligibility-title">
            <h3
              id="preview-eligibility-title"
              className="mb-2 text-[12.5px] font-semibold uppercase tracking-wider text-slate-500"
            >
              Eligibility Criteria
            </h3>
            <ul className="flex flex-col gap-2">
              {tender.eligibility.map((item, index) => (
                <li
                  key={`${tender.id}-elig-${index}`}
                  className="flex items-start gap-2 rounded-md border border-slate-200 bg-white p-2.5 text-[12.5px] leading-relaxed text-slate-700"
                >
                  <CheckCircle2
                    className="mt-0.5 h-3.5 w-3.5 flex-shrink-0 text-emerald-600"
                    aria-hidden="true"
                  />
                  <span>{item}</span>
                </li>
              ))}
            </ul>
          </section>

          {/* Documents */}
          <section className="mt-6" aria-labelledby="preview-docs-title">
            <h3
              id="preview-docs-title"
              className="mb-2 text-[12.5px] font-semibold uppercase tracking-wider text-slate-500"
            >
              Mandatory Document Checklist
            </h3>
            <ul className="flex flex-col gap-1.5">
              {tender.documents.map((doc, index) => (
                <li
                  key={`${tender.id}-doc-${index}`}
                  className="flex items-center justify-between rounded-md border border-slate-200 bg-white px-3 py-2 text-[12.5px]"
                >
                  <span className="text-slate-700">{doc.name}</span>
                  <span
                    className={cx(
                      'text-[10.5px] font-semibold uppercase tracking-wider',
                      doc.mandatory ? 'text-red-600' : 'text-slate-400'
                    )}
                  >
                    {doc.mandatory ? 'Mandatory' : 'Optional'}
                  </span>
                </li>
              ))}
            </ul>
          </section>
        </div>

        {/* Footer */}
        <footer className="flex items-center justify-end gap-2 border-t border-slate-200 bg-slate-50 p-4">
          <button
            type="button"
            onClick={onClose}
            className="inline-flex h-9 items-center rounded-md border border-slate-200 bg-white px-3 text-[12.5px] font-semibold text-slate-700 transition-colors hover:bg-slate-50 focus:outline-none focus-visible:ring-2 focus-visible:ring-emerald-600 focus-visible:ring-offset-1"
          >
            Close
          </button>
          <Link
            to={`/tenders/${tender.id}`}
            className="inline-flex h-9 items-center gap-1.5 rounded-md bg-emerald-600 px-3.5 text-[12.5px] font-semibold text-white transition-colors hover:bg-emerald-700 focus:outline-none focus-visible:ring-2 focus-visible:ring-emerald-600 focus-visible:ring-offset-2"
          >
            Open Full Details
          </Link>
        </footer>
      </aside>
    </div>
  );
}

/* ---------------- H. Empty state ---------------- */
function EmptyState({ onClear }) {
  return (
    <div className="flex flex-col items-center justify-center gap-3 px-6 py-14 text-center">
      <span
        className="inline-flex h-11 w-11 items-center justify-center rounded-md bg-slate-100 text-slate-500"
        aria-hidden="true"
      >
        <FileText className="h-5 w-5" />
      </span>
      <div>
        <p className="text-[13.5px] font-semibold text-slate-800">
          No tenders match your filters
        </p>
        <p className="mt-1 text-[12px] text-slate-500">
          Try adjusting the search terms, status, or category.
        </p>
      </div>
      <button
        type="button"
        onClick={onClear}
        className="mt-1 inline-flex h-8 items-center gap-1.5 rounded-md border border-slate-200 bg-white px-3 text-[12px] font-semibold text-slate-700 transition-colors hover:bg-slate-50 focus:outline-none focus-visible:ring-2 focus-visible:ring-emerald-600 focus-visible:ring-offset-1"
      >
        <X className="h-3.5 w-3.5" aria-hidden="true" />
        Clear filters
      </button>
    </div>
  );
}

/* ---------------- I. Pagination ---------------- */
function Pagination({
  page,
  pageSize,
  totalItems,
  onPageChange,
  onPageSizeChange,
}) {
  const totalPages = Math.max(1, Math.ceil(totalItems / pageSize));
  const start = totalItems === 0 ? 0 : (page - 1) * pageSize + 1;
  const end = Math.min(page * pageSize, totalItems);

  const pageNumbers = useMemo(() => {
    const window = [];
    const maxVisible = 5;
    let first = Math.max(1, page - Math.floor(maxVisible / 2));
    let last = Math.min(totalPages, first + maxVisible - 1);
    if (last - first + 1 < maxVisible) {
      first = Math.max(1, last - maxVisible + 1);
    }
    for (let i = first; i <= last; i += 1) window.push(i);
    return window;
  }, [page, totalPages]);

  return (
    <div className="flex flex-col items-center justify-between gap-3 border-t border-slate-200 px-5 py-3.5 sm:flex-row">
      <div className="flex items-center gap-3">
        <label
          htmlFor="tender-page-size"
          className="text-[12px] text-slate-600"
        >
          Rows per page
        </label>
        <select
          id="tender-page-size"
          value={pageSize}
          onChange={(event) => onPageSizeChange(Number(event.target.value))}
          className="h-8 cursor-pointer appearance-none rounded-md border border-slate-200 bg-white px-2 text-[12px] text-slate-800 transition-colors focus:border-emerald-600 focus:outline-none focus:ring-2 focus:ring-emerald-600/20"
        >
          {[5, 10, 25, 50].map((size) => (
            <option key={size} value={size}>
              {size}
            </option>
          ))}
        </select>
        <span className="hidden text-[12px] text-slate-500 sm:inline">
          {start}–{end} of {formatNumber(totalItems)}
        </span>
      </div>

      <nav
        aria-label="Pagination"
        className="flex items-center gap-1"
      >
        <button
          type="button"
          onClick={() => onPageChange(page - 1)}
          disabled={page <= 1}
          aria-label="Previous page"
          className="inline-flex h-8 w-8 items-center justify-center rounded-md border border-slate-200 bg-white text-slate-600 transition-colors hover:bg-slate-50 disabled:cursor-not-allowed disabled:opacity-40 focus:outline-none focus-visible:ring-2 focus-visible:ring-emerald-600 focus-visible:ring-offset-1"
        >
          <ChevronLeft className="h-4 w-4" aria-hidden="true" />
        </button>

        {pageNumbers.map((num) => {
          const isCurrent = num === page;
          return (
            <button
              key={num}
              type="button"
              onClick={() => onPageChange(num)}
              aria-current={isCurrent ? 'page' : undefined}
              className={cx(
                'inline-flex h-8 min-w-8 items-center justify-center rounded-md border px-2 text-[12px] font-semibold transition-colors focus:outline-none focus-visible:ring-2 focus-visible:ring-emerald-600 focus-visible:ring-offset-1',
                isCurrent
                  ? 'border-emerald-600 bg-emerald-600 text-white'
                  : 'border-slate-200 bg-white text-slate-700 hover:bg-slate-50'
              )}
            >
              {num}
            </button>
          );
        })}

        <button
          type="button"
          onClick={() => onPageChange(page + 1)}
          disabled={page >= totalPages}
          aria-label="Next page"
          className="inline-flex h-8 w-8 items-center justify-center rounded-md border border-slate-200 bg-white text-slate-600 transition-colors hover:bg-slate-50 disabled:cursor-not-allowed disabled:opacity-40 focus:outline-none focus-visible:ring-2 focus-visible:ring-emerald-600 focus-visible:ring-offset-1"
        >
          <ChevronRight className="h-4 w-4" aria-hidden="true" />
        </button>
      </nav>
    </div>
  );
}

/* ================================================================== */
/*  PAGE                                                              */
/* ================================================================== */

export default function Tenders() {
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [categoryFilter, setCategoryFilter] = useState('all');
  const [page, setPage] = useState(1);
  const [pageSize, setPageSize] = useState(5);
  const [previewTender, setPreviewTender] = useState(null);

  /* ---------------- Derived metrics ---------------- */
  const metrics = useMemo(() => {
    const totalTenders = MOCK_TENDERS.length;
    const activeBiddings = MOCK_TENDERS.filter(
      (t) => t.status === 'active'
    ).length;
    const extractedRequirements = MOCK_TENDERS.filter(
      (t) => t.extraction === 'extracted'
    ).length;
    const pendingRuns = MOCK_TENDERS.filter(
      (t) => t.extraction === 'pending'
    ).length;

    return [
      {
        id: 'total',
        label: 'Total Tenders',
        value: totalTenders,
        tone: 'slate',
        Icon: FileText,
        hint: 'All monitored records',
      },
      {
        id: 'active',
        label: 'Active Biddings',
        value: activeBiddings,
        tone: 'emerald',
        Icon: CheckCircle2,
        hint: 'Open for submission',
      },
      {
        id: 'extracted',
        label: 'Requirements Extracted',
        value: extractedRequirements,
        tone: 'slate',
        Icon: Sparkles,
        hint: 'AI parsing complete',
      },
      {
        id: 'pending',
        label: 'Pending Verification Runs',
        value: pendingRuns,
        tone: 'amber',
        Icon: Clock,
        hint: 'Awaiting extraction',
      },
    ];
  }, []);

  /* ---------------- Filtering pipeline ---------------- */
  const filteredTenders = useMemo(() => {
    const q = search.trim().toLowerCase();
    return MOCK_TENDERS.filter((tender) => {
      const matchesSearch =
        q === '' ||
        tender.id.toLowerCase().includes(q) ||
        tender.title.toLowerCase().includes(q) ||
        tender.agency.toLowerCase().includes(q);
      const matchesStatus =
        statusFilter === 'all' || tender.status === statusFilter;
      const matchesCategory =
        categoryFilter === 'all' || tender.category === categoryFilter;
      return matchesSearch && matchesStatus && matchesCategory;
    });
  }, [search, statusFilter, categoryFilter]);

  /* Reset to page 1 whenever filters change */
  useEffect(() => {
    setPage(1);
  }, [search, statusFilter, categoryFilter, pageSize]);

  /* ---------------- Pagination slice ---------------- */
  const paginatedTenders = useMemo(() => {
    const start = (page - 1) * pageSize;
    return filteredTenders.slice(start, start + pageSize);
  }, [filteredTenders, page, pageSize]);

  /* ---------------- Handlers ---------------- */
  const handleClearFilters = useCallback(() => {
    setSearch('');
    setStatusFilter('all');
    setCategoryFilter('all');
  }, []);

  const handlePageChange = useCallback(
    (nextPage) => {
      const totalPages = Math.max(
        1,
        Math.ceil(filteredTenders.length / pageSize)
      );
      const clamped = Math.min(Math.max(1, nextPage), totalPages);
      setPage(clamped);
    },
    [filteredTenders.length, pageSize]
  );

  const handleCreateTender = useCallback(() => {
    /* Navigation to creation flow intentionally not implemented */
  }, []);

  return (
    <div className="flex flex-col gap-5">
      {/* A. Page header */}
      <PageHeader onCreate={handleCreateTender} />

      {/* B. Metric summary bar */}
      <MetricBar metrics={metrics} />

      {/* C. Filter & search control panel */}
      <FilterPanel
        search={search}
        onSearchChange={setSearch}
        status={statusFilter}
        onStatusChange={setStatusFilter}
        category={categoryFilter}
        onCategoryChange={setCategoryFilter}
        onClear={handleClearFilters}
        totalResults={filteredTenders.length}
      />

      {/* D. Tenders table */}
      <section
        aria-label="Tenders list"
        className="overflow-hidden rounded-lg border border-slate-200 bg-white shadow-sm"
      >
        {paginatedTenders.length === 0 ? (
          <EmptyState onClear={handleClearFilters} />
        ) : (
          <>
            <div className="overflow-x-auto">
              <table className="w-full min-w-[1024px] border-collapse text-left text-[12.5px]">
                <caption className="sr-only">
                  List of tenders with status, extraction state, and available
                  actions
                </caption>
                <thead>
                  <tr className="border-b border-slate-200 bg-slate-50 text-[11px] font-semibold uppercase tracking-wider text-slate-500">
                    <th scope="col" className="px-5 py-2.5">
                      Tender Ref ID
                    </th>
                    <th scope="col" className="px-5 py-2.5">
                      Title / Category
                    </th>
                    <th scope="col" className="px-5 py-2.5">
                      Procuring Agency
                    </th>
                    <th scope="col" className="px-5 py-2.5">
                      Deadline
                    </th>
                    <th scope="col" className="px-5 py-2.5 text-right">
                      Bids
                    </th>
                    <th scope="col" className="px-5 py-2.5">
                      Extraction
                    </th>
                    <th scope="col" className="px-5 py-2.5">
                      Status
                    </th>
                    <th scope="col" className="px-5 py-2.5 text-right">
                      Actions
                    </th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {paginatedTenders.map((tender) => (
                    <tr
                      key={tender.id}
                      className="transition-colors hover:bg-slate-50/70"
                    >
                      <td className="whitespace-nowrap px-5 py-3">
                        <button
                          type="button"
                          onClick={() => setPreviewTender(tender)}
                          className="font-mono text-[11.5px] font-semibold text-emerald-600 transition-colors hover:text-emerald-700 focus:outline-none focus-visible:underline"
                        >
                          {tender.id}
                        </button>
                      </td>
                      <td className="px-5 py-3">
                        <div className="flex max-w-[280px] flex-col">
                          <span className="line-clamp-1 font-medium text-slate-800">
                            {tender.title}
                          </span>
                          <span className="mt-0.5 text-[11px] text-slate-500">
                            {tender.categoryLabel}
                          </span>
                        </div>
                      </td>
                      <td className="px-5 py-3">
                        <span className="inline-flex items-center gap-1.5 text-slate-700">
                          <Building2
                            className="h-3.5 w-3.5 flex-shrink-0 text-slate-400"
                            aria-hidden="true"
                          />
                          <span className="line-clamp-1 max-w-[200px]">
                            {tender.agency}
                          </span>
                        </span>
                      </td>
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
                      <td className="whitespace-nowrap px-5 py-3">
                        <ExtractionBadge state={tender.extraction} />
                      </td>
                      <td className="whitespace-nowrap px-5 py-3">
                        <StatusBadge status={tender.status} />
                      </td>
                      <td className="whitespace-nowrap px-5 py-3 text-right">
                        <div className="flex items-center justify-end gap-1">
                          <button
                            type="button"
                            onClick={() => setPreviewTender(tender)}
                            aria-label={`Preview ${tender.id}`}
                            className="inline-flex h-7 w-7 items-center justify-center rounded-md text-slate-500 transition-colors hover:bg-slate-100 hover:text-slate-800 focus:outline-none focus-visible:ring-2 focus-visible:ring-emerald-600 focus-visible:ring-offset-1"
                          >
                            <Eye className="h-3.5 w-3.5" aria-hidden="true" />
                          </button>
                          <RowActions
                            tender={tender}
                            onPreview={setPreviewTender}
                          />
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            {/* E. Pagination */}
            <Pagination
              page={page}
              pageSize={pageSize}
              totalItems={filteredTenders.length}
              onPageChange={handlePageChange}
              onPageSizeChange={setPageSize}
            />
          </>
        )}
      </section>

      {/* F. Preview drawer */}
      <PreviewDrawer
        tender={previewTender}
        onClose={() => setPreviewTender(null)}
      />
    </div>
  );
}