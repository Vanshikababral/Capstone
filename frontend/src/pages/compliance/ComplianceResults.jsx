import { useCallback, useEffect, useMemo, useState } from 'react';
import { Link, useParams } from 'react-router-dom';
import {
  ShieldCheck,
  ShieldAlert,
  AlertTriangle,
  FileText,
  CheckCircle2,
  XCircle,
  Search,
  Filter,
  ExternalLink,
  Download,
  UserCheck,
  Brain,
  ArrowLeft,
  Clock,
  X,
  ChevronDown,
  ChevronRight,
  Info,
  Layers,
  Building2,
} from 'lucide-react';

/* ================================================================== */
/*  MOCK DATA                                                         */
/* ================================================================== */

const COMPLIANCE_REGISTRY = {
  'BID-2026-0087': {
    bidId: 'BID-2026-0087',
    bidderName: 'Aarav Infrastructure Solutions Pvt. Ltd.',
    bidderContact: 'Vikram Mehta',
    tenderRef: 'TNDR-2026-0142',
    tenderTitle: 'Supply & Installation of Solar Micro-Grids',
    tenderOrganization: 'Ministry of New & Renewable Energy',
    tenderCategory: 'Renewable Energy Infrastructure',
    submittedAt: '2026-01-08 14:22 IST',
    verifiedAt: '2026-01-09 09:41 IST',
    requirements: [
      {
        id: 'req-1',
        name: 'GST Registration Certificate',
        category: 'Tax Compliance',
        mandatory: true,
        status: 'satisfied',
        confidence: 96,
        evidenceDoc: 'GST_Registration_AISPL.pdf',
        evidenceSize: '428 KB',
        aiReason:
          'GSTIN format validated against the standard 15-character pattern. Certificate date is post-implementation, active status confirmed via OCR-extracted validity markers.',
        extractedValue: 'GSTIN 07AAACA1234B1Z5 (Registered 12-Mar-2019)',
        expectedValue: 'Active GSTIN with ≥3 years of filing history',
        recommendedAction:
          'No action required. Evidence meets tender specification.',
      },
      {
        id: 'req-2',
        name: 'Company PAN Card',
        category: 'Tax Compliance',
        mandatory: true,
        status: 'satisfied',
        confidence: 94,
        evidenceDoc: 'Company_PAN_AISPL.pdf',
        evidenceSize: '212 KB',
        aiReason:
          'PAN extracted as AAACA1234B. Entity type matches declared bidder type (Private Limited Company). Legal name in PAN aligns with MCA registry.',
        extractedValue: 'PAN AAACA1234B — Aarav Infrastructure Solutions Pvt Ltd',
        expectedValue: 'Valid company PAN matching bidder legal entity',
        recommendedAction:
          'No action required. Evidence meets tender specification.',
      },
      {
        id: 'req-3',
        name: 'Udyam / MSME Registration',
        category: 'Registration',
        mandatory: false,
        status: 'satisfied',
        confidence: 91,
        evidenceDoc: 'Udyam_AISPL_2024.pdf',
        evidenceSize: '184 KB',
        aiReason:
          'Udyam registration number confirmed as active. Enterprise category classified as Medium. MSME benefit eligibility validated.',
        extractedValue: 'UDYAM-MH-03-0021456 — Medium Enterprise',
        expectedValue: 'Valid Udyam registration for MSME benefits',
        recommendedAction:
          'No action required. Optional requirement satisfied.',
      },
      {
        id: 'req-4',
        name: 'Income Tax Returns (FY22, FY23, FY24)',
        category: 'Tax Compliance',
        mandatory: true,
        status: 'review',
        confidence: 68,
        evidenceDoc: 'ITR_FY22-24_Combined.pdf',
        evidenceSize: '2.8 MB',
        aiReason:
          'ITR acknowledgements detected for FY22 and FY24. FY23 acknowledgement page is partially illegible due to scan quality. Manual verification of FY23 filing reference recommended.',
        extractedValue: 'ITR acknowledgements detected: FY22 (valid), FY23 (illegible), FY24 (valid)',
        expectedValue: 'ITR acknowledgements for last 3 consecutive financial years',
        recommendedAction:
          'Send to human reviewer for manual verification of FY23 filing reference.',
      },
      {
        id: 'req-5',
        name: 'Past Experience Certificates',
        category: 'Experience',
        mandatory: true,
        status: 'satisfied',
        confidence: 92,
        evidenceDoc: 'Experience_Certificates_Combined.pdf',
        evidenceSize: '1.6 MB',
        aiReason:
          'Three qualifying work orders detected. Issuing authorities identified as state-level renewable energy bodies. Aggregate contract value exceeds minimum threshold of ₹2 Cr.',
        extractedValue: '3 work orders — ₹1.2 Cr, ₹1.8 Cr, ₹2.1 Cr (issued 2021-2024)',
        expectedValue: 'Minimum 2 similar works of ≥₹2 Cr in last 5 years',
        recommendedAction:
          'No action required. Evidence meets tender specification.',
      },
      {
        id: 'req-6',
        name: 'Audited Financial Statements (FY22-FY24)',
        category: 'Financial',
        mandatory: true,
        status: 'review',
        confidence: 74,
        evidenceDoc: 'Financials_FY22-24_Audited.pdf',
        evidenceSize: '3.2 MB',
        aiReason:
          'Balance sheet and P&L extracted for all 3 years. CA registration number visible but signature image quality is low — human verification of CA authenticity recommended.',
        extractedValue: 'CA Reg No. 124567 (partially verified) — Turnover FY24 ₹18.4 Cr',
        expectedValue: 'CA-certified financials for FY22, FY23, FY24',
        recommendedAction:
          'Verify CA signature authenticity and registration number against ICAI registry.',
      },
      {
        id: 'req-7',
        name: 'BIS Certification for Solar Panels',
        category: 'Technical',
        mandatory: true,
        status: 'failed',
        confidence: 87,
        evidenceDoc: 'BIS_Cert_Scan.pdf',
        evidenceSize: '612 KB',
        aiReason:
          'BIS certificate submitted with validity expiring 15-Nov-2024. Tender requirement mandates validity through the entire bid submission window (ending 20-Jan-2026). Certificate is expired.',
        extractedValue: 'BIS Certificate valid till 15-Nov-2024 (expired)',
        expectedValue: 'BIS certification valid through 20-Jan-2026',
        recommendedAction:
          'Request updated BIS certification from bidder. Current submission cannot be accepted.',
      },
      {
        id: 'req-8',
        name: 'Solvency Certificate',
        category: 'Financial',
        mandatory: true,
        status: 'not-submitted',
        confidence: 0,
        evidenceDoc: null,
        evidenceSize: null,
        aiReason:
          'No document was submitted against this requirement. Tender mandates a ₹2 Cr solvency certificate issued by a scheduled commercial bank.',
        extractedValue: 'No document submitted',
        expectedValue: 'Solvency certificate of ₹2 Cr from scheduled commercial bank',
        recommendedAction:
          'Request solvency certificate from bidder. Requirement is mandatory and cannot be waived.',
      },
      {
        id: 'req-9',
        name: 'Technical Compliance Sheet',
        category: 'Technical',
        mandatory: true,
        status: 'satisfied',
        confidence: 89,
        evidenceDoc: 'Tech_Compliance_Sheet.xlsx',
        evidenceSize: '142 KB',
        aiReason:
          'All 24 technical parameters in the tender compliance sheet have been addressed. 22 parameters meet or exceed specification. Two parameters matched with documented tolerance.',
        extractedValue: '24 parameters addressed — 22 met, 2 within tolerance',
        expectedValue: 'Compliance with all 24 tender technical parameters',
        recommendedAction:
          'No action required. Technical compliance verified.',
      },
      {
        id: 'req-10',
        name: 'EMD / Bid Security Declaration',
        category: 'Financial',
        mandatory: true,
        status: 'satisfied',
        confidence: 95,
        evidenceDoc: 'EMD_Declaration_AISPL.pdf',
        evidenceSize: '188 KB',
        aiReason:
          'EMD exemption claimed under MSME category. Udyam registration cross-referenced to confirm eligibility. Exemption is valid per GeM procurement rules.',
        extractedValue: 'EMD exemption claimed — MSME Udyam MH-03-0021456',
        expectedValue: 'EMD payment or valid MSME exemption',
        recommendedAction:
          'No action required. Exemption validated.',
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
    bar: 'bg-emerald-500',
    text: 'text-emerald-600',
    Icon: CheckCircle2,
    weight: 1.0,
  },
  review: {
    label: 'Requires Review',
    className: 'bg-amber-50 text-amber-700 border-amber-200',
    bar: 'bg-amber-500',
    text: 'text-amber-600',
    Icon: AlertTriangle,
    weight: 0.5,
  },
  failed: {
    label: 'Failed',
    className: 'bg-red-50 text-red-700 border-red-200',
    bar: 'bg-red-500',
    text: 'text-red-600',
    Icon: XCircle,
    weight: 0,
  },
  'not-submitted': {
    label: 'Not Submitted',
    className: 'bg-slate-100 text-slate-700 border-slate-300',
    bar: 'bg-slate-400',
    text: 'text-slate-600',
    Icon: AlertTriangle,
    weight: 0,
  },
};

const OVERALL_STATUS = {
  compliant: {
    label: 'Compliant',
    className: 'bg-emerald-50 text-emerald-700 border-emerald-200',
  },
  'non-compliant': {
    label: 'Non-Compliant',
    className: 'bg-red-50 text-red-700 border-red-200',
  },
  'requires-review': {
    label: 'Requires Review',
    className: 'bg-amber-50 text-amber-700 border-amber-200',
  },
};

const CATEGORY_OPTIONS = [
  'All Categories',
  'Registration',
  'Tax Compliance',
  'Financial',
  'Experience',
  'Technical',
];

const STATUS_TABS = [
  { id: 'all', label: 'All' },
  { id: 'satisfied', label: 'Satisfied' },
  { id: 'failed', label: 'Failed' },
  { id: 'review', label: 'Requires Review' },
  { id: 'not-submitted', label: 'Not Submitted' },
];

const CONFIDENCE_BANDS = {
  high: {
    label: 'High',
    className: 'text-emerald-600',
    bar: 'bg-emerald-500',
    threshold: 90,
  },
  moderate: {
    label: 'Moderate',
    className: 'text-amber-600',
    bar: 'bg-amber-500',
    threshold: 70,
  },
  low: {
    label: 'Low',
    className: 'text-red-600',
    bar: 'bg-red-500',
    threshold: 0,
  },
};

/* ================================================================== */
/*  HELPERS                                                           */
/* ================================================================== */

const cx = (...parts) => parts.filter(Boolean).join(' ');

const getConfidenceBand = (score) => {
  if (score >= CONFIDENCE_BANDS.high.threshold) return CONFIDENCE_BANDS.high;
  if (score >= CONFIDENCE_BANDS.moderate.threshold)
    return CONFIDENCE_BANDS.moderate;
  return CONFIDENCE_BANDS.low;
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
        'inline-flex items-center gap-1 rounded-full border px-2 py-0.5 text-[10.5px] font-semibold uppercase tracking-wider',
        config.className
      )}
    >
      <Icon className="h-3 w-3" aria-hidden="true" />
      {config.label}
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

function CategoryTag({ category }) {
  return (
    <span className="inline-flex items-center gap-1 rounded border border-slate-200 bg-slate-50 px-1.5 py-0.5 text-[10px] font-semibold uppercase tracking-wider text-slate-600">
      <Layers className="h-2.5 w-2.5" aria-hidden="true" />
      {category}
    </span>
  );
}

function ConfidenceMeter({ score }) {
  if (score === 0) {
    return (
      <span className="text-[11px] font-medium text-slate-400">
        No signal
      </span>
    );
  }
  const band = getConfidenceBand(score);
  return (
    <div className="flex flex-col gap-1">
      <div className="flex items-center justify-between text-[10.5px] font-semibold">
        <span className={band.className}>{band.label}</span>
        <span className="tabular-nums text-slate-700">{score}%</span>
      </div>
      <div
        role="progressbar"
        aria-valuenow={score}
        aria-valuemin={0}
        aria-valuemax={100}
        aria-label={`AI confidence ${score} percent`}
        className="h-1.5 w-full overflow-hidden rounded-full bg-slate-100"
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

function ComplianceNotFound({ routeId }) {
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
          Compliance Record Not Found
        </h1>
        <p className="mt-1.5 text-[12.5px] leading-relaxed text-slate-600">
          No compliance record exists for bid{' '}
          <span className="font-mono font-semibold text-slate-800">
            {routeId || 'unknown'}
          </span>
          . The bid may not have been processed for AI verification yet, or the
          URL is incorrect.
        </p>
      </div>
      <Link
        to="/bids"
        className="inline-flex h-9 items-center gap-1.5 rounded-md bg-emerald-600 px-3.5 text-[12.5px] font-semibold text-white transition-colors hover:bg-emerald-700 focus:outline-none focus-visible:ring-2 focus-visible:ring-emerald-600 focus-visible:ring-offset-2"
      >
        <ArrowLeft className="h-3.5 w-3.5" aria-hidden="true" />
        Back to Bids
      </Link>
    </div>
  );
}

/* ================================================================== */
/*  PAGE HEADER                                                       */
/* ================================================================== */

function PageHeader({ record, overallStatus, onExport, onSendToReview }) {
  const statusConfig = OVERALL_STATUS[overallStatus] ?? OVERALL_STATUS['requires-review'];

  return (
    <div className="flex flex-col gap-4">
      <Link
        to={`/bids/${encodeURIComponent(record.bidId)}`}
        className="inline-flex w-fit items-center gap-1 text-[12px] font-medium text-slate-500 transition-colors hover:text-slate-800 focus:outline-none focus-visible:underline"
      >
        <ArrowLeft className="h-3.5 w-3.5" aria-hidden="true" />
        Back to Bid Details
      </Link>

      <div className="flex flex-col gap-4 lg:flex-row lg:items-start lg:justify-between">
        <div className="min-w-0 flex-1">
          <p className="text-[11px] font-semibold uppercase tracking-[0.15em] text-emerald-600">
            Compliance Verification Report
          </p>
          <h1 className="mt-1 text-xl font-semibold tracking-tight text-slate-900 sm:text-2xl">
            {record.bidderName}
          </h1>
          <div className="mt-2 flex flex-wrap items-center gap-x-3 gap-y-1.5 text-[12.5px] text-slate-600">
            <span className="inline-flex items-center gap-1.5">
              <FileText className="h-3.5 w-3.5 text-slate-400" aria-hidden="true" />
              <span className="font-mono text-[11.5px] font-semibold text-slate-800">
                {record.bidId}
              </span>
            </span>
            <span aria-hidden="true" className="text-slate-300">·</span>
            <span className="inline-flex items-center gap-1.5">
              <Layers className="h-3.5 w-3.5 text-slate-400" aria-hidden="true" />
              <Link
                to={`/tenders/${encodeURIComponent(record.tenderRef)}`}
                className="font-mono text-[11.5px] font-semibold text-emerald-600 transition-colors hover:text-emerald-700 focus:outline-none focus-visible:underline"
              >
                {record.tenderRef}
              </Link>
            </span>
            <span aria-hidden="true" className="text-slate-300">·</span>
            <span className="inline-flex items-center gap-1.5">
              <Building2 className="h-3.5 w-3.5 text-slate-400" aria-hidden="true" />
              {record.tenderOrganization}
            </span>
            <span aria-hidden="true" className="text-slate-300">·</span>
            <span className="inline-flex items-center gap-1.5">
              <Clock className="h-3.5 w-3.5 text-slate-400" aria-hidden="true" />
              Verified {record.verifiedAt}
            </span>
          </div>
          <p className="mt-1 text-[12px] text-slate-500">{record.tenderTitle}</p>
        </div>

        <div className="flex flex-col items-stretch gap-2 sm:flex-row sm:items-center sm:justify-end">
          <div className="flex items-center gap-2 self-start">
            <span
              className={cx(
                'inline-flex items-center gap-1 rounded-full border px-2.5 py-1 text-[11px] font-semibold uppercase tracking-wider',
                statusConfig.className
              )}
            >
              <ShieldCheck className="h-3.5 w-3.5" aria-hidden="true" />
              {statusConfig.label}
            </span>
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
              onClick={onExport}
              className="inline-flex h-9 items-center gap-1.5 rounded-md border border-slate-200 bg-white px-3 text-[12.5px] font-semibold text-slate-700 shadow-sm transition-colors hover:bg-slate-50 focus:outline-none focus-visible:ring-2 focus-visible:ring-emerald-600 focus-visible:ring-offset-1"
            >
              <Download className="h-3.5 w-3.5" aria-hidden="true" />
              Export Report
            </button>
            <button
              type="button"
              onClick={onSendToReview}
              className="inline-flex h-9 items-center gap-1.5 rounded-md bg-emerald-600 px-3.5 text-[12.5px] font-semibold text-white shadow-sm transition-colors hover:bg-emerald-700 focus:outline-none focus-visible:ring-2 focus-visible:ring-emerald-600 focus-visible:ring-offset-2"
            >
              <UserCheck className="h-3.5 w-3.5" aria-hidden="true" />
              Send to Review
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

/* ================================================================== */
/*  SCORE CARD                                                        */
/* ================================================================== */

function ScoreCard({ score, metrics }) {
  const tone = useMemo(() => {
    if (score >= 90) return { bar: 'bg-emerald-500', text: 'text-emerald-600', label: 'High Compliance' };
    if (score >= 60) return { bar: 'bg-amber-500', text: 'text-amber-600', label: 'Moderate Compliance' };
    return { bar: 'bg-red-500', text: 'text-red-600', label: 'Low Compliance' };
  }, [score]);

  /* SVG circular progress */
  const radius = 54;
  const circumference = 2 * Math.PI * radius;
  const offset = circumference - (score / 100) * circumference;

  const metricCards = [
    {
      id: 'satisfied',
      label: 'Satisfied',
      value: metrics.satisfied,
      Icon: CheckCircle2,
      tone: 'emerald',
    },
    {
      id: 'failed',
      label: 'Failed',
      value: metrics.failed,
      Icon: XCircle,
      tone: 'red',
    },
    {
      id: 'review',
      label: 'Review Needed',
      value: metrics.review,
      Icon: AlertTriangle,
      tone: 'amber',
    },
    {
      id: 'missing',
      label: 'Missing Docs',
      value: metrics.notSubmitted,
      Icon: AlertTriangle,
      tone: 'slate',
    },
  ];

  const toneIcon = {
    slate: 'bg-slate-100 text-slate-700',
    emerald: 'bg-emerald-50 text-emerald-600',
    amber: 'bg-amber-50 text-amber-600',
    red: 'bg-red-50 text-red-600',
  };

  return (
    <section
      aria-label="Compliance score overview"
      className="overflow-hidden rounded-lg border border-slate-200 bg-white shadow-sm"
    >
      <div className="grid grid-cols-1 gap-5 p-5 lg:grid-cols-3">
        {/* Circular score */}
        <div className="flex flex-col items-center justify-center gap-3 border-b border-slate-100 pb-5 lg:border-b-0 lg:border-r lg:pb-0 lg:pr-5">
          <div className="relative inline-flex h-36 w-36 items-center justify-center">
            <svg
              className="absolute inset-0 -rotate-90"
              viewBox="0 0 120 120"
              aria-hidden="true"
            >
              <circle
                cx="60"
                cy="60"
                r={radius}
                fill="none"
                stroke="currentColor"
                strokeWidth="8"
                className="text-slate-100"
              />
              <circle
                cx="60"
                cy="60"
                r={radius}
                fill="none"
                stroke="currentColor"
                strokeWidth="8"
                strokeLinecap="round"
                strokeDasharray={circumference}
                strokeDashoffset={offset}
                className={cx(tone.text, 'transition-[stroke-dashoffset] duration-700')}
              />
            </svg>
            <div className="relative flex flex-col items-center">
              <span
                className={cx(
                  'text-3xl font-semibold tabular-nums tracking-tight',
                  tone.text
                )}
              >
                {score}%
              </span>
              <span className="mt-0.5 text-[10.5px] font-semibold uppercase tracking-wider text-slate-500">
                Demo Score
              </span>
            </div>
          </div>
          <span
            className={cx(
              'inline-flex items-center gap-1 rounded-full border px-2.5 py-0.5 text-[11px] font-semibold uppercase tracking-wider',
              score >= 90
                ? 'border-emerald-200 bg-emerald-50 text-emerald-700'
                : score >= 60
                ? 'border-amber-200 bg-amber-50 text-amber-700'
                : 'border-red-200 bg-red-50 text-red-700'
            )}
          >
            {tone.label}
          </span>
        </div>

        {/* Metric badges */}
        <div className="lg:col-span-2">
          <ul className="grid grid-cols-2 gap-3 sm:grid-cols-4">
            {metricCards.map((metric) => {
              const MetricIcon = metric.Icon;
              return (
                <li
                  key={metric.id}
                  className="rounded-md border border-slate-200 bg-slate-50 p-3"
                >
                  <div className="flex items-center justify-between gap-2">
                    <span className="text-[10.5px] font-semibold uppercase tracking-wider text-slate-500">
                      {metric.label}
                    </span>
                    <span
                      className={cx(
                        'inline-flex h-6 w-6 flex-shrink-0 items-center justify-center rounded-md',
                        toneIcon[metric.tone]
                      )}
                      aria-hidden="true"
                    >
                      <MetricIcon className="h-3 w-3" />
                    </span>
                  </div>
                  <p className="mt-1.5 text-xl font-semibold tabular-nums tracking-tight text-slate-900">
                    {metric.value}
                  </p>
                </li>
              );
            })}
          </ul>

          <div className="mt-4 flex items-start gap-2 rounded-md border border-amber-200 bg-amber-50 p-3">
            <Info
              className="mt-0.5 h-3.5 w-3.5 flex-shrink-0 text-amber-600"
              aria-hidden="true"
            />
            <p className="text-[11.5px] leading-relaxed text-amber-800">
              <span className="font-semibold">Disclaimer: </span>
              Demo score calculated from mock verification results; not an
              official GeM scoring method. Confidence scores and AI
              explanations are decision-support signals, subject to human
              review. They are not legally binding determinations.
            </p>
          </div>
        </div>
      </div>
    </section>
  );
}

/* ================================================================== */
/*  FILTER PANEL                                                      */
/* ================================================================== */

function FilterPanel({
  statusTab,
  onStatusTabChange,
  category,
  onCategoryChange,
  search,
  onSearchChange,
  counts,
  total,
}) {
  return (
    <section
      aria-label="Filter and search compliance requirements"
      className="flex flex-col gap-3 rounded-lg border border-slate-200 bg-white p-4 shadow-sm"
    >
      {/* Status tabs */}
      <div
        role="tablist"
        aria-label="Filter by verification status"
        className="flex gap-1 overflow-x-auto"
      >
        {STATUS_TABS.map((tab) => {
          const isActive = tab.id === statusTab;
          const count = tab.id === 'all' ? total : counts[tab.id] ?? 0;
          return (
            <button
              key={tab.id}
              type="button"
              role="tab"
              aria-selected={isActive}
              onClick={() => onStatusTabChange(tab.id)}
              className={cx(
                'inline-flex flex-shrink-0 items-center gap-1.5 whitespace-nowrap rounded-md px-3 py-1.5 text-[12px] font-semibold transition-colors focus:outline-none focus-visible:ring-2 focus-visible:ring-emerald-600 focus-visible:ring-offset-1',
                isActive
                  ? 'bg-slate-900 text-white'
                  : 'text-slate-600 hover:bg-slate-100 hover:text-slate-900'
              )}
            >
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

      {/* Search + category filter */}
      <div className="grid grid-cols-1 gap-3 md:grid-cols-12">
        <div className="md:col-span-8">
          <label
            htmlFor="compliance-search"
            className="mb-1.5 block text-[11px] font-semibold uppercase tracking-wider text-slate-500"
          >
            Search
          </label>
          <div className="relative">
            <span className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-3 text-slate-400">
              <Search className="h-4 w-4" aria-hidden="true" />
            </span>
            <input
              id="compliance-search"
              type="search"
              value={search}
              onChange={(event) => onSearchChange(event.target.value)}
              placeholder="Match requirement, evidence file, or AI reasoning…"
              autoComplete="off"
              className="h-9 w-full rounded-md border border-slate-200 bg-white pl-9 pr-3 text-[13px] text-slate-900 placeholder:text-slate-400 transition-colors focus:border-emerald-600 focus:outline-none focus:ring-2 focus:ring-emerald-600/20"
            />
          </div>
        </div>

        <div className="md:col-span-4">
          <label
            htmlFor="compliance-category"
            className="mb-1.5 block text-[11px] font-semibold uppercase tracking-wider text-slate-500"
          >
            Category
          </label>
          <div className="relative">
            <span className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-3 text-slate-400">
              <Filter className="h-4 w-4" aria-hidden="true" />
            </span>
            <select
              id="compliance-category"
              value={category}
              onChange={(event) => onCategoryChange(event.target.value)}
              className="h-9 w-full cursor-pointer appearance-none rounded-md border border-slate-200 bg-white pl-9 pr-3 text-[13px] text-slate-900 transition-colors focus:border-emerald-600 focus:outline-none focus:ring-2 focus:ring-emerald-600/20"
            >
              {CATEGORY_OPTIONS.map((option) => (
                <option key={option} value={option}>
                  {option}
                </option>
              ))}
            </select>
          </div>
        </div>
      </div>
    </section>
  );
}

/* ================================================================== */
/*  REQUIREMENT DETAIL DRAWER                                         */
/* ================================================================== */

function RequirementDetailDrawer({ requirement, onClose, onOverride, onFlag }) {
  useEffect(() => {
    const onKey = (event) => {
      if (event.key === 'Escape') onClose();
    };
    document.addEventListener('keydown', onKey);
    document.body.style.overflow = 'hidden';
    return () => {
      document.removeEventListener('keydown', onKey);
      document.body.style.overflow = '';
    };
  }, [onClose]);

  const statusConfig = STATUS_CONFIG[requirement.status];
  const band = getConfidenceBand(requirement.confidence);

  return (
    <div className="fixed inset-0 z-50 flex">
      <div
        className="flex-1 bg-slate-900/50 backdrop-blur-sm"
        onClick={onClose}
        aria-hidden="true"
      />

      <aside
        role="dialog"
        aria-modal="true"
        aria-labelledby="requirement-drawer-title"
        className="flex h-full w-full max-w-xl flex-col bg-white shadow-2xl"
      >
        {/* Header */}
        <header className="flex items-start justify-between gap-3 border-b border-slate-200 p-5">
          <div className="min-w-0">
            <div className="mb-2 flex flex-wrap items-center gap-2">
              <CategoryTag category={requirement.category} />
              <MandatoryBadge mandatory={requirement.mandatory} />
              <StatusBadge status={requirement.status} />
            </div>
            <h2
              id="requirement-drawer-title"
              className="text-[15px] font-semibold leading-tight text-slate-900"
            >
              {requirement.name}
            </h2>
          </div>
          <button
            type="button"
            onClick={onClose}
            aria-label="Close details"
            className="inline-flex h-8 w-8 flex-shrink-0 items-center justify-center rounded-md text-slate-500 transition-colors hover:bg-slate-100 hover:text-slate-800 focus:outline-none focus-visible:ring-2 focus-visible:ring-emerald-600 focus-visible:ring-offset-1"
          >
            <X className="h-4 w-4" aria-hidden="true" />
          </button>
        </header>

        {/* Body */}
        <div className="flex-1 overflow-y-auto p-5">
          {/* Evidence document */}
          <section aria-labelledby="evidence-section-title" className="mb-5">
            <h3
              id="evidence-section-title"
              className="mb-2 text-[11px] font-semibold uppercase tracking-wider text-slate-500"
            >
              Submitted Evidence
            </h3>
            {requirement.evidenceDoc ? (
              <div className="flex items-center justify-between gap-3 rounded-md border border-slate-200 bg-slate-50 p-3">
                <div className="flex min-w-0 items-center gap-2">
                  <FileText
                    className="h-4 w-4 flex-shrink-0 text-slate-500"
                    aria-hidden="true"
                  />
                  <div className="min-w-0">
                    <p className="truncate text-[12.5px] font-medium text-slate-800">
                      {requirement.evidenceDoc}
                    </p>
                    <p className="mt-0.5 text-[11px] text-slate-500">
                      {requirement.evidenceSize}
                    </p>
                  </div>
                </div>
                <button
                  type="button"
                  className="inline-flex h-7 flex-shrink-0 items-center gap-1 rounded-md border border-slate-200 bg-white px-2.5 text-[11.5px] font-semibold text-slate-700 transition-colors hover:bg-slate-50 focus:outline-none focus-visible:ring-2 focus-visible:ring-emerald-600 focus-visible:ring-offset-1"
                >
                  <ExternalLink className="h-3 w-3" aria-hidden="true" />
                  View
                </button>
              </div>
            ) : (
              <div className="flex items-center gap-2 rounded-md border border-slate-200 bg-slate-50 p-3 text-[12.5px] text-slate-500">
                <AlertTriangle
                  className="h-4 w-4 flex-shrink-0 text-slate-400"
                  aria-hidden="true"
                />
                No evidence document was submitted against this requirement.
              </div>
            )}
          </section>

          {/* Extracted vs Expected */}
          <section aria-labelledby="comparison-section-title" className="mb-5">
            <h3
              id="comparison-section-title"
              className="mb-2 text-[11px] font-semibold uppercase tracking-wider text-slate-500"
            >
              Extracted vs Expected
            </h3>
            <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
              <div className="rounded-md border border-slate-200 bg-white p-3">
                <p className="text-[10.5px] font-semibold uppercase tracking-wider text-emerald-600">
                  Extracted Value
                </p>
                <p className="mt-1.5 text-[12.5px] leading-relaxed text-slate-800">
                  {requirement.extractedValue}
                </p>
              </div>
              <div className="rounded-md border border-slate-200 bg-white p-3">
                <p className="text-[10.5px] font-semibold uppercase tracking-wider text-slate-500">
                  Expected Requirement
                </p>
                <p className="mt-1.5 text-[12.5px] leading-relaxed text-slate-800">
                  {requirement.expectedValue}
                </p>
              </div>
            </div>
          </section>

          {/* AI Finding */}
          <section aria-labelledby="ai-finding-section-title" className="mb-5">
            <div className="mb-2 flex items-center gap-2">
              <span
                className="inline-flex h-6 w-6 items-center justify-center rounded-md bg-emerald-50 text-emerald-600"
                aria-hidden="true"
              >
                <Brain className="h-3.5 w-3.5" />
              </span>
              <h3
                id="ai-finding-section-title"
                className="text-[11px] font-semibold uppercase tracking-wider text-slate-500"
              >
                AI Finding & Reasoning
              </h3>
            </div>
            <div className="rounded-md border border-slate-200 bg-slate-50 p-3">
              <p className="text-[12.5px] leading-relaxed text-slate-700">
                {requirement.aiReason}
              </p>
            </div>
          </section>

          {/* Confidence */}
          <section aria-labelledby="confidence-section-title" className="mb-5">
            <h3
              id="confidence-section-title"
              className="mb-2 text-[11px] font-semibold uppercase tracking-wider text-slate-500"
            >
              AI Confidence Signal
            </h3>
            <div className="rounded-md border border-slate-200 bg-white p-3">
              <ConfidenceMeter score={requirement.confidence} />
              <p className="mt-2 flex items-start gap-1.5 text-[11px] leading-relaxed text-slate-500">
                <Info className="mt-0.5 h-3 w-3 flex-shrink-0" aria-hidden="true" />
                AI system confidence signal, subject to human review. Not a
                legally binding determination.
              </p>
            </div>
          </section>

          {/* Recommended action */}
          <section aria-labelledby="recommended-action-section-title">
            <h3
              id="recommended-action-section-title"
              className="mb-2 text-[11px] font-semibold uppercase tracking-wider text-slate-500"
            >
              Recommended Action
            </h3>
            <div
              className={cx(
                'rounded-md border p-3 text-[12.5px] leading-relaxed',
                requirement.status === 'satisfied'
                  ? 'border-emerald-200 bg-emerald-50 text-emerald-800'
                  : requirement.status === 'review'
                  ? 'border-amber-200 bg-amber-50 text-amber-800'
                  : 'border-red-200 bg-red-50 text-red-800'
              )}
            >
              {requirement.recommendedAction}
            </div>
          </section>
        </div>

        {/* Footer actions */}
        <footer className="flex flex-col gap-2 border-t border-slate-200 bg-slate-50 p-4 sm:flex-row sm:items-center sm:justify-end">
          <button
            type="button"
            onClick={() => onFlag(requirement.id)}
            className="inline-flex h-9 items-center justify-center gap-1.5 rounded-md border border-slate-200 bg-white px-3.5 text-[12.5px] font-semibold text-slate-700 transition-colors hover:bg-slate-50 focus:outline-none focus-visible:ring-2 focus-visible:ring-amber-500 focus-visible:ring-offset-1"
          >
            <UserCheck className="h-3.5 w-3.5" aria-hidden="true" />
            Flag for Review
          </button>
          <button
            type="button"
            onClick={() => onOverride(requirement.id)}
            className="inline-flex h-9 items-center justify-center gap-1.5 rounded-md bg-emerald-600 px-3.5 text-[12.5px] font-semibold text-white transition-colors hover:bg-emerald-700 focus:outline-none focus-visible:ring-2 focus-visible:ring-emerald-600 focus-visible:ring-offset-2"
          >
            <CheckCircle2 className="h-3.5 w-3.5" aria-hidden="true" />
            Override to Satisfied
          </button>
        </footer>
      </aside>
    </div>
  );
}

/* ================================================================== */
/*  REQUIREMENTS LIST                                                 */
/* ================================================================== */

function RequirementsList({ requirements, onSelect, selectedId }) {
  if (requirements.length === 0) {
    return (
      <div className="flex flex-col items-center gap-2 rounded-lg border border-slate-200 bg-white px-6 py-14 text-center shadow-sm">
        <span
          className="inline-flex h-11 w-11 items-center justify-center rounded-md bg-slate-100 text-slate-500"
          aria-hidden="true"
        >
          <Search className="h-5 w-5" />
        </span>
        <p className="text-[13.5px] font-semibold text-slate-800">
          No requirements match your filters
        </p>
        <p className="text-[12px] text-slate-500">
          Try adjusting the search terms, status tab, or category.
        </p>
      </div>
    );
  }

  return (
    <section
      aria-label="Compliance requirements"
      className="overflow-hidden rounded-lg border border-slate-200 bg-white shadow-sm"
    >
      <header className="border-b border-slate-200 px-5 py-4">
        <h2 className="text-[13.5px] font-semibold text-slate-900">
          Requirement Verification Details
        </h2>
        <p className="mt-0.5 text-[12px] text-slate-500">
          {requirements.length} requirement{requirements.length === 1 ? '' : 's'} shown
        </p>
      </header>

      {/* Desktop table */}
      <div className="hidden overflow-x-auto lg:block">
        <table className="w-full min-w-[1024px] border-collapse text-left text-[12.5px]">
          <caption className="sr-only">
            Compliance verification results per requirement
          </caption>
          <thead>
            <tr className="border-b border-slate-200 bg-slate-50 text-[11px] font-semibold uppercase tracking-wider text-slate-500">
              <th scope="col" className="px-5 py-2.5">Requirement</th>
              <th scope="col" className="px-5 py-2.5">Evidence</th>
              <th scope="col" className="px-5 py-2.5">Status</th>
              <th scope="col" className="px-5 py-2.5 w-[180px]">AI Confidence</th>
              <th scope="col" className="px-5 py-2.5">AI Reason</th>
              <th scope="col" className="px-5 py-2.5 text-right">Action</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100">
            {requirements.map((req) => (
              <tr
                key={req.id}
                className={cx(
                  'align-top transition-colors hover:bg-slate-50/70',
                  selectedId === req.id ? 'bg-emerald-50/30' : ''
                )}
              >
                <td className="max-w-[260px] px-5 py-3.5">
                  <div className="flex flex-col gap-1.5">
                    <p className="text-[12.5px] font-semibold text-slate-800">
                      {req.name}
                    </p>
                    <div className="flex flex-wrap items-center gap-1.5">
                      <CategoryTag category={req.category} />
                      <MandatoryBadge mandatory={req.mandatory} />
                    </div>
                  </div>
                </td>
                <td className="max-w-[200px] px-5 py-3.5">
                  {req.evidenceDoc ? (
                    <span className="flex items-start gap-1.5 text-[12px] text-slate-700">
                      <FileText
                        className="mt-0.5 h-3.5 w-3.5 flex-shrink-0 text-slate-400"
                        aria-hidden="true"
                      />
                      <span className="truncate">{req.evidenceDoc}</span>
                    </span>
                  ) : (
                    <span className="text-[12px] italic text-slate-400">
                      Not submitted
                    </span>
                  )}
                </td>
                <td className="whitespace-nowrap px-5 py-3.5">
                  <StatusBadge status={req.status} />
                </td>
                <td className="px-5 py-3.5">
                  <ConfidenceMeter score={req.confidence} />
                </td>
                <td className="max-w-[300px] px-5 py-3.5 text-[11.5px] leading-relaxed text-slate-600">
                  <span className="line-clamp-2">{req.aiReason}</span>
                </td>
                <td className="whitespace-nowrap px-5 py-3.5 text-right">
                  <button
                    type="button"
                    onClick={() => onSelect(req.id)}
                    className="inline-flex items-center gap-1 text-[12px] font-semibold text-emerald-600 transition-colors hover:text-emerald-700 focus:outline-none focus-visible:underline"
                  >
                    View Details
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
        {requirements.map((req) => (
          <li key={req.id} className="flex flex-col gap-3 p-4">
            <div className="flex items-start justify-between gap-3">
              <div className="min-w-0">
                <p className="text-[13px] font-semibold text-slate-800">
                  {req.name}
                </p>
                <div className="mt-1.5 flex flex-wrap items-center gap-1.5">
                  <CategoryTag category={req.category} />
                  <MandatoryBadge mandatory={req.mandatory} />
                </div>
              </div>
              <StatusBadge status={req.status} />
            </div>

            {req.evidenceDoc ? (
              <span className="flex items-start gap-1.5 text-[12px] text-slate-700">
                <FileText
                  className="mt-0.5 h-3.5 w-3.5 flex-shrink-0 text-slate-400"
                  aria-hidden="true"
                />
                <span className="truncate">{req.evidenceDoc}</span>
              </span>
            ) : (
              <span className="text-[12px] italic text-slate-400">
                Not submitted
              </span>
            )}

            <ConfidenceMeter score={req.confidence} />

            <p className="text-[11.5px] leading-relaxed text-slate-600">
              {req.aiReason}
            </p>

            <button
              type="button"
              onClick={() => onSelect(req.id)}
              className="inline-flex h-8 w-fit items-center gap-1 rounded-md border border-slate-200 bg-white px-3 text-[12px] font-semibold text-slate-700 transition-colors hover:bg-slate-50 focus:outline-none focus-visible:ring-2 focus-visible:ring-emerald-600 focus-visible:ring-offset-1"
            >
              View Details
              <ChevronRight className="h-3.5 w-3.5" aria-hidden="true" />
            </button>
          </li>
        ))}
      </ul>
    </section>
  );
}

/* ================================================================== */
/*  PAGE                                                              */
/* ================================================================== */

export default function ComplianceResults() {
  const { bidId } = useParams();

  const record = useMemo(
    () => COMPLIANCE_REGISTRY[bidId] ?? null,
    [bidId]
  );

  /* Local state — cloning requirements so HITL updates don't mutate mock data */
  const [requirements, setRequirements] = useState(
    () => record?.requirements?.map((r) => ({ ...r })) ?? []
  );
  const [statusTab, setStatusTab] = useState('all');
  const [category, setCategory] = useState('All Categories');
  const [search, setSearch] = useState('');
  const [selectedId, setSelectedId] = useState(null);
  const [toast, setToast] = useState(null);

  /* Re-hydrate when route param changes */
  useEffect(() => {
    if (record) {
      setRequirements(record.requirements.map((r) => ({ ...r })));
      setStatusTab('all');
      setCategory('All Categories');
      setSearch('');
      setSelectedId(null);
    }
  }, [record]);

  /* Toast auto-dismiss */
  useEffect(() => {
    if (!toast) return;
    const timeout = setTimeout(() => setToast(null), 2800);
    return () => clearTimeout(timeout);
  }, [toast]);

  /* ---------------- Metrics + deterministic score ---------------- */
  const metrics = useMemo(() => {
    const base = {
      total: requirements.length,
      satisfied: 0,
      failed: 0,
      review: 0,
      notSubmitted: 0,
    };
    return requirements.reduce((acc, req) => {
      if (req.status === 'satisfied') acc.satisfied += 1;
      else if (req.status === 'failed') acc.failed += 1;
      else if (req.status === 'review') acc.review += 1;
      else if (req.status === 'not-submitted') acc.notSubmitted += 1;
      return acc;
    }, base);
  }, [requirements]);

  const score = useMemo(() => {
    if (requirements.length === 0) return 0;
    const totalWeight = requirements.reduce(
      (sum, req) => sum + (STATUS_CONFIG[req.status]?.weight ?? 0),
      0
    );
    return Math.round((totalWeight / requirements.length) * 100);
  }, [requirements]);

  const overallStatus = useMemo(() => {
    if (requirements.length === 0) return 'requires-review';
    if (metrics.failed > 0 || metrics.notSubmitted > 0) {
      // If any hard failures or missing docs exist → non-compliant
      return metrics.satisfied === 0 ? 'non-compliant' : 'non-compliant';
    }
    if (metrics.review > 0) return 'requires-review';
    return 'compliant';
  }, [metrics, requirements.length]);

  /* ---------------- Filtering ---------------- */
  const filtered = useMemo(() => {
    const q = search.trim().toLowerCase();
    return requirements.filter((req) => {
      const matchesStatus =
        statusTab === 'all' || req.status === statusTab;
      const matchesCategory =
        category === 'All Categories' || req.category === category;
      const matchesSearch =
        q === '' ||
        req.name.toLowerCase().includes(q) ||
        (req.evidenceDoc ?? '').toLowerCase().includes(q) ||
        req.aiReason.toLowerCase().includes(q);
      return matchesStatus && matchesCategory && matchesSearch;
    });
  }, [requirements, statusTab, category, search]);

  const counts = useMemo(
    () => ({
      satisfied: metrics.satisfied,
      failed: metrics.failed,
      review: metrics.review,
      'not-submitted': metrics.notSubmitted,
    }),
    [metrics]
  );

  /* ---------------- HITL handlers ---------------- */
  const handleOverride = useCallback((id) => {
    setRequirements((prev) =>
      prev.map((req) =>
        req.id === id ? { ...req, status: 'satisfied', confidence: 100 } : req
      )
    );
    setToast({
      type: 'success',
      message: 'Requirement overridden to Satisfied. Score updated.',
    });
  }, []);

  const handleFlag = useCallback((id) => {
    setRequirements((prev) =>
      prev.map((req) =>
        req.id === id ? { ...req, status: 'review' } : req
      )
    );
    setToast({
      type: 'success',
      message: 'Requirement flagged for human review.',
    });
  }, []);

  /* ---------------- Page-level actions ---------------- */
  const handleExport = useCallback(() => {
    setToast({
      type: 'success',
      message: 'Compliance report export queued. Download will begin shortly.',
    });
  }, []);

  const handleSendToReview = useCallback(() => {
    setToast({
      type: 'success',
      message: `Bid ${record?.bidId ?? ''} sent to the review queue.`,
    });
  }, [record]);

  const handleSelectRequirement = useCallback((id) => {
    setSelectedId(id);
  }, []);

  const handleCloseDrawer = useCallback(() => {
    setSelectedId(null);
  }, []);

  /* ---------------- Fallback ---------------- */
  if (!record) {
    return <ComplianceNotFound routeId={bidId} />;
  }

  const selectedRequirement = selectedId
    ? requirements.find((r) => r.id === selectedId) ?? null
    : null;

  return (
    <div className="flex flex-col gap-5">
      {/* Toast */}
      {toast ? (
        <div
          role="status"
          aria-live="polite"
          className={cx(
            'fixed bottom-5 right-5 z-[60] flex max-w-sm items-start gap-2.5 rounded-md border px-3 py-2.5 text-[12.5px] shadow-lg',
            toast.type === 'success'
              ? 'border-emerald-200 bg-emerald-50 text-emerald-700'
              : 'border-red-200 bg-red-50 text-red-600'
          )}
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
        record={record}
        overallStatus={overallStatus}
        onExport={handleExport}
        onSendToReview={handleSendToReview}
      />

      {/* Score card */}
      <ScoreCard score={score} metrics={metrics} />

      {/* Filter panel */}
      <FilterPanel
        statusTab={statusTab}
        onStatusTabChange={setStatusTab}
        category={category}
        onCategoryChange={setCategory}
        search={search}
        onSearchChange={setSearch}
        counts={counts}
        total={requirements.length}
      />

      {/* Requirements list */}
      <RequirementsList
        requirements={filtered}
        onSelect={handleSelectRequirement}
        selectedId={selectedId}
      />

      {/* Detail drawer */}
      {selectedRequirement ? (
        <RequirementDetailDrawer
          requirement={selectedRequirement}
          onClose={handleCloseDrawer}
          onOverride={handleOverride}
          onFlag={handleFlag}
        />
      ) : null}
    </div>
  );
}