import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { Link, useSearchParams } from 'react-router-dom';
import {
  Search,
  Filter,
  RefreshCw,
  AlertTriangle,
  CheckCircle2,
  XCircle,
  Clock,
  UserCheck,
  UserX,
  ShieldAlert,
  FileText,
  ChevronRight,
  X,
  ArrowUpRight,
  MessageSquare,
  ExternalLink,
  Info,
  Layers,
} from 'lucide-react';

/* ================================================================== */
/*  MOCK DATA                                                         */
/* ================================================================== */

const REVIEWERS = [
  'Ananya Sharma',
  'Rahul Verma',
  'Priya Mehta',
  'Vikram Singh',
];

const INITIAL_CASES = [
  {
    id: 'RC-2026-1042',
    bidderName: 'Aarav Infrastructure Solutions Pvt. Ltd.',
    bidId: 'BID-2026-0087',
    tenderRef: 'TNDR-2026-0142',
    tenderTitle: 'Supply & Installation of Solar Micro-Grids',
    requirementName: 'GST Registration Certificate',
    requirementCategory: 'Tax Compliance',
    flagReason:
      'GSTIN state jurisdiction code ambiguous — OCR confidence on digit 2 is 64%',
    priority: 'critical',
    status: 'pending',
    assignee: null,
    createdAt: '2026-01-09 09:41 IST',
    updatedAt: '2026-01-09 09:41 IST',
    dueAt: '2026-01-09 18:00 IST',
    dueToday: true,
    resolvedToday: false,
    confidence: 64,
    verificationMethod: 'AI-Assisted Extraction + Rule Check',
    evidence: {
      fileName: 'GST_Registration_AISPL.pdf',
      fileSize: '428 KB',
      uploadedAt: '2026-01-08 14:10 IST',
    },
    extractedValue: 'GSTIN 07AAACA1234B1Z5 — Registered State: Delhi (07?)',
    expectedValue: 'GSTIN registered in Delhi (state code 07) matching GeM profile',
    mismatchNote:
      'The second digit of the GSTIN state code is ambiguously rendered. Both "7" (Delhi) and "9" (Uttar Pradesh) are plausible reads.',
    aiExplanation:
      'GSTIN format, registration status, minimum filing window, and legal name all conform. The only ambiguous signal is the state jurisdiction code, which was scanned at low resolution. Manual confirmation against the GeM portal vendor profile is required.',
    recommendedAction:
      'Verify state jurisdiction code manually against the GeM portal vendor profile. Mark Satisfied if the digit is "7"; escalate as jurisdiction mismatch if "9".',
    auditTrail: [
      {
        id: 'a1',
        event: 'Case Created',
        actor: 'System — Confidence threshold trigger',
        timestamp: '2026-01-09 09:41 IST',
        type: 'info',
      },
      {
        id: 'a2',
        event: 'AI Extraction Complete — Confidence 64%',
        actor: 'Document Intelligence v2.4',
        timestamp: '2026-01-09 09:40 IST',
        type: 'info',
      },
      {
        id: 'a3',
        event: 'Flagged — State jurisdiction ambiguity',
        actor: 'Compliance Rule Engine',
        timestamp: '2026-01-09 09:41 IST',
        type: 'warning',
      },
    ],
  },
  {
    id: 'RC-2026-1041',
    bidderName: 'Nexus Systems Integrators LLP',
    bidId: 'BID-2026-0088',
    tenderRef: 'TNDR-2026-0142',
    tenderTitle: 'Supply & Installation of Solar Micro-Grids',
    requirementName: 'Income Tax Returns (FY22, FY23, FY24)',
    requirementCategory: 'Tax Compliance',
    flagReason:
      'FY 2024-25 acknowledgment submitted — tender requires FY 2022-23 documentation',
    priority: 'high',
    status: 'in-review',
    assignee: 'Ananya Sharma',
    createdAt: '2026-01-09 08:22 IST',
    updatedAt: '2026-01-09 10:14 IST',
    dueAt: '2026-01-09 18:00 IST',
    dueToday: true,
    resolvedToday: false,
    confidence: 51,
    verificationMethod: 'AI-Assisted Extraction + Rule Check',
    evidence: {
      fileName: 'ITR_Combined_NexusSystems.pdf',
      fileSize: '2.8 MB',
      uploadedAt: '2026-01-08 15:48 IST',
    },
    extractedValue: 'ITR acknowledgment for FY 2024-25 submitted',
    expectedValue: 'ITR acknowledgments for FY22, FY23, FY24',
    mismatchNote:
      'The submitted acknowledgement is for the wrong financial year. Tender mandates FY22-FY24 filings; bidder submitted FY24-25.',
    aiExplanation:
      'The document was successfully parsed as a valid ITR acknowledgement. However, the financial year field displays "2024-25" — which falls outside the tender-specified FY22-FY24 window. This is a rule failure, not an extraction failure.',
    recommendedAction:
      'Confirm with the bidder whether the correct documents were uploaded. If confirmed incorrect, mark Non-Compliant and notify via the GeM portal.',
    auditTrail: [
      {
        id: 'a1',
        event: 'Case Created',
        actor: 'System — Rule check failure trigger',
        timestamp: '2026-01-09 08:22 IST',
        type: 'info',
      },
      {
        id: 'a2',
        event: 'AI Extraction Complete — Confidence 51%',
        actor: 'Document Intelligence v2.4',
        timestamp: '2026-01-09 08:21 IST',
        type: 'info',
      },
      {
        id: 'a3',
        event: 'Assigned to Ananya Sharma',
        actor: 'Reviewer — Auto-assignment',
        timestamp: '2026-01-09 10:14 IST',
        type: 'info',
      },
    ],
  },
  {
    id: 'RC-2026-1039',
    bidderName: 'Sunwave Renewables Pvt. Ltd.',
    bidId: 'BID-2026-0091',
    tenderRef: 'TNDR-2026-0142',
    tenderTitle: 'Supply & Installation of Solar Micro-Grids',
    requirementName: 'BIS Certification for Solar Panels',
    requirementCategory: 'Technical',
    flagReason: 'BIS certification expired 15-Nov-2024 — submission window open',
    priority: 'critical',
    status: 'pending',
    assignee: null,
    createdAt: '2026-01-09 07:15 IST',
    updatedAt: '2026-01-09 07:15 IST',
    dueAt: '2026-01-09 18:00 IST',
    dueToday: true,
    resolvedToday: false,
    confidence: 87,
    verificationMethod: 'Automated Rule Check',
    evidence: {
      fileName: 'BIS_Cert_Sunwave.pdf',
      fileSize: '612 KB',
      uploadedAt: '2026-01-08 12:22 IST',
    },
    extractedValue: 'BIS certificate valid till 15-Nov-2024',
    expectedValue: 'BIS certification valid through bid submission deadline 20-Jan-2026',
    mismatchNote:
      'Certificate expired 66 days before the current bid submission window. Rule check categorically failed.',
    aiExplanation:
      'The BIS certificate was successfully parsed and the expiry date field is unambiguous. Validity ended on 15-Nov-2024, which is before the tender submission window close date of 20-Jan-2026. Rule requires validity through the entire submission window.',
    recommendedAction:
      'Reject requirement. Request updated BIS certification from bidder through the GeM clarification channel.',
    auditTrail: [
      {
        id: 'a1',
        event: 'Case Created',
        actor: 'System — Rule check failure trigger',
        timestamp: '2026-01-09 07:15 IST',
        type: 'info',
      },
      {
        id: 'a2',
        event: 'Flagged — BIS certificate expired',
        actor: 'Compliance Rule Engine',
        timestamp: '2026-01-09 07:15 IST',
        type: 'error',
      },
    ],
  },
  {
    id: 'RC-2026-1037',
    bidderName: 'GreenVolt Energy Systems',
    bidId: 'BID-2026-0092',
    tenderRef: 'TNDR-2026-0142',
    tenderTitle: 'Supply & Installation of Solar Micro-Grids',
    requirementName: 'Audited Financial Statements (FY22-FY24)',
    requirementCategory: 'Financial',
    flagReason: 'CA signature verification failed — low-resolution scan',
    priority: 'medium',
    status: 'pending',
    assignee: 'Rahul Verma',
    createdAt: '2026-01-08 17:40 IST',
    updatedAt: '2026-01-09 09:05 IST',
    dueAt: '2026-01-10 18:00 IST',
    dueToday: false,
    resolvedToday: false,
    confidence: 74,
    verificationMethod: 'AI-Assisted Extraction + Rule Check',
    evidence: {
      fileName: 'Financials_FY22-24_GreenVolt.pdf',
      fileSize: '3.4 MB',
      uploadedAt: '2026-01-08 17:12 IST',
    },
    extractedValue: 'CA signature region — low confidence (74%)',
    expectedValue: 'CA-certified financials with verifiable signature and registration number',
    mismatchNote:
      'Signature legible enough for manual reading but insufficient for automated cross-check against ICAI registry.',
    aiExplanation:
      'All financial figures were extracted successfully. The CA signature block has sufficient contrast for human review but lacks the sharpness required for automated ICAI cross-reference. Human verification of the CA registration number is recommended.',
    recommendedAction:
      'Manually verify CA registration number against the ICAI public registry before marking the requirement.',
    auditTrail: [
      {
        id: 'a1',
        event: 'Case Created',
        actor: 'System — Confidence threshold trigger',
        timestamp: '2026-01-08 17:40 IST',
        type: 'info',
      },
      {
        id: 'a2',
        event: 'Assigned to Rahul Verma',
        actor: 'Reviewer — Manual assignment',
        timestamp: '2026-01-09 09:05 IST',
        type: 'info',
      },
    ],
  },
  {
    id: 'RC-2026-1035',
    bidderName: 'Helios Energy Solutions Pvt. Ltd.',
    bidId: 'BID-2026-0089',
    tenderRef: 'TNDR-2026-0142',
    tenderTitle: 'Supply & Installation of Solar Micro-Grids',
    requirementName: 'Past Experience Certificates',
    requirementCategory: 'Experience',
    flagReason: 'One of three work orders lacks issuing authority letterhead',
    priority: 'low',
    status: 'resolved',
    assignee: 'Priya Mehta',
    createdAt: '2026-01-08 11:20 IST',
    updatedAt: '2026-01-08 15:42 IST',
    dueAt: '2026-01-08 18:00 IST',
    dueToday: false,
    resolvedToday: true,
    confidence: 81,
    verificationMethod: 'Human Review',
    evidence: {
      fileName: 'Experience_Helios_Combined.pdf',
      fileSize: '2.1 MB',
      uploadedAt: '2026-01-08 10:48 IST',
    },
    extractedValue:
      'Work orders: 3 detected — 2 with letterhead, 1 plain-format completion certificate',
    expectedValue: 'Minimum 2 similar works of ≥₹2 Cr in last 5 years',
    mismatchNote:
      'One certificate is on plain paper without letterhead. The other two are fully compliant.',
    aiExplanation:
      'Two of three work orders meet the tender criterion (₹2 Cr minimum value and letterhead-authenticated). The bidder exceeds the minimum of 2 required orders, so the missing letterhead is not disqualifying.',
    recommendedAction:
      'Mark Satisfied — the bidder meets the minimum requirement with two qualifying orders.',
    auditTrail: [
      {
        id: 'a1',
        event: 'Case Created',
        actor: 'System — Manual flag',
        timestamp: '2026-01-08 11:20 IST',
        type: 'info',
      },
      {
        id: 'a2',
        event: 'Assigned to Priya Mehta',
        actor: 'Reviewer — Auto-assignment',
        timestamp: '2026-01-08 11:25 IST',
        type: 'info',
      },
      {
        id: 'a3',
        event: 'Human Decision — Marked as Satisfied',
        actor: 'Reviewer — Priya Mehta',
        timestamp: '2026-01-08 15:42 IST',
        type: 'success',
      },
      {
        id: 'a4',
        event: 'Reviewer Note: Two compliant work orders meet the ₹2 Cr minimum requirement. Third certificate is non-disqualifying.',
        actor: 'Reviewer — Priya Mehta',
        timestamp: '2026-01-08 15:42 IST',
        type: 'info',
      },
    ],
  },
  {
    id: 'RC-2026-1033',
    bidderName: 'Aurora Power Systems LLP',
    bidId: 'BID-2026-0090',
    tenderRef: 'TNDR-2026-0142',
    tenderTitle: 'Supply & Installation of Solar Micro-Grids',
    requirementName: 'GST Registration Certificate',
    requirementCategory: 'Tax Compliance',
    flagReason: 'Escalated — prior decision disputed by procurement authority',
    priority: 'high',
    status: 'escalated',
    assignee: 'Vikram Singh',
    createdAt: '2026-01-07 14:30 IST',
    updatedAt: '2026-01-08 09:15 IST',
    dueAt: '2026-01-10 18:00 IST',
    dueToday: false,
    resolvedToday: false,
    confidence: 58,
    verificationMethod: 'Hybrid Verification',
    evidence: {
      fileName: 'GST_Aurora_Scan.pdf',
      fileSize: '396 KB',
      uploadedAt: '2026-01-07 14:02 IST',
    },
    extractedValue: 'GSTIN partially legible — 12 of 15 characters confidently extracted',
    expectedValue: 'Active GSTIN with ≥3 years filing history',
    mismatchNote:
      'Document severely degraded. Only the PAN segment of the GSTIN could be reliably extracted.',
    aiExplanation:
      'Extraction pipeline completed with a confidence score below the review threshold. The document quality is insufficient for automated verification. This case was previously marked Satisfied but has been escalated for re-review by a procurement officer.',
    recommendedAction:
      'Request a re-upload of the GST certificate from the bidder. Hold adjudication until a legible document is available.',
    auditTrail: [
      {
        id: 'a1',
        event: 'Case Created',
        actor: 'System — Extraction failure trigger',
        timestamp: '2026-01-07 14:30 IST',
        type: 'info',
      },
      {
        id: 'a2',
        event: 'Human Decision — Marked as Satisfied',
        actor: 'Reviewer — Vikram Singh',
        timestamp: '2026-01-07 16:20 IST',
        type: 'success',
      },
      {
        id: 'a3',
        event: 'Escalated — Decision disputed by procurement authority',
        actor: 'Procurement Officer — Manual escalation',
        timestamp: '2026-01-08 09:15 IST',
        type: 'error',
      },
    ],
  },
];

/* ================================================================== */
/*  CONFIG MAPS                                                       */
/* ================================================================== */

const PRIORITY_CONFIG = {
  critical: {
    label: 'Critical',
    className: 'bg-red-50 text-red-700 border-red-200',
    dot: 'bg-red-600',
  },
  high: {
    label: 'High',
    className: 'bg-red-50 text-red-700 border-red-200',
    dot: 'bg-amber-500',
  },
  medium: {
    label: 'Medium',
    className: 'bg-amber-50 text-amber-700 border-amber-200',
    dot: 'bg-amber-500',
  },
  low: {
    label: 'Low',
    className: 'bg-emerald-50 text-emerald-700 border-emerald-200',
    dot: 'bg-emerald-500',
  },
};

const STATUS_CONFIG = {
  pending: {
    label: 'Pending',
    className: 'bg-slate-100 text-slate-700 border-slate-300',
    Icon: Clock,
  },
  'in-review': {
    label: 'In Review',
    className: 'bg-amber-50 text-amber-700 border-amber-200',
    Icon: AlertTriangle,
  },
  resolved: {
    label: 'Resolved',
    className: 'bg-emerald-50 text-emerald-700 border-emerald-200',
    Icon: CheckCircle2,
  },
  escalated: {
    label: 'Escalated',
    className: 'bg-red-50 text-red-700 border-red-200',
    Icon: ShieldAlert,
  },
};

const AUDIT_TONE = {
  info: { iconBg: 'bg-slate-100 text-slate-600', Icon: Info },
  warning: { iconBg: 'bg-amber-50 text-amber-600', Icon: AlertTriangle },
  success: { iconBg: 'bg-emerald-50 text-emerald-600', Icon: CheckCircle2 },
  error: { iconBg: 'bg-red-50 text-red-600', Icon: XCircle },
};

const STATUS_FILTER_OPTIONS = [
  { value: 'all', label: 'All Status' },
  { value: 'pending', label: 'Pending' },
  { value: 'in-review', label: 'In Review' },
  { value: 'resolved', label: 'Resolved' },
  { value: 'escalated', label: 'Escalated' },
];

const PRIORITY_FILTER_OPTIONS = [
  { value: 'all', label: 'All Priorities' },
  { value: 'critical', label: 'Critical' },
  { value: 'high', label: 'High' },
  { value: 'medium', label: 'Medium' },
  { value: 'low', label: 'Low' },
];

/* ================================================================== */
/*  HELPERS                                                           */
/* ================================================================== */

const cx = (...parts) => parts.filter(Boolean).join(' ');

const getConfidenceBand = (score) => {
  if (score >= 90) return { label: 'High', className: 'text-emerald-600', bar: 'bg-emerald-500' };
  if (score >= 70) return { label: 'Moderate', className: 'text-amber-600', bar: 'bg-amber-500' };
  return { label: 'Low', className: 'text-red-600', bar: 'bg-red-500' };
};

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

function PriorityBadge({ priority }) {
  const config = PRIORITY_CONFIG[priority] ?? PRIORITY_CONFIG.medium;
  return (
    <span
      className={cx(
        'inline-flex items-center gap-1.5 rounded-full border px-2 py-0.5 text-[10.5px] font-semibold uppercase tracking-wider',
        config.className
      )}
    >
      <span
        className={cx('h-1.5 w-1.5 rounded-full', config.dot)}
        aria-hidden="true"
      />
      {config.label}
    </span>
  );
}

function StatusBadge({ status }) {
  const config = STATUS_CONFIG[status] ?? STATUS_CONFIG.pending;
  const Icon = config.Icon;
  return (
    <span
      className={cx(
        'inline-flex items-center gap-1 rounded-full border px-2 py-0.5 text-[10.5px] font-semibold uppercase tracking-wider',
        config.className
      )}
    >
      <Icon className="h-3 w-3" aria-hidden="true" />
      {config.label}
    </span>
  );
}

function AssigneeTag({ assignee }) {
  if (!assignee) {
    return (
      <span className="inline-flex items-center gap-1 rounded-full border border-amber-200 bg-amber-50 px-2 py-0.5 text-[10.5px] font-semibold uppercase tracking-wider text-amber-700">
        <UserX className="h-3 w-3" aria-hidden="true" />
        Unassigned
      </span>
    );
  }
  return (
    <span className="inline-flex items-center gap-1.5 rounded-full border border-slate-200 bg-white px-2 py-0.5 text-[11px] font-medium text-slate-700">
      <span
        className="inline-flex h-4 w-4 items-center justify-center rounded-full bg-slate-900 text-[8px] font-semibold text-white"
        aria-hidden="true"
      >
        {assignee.split(' ').map((p) => p[0]).slice(0, 2).join('')}
      </span>
      {assignee}
    </span>
  );
}

function CategoryTag({ category }) {
  return (
    <span className="inline-flex items-center gap-1 rounded border border-slate-200 bg-slate-50 px-1.5 py-0.5 text-[10px] font-semibold uppercase tracking-wider text-slate-600">
      <Layers className="h-2.5 w-2.5" aria-hidden="true" />
      {category}
    </span>
  );
}

/* ================================================================== */
/*  SUMMARY CARDS                                                     */
/* ================================================================== */

function SummaryCards({ metrics, onRefresh, refreshing }) {
  const cards = [
    {
      id: 'pending',
      label: 'Total Pending',
      value: metrics.pending,
      Icon: Clock,
      tone: 'amber',
    },
    {
      id: 'critical',
      label: 'Critical Priority',
      value: metrics.critical,
      Icon: ShieldAlert,
      tone: 'red',
    },
    {
      id: 'dueToday',
      label: 'Due Today',
      value: metrics.dueToday,
      Icon: AlertTriangle,
      tone: 'amber',
    },
    {
      id: 'resolvedToday',
      label: 'Resolved Today',
      value: metrics.resolvedToday,
      Icon: CheckCircle2,
      tone: 'emerald',
    },
  ];

  const toneIcon = {
    slate: 'bg-slate-100 text-slate-700',
    emerald: 'bg-emerald-50 text-emerald-600',
    amber: 'bg-amber-50 text-amber-600',
    red: 'bg-red-50 text-red-600',
  };

  return (
    <section aria-label="Review queue summary" className="flex flex-col gap-3">
      <div className="flex items-center justify-between">
        <div>
          <p className="text-[11px] font-semibold uppercase tracking-[0.15em] text-emerald-600">
            Human Review Console
          </p>
          <h1 className="mt-0.5 text-xl font-semibold tracking-tight text-slate-900 sm:text-2xl">
            Review Queue
          </h1>
          <p className="mt-0.5 text-[12.5px] text-slate-600">
            Adjudicate AI-flagged compliance cases and record the human decision
            for audit
          </p>
        </div>
        <button
          type="button"
          onClick={onRefresh}
          disabled={refreshing}
          aria-label="Refresh queue"
          className="inline-flex h-9 flex-shrink-0 items-center gap-2 rounded-md border border-slate-200 bg-white px-3 text-[12.5px] font-semibold text-slate-700 shadow-sm transition-colors hover:bg-slate-50 focus:outline-none focus-visible:ring-2 focus-visible:ring-emerald-600 focus-visible:ring-offset-1 disabled:cursor-not-allowed disabled:opacity-60"
        >
          <RefreshCw
            className={cx('h-3.5 w-3.5', refreshing ? 'animate-spin' : '')}
            aria-hidden="true"
          />
          {refreshing ? 'Refreshing…' : 'Refresh'}
        </button>
      </div>

      <ul className="grid grid-cols-2 gap-3 lg:grid-cols-4">
        {cards.map((card) => {
          const CardIcon = card.Icon;
          return (
            <li
              key={card.id}
              className="rounded-lg border border-slate-200 bg-white p-3.5 shadow-sm"
            >
              <div className="flex items-center justify-between gap-2">
                <span className="text-[11px] font-semibold uppercase tracking-wider text-slate-500">
                  {card.label}
                </span>
                <span
                  className={cx(
                    'inline-flex h-7 w-7 flex-shrink-0 items-center justify-center rounded-md',
                    toneIcon[card.tone]
                  )}
                  aria-hidden="true"
                >
                  <CardIcon className="h-3.5 w-3.5" />
                </span>
              </div>
              <p className="mt-2 text-xl font-semibold tabular-nums tracking-tight text-slate-900">
                {card.value}
              </p>
            </li>
          );
        })}
      </ul>
    </section>
  );
}

/* ================================================================== */
/*  FILTER BAR                                                        */
/* ================================================================== */

function FilterBar({
  search,
  onSearchChange,
  status,
  onStatusChange,
  priority,
  onPriorityChange,
  assignee,
  onAssigneeChange,
  onClear,
  hasActiveFilter,
  resultCount,
}) {
  return (
    <section
      aria-label="Search and filter review cases"
      className="rounded-lg border border-slate-200 bg-white p-4 shadow-sm"
    >
      <div className="grid grid-cols-1 gap-3 md:grid-cols-12">
        {/* Search */}
        <div className="md:col-span-5">
          <label
            htmlFor="review-search"
            className="mb-1.5 block text-[11px] font-semibold uppercase tracking-wider text-slate-500"
          >
            Search
          </label>
          <div className="relative">
            <span className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-3 text-slate-400">
              <Search className="h-4 w-4" aria-hidden="true" />
            </span>
            <input
              id="review-search"
              type="search"
              value={search}
              onChange={(event) => onSearchChange(event.target.value)}
              placeholder="Case ID, bidder, tender, bid, requirement, reason…"
              autoComplete="off"
              className="h-9 w-full rounded-md border border-slate-200 bg-white pl-9 pr-3 text-[13px] text-slate-900 placeholder:text-slate-400 transition-colors focus:border-emerald-600 focus:outline-none focus:ring-2 focus:ring-emerald-600/20"
            />
          </div>
        </div>

        {/* Status */}
        <div className="md:col-span-2">
          <label
            htmlFor="review-status"
            className="mb-1.5 block text-[11px] font-semibold uppercase tracking-wider text-slate-500"
          >
            Status
          </label>
          <select
            id="review-status"
            value={status}
            onChange={(event) => onStatusChange(event.target.value)}
            className="h-9 w-full cursor-pointer appearance-none rounded-md border border-slate-200 bg-white px-3 text-[13px] text-slate-900 transition-colors focus:border-emerald-600 focus:outline-none focus:ring-2 focus:ring-emerald-600/20"
          >
            {STATUS_FILTER_OPTIONS.map((opt) => (
              <option key={opt.value} value={opt.value}>
                {opt.label}
              </option>
            ))}
          </select>
        </div>

        {/* Priority */}
        <div className="md:col-span-2">
          <label
            htmlFor="review-priority"
            className="mb-1.5 block text-[11px] font-semibold uppercase tracking-wider text-slate-500"
          >
            Priority
          </label>
          <select
            id="review-priority"
            value={priority}
            onChange={(event) => onPriorityChange(event.target.value)}
            className="h-9 w-full cursor-pointer appearance-none rounded-md border border-slate-200 bg-white px-3 text-[13px] text-slate-900 transition-colors focus:border-emerald-600 focus:outline-none focus:ring-2 focus:ring-emerald-600/20"
          >
            {PRIORITY_FILTER_OPTIONS.map((opt) => (
              <option key={opt.value} value={opt.value}>
                {opt.label}
              </option>
            ))}
          </select>
        </div>

        {/* Assignee */}
        <div className="md:col-span-3">
          <label
            htmlFor="review-assignee"
            className="mb-1.5 block text-[11px] font-semibold uppercase tracking-wider text-slate-500"
          >
            Assignee
          </label>
          <select
            id="review-assignee"
            value={assignee}
            onChange={(event) => onAssigneeChange(event.target.value)}
            className="h-9 w-full cursor-pointer appearance-none rounded-md border border-slate-200 bg-white px-3 text-[13px] text-slate-900 transition-colors focus:border-emerald-600 focus:outline-none focus:ring-2 focus:ring-emerald-600/20"
          >
            <option value="all">All Reviewers</option>
            <option value="unassigned">Unassigned</option>
            {REVIEWERS.map((name) => (
              <option key={name} value={name}>
                {name}
              </option>
            ))}
          </select>
        </div>
      </div>

      <div className="mt-3 flex items-center justify-between border-t border-slate-100 pt-3">
        <p className="text-[12px] text-slate-500">
          Showing{' '}
          <span className="font-semibold text-slate-800">{resultCount}</span>{' '}
          {resultCount === 1 ? 'case' : 'cases'}
        </p>
        {hasActiveFilter ? (
          <button
            type="button"
            onClick={onClear}
            className="inline-flex h-8 items-center gap-1.5 rounded-md border border-slate-200 bg-white px-3 text-[12px] font-semibold text-slate-700 transition-colors hover:bg-slate-50 focus:outline-none focus-visible:ring-2 focus-visible:ring-emerald-600 focus-visible:ring-offset-1"
          >
            <Filter className="h-3.5 w-3.5" aria-hidden="true" />
            Clear Filters
          </button>
        ) : null}
      </div>
    </section>
  );
}

/* ================================================================== */
/*  EMPTY STATE                                                       */
/* ================================================================== */

function EmptyState({ onClear }) {
  return (
    <div className="flex flex-col items-center justify-center gap-3 rounded-lg border border-slate-200 bg-white px-6 py-14 text-center shadow-sm">
      <span
        className="inline-flex h-11 w-11 items-center justify-center rounded-md bg-slate-100 text-slate-500"
        aria-hidden="true"
      >
        <Search className="h-5 w-5" />
      </span>
      <div>
        <p className="text-[13.5px] font-semibold text-slate-800">
          No review cases match your filters
        </p>
        <p className="mt-1 text-[12px] text-slate-500">
          Try adjusting the search terms, status, priority, or assignee.
        </p>
      </div>
      <button
        type="button"
        onClick={onClear}
        className="mt-1 inline-flex h-8 items-center gap-1.5 rounded-md border border-slate-200 bg-white px-3 text-[12px] font-semibold text-slate-700 transition-colors hover:bg-slate-50 focus:outline-none focus-visible:ring-2 focus-visible:ring-emerald-600 focus-visible:ring-offset-1"
      >
        <Filter className="h-3.5 w-3.5" aria-hidden="true" />
        Clear All Filters
      </button>
    </div>
  );
}

/* ================================================================== */
/*  CASE TABLE                                                        */
/* ================================================================== */

function CaseTable({ cases, onInspect }) {
  if (cases.length === 0) return null;

  return (
    <section
      aria-label="Review cases"
      className="overflow-hidden rounded-lg border border-slate-200 bg-white shadow-sm"
    >
      {/* Desktop table */}
      <div className="hidden overflow-x-auto lg:block">
        <table className="w-full min-w-[1100px] border-collapse text-left text-[12.5px]">
          <caption className="sr-only">
            List of compliance review cases awaiting human adjudication
          </caption>
          <thead>
            <tr className="border-b border-slate-200 bg-slate-50 text-[11px] font-semibold uppercase tracking-wider text-slate-500">
              <th scope="col" className="px-5 py-2.5">Case</th>
              <th scope="col" className="px-5 py-2.5">Bidder / Bid</th>
              <th scope="col" className="px-5 py-2.5">Tender</th>
              <th scope="col" className="px-5 py-2.5">Requirement</th>
              <th scope="col" className="px-5 py-2.5">Flag Reason</th>
              <th scope="col" className="px-5 py-2.5">Priority</th>
              <th scope="col" className="px-5 py-2.5">Status</th>
              <th scope="col" className="px-5 py-2.5">Assignee</th>
              <th scope="col" className="px-5 py-2.5 text-right">Action</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100">
            {cases.map((c) => (
              <tr
                key={c.id}
                className="align-top transition-colors hover:bg-slate-50/70"
              >
                <td className="whitespace-nowrap px-5 py-3">
                  <div className="flex flex-col">
                    <span className="font-mono text-[11.5px] font-semibold text-slate-800">
                      {c.id}
                    </span>
                    <span className="mt-0.5 text-[10.5px] text-slate-500">
                      Created {c.createdAt}
                    </span>
                    {c.updatedAt !== c.createdAt ? (
                      <span className="text-[10.5px] text-slate-400">
                        Updated {c.updatedAt}
                      </span>
                    ) : null}
                  </div>
                </td>
                <td className="max-w-[220px] px-5 py-3">
                  <div className="flex flex-col">
                    <span className="line-clamp-1 font-medium text-slate-800">
                      {c.bidderName}
                    </span>
                    <span className="mt-0.5 font-mono text-[10.5px] text-slate-500">
                      {c.bidId}
                    </span>
                  </div>
                </td>
                <td className="whitespace-nowrap px-5 py-3">
                  <Link
                    to={`/tenders/${encodeURIComponent(c.tenderRef)}`}
                    className="font-mono text-[11.5px] font-semibold text-emerald-600 transition-colors hover:text-emerald-700 focus:outline-none focus-visible:underline"
                  >
                    {c.tenderRef}
                  </Link>
                </td>
                <td className="max-w-[200px] px-5 py-3">
                  <div className="flex flex-col gap-1.5">
                    <span className="line-clamp-1 text-[12px] font-medium text-slate-800">
                      {c.requirementName}
                    </span>
                    <CategoryTag category={c.requirementCategory} />
                  </div>
                </td>
                <td className="max-w-[260px] px-5 py-3 text-[11.5px] leading-relaxed text-slate-600">
                  <span className="line-clamp-2">{c.flagReason}</span>
                </td>
                <td className="whitespace-nowrap px-5 py-3">
                  <PriorityBadge priority={c.priority} />
                </td>
                <td className="whitespace-nowrap px-5 py-3">
                  <StatusBadge status={c.status} />
                </td>
                <td className="whitespace-nowrap px-5 py-3">
                  <AssigneeTag assignee={c.assignee} />
                </td>
                <td className="whitespace-nowrap px-5 py-3 text-right">
                  <button
                    type="button"
                    onClick={() => onInspect(c.id)}
                    className="inline-flex items-center gap-1 text-[12px] font-semibold text-emerald-600 transition-colors hover:text-emerald-700 focus:outline-none focus-visible:underline"
                  >
                    Inspect Case
                    <ChevronRight className="h-3.5 w-3.5" aria-hidden="true" />
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Mobile card stack */}
      <ul className="divide-y divide-slate-100 lg:hidden">
        {cases.map((c) => (
          <li key={c.id} className="flex flex-col gap-3 p-4">
            <div className="flex items-start justify-between gap-3">
              <div className="min-w-0">
                <p className="font-mono text-[11.5px] font-semibold text-slate-800">
                  {c.id}
                </p>
                <p className="mt-0.5 text-[10.5px] text-slate-500">
                  Created {c.createdAt}
                </p>
              </div>
              <PriorityBadge priority={c.priority} />
            </div>

            <div className="flex flex-col gap-1">
              <p className="text-[12.5px] font-semibold text-slate-800">
                {c.bidderName}
              </p>
              <div className="flex flex-wrap items-center gap-x-3 gap-y-1 text-[11px] text-slate-500">
                <span className="font-mono">{c.bidId}</span>
                <span aria-hidden="true">·</span>
                <Link
                  to={`/tenders/${encodeURIComponent(c.tenderRef)}`}
                  className="font-mono font-semibold text-emerald-600 hover:text-emerald-700 focus:outline-none focus-visible:underline"
                >
                  {c.tenderRef}
                </Link>
              </div>
            </div>

            <div className="flex flex-col gap-1.5">
              <p className="text-[12px] font-medium text-slate-800">
                {c.requirementName}
              </p>
              <CategoryTag category={c.requirementCategory} />
            </div>

            <p className="text-[11.5px] leading-relaxed text-slate-600">
              {c.flagReason}
            </p>

            <div className="flex flex-wrap items-center gap-2">
              <StatusBadge status={c.status} />
              <AssigneeTag assignee={c.assignee} />
            </div>

            <button
              type="button"
              onClick={() => onInspect(c.id)}
              className="inline-flex h-8 w-fit items-center gap-1 rounded-md border border-slate-200 bg-white px-3 text-[12px] font-semibold text-slate-700 transition-colors hover:bg-slate-50 focus:outline-none focus-visible:ring-2 focus-visible:ring-emerald-600 focus-visible:ring-offset-1"
            >
              Inspect Case
              <ChevronRight className="h-3.5 w-3.5" aria-hidden="true" />
            </button>
          </li>
        ))}
      </ul>
    </section>
  );
}

/* ================================================================== */
/*  INSPECTION DRAWER                                                 */
/* ================================================================== */

function InspectionDrawer({ caseRecord, onClose, onAssign, onDecide }) {
  const [assignee, setAssignee] = useState(caseRecord.assignee ?? '');
  const [decision, setDecision] = useState('');
  const [note, setNote] = useState('');
  const [noteError, setNoteError] = useState('');
  const drawerRef = useRef(null);

  useEffect(() => {
    const onKey = (event) => {
      if (event.key === 'Escape') onClose();
    };
    document.addEventListener('keydown', onKey);
    document.body.style.overflow = 'hidden';
    drawerRef.current?.focus?.();
    return () => {
      document.removeEventListener('keydown', onKey);
      document.body.style.overflow = '';
    };
  }, [onClose]);

  useEffect(() => {
    setAssignee(caseRecord.assignee ?? '');
    setDecision('');
    setNote('');
    setNoteError('');
  }, [caseRecord]);

  const band = getConfidenceBand(caseRecord.confidence);

  const decisions = [
    {
      value: 'satisfied',
      label: 'Mark Compliant',
      Icon: CheckCircle2,
      activeClass: 'border-emerald-500 bg-emerald-50 text-emerald-700 ring-2 ring-emerald-500/30',
      idleClass: 'border-slate-200 bg-white text-slate-700 hover:border-emerald-500 hover:text-emerald-700',
    },
    {
      value: 'failed',
      label: 'Mark Non-Compliant',
      Icon: XCircle,
      activeClass: 'border-red-500 bg-red-50 text-red-700 ring-2 ring-red-500/30',
      idleClass: 'border-slate-200 bg-white text-slate-700 hover:border-red-500 hover:text-red-700',
    },
    {
      value: 'review',
      label: 'Keep in Review',
      Icon: Clock,
      activeClass: 'border-amber-500 bg-amber-50 text-amber-700 ring-2 ring-amber-500/30',
      idleClass: 'border-slate-200 bg-white text-slate-700 hover:border-amber-500 hover:text-amber-700',
    },
    {
      value: 'escalated',
      label: 'Escalate',
      Icon: ShieldAlert,
      activeClass: 'border-red-500 bg-red-50 text-red-700 ring-2 ring-red-500/30',
      idleClass: 'border-slate-200 bg-white text-slate-700 hover:border-red-500 hover:text-red-700',
    },
  ];

  const handleAssignChange = useCallback(
    (value) => {
      setAssignee(value);
      if (value) onAssign(caseRecord.id, value);
    },
    [caseRecord.id, onAssign]
  );

  const handleSubmit = useCallback(
    (event) => {
      event.preventDefault();

      if (!decision) {
        setNoteError('Select a decision before submitting.');
        return;
      }
      if (note.trim().length < 10) {
        setNoteError('Reviewer note is required and must be at least 10 characters.');
        return;
      }

      setNoteError('');
      onDecide(caseRecord.id, { decision, note: note.trim() });
      setNote('');
      setDecision('');
    },
    [decision, note, caseRecord.id, onDecide]
  );

  return (
    <div className="fixed inset-0 z-50 flex">
      <div
        className="flex-1 bg-slate-900/50 backdrop-blur-sm"
        onClick={onClose}
        aria-hidden="true"
      />

      <aside
        ref={drawerRef}
        role="dialog"
        aria-modal="true"
        aria-labelledby="inspection-drawer-title"
        tabIndex={-1}
        className="flex h-full w-full max-w-2xl flex-col bg-white shadow-2xl focus:outline-none"
      >
        {/* Header */}
        <header className="flex items-start justify-between gap-3 border-b border-slate-200 p-5">
          <div className="min-w-0">
            <div className="mb-2 flex flex-wrap items-center gap-2">
              <span className="font-mono text-[11.5px] font-semibold text-slate-500">
                {caseRecord.id}
              </span>
              <StatusBadge status={caseRecord.status} />
              <PriorityBadge priority={caseRecord.priority} />
            </div>
            <h2
              id="inspection-drawer-title"
              className="text-[15px] font-semibold leading-tight text-slate-900"
            >
              {caseRecord.bidderName}
            </h2>
            <div className="mt-1.5 flex flex-wrap items-center gap-x-3 gap-y-1 text-[11.5px] text-slate-600">
              <span className="inline-flex items-center gap-1.5">
                <FileText className="h-3 w-3 text-slate-400" aria-hidden="true" />
                <span className="font-mono">{caseRecord.bidId}</span>
              </span>
              <span aria-hidden="true" className="text-slate-300">·</span>
              <span className="inline-flex items-center gap-1.5">
                <Layers className="h-3 w-3 text-slate-400" aria-hidden="true" />
                <Link
                  to={`/tenders/${encodeURIComponent(caseRecord.tenderRef)}`}
                  className="font-mono font-semibold text-emerald-600 hover:text-emerald-700 focus:outline-none focus-visible:underline"
                >
                  {caseRecord.tenderRef}
                </Link>
              </span>
            </div>
          </div>
          <button
            type="button"
            onClick={onClose}
            aria-label="Close case inspection"
            className="inline-flex h-8 w-8 flex-shrink-0 items-center justify-center rounded-md text-slate-500 transition-colors hover:bg-slate-100 hover:text-slate-800 focus:outline-none focus-visible:ring-2 focus-visible:ring-emerald-600 focus-visible:ring-offset-1"
          >
            <X className="h-4 w-4" aria-hidden="true" />
          </button>
        </header>

        {/* Body */}
        <div className="flex-1 overflow-y-auto p-5">
          {/* Requirement & flag reason */}
          <section aria-labelledby="req-section" className="mb-5">
            <h3
              id="req-section"
              className="mb-2 text-[11px] font-semibold uppercase tracking-wider text-slate-500"
            >
              Target Requirement
            </h3>
            <div className="rounded-md border border-slate-200 bg-slate-50 p-3">
              <div className="flex flex-wrap items-center gap-2">
                <p className="text-[12.5px] font-semibold text-slate-800">
                  {caseRecord.requirementName}
                </p>
                <CategoryTag category={caseRecord.requirementCategory} />
              </div>
              <p className="mt-2 text-[11.5px] leading-relaxed text-slate-600">
                <span className="font-semibold text-slate-700">
                  Flag Reason:{' '}
                </span>
                {caseRecord.flagReason}
              </p>
            </div>
          </section>

          {/* Evidence vs expected */}
          <section aria-labelledby="evidence-section" className="mb-5">
            <h3
              id="evidence-section"
              className="mb-2 text-[11px] font-semibold uppercase tracking-wider text-slate-500"
            >
              Evidence vs Expected
            </h3>

            <div className="mb-3 flex items-center justify-between gap-3 rounded-md border border-slate-200 bg-white p-3">
              <div className="flex min-w-0 items-center gap-2">
                <FileText
                  className="h-4 w-4 flex-shrink-0 text-slate-500"
                  aria-hidden="true"
                />
                <div className="min-w-0">
                  <p className="truncate text-[12.5px] font-medium text-slate-800">
                    {caseRecord.evidence.fileName}
                  </p>
                  <p className="mt-0.5 text-[11px] text-slate-500">
                    {caseRecord.evidence.fileSize} · Uploaded{' '}
                    {caseRecord.evidence.uploadedAt}
                  </p>
                </div>
              </div>
              <button
                type="button"
                className="inline-flex h-7 flex-shrink-0 items-center gap-1 rounded-md border border-slate-200 bg-white px-2.5 text-[11.5px] font-semibold text-slate-700 transition-colors hover:bg-slate-50 focus:outline-none focus-visible:ring-2 focus-visible:ring-emerald-600 focus-visible:ring-offset-1"
              >
                <ExternalLink className="h-3 w-3" aria-hidden="true" />
                Preview
              </button>
            </div>

            <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
              <div className="rounded-md border border-slate-200 bg-white p-3">
                <p className="text-[10.5px] font-semibold uppercase tracking-wider text-slate-500">
                  Extracted Value
                </p>
                <p className="mt-1.5 text-[12px] leading-relaxed text-slate-700">
                  {caseRecord.extractedValue}
                </p>
              </div>
              <div className="rounded-md border border-slate-200 bg-white p-3">
                <p className="text-[10.5px] font-semibold uppercase tracking-wider text-slate-500">
                  Expected Requirement
                </p>
                <p className="mt-1.5 text-[12px] leading-relaxed text-slate-700">
                  {caseRecord.expectedValue}
                </p>
              </div>
            </div>

            <div className="mt-3 flex items-start gap-2 rounded-md border border-amber-200 bg-amber-50 p-3">
              <AlertTriangle
                className="mt-0.5 h-3.5 w-3.5 flex-shrink-0 text-amber-600"
                aria-hidden="true"
              />
              <p className="text-[11.5px] leading-relaxed text-amber-800">
                <span className="font-semibold">Mismatch / Uncertainty: </span>
                {caseRecord.mismatchNote}
              </p>
            </div>
          </section>

          {/* AI Decision support */}
          <section aria-labelledby="ai-section" className="mb-5">
            <div className="mb-2 flex items-center gap-2">
              <span
                className="inline-flex h-6 w-6 items-center justify-center rounded-md bg-emerald-50 text-emerald-600"
                aria-hidden="true"
              >
                <ShieldAlert className="h-3.5 w-3.5" />
              </span>
              <h3
                id="ai-section"
                className="text-[11px] font-semibold uppercase tracking-wider text-slate-500"
              >
                AI Decision-Support Signal
              </h3>
            </div>

            <div className="flex flex-col gap-3 rounded-md border border-slate-200 bg-slate-50 p-3">
              <div>
                <p className="text-[10.5px] font-semibold uppercase tracking-wider text-slate-500">
                  Explanation
                </p>
                <p className="mt-1 text-[12px] leading-relaxed text-slate-700">
                  {caseRecord.aiExplanation}
                </p>
              </div>

              <div>
                <div className="flex items-center justify-between text-[10.5px] font-semibold">
                  <span className="uppercase tracking-wider text-slate-500">
                    Confidence Score
                  </span>
                  <span className={cx('tabular-nums', band.className)}>
                    {band.label} · {caseRecord.confidence}%
                  </span>
                </div>
                <div
                  role="progressbar"
                  aria-valuenow={caseRecord.confidence}
                  aria-valuemin={0}
                  aria-valuemax={100}
                  aria-label={`AI confidence ${caseRecord.confidence} percent`}
                  className="mt-1.5 h-1.5 w-full overflow-hidden rounded-full bg-slate-200"
                >
                  <div
                    style={{ width: `${caseRecord.confidence}%` }}
                    className={cx('h-full rounded-full', band.bar)}
                  />
                </div>
              </div>

              <div className="rounded-md border border-emerald-200 bg-emerald-50/70 p-3">
                <p className="text-[10.5px] font-semibold uppercase tracking-wider text-emerald-700">
                  Recommended Action
                </p>
                <p className="mt-1 text-[12px] leading-relaxed text-emerald-800">
                  {caseRecord.recommendedAction}
                </p>
              </div>

              <p className="flex items-start gap-1.5 text-[11px] leading-relaxed text-slate-500">
                <Info className="mt-0.5 h-3 w-3 flex-shrink-0" aria-hidden="true" />
                AI confidence and reasoning are decision-support signals, not
                legally binding determinations. Human adjudication required.
              </p>
            </div>
          </section>

          {/* Assignee selector */}
          <section aria-labelledby="assign-section" className="mb-5">
            <h3
              id="assign-section"
              className="mb-2 text-[11px] font-semibold uppercase tracking-wider text-slate-500"
            >
              Assign Auditor
            </h3>
            <select
              value={assignee}
              onChange={(event) => handleAssignChange(event.target.value)}
              className="h-9 w-full cursor-pointer appearance-none rounded-md border border-slate-200 bg-white px-3 text-[13px] text-slate-900 transition-colors focus:border-emerald-600 focus:outline-none focus:ring-2 focus:ring-emerald-600/20"
            >
              <option value="">Unassigned</option>
              {REVIEWERS.map((name) => (
                <option key={name} value={name}>
                  {name}
                </option>
              ))}
            </select>
          </section>

          {/* Decision form */}
          <section aria-labelledby="decision-section" className="mb-5">
            <h3
              id="decision-section"
              className="mb-2 text-[11px] font-semibold uppercase tracking-wider text-slate-500"
            >
              Reviewer Decision
            </h3>
            <form onSubmit={handleSubmit} className="flex flex-col gap-3">
              <div className="grid grid-cols-1 gap-2 sm:grid-cols-2">
                {decisions.map((opt) => {
                  const DecisionIcon = opt.Icon;
                  const isActive = decision === opt.value;
                  return (
                    <label
                      key={opt.value}
                      className={cx(
                        'flex cursor-pointer items-center justify-center gap-2 rounded-md border px-3 py-2.5 text-[12.5px] font-semibold transition-colors focus-within:ring-2 focus-within:ring-emerald-600 focus-within:ring-offset-1',
                        isActive ? opt.activeClass : opt.idleClass
                      )}
                    >
                      <input
                        type="radio"
                        name={`decision-${caseRecord.id}`}
                        value={opt.value}
                        checked={isActive}
                        onChange={(event) => setDecision(event.target.value)}
                        className="sr-only"
                      />
                      <DecisionIcon className="h-3.5 w-3.5" aria-hidden="true" />
                      {opt.label}
                    </label>
                  );
                })}
              </div>

              <div>
                <label
                  htmlFor={`note-${caseRecord.id}`}
                  className="mb-1.5 block text-[10.5px] font-semibold uppercase tracking-wider text-slate-500"
                >
                  Reviewer Note (required)
                </label>
                <textarea
                  id={`note-${caseRecord.id}`}
                  value={note}
                  onChange={(event) => {
                    setNote(event.target.value);
                    if (noteError) setNoteError('');
                  }}
                  rows={3}
                  placeholder="Explain the decision — this is recorded in the audit trail."
                  aria-invalid={Boolean(noteError)}
                  aria-describedby={noteError ? `note-error-${caseRecord.id}` : undefined}
                  className={cx(
                    'w-full rounded-md border bg-white px-3 py-2 text-[12.5px] leading-relaxed text-slate-900 placeholder:text-slate-400 transition-colors focus:outline-none focus:ring-2',
                    noteError
                      ? 'border-red-200 focus:border-red-600 focus:ring-red-600/20'
                      : 'border-slate-200 focus:border-emerald-600 focus:ring-emerald-600/20'
                  )}
                />
                {noteError ? (
                  <p
                    id={`note-error-${caseRecord.id}`}
                    role="alert"
                    className="mt-1.5 flex items-center gap-1.5 text-[11.5px] font-medium text-red-600"
                  >
                    <AlertTriangle className="h-3.5 w-3.5 flex-shrink-0" aria-hidden="true" />
                    {noteError}
                  </p>
                ) : null}
              </div>

              <button
                type="submit"
                className="inline-flex h-9 w-fit items-center gap-1.5 rounded-md bg-emerald-600 px-3.5 text-[12.5px] font-semibold text-white shadow-sm transition-colors hover:bg-emerald-700 focus:outline-none focus-visible:ring-2 focus-visible:ring-emerald-600 focus-visible:ring-offset-2"
              >
                <CheckCircle2 className="h-3.5 w-3.5" aria-hidden="true" />
                Submit Decision
              </button>
            </form>
          </section>

          {/* Audit trail */}
          <section aria-labelledby="audit-section">
            <h3
              id="audit-section"
              className="mb-2 text-[11px] font-semibold uppercase tracking-wider text-slate-500"
            >
              Audit Trail
            </h3>
            <ol className="flex flex-col">
              {caseRecord.auditTrail
                .slice()
                .reverse()
                .map((event, index, arr) => {
                  const tone = AUDIT_TONE[event.type] ?? AUDIT_TONE.info;
                  const EventIcon = tone.Icon;
                  const isLast = index === arr.length - 1;
                  return (
                    <li key={event.id} className="relative flex items-start gap-3">
                      {!isLast ? (
                        <span
                          className="absolute left-[13px] top-7 h-[calc(100%-8px)] w-0.5 bg-slate-200"
                          aria-hidden="true"
                        />
                      ) : null}
                      <span
                        className={cx(
                          'relative z-10 inline-flex h-7 w-7 flex-shrink-0 items-center justify-center rounded-full',
                          tone.iconBg
                        )}
                        aria-hidden="true"
                      >
                        <EventIcon className="h-3.5 w-3.5" />
                      </span>
                      <div className="flex min-w-0 flex-1 flex-col gap-0.5 pb-4">
                        <p className="text-[12px] font-semibold text-slate-800">
                          {event.event}
                        </p>
                        <p className="text-[11px] text-slate-500">
                          {event.actor}
                        </p>
                        <p className="flex items-center gap-1 text-[10.5px] text-slate-400">
                          <Clock className="h-3 w-3" aria-hidden="true" />
                          {event.timestamp}
                        </p>
                      </div>
                    </li>
                  );
                })}
            </ol>
          </section>
        </div>

        {/* Footer */}
        <footer className="flex items-center justify-end gap-2 border-t border-slate-200 bg-slate-50 p-4">
          <button
            type="button"
            onClick={onClose}
            className="inline-flex h-9 items-center rounded-md border border-slate-200 bg-white px-3.5 text-[12.5px] font-semibold text-slate-700 transition-colors hover:bg-slate-50 focus:outline-none focus-visible:ring-2 focus-visible:ring-emerald-600 focus-visible:ring-offset-1"
          >
            Close
          </button>
        </footer>
      </aside>
    </div>
  );
}

/* ================================================================== */
/*  PAGE                                                              */
/* ================================================================== */

export default function ReviewCases() {
  const [searchParams] = useSearchParams();

  const [cases, setCases] = useState(() => INITIAL_CASES.map((c) => ({ ...c })));
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [priorityFilter, setPriorityFilter] = useState('all');
  const [assigneeFilter, setAssigneeFilter] = useState('all');
  const [inspectingId, setInspectingId] = useState(null);
  const [toast, setToast] = useState(null);
  const [refreshing, setRefreshing] = useState(false);

  /* ---------------- Handle ?bid= query param ---------------- */
  useEffect(() => {
    const bidParam = searchParams.get('bid');
    if (!bidParam) return;
    const matched = INITIAL_CASES.find((c) => c.bidId === bidParam);
    if (matched) setInspectingId(matched.id);
  }, [searchParams]);

  /* ---------------- Toast auto-dismiss ---------------- */
  useEffect(() => {
    if (!toast) return;
    const timeout = setTimeout(() => setToast(null), 2800);
    return () => clearTimeout(timeout);
  }, [toast]);

  /* ---------------- Dynamic metrics ---------------- */
  const metrics = useMemo(() => {
    return cases.reduce(
      (acc, c) => {
        if (c.status === 'pending' || c.status === 'in-review') {
          acc.pending += 1;
        }
        if (c.priority === 'critical' || c.priority === 'high') {
          if (c.status === 'pending' || c.status === 'in-review') {
            acc.critical += 1;
          }
        }
        if (c.dueToday && c.status !== 'resolved') acc.dueToday += 1;
        if (c.resolvedToday && c.status === 'resolved') acc.resolvedToday += 1;
        return acc;
      },
      { pending: 0, critical: 0, dueToday: 0, resolvedToday: 0 }
    );
  }, [cases]);

  /* ---------------- Filtering pipeline ---------------- */
  const filtered = useMemo(() => {
    const q = search.trim().toLowerCase();
    return cases.filter((c) => {
      const matchesSearch =
        q === '' ||
        c.id.toLowerCase().includes(q) ||
        c.bidderName.toLowerCase().includes(q) ||
        c.bidId.toLowerCase().includes(q) ||
        c.tenderRef.toLowerCase().includes(q) ||
        c.requirementName.toLowerCase().includes(q) ||
        c.flagReason.toLowerCase().includes(q);

      const matchesStatus =
        statusFilter === 'all' || c.status === statusFilter;

      const matchesPriority =
        priorityFilter === 'all' || c.priority === priorityFilter;

      const matchesAssignee =
        assigneeFilter === 'all' ||
        (assigneeFilter === 'unassigned' && !c.assignee) ||
        c.assignee === assigneeFilter;

      return matchesSearch && matchesStatus && matchesPriority && matchesAssignee;
    });
  }, [cases, search, statusFilter, priorityFilter, assigneeFilter]);

  const hasActiveFilter =
    search.trim() !== '' ||
    statusFilter !== 'all' ||
    priorityFilter !== 'all' ||
    assigneeFilter !== 'all';

  /* ---------------- Handlers ---------------- */
  const handleClearFilters = useCallback(() => {
    setSearch('');
    setStatusFilter('all');
    setPriorityFilter('all');
    setAssigneeFilter('all');
  }, []);

  const handleRefresh = useCallback(async () => {
    setRefreshing(true);
    await new Promise((resolve) => setTimeout(resolve, 700));
    setRefreshing(false);
    setToast({ type: 'success', message: 'Review queue refreshed.' });
  }, []);

  const handleAssign = useCallback((caseId, assigneeName) => {
    setCases((prev) =>
      prev.map((c) =>
        c.id === caseId
          ? {
              ...c,
              assignee: assigneeName || null,
              status: c.status === 'pending' && assigneeName ? 'in-review' : c.status,
              updatedAt: formatTimestampNow(),
              auditTrail: [
                ...c.auditTrail,
                {
                  id: `a-${Date.now()}`,
                  event: assigneeName
                    ? `Assigned to ${assigneeName}`
                    : 'Unassigned',
                  actor: 'Reviewer — Manual action',
                  timestamp: formatTimestampNow(),
                  type: 'info',
                },
              ],
            }
          : c
      )
    );
  }, []);

  const handleDecision = useCallback((caseId, { decision, note }) => {
    setCases((prev) =>
      prev.map((c) => {
        if (c.id !== caseId) return c;

        const nextStatus =
          decision === 'satisfied'
            ? 'resolved'
            : decision === 'failed'
            ? 'resolved'
            : decision === 'escalated'
            ? 'escalated'
            : 'in-review';

        const decisionLabel =
          decision === 'satisfied'
            ? 'Marked as Compliant'
            : decision === 'failed'
            ? 'Marked as Non-Compliant'
            : decision === 'escalated'
            ? 'Escalated for Senior Review'
            : 'Kept in Review';

        const decisionTone =
          decision === 'satisfied'
            ? 'success'
            : decision === 'failed'
            ? 'error'
            : decision === 'escalated'
            ? 'error'
            : 'warning';

        const now = formatTimestampNow();

        return {
          ...c,
          status: nextStatus,
          updatedAt: now,
          resolvedToday: nextStatus === 'resolved',
          auditTrail: [
            ...c.auditTrail,
            {
              id: `a-${Date.now()}-decision`,
              event: `Human Decision — ${decisionLabel}`,
              actor: `Reviewer — ${c.assignee ?? 'Current User'}`,
              timestamp: now,
              type: decisionTone,
            },
            {
              id: `a-${Date.now()}-note`,
              event: `Reviewer Note: ${note}`,
              actor: `Reviewer — ${c.assignee ?? 'Current User'}`,
              timestamp: now,
              type: 'info',
            },
          ],
        };
      })
    );

    setToast({
      type: 'success',
      message: 'Decision recorded. Case updated and audit trail appended.',
    });
  }, []);

  const handleInspect = useCallback((caseId) => {
    setInspectingId(caseId);
  }, []);

  const handleCloseDrawer = useCallback(() => {
    setInspectingId(null);
  }, []);

  const inspectingCase = inspectingId
    ? cases.find((c) => c.id === inspectingId) ?? null
    : null;

  return (
    <div className="flex flex-col gap-5">
      {/* Toast */}
      {toast ? (
        <div
          role="status"
          aria-live="polite"
          className="fixed bottom-5 right-5 z-[60] flex max-w-sm items-start gap-2.5 rounded-md border border-emerald-200 bg-emerald-50 px-3 py-2.5 text-[12.5px] text-emerald-700 shadow-lg"
        >
          <CheckCircle2
            className="mt-0.5 h-4 w-4 flex-shrink-0"
            aria-hidden="true"
          />
          <span>{toast.message}</span>
        </div>
      ) : null}

      {/* Summary cards + header */}
      <SummaryCards
        metrics={metrics}
        onRefresh={handleRefresh}
        refreshing={refreshing}
      />

      {/* Filter bar */}
      <FilterBar
        search={search}
        onSearchChange={setSearch}
        status={statusFilter}
        onStatusChange={setStatusFilter}
        priority={priorityFilter}
        onPriorityChange={setPriorityFilter}
        assignee={assigneeFilter}
        onAssigneeChange={setAssigneeFilter}
        onClear={handleClearFilters}
        hasActiveFilter={hasActiveFilter}
        resultCount={filtered.length}
      />

      {/* Cases table or empty state */}
      {filtered.length === 0 ? (
        <EmptyState onClear={handleClearFilters} />
      ) : (
        <CaseTable cases={filtered} onInspect={handleInspect} />
      )}

      {/* Inspection drawer */}
      {inspectingCase ? (
        <InspectionDrawer
          caseRecord={inspectingCase}
          onClose={handleCloseDrawer}
          onAssign={handleAssign}
          onDecide={handleDecision}
        />
      ) : null}
    </div>
  );
}