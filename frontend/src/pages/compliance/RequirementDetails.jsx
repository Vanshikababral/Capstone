import { useCallback, useEffect, useMemo, useState } from 'react';
import { Link, useParams } from 'react-router-dom';
import {
  ArrowLeft,
  FileText,
  CheckCircle2,
  XCircle,
  AlertTriangle,
  ShieldCheck,
  ShieldAlert,
  Brain,
  Clock,
  UserCheck,
  Download,
  Eye,
  Edit3,
  ExternalLink,
  Info,
  Layers,
  X,
  ChevronRight,
} from 'lucide-react';

/* ================================================================== */
/*  MOCK DATA                                                         */
/* ================================================================== */

const REQUIREMENT_REGISTRY = {
  'REQ-GST-001': {
    id: 'REQ-GST-001',
    name: 'GST Registration Certificate',
    category: 'Tax Compliance',
    mandatory: true,
    status: 'review',
    confidence: 68,
    verificationMethod: 'AI-Assisted Extraction + Rule Check',
    tenderRef: 'TNDR-2026-0142',
    tenderTitle: 'Supply & Installation of Solar Micro-Grids',
    tenderOrganization: 'Ministry of New & Renewable Energy',
    bidId: 'BID-2026-0087',
    bidderName: 'Aarav Infrastructure Solutions Pvt. Ltd.',
    bidderContact: 'Vikram Mehta',
    submittedAt: '2026-01-08 14:22 IST',
    requirementDescription:
      'Bidder must submit a valid GST Registration Certificate with an active GSTIN that has a minimum of three (3) consecutive years of filing history. The GSTIN must be registered in the state where the bidder\'s primary operations are located, as declared in the bidder profile within the GeM portal.',
    expectedEvidence:
      'Original GST Registration Certificate (Form REG-06 or equivalent) issued by the Central Board of Indirect Taxes and Customs, clearly displaying GSTIN, legal name, registration date, and registered state jurisdiction.',
    document: {
      name: 'GST_Registration_AISPL.pdf',
      format: 'PDF',
      size: '428 KB',
      uploadedAt: '2026-01-08 14:10 IST',
      pages: 2,
    },
    extractedFields: [
      {
        id: 'field-gstin',
        label: 'GSTIN',
        value: '07AAACA1234B1Z5',
        confidence: 92,
      },
      {
        id: 'field-legalname',
        label: 'Legal Name',
        value: 'Aarav Infrastructure Solutions Pvt. Ltd.',
        confidence: 96,
      },
      {
        id: 'field-regdate',
        label: 'Registration Date',
        value: '12-Mar-2019',
        confidence: 94,
      },
      {
        id: 'field-status',
        label: 'Status',
        value: 'Active',
        confidence: 91,
      },
      {
        id: 'field-state',
        label: 'Registered State',
        value: 'Delhi (State Code 07)',
        confidence: 64,
      },
      {
        id: 'field-doc-type',
        label: 'Document Type',
        value: 'Form REG-06',
        confidence: 88,
      },
    ],
    comparison: [
      {
        id: 'cmp-1',
        criterion: 'Valid GSTIN Format (15 characters)',
        expected: 'Pattern: 2-digit state + 10-char PAN + 1-digit entity + Z + 1-char checksum',
        observed: '07AAACA1234B1Z5',
        verdict: 'match',
      },
      {
        id: 'cmp-2',
        criterion: 'Active Registration Status',
        expected: 'Active (not cancelled, not suspended)',
        observed: 'Active (as on 08-Jan-2026)',
        verdict: 'match',
      },
      {
        id: 'cmp-3',
        criterion: 'Minimum 3 Years Filing History',
        expected: 'Registration date on or before 08-Jan-2023',
        observed: 'Registered 12-Mar-2019 (6+ years)',
        verdict: 'match',
      },
      {
        id: 'cmp-4',
        criterion: 'State Jurisdiction Match',
        expected: 'Registered in state of primary operations — per GeM profile: Delhi (07)',
        observed: 'State code 07 detected but could be 09 (Uttar Pradesh) — OCR ambiguity on digit',
        verdict: 'ambiguous',
      },
      {
        id: 'cmp-5',
        criterion: 'Legal Name Match',
        expected: 'Aarav Infrastructure Solutions Pvt. Ltd.',
        observed: 'Aarav Infrastructure Solutions Pvt. Ltd.',
        verdict: 'match',
      },
    ],
    ruleChecks: [
      {
        id: 'rule-1',
        label: 'GSTIN format validation against CBIC pattern',
        status: 'passed',
        detail: '15-character structure validated — all segments conform to standard.',
      },
      {
        id: 'rule-2',
        label: 'Registration status = Active',
        status: 'passed',
        detail: 'Certificate displays "Active" status with no cancellation markers.',
      },
      {
        id: 'rule-3',
        label: 'Minimum 3-year filing window',
        status: 'passed',
        detail: 'Registration date 12-Mar-2019 exceeds the 3-year minimum threshold.',
      },
      {
        id: 'rule-4',
        label: 'State jurisdiction cross-verification',
        status: 'ambiguous',
        detail:
          'First two digits of GSTIN appear to be "07" (Delhi) but OCR confidence on digit 2 is low (64%). Possible "09" (Uttar Pradesh) misread.',
      },
      {
        id: 'rule-5',
        label: 'Bidder name matches PAN registry',
        status: 'passed',
        detail: 'Extracted legal name matches PAN-linked registered name field.',
      },
      {
        id: 'rule-6',
        label: 'Certificate freshness (issued within bid window)',
        status: 'passed',
        detail: 'Certificate carries digital signature dated 08-Jan-2026.',
      },
    ],
    aiReasoning: {
      finding:
        'GST registration certificate submitted. 5 of 6 rule checks passed. One ambiguous signal detected in state jurisdiction code.',
      evidence:
        'Source: GST_Registration_AISPL.pdf — Page 1, top-right registration block, GSTIN field.',
      reasoning:
        'The GSTIN format, registration status, minimum filing window, and legal name all conform to requirements. However, the second digit of the GSTIN state code exhibits low OCR confidence (64%). The text is scanned in a low-resolution region of the PDF and the digit shape is consistent with both "7" and "9", corresponding to Delhi and Uttar Pradesh respectively. Manual confirmation is required to determine if the bidder\'s registered GST state matches the Delhi (07) state declared in their GeM profile.',
      recommendedAction:
        'Verify state jurisdiction code manually against the GeM portal vendor profile. If the digit is confirmed as "7", mark the requirement as Satisfied. If it is "9", escalate for a mismatch review under Clause 3.1.',
    },
    auditTrail: [
      {
        id: 'audit-1',
        event: 'Document Uploaded',
        actor: 'Bidder — Vikram Mehta',
        timestamp: '2026-01-08 14:10 IST',
        type: 'info',
      },
      {
        id: 'audit-2',
        event: 'Fields Extracted by AI Engine',
        actor: 'System — Document Intelligence v2.4',
        timestamp: '2026-01-09 09:38 IST',
        type: 'info',
      },
      {
        id: 'audit-3',
        event: 'Automated Rule Checks Completed',
        actor: 'System — Compliance Rule Engine',
        timestamp: '2026-01-09 09:40 IST',
        type: 'info',
      },
      {
        id: 'audit-4',
        event: 'Flagged for Human Review — State jurisdiction ambiguity',
        actor: 'System — Confidence threshold trigger',
        timestamp: '2026-01-09 09:41 IST',
        type: 'warning',
      },
    ],
  },
  'REQ-ITR-004': {
    id: 'REQ-ITR-004',
    name: 'Income Tax Returns (FY22, FY23, FY24)',
    category: 'Tax Compliance',
    mandatory: true,
    status: 'review',
    confidence: 72,
    verificationMethod: 'AI-Assisted Extraction + Rule Check',
    tenderRef: 'TNDR-2026-0142',
    tenderTitle: 'Supply & Installation of Solar Micro-Grids',
    tenderOrganization: 'Ministry of New & Renewable Energy',
    bidId: 'BID-2026-0087',
    bidderName: 'Aarav Infrastructure Solutions Pvt. Ltd.',
    bidderContact: 'Vikram Mehta',
    submittedAt: '2026-01-08 14:24 IST',
    requirementDescription:
      'Bidder must submit Income Tax Return acknowledgements for the last three consecutive financial years (FY22, FY23, FY24) with valid e-filing acknowledgment numbers and matching PAN.',
    expectedEvidence:
      'ITR-V acknowledgment forms issued by the Income Tax Department for FY 2021-22, FY 2022-23, and FY 2023-24.',
    document: {
      name: 'ITR_FY22-24_Combined.pdf',
      format: 'PDF',
      size: '2.8 MB',
      uploadedAt: '2026-01-08 14:24 IST',
      pages: 9,
    },
    extractedFields: [
      {
        id: 'field-pan',
        label: 'PAN',
        value: 'AAACA1234B',
        confidence: 95,
      },
      {
        id: 'field-fy22',
        label: 'FY 2021-22 Acknowledgement',
        value: 'ACK-2201456789 (filed 18-Jul-2022)',
        confidence: 93,
      },
      {
        id: 'field-fy23',
        label: 'FY 2022-23 Acknowledgement',
        value: 'ACK number partially illegible',
        confidence: 51,
      },
      {
        id: 'field-fy24',
        label: 'FY 2023-24 Acknowledgement',
        value: 'ACK-2401789012 (filed 22-Jul-2024)',
        confidence: 94,
      },
      {
        id: 'field-name',
        label: 'Name on ITR',
        value: 'Aarav Infrastructure Solutions Pvt. Ltd.',
        confidence: 96,
      },
    ],
    comparison: [
      {
        id: 'cmp-1',
        criterion: 'FY 2021-22 ITR Acknowledgement',
        expected: 'Valid acknowledgment for FY22',
        observed: 'ACK-2201456789 (filed 18-Jul-2022)',
        verdict: 'match',
      },
      {
        id: 'cmp-2',
        criterion: 'FY 2022-23 ITR Acknowledgement',
        expected: 'Valid acknowledgment for FY23',
        observed: 'Acknowledgment page partially illegible — ACK number unreadable',
        verdict: 'ambiguous',
      },
      {
        id: 'cmp-3',
        criterion: 'FY 2023-24 ITR Acknowledgement',
        expected: 'Valid acknowledgment for FY24',
        observed: 'ACK-2401789012 (filed 22-Jul-2024)',
        verdict: 'match',
      },
      {
        id: 'cmp-4',
        criterion: 'PAN consistency across filings',
        expected: 'Same PAN across all 3 years',
        observed: 'AAACA1234B — consistent across legible years',
        verdict: 'match',
      },
    ],
    ruleChecks: [
      {
        id: 'rule-1',
        label: 'FY22 ITR acknowledgment present and valid',
        status: 'passed',
        detail: 'ACK-2201456789 verified, filing date within statutory window.',
      },
      {
        id: 'rule-2',
        label: 'FY23 ITR acknowledgment present and valid',
        status: 'ambiguous',
        detail:
          'Page 4 of the combined PDF shows severe scan artifacts. ACK number region is illegible.',
      },
      {
        id: 'rule-3',
        label: 'FY24 ITR acknowledgment present and valid',
        status: 'passed',
        detail: 'ACK-2401789012 verified, filing date within statutory window.',
      },
      {
        id: 'rule-4',
        label: 'PAN consistency across all acknowledgments',
        status: 'passed',
        detail: 'PAN AAACA1234B consistent across legible years.',
      },
    ],
    aiReasoning: {
      finding:
        'Combined ITR PDF submitted with 3 acknowledgments. FY22 and FY24 fully validated. FY23 acknowledgment region illegible.',
      evidence:
        'Source: ITR_FY22-24_Combined.pdf — Page 4 (FY23 section), acknowledgment number block.',
      reasoning:
        'The bidder has submitted ITR acknowledgements for all three required financial years. Automated extraction successfully parsed FY22 and FY24 acknowledgment numbers and cross-validated the PAN. Page 4, corresponding to FY23, exhibits scan artifacts that render the acknowledgment number unreadable — approximately 60% of the number region is obscured. PAN consistency and filing cadence suggest the FY23 filing is legitimate, but the number cannot be confirmed without a manual review.',
      recommendedAction:
        'Send to human reviewer for manual verification of FY23 filing reference against the Income Tax Department\'s e-filing portal or request a clearer copy from the bidder.',
    },
    auditTrail: [
      {
        id: 'audit-1',
        event: 'Document Uploaded',
        actor: 'Bidder — Vikram Mehta',
        timestamp: '2026-01-08 14:24 IST',
        type: 'info',
      },
      {
        id: 'audit-2',
        event: 'Fields Extracted by AI Engine',
        actor: 'System — Document Intelligence v2.4',
        timestamp: '2026-01-09 09:39 IST',
        type: 'info',
      },
      {
        id: 'audit-3',
        event: 'Automated Rule Checks Completed',
        actor: 'System — Compliance Rule Engine',
        timestamp: '2026-01-09 09:40 IST',
        type: 'info',
      },
      {
        id: 'audit-4',
        event: 'Flagged for Human Review — Illegible FY23 acknowledgment',
        actor: 'System — Confidence threshold trigger',
        timestamp: '2026-01-09 09:41 IST',
        type: 'warning',
      },
    ],
  },
};

/* ================================================================== */
/*  CONFIG MAPS                                                       */
/* ================================================================== */

const STATUS_CONFIG = {
  satisfied: {
    label: 'Satisfied',
    className: 'bg-emerald-50 text-emerald-700 border-emerald-200',
    Icon: CheckCircle2,
    text: 'text-emerald-600',
  },
  failed: {
    label: 'Failed',
    className: 'bg-red-50 text-red-700 border-red-200',
    Icon: XCircle,
    text: 'text-red-600',
  },
  review: {
    label: 'Requires Review',
    className: 'bg-amber-50 text-amber-700 border-amber-200',
    Icon: AlertTriangle,
    text: 'text-amber-600',
  },
  'not-submitted': {
    label: 'Not Submitted',
    className: 'bg-slate-100 text-slate-700 border-slate-300',
    Icon: AlertTriangle,
    text: 'text-slate-600',
  },
};

const VERDICT_CONFIG = {
  match: {
    label: 'MATCH',
    className: 'bg-emerald-50 text-emerald-700 border-emerald-200',
    rowTone: 'border-emerald-200 bg-emerald-50/40',
    Icon: CheckCircle2,
  },
  mismatch: {
    label: 'MISMATCH',
    className: 'bg-red-50 text-red-700 border-red-200',
    rowTone: 'border-red-200 bg-red-50/40',
    Icon: XCircle,
  },
  ambiguous: {
    label: 'AMBIGUOUS',
    className: 'bg-amber-50 text-amber-700 border-amber-200',
    rowTone: 'border-amber-200 bg-amber-50/40',
    Icon: AlertTriangle,
  },
};

const RULE_STATUS_CONFIG = {
  passed: {
    label: 'Passed',
    className: 'text-emerald-600',
    bgWrap: 'bg-emerald-50 text-emerald-600',
    Icon: CheckCircle2,
  },
  failed: {
    label: 'Failed',
    className: 'text-red-600',
    bgWrap: 'bg-red-50 text-red-600',
    Icon: XCircle,
  },
  ambiguous: {
    label: 'Ambiguous',
    className: 'text-amber-600',
    bgWrap: 'bg-amber-50 text-amber-600',
    Icon: AlertTriangle,
  },
};

const AUDIT_TONE = {
  info: {
    dot: 'bg-slate-300',
    Icon: Info,
    iconBg: 'bg-slate-100 text-slate-600',
  },
  warning: {
    dot: 'bg-amber-400',
    Icon: AlertTriangle,
    iconBg: 'bg-amber-50 text-amber-600',
  },
  success: {
    dot: 'bg-emerald-500',
    Icon: CheckCircle2,
    iconBg: 'bg-emerald-50 text-emerald-600',
  },
  error: {
    dot: 'bg-red-500',
    Icon: XCircle,
    iconBg: 'bg-red-50 text-red-600',
  },
};

/* ================================================================== */
/*  HELPERS                                                           */
/* ================================================================== */

const cx = (...parts) => parts.filter(Boolean).join(' ');

const getConfidenceBand = (score) => {
  if (score >= 90) {
    return {
      label: 'High',
      className: 'text-emerald-600',
      bar: 'bg-emerald-500',
    };
  }
  if (score >= 70) {
    return {
      label: 'Moderate',
      className: 'text-amber-600',
      bar: 'bg-amber-500',
    };
  }
  return { label: 'Low', className: 'text-red-600', bar: 'bg-red-500' };
};

const formatTimestampNow = () => {
  const now = new Date();
  const pad = (n) => String(n).padStart(2, '0');
  return `${now.getFullYear()}-${pad(now.getMonth() + 1)}-${pad(
    now.getDate()
  )} ${pad(now.getHours())}:${pad(now.getMinutes())} IST`;
};

/* ================================================================== */
/*  PRIMITIVES                                                        */
/* ================================================================== */

function StatusBadge({ status }) {
  const config = STATUS_CONFIG[status] ?? STATUS_CONFIG['not-submitted'];
  const Icon = config.Icon;
  return (
    <span
      className={cx(
        'inline-flex items-center gap-1 rounded-full border px-2.5 py-1 text-[10.5px] font-semibold uppercase tracking-wider',
        config.className
      )}
    >
      <Icon className="h-3 w-3" aria-hidden="true" />
      {config.label}
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

function MandatoryBadge({ mandatory }) {
  return (
    <span
      className={cx(
        'inline-flex items-center rounded-full border px-2 py-0.5 text-[10px] font-semibold uppercase tracking-wider',
        mandatory
          ? 'border-red-200 bg-red-50 text-red-700'
          : 'border-slate-200 bg-slate-100 text-slate-600'
      )}
    >
      {mandatory ? 'Mandatory' : 'Optional'}
    </span>
  );
}

function ConfidenceMeter({ score, compact = false }) {
  const band = getConfidenceBand(score);
  return (
    <div className="flex flex-col gap-1">
      <div className="flex items-center justify-between text-[10.5px] font-semibold">
        <span className={band.className}>{band.label} Confidence</span>
        <span className="tabular-nums text-slate-700">{score}%</span>
      </div>
      <div
        role="progressbar"
        aria-valuenow={score}
        aria-valuemin={0}
        aria-valuemax={100}
        aria-label={`Extraction confidence ${score} percent`}
        className={cx(
          'w-full overflow-hidden rounded-full bg-slate-100',
          compact ? 'h-1' : 'h-1.5'
        )}
      >
        <div
          style={{ width: `${score}%` }}
          className={cx('h-full rounded-full', band.bar)}
        />
      </div>
    </div>
  );
}

/* ================================================================== */
/*  NOT FOUND STATE                                                   */
/* ================================================================== */

function RequirementNotFound({ routeId }) {
  return (
    <div className="flex flex-col items-center justify-center gap-4 rounded-lg border border-slate-200 bg-white px-6 py-16 text-center shadow-sm">
      <span
        className="inline-flex h-12 w-12 items-center justify-center rounded-md bg-amber-50 text-amber-600"
        aria-hidden="true"
      >
        <ShieldAlert className="h-6 w-6" />
      </span>
      <div className="max-w-md">
        <h1 className="text-[15px] font-semibold text-slate-900">
          Requirement Audit Record Not Found
        </h1>
        <p className="mt-1.5 text-[12.5px] leading-relaxed text-slate-600">
          No audit record exists for requirement{' '}
          <span className="font-mono font-semibold text-slate-800">
            {routeId || 'unknown'}
          </span>
          . The requirement may not have been processed for AI verification
          yet, or the URL is incorrect.
        </p>
      </div>
      <div className="flex flex-wrap items-center justify-center gap-2">
        <Link
          to="/bids"
          className="inline-flex h-9 items-center gap-1.5 rounded-md border border-slate-200 bg-white px-3.5 text-[12.5px] font-semibold text-slate-700 transition-colors hover:bg-slate-50 focus:outline-none focus-visible:ring-2 focus-visible:ring-emerald-600 focus-visible:ring-offset-1"
        >
          <ArrowLeft className="h-3.5 w-3.5" aria-hidden="true" />
          Back to Bids
        </Link>
        <Link
          to="/compliance"
          className="inline-flex h-9 items-center gap-1.5 rounded-md bg-emerald-600 px-3.5 text-[12.5px] font-semibold text-white transition-colors hover:bg-emerald-700 focus:outline-none focus-visible:ring-2 focus-visible:ring-emerald-600 focus-visible:ring-offset-2"
        >
          <ShieldCheck className="h-3.5 w-3.5" aria-hidden="true" />
          Compliance Home
        </Link>
      </div>
    </div>
  );
}

/* ================================================================== */
/*  PAGE HEADER                                                       */
/* ================================================================== */

function PageHeader({ record, onFlag }) {
  return (
    <div className="flex flex-col gap-4">
      <Link
        to={`/compliance/${encodeURIComponent(record.bidId)}`}
        className="inline-flex w-fit items-center gap-1 text-[12px] font-medium text-slate-500 transition-colors hover:text-slate-800 focus:outline-none focus-visible:underline"
      >
        <ArrowLeft className="h-3.5 w-3.5" aria-hidden="true" />
        Back to Compliance Results
      </Link>

      <div className="flex flex-col gap-4 lg:flex-row lg:items-start lg:justify-between">
        <div className="min-w-0 flex-1">
          <div className="mb-2 flex flex-wrap items-center gap-2">
            <span className="font-mono text-[11.5px] font-semibold text-slate-500">
              {record.id}
            </span>
            <CategoryTag category={record.category} />
            <MandatoryBadge mandatory={record.mandatory} />
            <StatusBadge status={record.status} />
          </div>

          <h1 className="text-xl font-semibold tracking-tight text-slate-900 sm:text-2xl">
            {record.name}
          </h1>

          <dl className="mt-2 flex flex-wrap items-center gap-x-4 gap-y-1.5 text-[12px]">
            <div className="inline-flex items-center gap-1.5">
              <dt className="font-semibold uppercase tracking-wider text-slate-500">
                Tender
              </dt>
              <dd>
                <Link
                  to={`/tenders/${encodeURIComponent(record.tenderRef)}`}
                  className="font-mono text-[11.5px] font-semibold text-emerald-600 transition-colors hover:text-emerald-700 focus:outline-none focus-visible:underline"
                >
                  {record.tenderRef}
                </Link>
              </dd>
            </div>
            <span aria-hidden="true" className="text-slate-300">·</span>
            <div className="inline-flex items-center gap-1.5">
              <dt className="font-semibold uppercase tracking-wider text-slate-500">
                Bid
              </dt>
              <dd>
                <Link
                  to={`/bids/${encodeURIComponent(record.bidId)}`}
                  className="font-mono text-[11.5px] font-semibold text-emerald-600 transition-colors hover:text-emerald-700 focus:outline-none focus-visible:underline"
                >
                  {record.bidId}
                </Link>
              </dd>
            </div>
            <span aria-hidden="true" className="text-slate-300">·</span>
            <div className="inline-flex items-center gap-1.5">
              <dt className="font-semibold uppercase tracking-wider text-slate-500">
                Bidder
              </dt>
              <dd className="text-slate-700">{record.bidderName}</dd>
            </div>
          </dl>
        </div>

        <div className="flex flex-wrap items-center gap-2">
          <Link
            to={`/bids/${encodeURIComponent(record.bidId)}`}
            className="inline-flex h-9 items-center gap-1.5 rounded-md border border-slate-200 bg-white px-3 text-[12.5px] font-semibold text-slate-700 shadow-sm transition-colors hover:bg-slate-50 focus:outline-none focus-visible:ring-2 focus-visible:ring-emerald-600 focus-visible:ring-offset-1"
          >
            <FileText className="h-3.5 w-3.5" aria-hidden="true" />
            View Bid
          </Link>
          <Link
            to={`/tenders/${encodeURIComponent(record.tenderRef)}`}
            className="inline-flex h-9 items-center gap-1.5 rounded-md border border-slate-200 bg-white px-3 text-[12.5px] font-semibold text-slate-700 shadow-sm transition-colors hover:bg-slate-50 focus:outline-none focus-visible:ring-2 focus-visible:ring-emerald-600 focus-visible:ring-offset-1"
          >
            <ExternalLink className="h-3.5 w-3.5" aria-hidden="true" />
            View Tender
          </Link>
          <button
            type="button"
            onClick={onFlag}
            className="inline-flex h-9 items-center gap-1.5 rounded-md bg-amber-500 px-3.5 text-[12.5px] font-semibold text-white shadow-sm transition-colors hover:bg-amber-600 focus:outline-none focus-visible:ring-2 focus-visible:ring-amber-500 focus-visible:ring-offset-2"
          >
            <UserCheck className="h-3.5 w-3.5" aria-hidden="true" />
            Flag for Human Review
          </button>
        </div>
      </div>
    </div>
  );
}

/* ================================================================== */
/*  REQUIREMENT OVERVIEW + EVIDENCE                                   */
/* ================================================================== */

function OverviewSection({ record, onAction }) {
  return (
    <section
      aria-label="Requirement overview and evidence"
      className="grid grid-cols-1 gap-4 lg:grid-cols-3"
    >
      {/* Requirement details */}
      <article className="rounded-lg border border-slate-200 bg-white p-5 shadow-sm lg:col-span-2">
        <header className="mb-3 flex items-start gap-3">
          <span
            className="inline-flex h-8 w-8 flex-shrink-0 items-center justify-center rounded-md bg-emerald-50 text-emerald-600"
            aria-hidden="true"
          >
            <ShieldCheck className="h-4 w-4" />
          </span>
          <div>
            <h2 className="text-[13.5px] font-semibold text-slate-900">
              Requirement Specification
            </h2>
            <p className="mt-0.5 text-[12px] text-slate-500">
              Tender-mandated criteria for this requirement
            </p>
          </div>
        </header>

        <div className="flex flex-col gap-4">
          <div>
            <p className="text-[10.5px] font-semibold uppercase tracking-wider text-slate-500">
              Description
            </p>
            <p className="mt-1 text-[12.5px] leading-relaxed text-slate-700">
              {record.requirementDescription}
            </p>
          </div>

          <div>
            <p className="text-[10.5px] font-semibold uppercase tracking-wider text-slate-500">
              Expected Evidence
            </p>
            <p className="mt-1 text-[12.5px] leading-relaxed text-slate-700">
              {record.expectedEvidence}
            </p>
          </div>
        </div>
      </article>

      {/* Document card */}
      <article className="rounded-lg border border-slate-200 bg-white p-5 shadow-sm">
        <header className="mb-3 flex items-start gap-3">
          <span
            className="inline-flex h-8 w-8 flex-shrink-0 items-center justify-center rounded-md bg-slate-100 text-slate-600"
            aria-hidden="true"
          >
            <FileText className="h-4 w-4" />
          </span>
          <div>
            <h2 className="text-[13.5px] font-semibold text-slate-900">
              Submitted Evidence
            </h2>
            <p className="mt-0.5 text-[12px] text-slate-500">
              Document attached by the bidder
            </p>
          </div>
        </header>

        <div className="flex flex-col gap-3">
          <div className="rounded-md border border-slate-200 bg-slate-50 p-3">
            <p className="truncate text-[12.5px] font-semibold text-slate-800">
              {record.document.name}
            </p>
            <div className="mt-1 flex flex-wrap items-center gap-x-2 gap-y-0.5 text-[11px] text-slate-500">
              <span className="font-mono uppercase">
                {record.document.format}
              </span>
              <span aria-hidden="true">·</span>
              <span>{record.document.size}</span>
              <span aria-hidden="true">·</span>
              <span>{record.document.pages} pages</span>
            </div>
            <p className="mt-1.5 flex items-center gap-1 text-[11px] text-slate-500">
              <Clock className="h-3 w-3" aria-hidden="true" />
              Uploaded {record.document.uploadedAt}
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-2">
            <button
              type="button"
              onClick={() => onAction(`Viewing ${record.document.name}`)}
              className="inline-flex h-8 items-center gap-1.5 rounded-md border border-slate-200 bg-white px-2.5 text-[12px] font-semibold text-slate-700 transition-colors hover:bg-slate-50 focus:outline-none focus-visible:ring-2 focus-visible:ring-emerald-600 focus-visible:ring-offset-1"
            >
              <Eye className="h-3 w-3" aria-hidden="true" />
              View Preview
            </button>
            <button
              type="button"
              onClick={() => onAction(`Downloading ${record.document.name}`)}
              className="inline-flex h-8 items-center gap-1.5 rounded-md border border-slate-200 bg-white px-2.5 text-[12px] font-semibold text-slate-700 transition-colors hover:bg-slate-50 focus:outline-none focus-visible:ring-2 focus-visible:ring-emerald-600 focus-visible:ring-offset-1"
            >
              <Download className="h-3 w-3" aria-hidden="true" />
              Download
            </button>
            <button
              type="button"
              onClick={() => onAction('Replace document requested — demo only')}
              className="inline-flex h-8 items-center gap-1.5 rounded-md border border-slate-200 bg-white px-2.5 text-[12px] font-semibold text-slate-700 transition-colors hover:bg-slate-50 focus:outline-none focus-visible:ring-2 focus-visible:ring-emerald-600 focus-visible:ring-offset-1"
            >
              <Edit3 className="h-3 w-3" aria-hidden="true" />
              Replace
            </button>
          </div>
        </div>
      </article>
    </section>
  );
}

/* ================================================================== */
/*  XAI — EXTRACTED FIELDS                                            */
/* ================================================================== */

function ExtractedFieldsSection({ record }) {
  return (
    <section
      aria-label="Mock AI document extraction"
      className="rounded-lg border border-slate-200 bg-white shadow-sm"
    >
      <header className="flex flex-wrap items-start justify-between gap-3 border-b border-slate-200 px-5 py-4">
        <div className="flex items-start gap-3">
          <span
            className="inline-flex h-8 w-8 flex-shrink-0 items-center justify-center rounded-md bg-emerald-50 text-emerald-600"
            aria-hidden="true"
          >
            <Brain className="h-4 w-4" />
          </span>
          <div>
            <h2 className="text-[13.5px] font-semibold text-slate-900">
              AI-Extracted Fields
            </h2>
            <p className="mt-0.5 text-[12px] text-slate-500">
              Key-value pairs parsed from the submitted document
            </p>
          </div>
        </div>
        <span className="inline-flex items-center gap-1 rounded-full border border-slate-200 bg-slate-50 px-2 py-0.5 text-[10px] font-semibold uppercase tracking-wider text-slate-600">
          <Info className="h-3 w-3" aria-hidden="true" />
          Mock AI Extraction — Decision Support Signal
        </span>
      </header>

      <dl className="grid grid-cols-1 divide-y divide-slate-100 sm:grid-cols-2 sm:divide-y-0 lg:grid-cols-3">
        {record.extractedFields.map((field) => (
          <div
            key={field.id}
            className="flex flex-col gap-2 border-slate-100 p-4 sm:border-b sm:border-r lg:[&:nth-child(3n)]:border-r-0"
          >
            <dt className="text-[10.5px] font-semibold uppercase tracking-wider text-slate-500">
              {field.label}
            </dt>
            <dd className="text-[13px] font-medium text-slate-800">
              {field.value}
            </dd>
            <ConfidenceMeter score={field.confidence} compact />
          </div>
        ))}
      </dl>
    </section>
  );
}

/* ================================================================== */
/*  COMPARISON MATRIX                                                 */
/* ================================================================== */

function ComparisonMatrix({ comparisons }) {
  return (
    <section
      aria-label="Requirement vs evidence comparison"
      className="overflow-hidden rounded-lg border border-slate-200 bg-white shadow-sm"
    >
      <header className="border-b border-slate-200 px-5 py-4">
        <h2 className="text-[13.5px] font-semibold text-slate-900">
          Requirement vs Evidence Comparison
        </h2>
        <p className="mt-0.5 text-[12px] text-slate-500">
          Side-by-side mapping of tender criteria against extracted evidence
        </p>
      </header>

      <ul className="divide-y divide-slate-100">
        {comparisons.map((row) => {
          const verdict = VERDICT_CONFIG[row.verdict] ?? VERDICT_CONFIG.ambiguous;
          const VerdictIcon = verdict.Icon;
          return (
            <li key={row.id} className="p-4 sm:p-5">
              <div className="mb-3 flex flex-wrap items-center justify-between gap-2">
                <p className="text-[12.5px] font-semibold text-slate-800">
                  {row.criterion}
                </p>
                <span
                  className={cx(
                    'inline-flex items-center gap-1 rounded-full border px-2 py-0.5 text-[10.5px] font-semibold uppercase tracking-wider',
                    verdict.className
                  )}
                >
                  <VerdictIcon className="h-3 w-3" aria-hidden="true" />
                  {verdict.label}
                </span>
              </div>

              <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
                <div
                  className={cx(
                    'rounded-md border p-3',
                    'border-slate-200 bg-slate-50'
                  )}
                >
                  <p className="text-[10.5px] font-semibold uppercase tracking-wider text-slate-500">
                    Expected (Tender)
                  </p>
                  <p className="mt-1 text-[12px] leading-relaxed text-slate-700">
                    {row.expected}
                  </p>
                </div>

                <div
                  className={cx(
                    'rounded-md border p-3',
                    verdict.rowTone
                  )}
                >
                  <p
                    className={cx(
                      'text-[10.5px] font-semibold uppercase tracking-wider',
                      row.verdict === 'match'
                        ? 'text-emerald-700'
                        : row.verdict === 'mismatch'
                        ? 'text-red-700'
                        : 'text-amber-700'
                    )}
                  >
                    Observed (Extracted)
                  </p>
                  <p className="mt-1 text-[12px] leading-relaxed text-slate-700">
                    {row.observed}
                  </p>
                </div>
              </div>
            </li>
          );
        })}
      </ul>
    </section>
  );
}

/* ================================================================== */
/*  VERIFICATION CHECKS + CONFIDENCE                                  */
/* ================================================================== */

function VerificationChecksSection({ record }) {
  const band = getConfidenceBand(record.confidence);

  return (
    <section
      aria-label="Verification checks"
      className="grid grid-cols-1 gap-4 lg:grid-cols-3"
    >
      {/* Rule checks list */}
      <article className="rounded-lg border border-slate-200 bg-white shadow-sm lg:col-span-2">
        <header className="border-b border-slate-200 px-5 py-4">
          <h2 className="text-[13.5px] font-semibold text-slate-900">
            Verification Rule Checks
          </h2>
          <p className="mt-0.5 text-[12px] text-slate-500">
            Granular checks executed by the compliance rule engine
          </p>
        </header>

        <ul className="divide-y divide-slate-100">
          {record.ruleChecks.map((check) => {
            const config =
              RULE_STATUS_CONFIG[check.status] ?? RULE_STATUS_CONFIG.ambiguous;
            const CheckIcon = config.Icon;
            return (
              <li key={check.id} className="flex items-start gap-3 px-5 py-3.5">
                <span
                  className={cx(
                    'mt-0.5 inline-flex h-7 w-7 flex-shrink-0 items-center justify-center rounded-md',
                    config.bgWrap
                  )}
                  aria-hidden="true"
                >
                  <CheckIcon className="h-3.5 w-3.5" />
                </span>
                <div className="min-w-0 flex-1">
                  <p className="text-[12.5px] font-semibold text-slate-800">
                    {check.label}
                  </p>
                  <p className="mt-0.5 text-[11.5px] leading-relaxed text-slate-600">
                    {check.detail}
                  </p>
                </div>
                <span
                  className={cx(
                    'flex-shrink-0 text-[10.5px] font-semibold uppercase tracking-wider',
                    config.className
                  )}
                >
                  {config.label}
                </span>
              </li>
            );
          })}
        </ul>
      </article>

      {/* Confidence + verification method */}
      <article className="rounded-lg border border-slate-200 bg-white p-5 shadow-sm">
        <header className="mb-4 flex items-start gap-3">
          <span
            className="inline-flex h-8 w-8 flex-shrink-0 items-center justify-center rounded-md bg-emerald-50 text-emerald-600"
            aria-hidden="true"
          >
            <ShieldCheck className="h-4 w-4" />
          </span>
          <div>
            <h2 className="text-[13.5px] font-semibold text-slate-900">
              Verification Summary
            </h2>
            <p className="mt-0.5 text-[12px] text-slate-500">
              Aggregate confidence and method
            </p>
          </div>
        </header>

        <div className="flex flex-col gap-4">
          <div>
            <p className="text-[10.5px] font-semibold uppercase tracking-wider text-slate-500">
              Overall Confidence Score
            </p>
            <div className="mt-1.5 flex items-baseline gap-2">
              <span
                className={cx(
                  'text-3xl font-semibold tabular-nums tracking-tight',
                  band.className
                )}
              >
                {record.confidence}%
              </span>
              <span className={cx('text-[12px] font-semibold', band.className)}>
                {band.label}
              </span>
            </div>
            <div
              role="progressbar"
              aria-valuenow={record.confidence}
              aria-valuemin={0}
              aria-valuemax={100}
              aria-label={`Overall confidence ${record.confidence} percent`}
              className="mt-2 h-2 w-full overflow-hidden rounded-full bg-slate-100"
            >
              <div
                style={{ width: `${record.confidence}%` }}
                className={cx('h-full rounded-full', band.bar)}
              />
            </div>
          </div>

          <div>
            <p className="text-[10.5px] font-semibold uppercase tracking-wider text-slate-500">
              Verification Method
            </p>
            <p className="mt-1 inline-flex items-center rounded-full border border-slate-200 bg-slate-50 px-2.5 py-1 text-[11.5px] font-semibold text-slate-700">
              {record.verificationMethod}
            </p>
          </div>

          <div className="flex items-start gap-2 rounded-md border border-amber-200 bg-amber-50 p-3">
            <Info
              className="mt-0.5 h-3.5 w-3.5 flex-shrink-0 text-amber-600"
              aria-hidden="true"
            />
            <p className="text-[11px] leading-relaxed text-amber-800">
              Confidence thresholds are system signals, not official government
              standards. All scores and rule checks are decision-support only
              and require human review before legal or contractual effect.
            </p>
          </div>
        </div>
      </article>
    </section>
  );
}

/* ================================================================== */
/*  AI REASONING                                                      */
/* ================================================================== */

function AIReasoningSection({ reasoning }) {
  const blocks = [
    {
      id: 'finding',
      label: 'Finding',
      value: reasoning.finding,
      accent: 'text-emerald-700',
      bg: 'border-emerald-200 bg-emerald-50/60',
    },
    {
      id: 'evidence',
      label: 'Evidence',
      value: reasoning.evidence,
      accent: 'text-slate-700',
      bg: 'border-slate-200 bg-slate-50',
    },
    {
      id: 'reasoning',
      label: 'Reasoning',
      value: reasoning.reasoning,
      accent: 'text-slate-700',
      bg: 'border-slate-200 bg-slate-50',
    },
    {
      id: 'action',
      label: 'Recommended Action',
      value: reasoning.recommendedAction,
      accent: 'text-amber-700',
      bg: 'border-amber-200 bg-amber-50/70',
    },
  ];

  return (
    <section
      aria-label="AI reasoning and recommended actions"
      className="rounded-lg border border-slate-200 bg-white shadow-sm"
    >
      <header className="flex items-start gap-3 border-b border-slate-200 px-5 py-4">
        <span
          className="inline-flex h-8 w-8 flex-shrink-0 items-center justify-center rounded-md bg-emerald-50 text-emerald-600"
          aria-hidden="true"
        >
          <Brain className="h-4 w-4" />
        </span>
        <div>
          <h2 className="text-[13.5px] font-semibold text-slate-900">
            AI Reasoning & Recommended Actions
          </h2>
          <p className="mt-0.5 text-[12px] text-slate-500">
            Explainable decision-support output — not a legal determination
          </p>
        </div>
      </header>

      <ul className="grid grid-cols-1 divide-y divide-slate-100 lg:grid-cols-2 lg:divide-y-0">
        {blocks.map((block) => (
          <li
            key={block.id}
            className="flex flex-col gap-2 border-slate-100 p-5 lg:border-b lg:border-r lg:[&:nth-child(2n)]:border-r-0 lg:[&:nth-last-child(-n+2)]:border-b-0"
          >
            <p className="text-[10.5px] font-semibold uppercase tracking-wider text-slate-500">
              {block.label}
            </p>
            <div className={cx('rounded-md border p-3', block.bg)}>
              <p
                className={cx(
                  'text-[12.5px] leading-relaxed',
                  block.accent
                )}
              >
                {block.value}
              </p>
            </div>
          </li>
        ))}
      </ul>
    </section>
  );
}

/* ================================================================== */
/*  AUDIT TRAIL                                                       */
/* ================================================================== */

function AuditTrailSection({ events }) {
  return (
    <section
      aria-label="Audit trail"
      className="rounded-lg border border-slate-200 bg-white shadow-sm"
    >
      <header className="border-b border-slate-200 px-5 py-4">
        <h2 className="text-[13.5px] font-semibold text-slate-900">
          Audit Trail
        </h2>
        <p className="mt-0.5 text-[12px] text-slate-500">
          Chronological lifecycle of this requirement record
        </p>
      </header>

      <ol className="p-5">
        {events.map((event, index) => {
          const tone = AUDIT_TONE[event.type] ?? AUDIT_TONE.info;
          const EventIcon = tone.Icon;
          const isLast = index === events.length - 1;
          return (
            <li key={event.id} className="relative flex items-start gap-4">
              {!isLast ? (
                <span
                  className="absolute left-[15px] top-8 h-[calc(100%-16px)] w-0.5 bg-slate-200"
                  aria-hidden="true"
                />
              ) : null}

              <span
                className={cx(
                  'relative z-10 inline-flex h-8 w-8 flex-shrink-0 items-center justify-center rounded-full',
                  tone.iconBg
                )}
                aria-hidden="true"
              >
                <EventIcon className="h-4 w-4" />
              </span>

              <div className="flex min-w-0 flex-1 flex-col gap-0.5 pb-5">
                <p className="text-[12.5px] font-semibold text-slate-800">
                  {event.event}
                </p>
                <p className="text-[11.5px] text-slate-500">{event.actor}</p>
                <p className="flex items-center gap-1 text-[11px] text-slate-400">
                  <Clock className="h-3 w-3" aria-hidden="true" />
                  {event.timestamp}
                </p>
              </div>
            </li>
          );
        })}
      </ol>
    </section>
  );
}

/* ================================================================== */
/*  HITL DECISION BAR                                                 */
/* ================================================================== */

function DecisionBar({ currentStatus, onSubmit }) {
  const [draftStatus, setDraftStatus] = useState(currentStatus);
  const [note, setNote] = useState('');
  const [noteError, setNoteError] = useState('');

  useEffect(() => {
    setDraftStatus(currentStatus);
  }, [currentStatus]);

  const handleSubmit = useCallback(
    (event) => {
      event.preventDefault();

      if (!draftStatus) {
        setNoteError('Select a decision before submitting.');
        return;
      }
      if (note.trim().length > 0 && note.trim().length < 10) {
        setNoteError('Reviewer note must be at least 10 characters if provided.');
        return;
      }

      setNoteError('');
      onSubmit({ status: draftStatus, note: note.trim() });
      setNote('');
    },
    [draftStatus, note, onSubmit]
  );

  const decisions = [
    {
      value: 'satisfied',
      label: 'Mark Satisfied',
      Icon: CheckCircle2,
      activeClass:
        'border-emerald-500 bg-emerald-50 text-emerald-700 ring-2 ring-emerald-500/30',
      idleClass:
        'border-slate-200 bg-white text-slate-700 hover:border-emerald-500 hover:text-emerald-700',
    },
    {
      value: 'failed',
      label: 'Mark Failed',
      Icon: XCircle,
      activeClass:
        'border-red-500 bg-red-50 text-red-700 ring-2 ring-red-500/30',
      idleClass:
        'border-slate-200 bg-white text-slate-700 hover:border-red-500 hover:text-red-700',
    },
    {
      value: 'review',
      label: 'Requires Review',
      Icon: AlertTriangle,
      activeClass:
        'border-amber-500 bg-amber-50 text-amber-700 ring-2 ring-amber-500/30',
      idleClass:
        'border-slate-200 bg-white text-slate-700 hover:border-amber-500 hover:text-amber-700',
    },
  ];

  return (
    <section
      aria-label="Human review decision"
      className="rounded-lg border border-slate-200 bg-white shadow-sm"
    >
      <header className="flex items-start gap-3 border-b border-slate-200 px-5 py-4">
        <span
          className="inline-flex h-8 w-8 flex-shrink-0 items-center justify-center rounded-md bg-emerald-50 text-emerald-600"
          aria-hidden="true"
        >
          <UserCheck className="h-4 w-4" />
        </span>
        <div>
          <h2 className="text-[13.5px] font-semibold text-slate-900">
            Human Review Decision
          </h2>
          <p className="mt-0.5 text-[12px] text-slate-500">
            Reviewer action overrides the AI signal and is written to the audit
            trail
          </p>
        </div>
      </header>

      <form onSubmit={handleSubmit} className="flex flex-col gap-4 p-5">
        <fieldset>
          <legend className="mb-2 text-[10.5px] font-semibold uppercase tracking-wider text-slate-500">
            Decision
          </legend>
          <div className="grid grid-cols-1 gap-2 sm:grid-cols-3">
            {decisions.map((decision) => {
              const DecisionIcon = decision.Icon;
              const isActive = draftStatus === decision.value;
              return (
                <label
                  key={decision.value}
                  className={cx(
                    'flex cursor-pointer items-center justify-center gap-2 rounded-md border px-3 py-2.5 text-[12.5px] font-semibold transition-colors focus-within:ring-2 focus-within:ring-emerald-600 focus-within:ring-offset-1',
                    isActive ? decision.activeClass : decision.idleClass
                  )}
                >
                  <input
                    type="radio"
                    name="decision"
                    value={decision.value}
                    checked={isActive}
                    onChange={(event) => setDraftStatus(event.target.value)}
                    className="sr-only"
                  />
                  <DecisionIcon className="h-3.5 w-3.5" aria-hidden="true" />
                  {decision.label}
                </label>
              );
            })}
          </div>
        </fieldset>

        <div>
          <label
            htmlFor="reviewer-note"
            className="mb-1.5 block text-[10.5px] font-semibold uppercase tracking-wider text-slate-500"
          >
            Reviewer Note (optional)
          </label>
          <textarea
            id="reviewer-note"
            value={note}
            onChange={(event) => {
              setNote(event.target.value);
              if (noteError) setNoteError('');
            }}
            rows={3}
            placeholder="Add context for the decision — this is written to the audit trail."
            aria-invalid={Boolean(noteError)}
            aria-describedby={noteError ? 'reviewer-note-error' : undefined}
            className={cx(
              'w-full rounded-md border bg-white px-3 py-2 text-[12.5px] leading-relaxed text-slate-900 placeholder:text-slate-400 transition-colors focus:outline-none focus:ring-2',
              noteError
                ? 'border-red-200 focus:border-red-600 focus:ring-red-600/20'
                : 'border-slate-200 focus:border-emerald-600 focus:ring-emerald-600/20'
            )}
          />
          {noteError ? (
            <p
              id="reviewer-note-error"
              role="alert"
              className="mt-1.5 flex items-center gap-1.5 text-[11.5px] font-medium text-red-600"
            >
              <AlertTriangle className="h-3.5 w-3.5 flex-shrink-0" aria-hidden="true" />
              {noteError}
            </p>
          ) : null}
        </div>

        <div className="flex flex-wrap items-center justify-end gap-2">
          <button
            type="submit"
            className="inline-flex h-9 items-center gap-1.5 rounded-md bg-emerald-600 px-3.5 text-[12.5px] font-semibold text-white shadow-sm transition-colors hover:bg-emerald-700 focus:outline-none focus-visible:ring-2 focus-visible:ring-emerald-600 focus-visible:ring-offset-2"
          >
            <CheckCircle2 className="h-3.5 w-3.5" aria-hidden="true" />
            Submit Decision
          </button>
        </div>
      </form>
    </section>
  );
}

/* ================================================================== */
/*  PAGE                                                              */
/* ================================================================== */

export default function RequirementDetails() {
  const { id } = useParams();

  const baseRecord = useMemo(
    () => REQUIREMENT_REGISTRY[id] ?? null,
    [id]
  );

  /* Local mutable state — cloned from mock registry */
  const [record, setRecord] = useState(() =>
    baseRecord ? { ...baseRecord, auditTrail: [...baseRecord.auditTrail] } : null
  );
  const [toast, setToast] = useState(null);

  /* Re-hydrate when route param changes */
  useEffect(() => {
    if (baseRecord) {
      setRecord({
        ...baseRecord,
        auditTrail: [...baseRecord.auditTrail],
      });
    }
  }, [baseRecord]);

  /* Toast auto-dismiss */
  useEffect(() => {
    if (!toast) return;
    const timeout = setTimeout(() => setToast(null), 2800);
    return () => clearTimeout(timeout);
  }, [toast]);

  /* ---------------- Actions ---------------- */
  const handleAction = useCallback((message) => {
    setToast({ type: 'success', message });
  }, []);

  const handleFlagForReview = useCallback(() => {
    setRecord((prev) => {
      if (!prev) return prev;
      return {
        ...prev,
        status: 'review',
        auditTrail: [
          ...prev.auditTrail,
          {
            id: `audit-${Date.now()}`,
            event: 'Flagged for Human Review',
            actor: 'Reviewer — Manual action',
            timestamp: formatTimestampNow(),
            type: 'warning',
          },
        ],
      };
    });
    setToast({
      type: 'success',
      message: 'Requirement flagged for human review.',
    });
  }, []);

  const handleDecisionSubmit = useCallback(({ status, note }) => {
    setRecord((prev) => {
      if (!prev) return prev;
      const statusLabel =
        status === 'satisfied'
          ? 'Satisfied'
          : status === 'failed'
          ? 'Failed'
          : 'Requires Review';

      const newEntry = {
        id: `audit-${Date.now()}`,
        event: `Human Decision — Marked as ${statusLabel}`,
        actor: 'Reviewer — Manual override',
        timestamp: formatTimestampNow(),
        type:
          status === 'satisfied'
            ? 'success'
            : status === 'failed'
            ? 'error'
            : 'warning',
      };

      const noteEntry = note
        ? [
            {
              id: `audit-note-${Date.now()}`,
              event: `Reviewer Note: ${note}`,
              actor: 'Reviewer — Manual annotation',
              timestamp: formatTimestampNow(),
              type: 'info',
            },
          ]
        : [];

      return {
        ...prev,
        status,
        auditTrail: [...prev.auditTrail, newEntry, ...noteEntry],
      };
    });

    setToast({
      type: 'success',
      message: 'Decision recorded. Audit trail updated.',
    });
  }, []);

  /* ---------------- Fallback ---------------- */
  if (!record) {
    return <RequirementNotFound routeId={id} />;
  }

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
      <PageHeader record={record} onFlag={handleFlagForReview} />

      {/* Overview + evidence */}
      <OverviewSection record={record} onAction={handleAction} />

      {/* Extracted fields */}
      <ExtractedFieldsSection record={record} />

      {/* Comparison matrix */}
      <ComparisonMatrix comparisons={record.comparison} />

      {/* Rule checks + confidence */}
      <VerificationChecksSection record={record} />

      {/* AI reasoning */}
      <AIReasoningSection reasoning={record.aiReasoning} />

      {/* Audit trail */}
      <AuditTrailSection events={record.auditTrail} />

      {/* HITL decision bar */}
      <DecisionBar
        currentStatus={record.status}
        onSubmit={handleDecisionSubmit}
      />
    </div>
  );
}