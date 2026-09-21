import { useCallback, useEffect, useMemo, useState } from 'react';
import { Link, useNavigate, useParams } from 'react-router-dom';
import {
  FileText,
  CheckCircle2,
  XCircle,
  AlertTriangle,
  Clock,
  Eye,
  Download,
  ShieldAlert,
  ShieldCheck,
  Building2,
  RefreshCw,
  ArrowLeft,
  Layers,
  ExternalLink,
  ChevronRight,
  X,
  Mail,
  Phone,
  MapPin,
  IndianRupee,
} from 'lucide-react';

/* ================================================================== */
/*  MOCK DATA — keyed by Bid ID                                       */
/* ================================================================== */

const BID_REGISTRY = {
  'BID-2026-8801': {
    id: 'BID-2026-8801',
    bidder: {
      name: 'Dell Technologies India Pvt Ltd',
      legalName: 'Dell Technologies India Private Limited',
      cin: 'U72200KA1996PTC020396',
      udyam: 'UDYAM-KR-03-0004521',
      gstin: '29AAACD1234F1Z5',
      pan: 'AAACD1234F',
      contactPerson: 'Ramesh Iyer',
      email: 'govt.sales@dell.example.in',
      phone: '+91 80 4567 8900',
      address: '12th Floor, Divyasree Technopolis, Bengaluru 560103',
    },
    tenderRef: 'GEM/2024/B/5521091',
    tenderTitle: 'Supply of Desktop Computers & Peripherals',
    tenderCategory: 'IT Hardware',
    tenderOrganization: 'Ministry of Education',
    submittedAt: '2025-01-08 14:22 IST',
    status: 'under-review',
    complianceScore: 94,
    quotedAmount: '₹ 2,32,80,000',
    emdExempt: true,
    emdReason: 'MSME registered — EMD exemption under PPP-MII Order',
    documents: [
      {
        id: 'doc-1',
        name: 'GST Registration Certificate.pdf',
        size: '428 KB',
        format: 'PDF',
        verification: 'verified',
        ocrSnippet:
          'GSTIN 29AAACD1234F1Z5 · Legal Name: Dell Technologies India Pvt Ltd · Registration Date: 14-Mar-2017',
        uploadedAt: '2025-01-08 14:10 IST',
        required: true,
      },
      {
        id: 'doc-2',
        name: 'Company PAN Card.pdf',
        size: '212 KB',
        format: 'PDF',
        verification: 'verified',
        ocrSnippet:
          'PAN AAACD1234F · Entity Type: Company · Name matches submitted bidder profile',
        uploadedAt: '2025-01-08 14:11 IST',
        required: true,
      },
      {
        id: 'doc-3',
        name: 'Udyam Registration Certificate.pdf',
        size: '186 KB',
        format: 'PDF',
        verification: 'verified',
        ocrSnippet:
          'Udyam Registration Number: UDYAM-KR-03-0004521 · Enterprise Type: Medium · MSME Category: Service',
        uploadedAt: '2025-01-08 14:12 IST',
        required: false,
      },
      {
        id: 'doc-4',
        name: 'Audited Financials FY22-24.pdf',
        size: '3.8 MB',
        format: 'PDF',
        verification: 'review',
        ocrSnippet:
          'Turnover FY22: ₹ 1,240 Cr · FY23: ₹ 1,412 Cr · FY24: ₹ 1,588 Cr · CA signature page 47 partially legible',
        uploadedAt: '2025-01-08 14:14 IST',
        required: true,
      },
      {
        id: 'doc-5',
        name: 'ISO 9001-2015 Certificate.pdf',
        size: '542 KB',
        format: 'PDF',
        verification: 'verified',
        ocrSnippet:
          'Certificate No. IN-ISO-2023-08841 · Valid till 22-Nov-2026 · Scope: Design & Supply of IT Hardware',
        uploadedAt: '2025-01-08 14:15 IST',
        required: true,
      },
      {
        id: 'doc-6',
        name: 'Past Experience Certificates.pdf',
        size: '1.6 MB',
        format: 'PDF',
        verification: 'verified',
        ocrSnippet:
          '3 work orders · MoE (₹ 62 L), MeitY (₹ 84 L), AIIMS (₹ 47 L) · All within last 5 years',
        uploadedAt: '2025-01-08 14:17 IST',
        required: true,
      },
      {
        id: 'doc-7',
        name: 'OEM Authorisation Letter.pdf',
        size: '318 KB',
        format: 'PDF',
        verification: 'failed',
        ocrSnippet:
          'Authorisation issued 04-Jan-2025 · Signature field blank · Stamp not detected by OCR engine',
        uploadedAt: '2025-01-08 14:18 IST',
        required: true,
      },
      {
        id: 'doc-8',
        name: 'MSME Benefit Claim Form.pdf',
        size: '98 KB',
        format: 'PDF',
        verification: 'pending',
        ocrSnippet: 'Awaiting OCR extraction — document queued for processing',
        uploadedAt: '2025-01-08 14:20 IST',
        required: false,
      },
      {
        id: 'doc-9',
        name: 'Bid Security Declaration.pdf',
        size: '124 KB',
        format: 'PDF',
        verification: 'verified',
        ocrSnippet:
          'EMD exemption claimed under Clause 4.2 · Supported by Udyam registration',
        uploadedAt: '2025-01-08 14:21 IST',
        required: true,
      },
    ],
    complianceRules: [
      {
        id: 'rule-1',
        clause: 'Clause 3.1',
        description: 'Valid GST registration with 3+ years of filing history',
        requirement: 'Mandatory',
        status: 'passed',
        aiRemark: 'GSTIN verified against GSTN registry. Continuous filing confirmed.',
      },
      {
        id: 'rule-2',
        clause: 'Clause 3.2',
        description: 'Minimum annual turnover of ₹ 5 Cr in each of last 3 FYs',
        requirement: 'Mandatory',
        status: 'passed',
        aiRemark: 'Reported turnover well above threshold in all 3 financial years.',
      },
      {
        id: 'rule-3',
        clause: 'Clause 3.3',
        description: 'ISO 9001:2015 certification valid through bid period',
        requirement: 'Mandatory',
        status: 'passed',
        aiRemark: 'Certificate valid till 22-Nov-2026, covering the tender lifecycle.',
      },
      {
        id: 'rule-4',
        clause: 'Clause 3.4',
        description: 'Original OEM authorisation letter with valid signature',
        requirement: 'Mandatory',
        status: 'failed',
        aiRemark:
          'OCR detected blank signature field. Document rejected pending manual verification.',
      },
      {
        id: 'rule-5',
        clause: 'Clause 3.5',
        description: 'Minimum 3 similar supply orders of ₹ 50 Lakhs in last 5 years',
        requirement: 'Mandatory',
        status: 'passed',
        aiRemark: 'Three qualifying orders found. Each order cross-checked with issuing authority.',
      },
      {
        id: 'rule-6',
        clause: 'Clause 3.6',
        description: 'CA-certified balance sheet and P&L for FY22, FY23, FY24',
        requirement: 'Mandatory',
        status: 'review',
        aiRemark:
          'CA signature page partially legible — flagged for human verification of authenticity.',
      },
      {
        id: 'rule-7',
        clause: 'Clause 4.2',
        description: 'EMD payment or valid exemption certificate',
        requirement: 'Mandatory',
        status: 'passed',
        aiRemark: 'MSME exemption claimed and validated against Udyam registration.',
      },
      {
        id: 'rule-8',
        clause: 'Clause 5.1',
        description: 'MSME / Udyam registration for purchase preference',
        requirement: 'Optional',
        status: 'passed',
        aiRemark: 'Udyam registration verified. Bidder qualifies for MSE benefits.',
      },
      {
        id: 'rule-9',
        clause: 'Clause 5.2',
        description: 'BIS certification for all offered equipment models',
        requirement: 'Mandatory',
        status: 'review',
        aiRemark:
          'BIS certificates referenced but not attached as separate documents — pending upload confirmation.',
      },
    ],
  },
  'BID-2026-8802': {
    id: 'BID-2026-8802',
    bidder: {
      name: 'HP India Sales Pvt Ltd',
      legalName: 'HP India Sales Private Limited',
      cin: 'U30007KA1996PTC020431',
      udyam: 'UDYAM-KR-03-0007788',
      gstin: '29AAACH5678G1Z9',
      pan: 'AAACH5678G',
      contactPerson: 'Priya Nair',
      email: 'govt.bids@hp.example.in',
      phone: '+91 80 6789 1200',
      address: '24 Salarpuria Tech Park, Bengaluru 560103',
    },
    tenderRef: 'GEM/2024/B/5521091',
    tenderTitle: 'Supply of Desktop Computers & Peripherals',
    tenderCategory: 'IT Hardware',
    tenderOrganization: 'Ministry of Education',
    submittedAt: '2025-01-08 11:05 IST',
    status: 'verified',
    complianceScore: 98,
    quotedAmount: '₹ 2,38,50,000',
    emdExempt: false,
    emdReason: 'EMD paid via bank guarantee dated 06-Jan-2025',
    documents: [
      {
        id: 'doc-1',
        name: 'GST Registration Certificate.pdf',
        size: '412 KB',
        format: 'PDF',
        verification: 'verified',
        ocrSnippet: 'GSTIN 29AAACH5678G1Z9 · Active status confirmed',
        uploadedAt: '2025-01-08 10:52 IST',
        required: true,
      },
      {
        id: 'doc-2',
        name: 'Company PAN Card.pdf',
        size: '198 KB',
        format: 'PDF',
        verification: 'verified',
        ocrSnippet: 'PAN AAACH5678G · Entity Type: Company · Name matched',
        uploadedAt: '2025-01-08 10:54 IST',
        required: true,
      },
      {
        id: 'doc-3',
        name: 'Audited Financials FY22-24.pdf',
        size: '4.1 MB',
        format: 'PDF',
        verification: 'verified',
        ocrSnippet:
          'Turnover FY22: ₹ 2,180 Cr · FY23: ₹ 2,410 Cr · FY24: ₹ 2,690 Cr · CA certification clear',
        uploadedAt: '2025-01-08 10:56 IST',
        required: true,
      },
      {
        id: 'doc-4',
        name: 'ISO 9001-2015 Certificate.pdf',
        size: '508 KB',
        format: 'PDF',
        verification: 'verified',
        ocrSnippet: 'Certificate No. IN-ISO-2022-07719 · Valid till 14-Aug-2025',
        uploadedAt: '2025-01-08 10:57 IST',
        required: true,
      },
      {
        id: 'doc-5',
        name: 'OEM Authorisation Letter.pdf',
        size: '342 KB',
        format: 'PDF',
        verification: 'verified',
        ocrSnippet:
          'Authorisation issued 02-Jan-2025 · Signature and stamp both detected · Validity 12 months',
        uploadedAt: '2025-01-08 10:58 IST',
        required: true,
      },
      {
        id: 'doc-6',
        name: 'Past Experience Certificates.pdf',
        size: '1.9 MB',
        format: 'PDF',
        verification: 'verified',
        ocrSnippet: '4 qualifying work orders · All from central government bodies',
        uploadedAt: '2025-01-08 11:00 IST',
        required: true,
      },
      {
        id: 'doc-7',
        name: 'Bank Guarantee for EMD.pdf',
        size: '286 KB',
        format: 'PDF',
        verification: 'verified',
        ocrSnippet:
          'BG No. SBI/BG/2025/88412 · Amount ₹ 4,80,000 · Valid till 30-Jun-2025',
        uploadedAt: '2025-01-08 11:02 IST',
        required: true,
      },
    ],
    complianceRules: [
      {
        id: 'rule-1',
        clause: 'Clause 3.1',
        description: 'Valid GST registration with 3+ years of filing history',
        requirement: 'Mandatory',
        status: 'passed',
        aiRemark: 'GSTIN verified. Continuous filing since 2016.',
      },
      {
        id: 'rule-2',
        clause: 'Clause 3.2',
        description: 'Minimum annual turnover of ₹ 5 Cr in each of last 3 FYs',
        requirement: 'Mandatory',
        status: 'passed',
        aiRemark: 'Turnover substantially exceeds minimum threshold.',
      },
      {
        id: 'rule-3',
        clause: 'Clause 3.3',
        description: 'ISO 9001:2015 certification valid through bid period',
        requirement: 'Mandatory',
        status: 'passed',
        aiRemark: 'Certificate valid till 14-Aug-2025. Covers full evaluation period.',
      },
      {
        id: 'rule-4',
        clause: 'Clause 3.4',
        description: 'Original OEM authorisation letter with valid signature',
        requirement: 'Mandatory',
        status: 'passed',
        aiRemark: 'Signature and stamp detected. Authorisation current.',
      },
      {
        id: 'rule-5',
        clause: 'Clause 3.5',
        description: 'Minimum 3 similar supply orders of ₹ 50 Lakhs in last 5 years',
        requirement: 'Mandatory',
        status: 'passed',
        aiRemark: 'Four qualifying orders verified.',
      },
      {
        id: 'rule-6',
        clause: 'Clause 3.6',
        description: 'CA-certified balance sheet and P&L for FY22, FY23, FY24',
        requirement: 'Mandatory',
        status: 'passed',
        aiRemark: 'CA certification verified across all three years.',
      },
      {
        id: 'rule-7',
        clause: 'Clause 4.2',
        description: 'EMD payment or valid exemption certificate',
        requirement: 'Mandatory',
        status: 'passed',
        aiRemark: 'Bank guarantee validated. Amount and validity within parameters.',
      },
      {
        id: 'rule-8',
        clause: 'Clause 5.2',
        description: 'BIS certification for all offered equipment models',
        requirement: 'Mandatory',
        status: 'passed',
        aiRemark: 'BIS certificates attached for all 6 equipment models.',
      },
    ],
  },
};

/* ================================================================== */
/*  CONFIG MAPS                                                       */
/* ================================================================== */

const VERIFICATION_CONFIG = {
  verified: {
    label: 'Verified',
    className: 'bg-emerald-50 text-emerald-700 border-emerald-200',
    Icon: CheckCircle2,
  },
  failed: {
    label: 'Failed',
    className: 'bg-red-50 text-red-700 border-red-200',
    Icon: XCircle,
  },
  review: {
    label: 'Requires Review',
    className: 'bg-amber-50 text-amber-700 border-amber-200',
    Icon: AlertTriangle,
  },
  pending: {
    label: 'Pending',
    className: 'bg-slate-100 text-slate-600 border-slate-200',
    Icon: Clock,
  },
};

const RULE_STATUS_CONFIG = {
  passed: {
    label: 'Passed',
    className: 'bg-emerald-50 text-emerald-700 border-emerald-200',
    Icon: CheckCircle2,
  },
  failed: {
    label: 'Failed',
    className: 'bg-red-50 text-red-700 border-red-200',
    Icon: XCircle,
  },
  review: {
    label: 'Requires Review',
    className: 'bg-amber-50 text-amber-700 border-amber-200',
    Icon: AlertTriangle,
  },
};

const BID_STATUS_CONFIG = {
  verified: {
    label: 'Verified',
    className: 'bg-emerald-50 text-emerald-700 border-emerald-200',
  },
  'under-review': {
    label: 'Under Review',
    className: 'bg-amber-50 text-amber-700 border-amber-200',
  },
  rejected: {
    label: 'Rejected',
    className: 'bg-red-50 text-red-700 border-red-200',
  },
};

/* ================================================================== */
/*  HELPERS                                                           */
/* ================================================================== */

const cx = (...parts) => parts.filter(Boolean).join(' ');

const complianceTone = (score) => {
  if (score >= 90) return { bar: 'bg-emerald-500', text: 'text-emerald-600' };
  if (score >= 60) return { bar: 'bg-amber-500', text: 'text-amber-600' };
  return { bar: 'bg-red-500', text: 'text-red-600' };
};

/* ================================================================== */
/*  SMALL PRIMITIVES                                                  */
/* ================================================================== */

function StatusPill({ config, children }) {
  return (
    <span
      className={cx(
        'inline-flex items-center gap-1 rounded-full border px-2 py-0.5 text-[10.5px] font-semibold uppercase tracking-wider',
        config.className
      )}
    >
      {children}
    </span>
  );
}

function VerificationBadge({ state }) {
  const config = VERIFICATION_CONFIG[state] ?? VERIFICATION_CONFIG.pending;
  const Icon = config.Icon;
  return (
    <StatusPill config={config}>
      <Icon className="h-3 w-3" aria-hidden="true" />
      {config.label}
    </StatusPill>
  );
}

function RuleStatusBadge({ state }) {
  const config = RULE_STATUS_CONFIG[state] ?? RULE_STATUS_CONFIG.review;
  const Icon = config.Icon;
  return (
    <StatusPill config={config}>
      <Icon className="h-3 w-3" aria-hidden="true" />
      {config.label}
    </StatusPill>
  );
}

/* ================================================================== */
/*  NOT FOUND STATE                                                   */
/* ================================================================== */

function BidNotFound({ routeId }) {
  const navigate = useNavigate();
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
          Bid Record Not Found
        </h1>
        <p className="mt-1.5 text-[12.5px] leading-relaxed text-slate-600">
          No bid record exists with the reference{' '}
          <span className="font-mono font-semibold text-slate-800">
            {routeId || 'unknown'}
          </span>
          . The bid may have been withdrawn, archived, or the URL is incorrect.
        </p>
      </div>
      <div className="flex flex-wrap items-center justify-center gap-2">
        <button
          type="button"
          onClick={() => navigate(-1)}
          className="inline-flex h-9 items-center gap-1.5 rounded-md border border-slate-200 bg-white px-3.5 text-[12.5px] font-semibold text-slate-700 transition-colors hover:bg-slate-50 focus:outline-none focus-visible:ring-2 focus-visible:ring-emerald-600 focus-visible:ring-offset-1"
        >
          <ArrowLeft className="h-3.5 w-3.5" aria-hidden="true" />
          Go Back
        </button>
        <Link
          to="/tenders"
          className="inline-flex h-9 items-center gap-1.5 rounded-md bg-emerald-600 px-3.5 text-[12.5px] font-semibold text-white transition-colors hover:bg-emerald-700 focus:outline-none focus-visible:ring-2 focus-visible:ring-emerald-600 focus-visible:ring-offset-2"
        >
          <FileText className="h-3.5 w-3.5" aria-hidden="true" />
          Browse Tenders
        </Link>
      </div>
    </div>
  );
}

/* ================================================================== */
/*  PAGE HEADER                                                       */
/* ================================================================== */

function PageHeader({ bid, onRerun }) {
  const navigate = useNavigate();
  const statusConfig =
    BID_STATUS_CONFIG[bid.status] ?? BID_STATUS_CONFIG['under-review'];
  const tone = complianceTone(bid.complianceScore);

  return (
    <div className="flex flex-col gap-4">
      <button
        type="button"
        onClick={() => navigate(-1)}
        className="inline-flex w-fit items-center gap-1 text-[12px] font-medium text-slate-500 transition-colors hover:text-slate-800 focus:outline-none focus-visible:underline"
      >
        <ArrowLeft className="h-3.5 w-3.5" aria-hidden="true" />
        Back
      </button>

      <div className="flex flex-col gap-4 lg:flex-row lg:items-start lg:justify-between">
        <div className="min-w-0 flex-1">
          <div className="flex flex-wrap items-center gap-2">
            <span className="font-mono text-[11.5px] font-semibold text-slate-500">
              {bid.id}
            </span>
            <StatusPill config={statusConfig}>{statusConfig.label}</StatusPill>
            <span
              className={cx(
                'inline-flex items-center gap-1 rounded-full border border-slate-200 bg-white px-2 py-0.5 text-[10.5px] font-semibold uppercase tracking-wider',
                tone.text
              )}
            >
              <ShieldCheck className="h-3 w-3" aria-hidden="true" />
              Compliance {bid.complianceScore}%
            </span>
          </div>
          <h1 className="mt-1.5 text-xl font-semibold tracking-tight text-slate-900 sm:text-2xl">
            {bid.bidder.name}
          </h1>
          <div className="mt-2 flex flex-wrap items-center gap-x-3 gap-y-1 text-[12.5px] text-slate-600">
            <span className="inline-flex items-center gap-1.5">
              <Building2
                className="h-3.5 w-3.5 text-slate-400"
                aria-hidden="true"
              />
              {bid.bidder.legalName}
            </span>
            <span aria-hidden="true" className="text-slate-300">·</span>
            <span className="inline-flex items-center gap-1.5">
              <Layers
                className="h-3.5 w-3.5 text-slate-400"
                aria-hidden="true"
              />
              <Link
                to={`/tenders/${encodeURIComponent(bid.tenderRef)}`}
                className="font-mono text-[11.5px] font-semibold text-emerald-600 transition-colors hover:text-emerald-700 focus:outline-none focus-visible:underline"
              >
                {bid.tenderRef}
              </Link>
            </span>
            <span aria-hidden="true" className="text-slate-300">·</span>
            <span className="inline-flex items-center gap-1.5">
              <Clock className="h-3.5 w-3.5 text-slate-400" aria-hidden="true" />
              Submitted {bid.submittedAt}
            </span>
          </div>
        </div>

        <div className="flex flex-wrap items-center gap-2">
          <button
            type="button"
            onClick={onRerun}
            className="inline-flex h-9 items-center gap-2 rounded-md border border-slate-200 bg-white px-3 text-[12.5px] font-semibold text-slate-700 shadow-sm transition-colors hover:bg-slate-50 focus:outline-none focus-visible:ring-2 focus-visible:ring-emerald-600 focus-visible:ring-offset-1"
          >
            <RefreshCw className="h-3.5 w-3.5" aria-hidden="true" />
            Re-Run AI Verification
          </button>
          <Link
            to={`/review?bid=${encodeURIComponent(bid.id)}`}
            className="inline-flex h-9 items-center gap-2 rounded-md bg-emerald-600 px-3.5 text-[12.5px] font-semibold text-white shadow-sm transition-colors hover:bg-emerald-700 focus:outline-none focus-visible:ring-2 focus-visible:ring-emerald-600 focus-visible:ring-offset-2"
          >
            <ShieldAlert className="h-3.5 w-3.5" aria-hidden="true" />
            Open Human Review
          </Link>
        </div>
      </div>
    </div>
  );
}

/* ================================================================== */
/*  COMPLIANCE INDEX BANNER                                           */
/* ================================================================== */

function ComplianceBanner({ score }) {
  const tone = complianceTone(score);
  return (
    <section
      aria-label="Compliance index"
      className="rounded-lg border border-slate-200 bg-white p-5 shadow-sm"
    >
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div className="min-w-0">
          <p className="text-[11px] font-semibold uppercase tracking-[0.15em] text-slate-500">
            Overall Compliance Index
          </p>
          <div className="mt-1 flex items-baseline gap-2">
            <span
              className={cx(
                'text-3xl font-semibold tabular-nums tracking-tight',
                tone.text
              )}
            >
              {score}%
            </span>
            <span className="text-[12.5px] text-slate-500">
              across mandatory & optional rules
            </span>
          </div>
        </div>

        <div className="w-full max-w-md">
          <div
            role="progressbar"
            aria-valuenow={score}
            aria-valuemin={0}
            aria-valuemax={100}
            aria-label={`Compliance score ${score} percent`}
            className="h-2.5 w-full overflow-hidden rounded-full bg-slate-100"
          >
            <div
              style={{ width: `${score}%` }}
              className={cx('h-full rounded-full transition-[width] duration-500', tone.bar)}
            />
          </div>
          <div className="mt-1.5 flex items-center justify-between text-[10.5px] font-semibold uppercase tracking-wider text-slate-400">
            <span>0%</span>
            <span>60%</span>
            <span>90%</span>
            <span>100%</span>
          </div>
        </div>
      </div>
    </section>
  );
}

/* ================================================================== */
/*  TABS                                                              */
/* ================================================================== */

function Tabs({ tabs, activeTab, onChange }) {
  return (
    <div
      role="tablist"
      aria-label="Bid details sections"
      className="flex gap-1 overflow-x-auto rounded-lg border border-slate-200 bg-white p-1 shadow-sm"
    >
      {tabs.map((tab) => {
        const isActive = tab.id === activeTab;
        return (
          <button
            key={tab.id}
            type="button"
            role="tab"
            id={`tab-${tab.id}`}
            aria-selected={isActive}
            aria-controls={`tabpanel-${tab.id}`}
            tabIndex={isActive ? 0 : -1}
            onClick={() => onChange(tab.id)}
            className={cx(
              'inline-flex flex-shrink-0 items-center gap-2 whitespace-nowrap rounded-md px-3.5 py-2 text-[12.5px] font-semibold transition-colors focus:outline-none focus-visible:ring-2 focus-visible:ring-emerald-600 focus-visible:ring-offset-1',
              isActive
                ? 'bg-emerald-600 text-white shadow-sm'
                : 'text-slate-600 hover:bg-slate-50 hover:text-slate-900'
            )}
          >
            {tab.label}
            {tab.count != null ? (
              <span
                className={cx(
                  'rounded-full px-1.5 py-0.5 text-[10px] font-semibold',
                  isActive
                    ? 'bg-white/20 text-white'
                    : 'bg-slate-100 text-slate-600'
                )}
              >
                {tab.count}
              </span>
            ) : null}
          </button>
        );
      })}
    </div>
  );
}

/* ================================================================== */
/*  TAB 1 — SUBMITTED DOCUMENTS                                       */
/* ================================================================== */

function DocumentsTab({ documents, onPreview, onDownload }) {
  return (
    <section
      aria-label="Submitted documents"
      className="overflow-hidden rounded-lg border border-slate-200 bg-white shadow-sm"
    >
      <header className="border-b border-slate-200 px-5 py-4">
        <h2 className="text-[13.5px] font-semibold text-slate-900">
          Submitted Documents
        </h2>
        <p className="mt-0.5 text-[12px] text-slate-500">
          {documents.length} file(s) submitted — click any row to inspect OCR findings
        </p>
      </header>

      <div className="overflow-x-auto">
        <table className="w-full min-w-[900px] border-collapse text-left text-[12.5px]">
          <caption className="sr-only">
            List of submitted bid documents with verification state and OCR snippets
          </caption>
          <thead>
            <tr className="border-b border-slate-200 bg-slate-50 text-[11px] font-semibold uppercase tracking-wider text-slate-500">
              <th scope="col" className="px-5 py-2.5">File</th>
              <th scope="col" className="px-5 py-2.5">Size</th>
              <th scope="col" className="px-5 py-2.5">Status</th>
              <th scope="col" className="px-5 py-2.5">OCR Finding</th>
              <th scope="col" className="px-5 py-2.5 text-right">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100">
            {documents.map((doc) => (
              <tr
                key={doc.id}
                className="align-top transition-colors hover:bg-slate-50/70"
              >
                <td className="px-5 py-3">
                  <button
                    type="button"
                    onClick={() => onPreview(doc)}
                    className="flex items-start gap-2 text-left focus:outline-none focus-visible:underline"
                  >
                    <FileText
                      className="mt-0.5 h-3.5 w-3.5 flex-shrink-0 text-slate-400"
                      aria-hidden="true"
                    />
                    <span className="flex flex-col">
                      <span className="font-medium text-slate-800">
                        {doc.name}
                      </span>
                      <span className="mt-0.5 text-[11px] text-slate-500">
                        {doc.format} · Uploaded {doc.uploadedAt}
                        {doc.required ? ' · Mandatory' : ' · Optional'}
                      </span>
                    </span>
                  </button>
                </td>
                <td className="whitespace-nowrap px-5 py-3 tabular-nums text-slate-600">
                  {doc.size}
                </td>
                <td className="whitespace-nowrap px-5 py-3">
                  <VerificationBadge state={doc.verification} />
                </td>
                <td className="max-w-[360px] px-5 py-3 text-[11.5px] leading-relaxed text-slate-600">
                  <span className="line-clamp-2">{doc.ocrSnippet}</span>
                </td>
                <td className="whitespace-nowrap px-5 py-3 text-right">
                  <div className="flex items-center justify-end gap-1">
                    <button
                      type="button"
                      onClick={() => onPreview(doc)}
                      aria-label={`Preview ${doc.name}`}
                      className="inline-flex h-7 w-7 items-center justify-center rounded-md text-slate-500 transition-colors hover:bg-slate-100 hover:text-slate-800 focus:outline-none focus-visible:ring-2 focus-visible:ring-emerald-600 focus-visible:ring-offset-1"
                    >
                      <Eye className="h-3.5 w-3.5" aria-hidden="true" />
                    </button>
                    <button
                      type="button"
                      onClick={() => onDownload(doc)}
                      aria-label={`Download ${doc.name}`}
                      className="inline-flex h-7 w-7 items-center justify-center rounded-md text-slate-500 transition-colors hover:bg-slate-100 hover:text-slate-800 focus:outline-none focus-visible:ring-2 focus-visible:ring-emerald-600 focus-visible:ring-offset-1"
                    >
                      <Download className="h-3.5 w-3.5" aria-hidden="true" />
                    </button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </section>
  );
}

/* ================================================================== */
/*  TAB 2 — COMPLIANCE RULE MATRIX                                    */
/* ================================================================== */

function RulesTab({ rules }) {
  const grouped = useMemo(() => {
    return {
      mandatory: rules.filter((r) => r.requirement === 'Mandatory'),
      optional: rules.filter((r) => r.requirement === 'Optional'),
    };
  }, [rules]);

  const renderRows = (list) =>
    list.map((rule) => (
      <li
        key={rule.id}
        className="grid grid-cols-1 gap-3 border-b border-slate-100 px-5 py-4 last:border-b-0 md:grid-cols-12 md:items-start"
      >
        <div className="md:col-span-2">
          <span className="inline-flex items-center rounded border border-slate-200 bg-slate-50 px-1.5 py-0.5 font-mono text-[10.5px] font-semibold uppercase tracking-wider text-slate-600">
            {rule.clause}
          </span>
        </div>
        <div className="md:col-span-6">
          <p className="text-[12.5px] font-medium text-slate-800">
            {rule.description}
          </p>
          <p className="mt-1 text-[11.5px] leading-relaxed text-slate-500">
            <span className="font-semibold text-slate-600">AI Remark: </span>
            {rule.aiRemark}
          </p>
        </div>
        <div className="md:col-span-2">
          <span
            className={cx(
              'inline-flex items-center rounded-full border px-2 py-0.5 text-[10px] font-semibold uppercase tracking-wider',
              rule.requirement === 'Mandatory'
                ? 'border-red-200 bg-red-50 text-red-700'
                : 'border-slate-200 bg-slate-100 text-slate-600'
            )}
          >
            {rule.requirement}
          </span>
        </div>
        <div className="md:col-span-2 md:text-right">
          <RuleStatusBadge state={rule.status} />
        </div>
      </li>
    ));

  return (
    <section
      aria-label="Compliance rule matrix"
      className="overflow-hidden rounded-lg border border-slate-200 bg-white shadow-sm"
    >
      <header className="border-b border-slate-200 px-5 py-4">
        <h2 className="text-[13.5px] font-semibold text-slate-900">
          Compliance Rule Matrix
        </h2>
        <p className="mt-0.5 text-[12px] text-slate-500">
          Extracted data mapped against each tender clause with AI remarks
        </p>
      </header>

      <div className="flex flex-col">
        <div className="bg-slate-50 px-5 py-2 text-[10.5px] font-semibold uppercase tracking-wider text-slate-500">
          Mandatory Requirements ({grouped.mandatory.length})
        </div>
        <ul>{renderRows(grouped.mandatory)}</ul>

        {grouped.optional.length > 0 ? (
          <>
            <div className="border-t border-slate-200 bg-slate-50 px-5 py-2 text-[10.5px] font-semibold uppercase tracking-wider text-slate-500">
              Optional Requirements ({grouped.optional.length})
            </div>
            <ul>{renderRows(grouped.optional)}</ul>
          </>
        ) : null}
      </div>
    </section>
  );
}

/* ================================================================== */
/*  TAB 3 — BIDDER BUSINESS PROFILE                                   */
/* ================================================================== */

function ProfileTab({ bidder, quotedAmount, emdExempt, emdReason }) {
  const rows = [
    { label: 'Registered Name', value: bidder.legalName, Icon: Building2 },
    { label: 'CIN', value: bidder.cin, Icon: FileText, mono: true },
    { label: 'Udyam Registration', value: bidder.udyam, Icon: FileText, mono: true },
    { label: 'GSTIN', value: bidder.gstin, Icon: ShieldCheck, mono: true },
    { label: 'PAN', value: bidder.pan, Icon: FileText, mono: true },
    { label: 'Contact Person', value: bidder.contactPerson, Icon: Building2 },
    { label: 'Email', value: bidder.email, Icon: Mail },
    { label: 'Phone', value: bidder.phone, Icon: Phone },
    { label: 'Registered Address', value: bidder.address, Icon: MapPin },
  ];

  return (
    <div className="grid grid-cols-1 gap-4 lg:grid-cols-3">
      <section
        aria-label="Legal and contact information"
        className="overflow-hidden rounded-lg border border-slate-200 bg-white shadow-sm lg:col-span-2"
      >
        <header className="border-b border-slate-200 px-5 py-4">
          <h2 className="text-[13.5px] font-semibold text-slate-900">
            Legal & Contact Profile
          </h2>
          <p className="mt-0.5 text-[12px] text-slate-500">
            Registration details as declared in the bid submission
          </p>
        </header>
        <dl className="divide-y divide-slate-100">
          {rows.map((row) => {
            const RowIcon = row.Icon;
            return (
              <div
                key={row.label}
                className="flex items-start gap-3 px-5 py-3.5"
              >
                <span
                  className="inline-flex h-7 w-7 flex-shrink-0 items-center justify-center rounded-md bg-slate-100 text-slate-600"
                  aria-hidden="true"
                >
                  <RowIcon className="h-3.5 w-3.5" />
                </span>
                <div className="min-w-0">
                  <dt className="text-[10.5px] font-semibold uppercase tracking-wider text-slate-500">
                    {row.label}
                  </dt>
                  <dd
                    className={cx(
                      'mt-0.5 text-[12.5px] font-medium text-slate-800',
                      row.mono ? 'font-mono text-[11.5px]' : ''
                    )}
                  >
                    {row.value}
                  </dd>
                </div>
              </div>
            );
          })}
        </dl>
      </section>

      <section
        aria-label="Financial summary"
        className="overflow-hidden rounded-lg border border-slate-200 bg-white shadow-sm"
      >
        <header className="border-b border-slate-200 px-5 py-4">
          <h2 className="text-[13.5px] font-semibold text-slate-900">
            Financial Summary
          </h2>
          <p className="mt-0.5 text-[12px] text-slate-500">
            Quoted amount and security details
          </p>
        </header>
        <div className="flex flex-col gap-4 p-5">
          <div>
            <p className="text-[10.5px] font-semibold uppercase tracking-wider text-slate-500">
              Quoted Amount
            </p>
            <p className="mt-1 flex items-baseline gap-1.5 text-2xl font-semibold tabular-nums tracking-tight text-slate-900">
              <IndianRupee
                className="h-4 w-4 text-slate-400"
                aria-hidden="true"
              />
              {quotedAmount.replace('₹ ', '')}
            </p>
          </div>

          <div className="rounded-md border border-slate-200 bg-slate-50 p-3">
            <div className="flex items-center justify-between gap-2">
              <span className="text-[11.5px] font-semibold text-slate-700">
                EMD Status
              </span>
              <span
                className={cx(
                  'inline-flex items-center rounded-full border px-2 py-0.5 text-[10px] font-semibold uppercase tracking-wider',
                  emdExempt
                    ? 'border-emerald-200 bg-emerald-50 text-emerald-700'
                    : 'border-slate-200 bg-white text-slate-700'
                )}
              >
                {emdExempt ? 'Exempt' : 'Paid'}
              </span>
            </div>
            <p className="mt-1.5 text-[11.5px] leading-relaxed text-slate-600">
              {emdReason}
            </p>
          </div>
        </div>
      </section>
    </div>
  );
}

/* ================================================================== */
/*  TAB 4 — ASSOCIATED TENDER                                         */
/* ================================================================== */

function TenderTab({ bid }) {
  const fields = [
    { label: 'Tender Ref', value: bid.tenderRef, mono: true },
    { label: 'Title', value: bid.tenderTitle },
    { label: 'Category', value: bid.tenderCategory },
    { label: 'Organization', value: bid.tenderOrganization },
  ];

  return (
    <section
      aria-label="Associated tender"
      className="overflow-hidden rounded-lg border border-slate-200 bg-white shadow-sm"
    >
      <header className="flex items-start justify-between gap-3 border-b border-slate-200 px-5 py-4">
        <div className="min-w-0">
          <h2 className="text-[13.5px] font-semibold text-slate-900">
            Associated Tender
          </h2>
          <p className="mt-0.5 text-[12px] text-slate-500">
            The procurement notice this bid was submitted against
          </p>
        </div>
        <Link
          to={`/tenders/${encodeURIComponent(bid.tenderRef)}`}
          className="inline-flex flex-shrink-0 items-center gap-1 text-[12px] font-semibold text-emerald-600 transition-colors hover:text-emerald-700 focus:outline-none focus-visible:underline"
        >
          Open Tender
          <ExternalLink className="h-3.5 w-3.5" aria-hidden="true" />
        </Link>
      </header>

      <dl className="grid grid-cols-1 divide-y divide-slate-100 sm:grid-cols-2 sm:divide-y-0">
        {fields.map((field) => (
          <div
            key={field.label}
            className="border-slate-100 p-4 sm:border-b sm:border-r sm:[&:nth-child(2n)]:border-r-0"
          >
            <dt className="text-[10.5px] font-semibold uppercase tracking-wider text-slate-500">
              {field.label}
            </dt>
            <dd
              className={cx(
                'mt-0.5 text-[13px] font-medium text-slate-800',
                field.mono ? 'font-mono text-[11.5px]' : ''
              )}
            >
              {field.value}
            </dd>
          </div>
        ))}
      </dl>

      <footer className="border-t border-slate-200 bg-slate-50 px-5 py-3">
        <Link
          to={`/tenders/${encodeURIComponent(bid.tenderRef)}`}
          className="inline-flex items-center gap-1 text-[12px] font-semibold text-emerald-600 transition-colors hover:text-emerald-700 focus:outline-none focus-visible:underline"
        >
          View full tender details
          <ChevronRight className="h-3.5 w-3.5" aria-hidden="true" />
        </Link>
      </footer>
    </section>
  );
}

/* ================================================================== */
/*  PREVIEW MODAL                                                     */
/* ================================================================== */

function PreviewModal({ doc, bidderName, onClose, onDownload }) {
  const dialogRef = useCallback(
    (node) => {
      if (node && !node.dataset.focused) {
        node.focus();
        node.dataset.focused = 'true';
      }
    },
    []
  );

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

  if (!doc) return null;

  const config = VERIFICATION_CONFIG[doc.verification] ?? VERIFICATION_CONFIG.pending;
  const ConfigIcon = config.Icon;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <div
        className="absolute inset-0 bg-slate-900/60 backdrop-blur-sm"
        onClick={onClose}
        aria-hidden="true"
      />

      <div
        ref={dialogRef}
        role="dialog"
        aria-modal="true"
        aria-labelledby="preview-modal-title"
        tabIndex={-1}
        className="relative z-10 flex w-full max-w-lg flex-col overflow-hidden rounded-lg border border-slate-200 bg-white shadow-2xl focus:outline-none"
      >
        <header className="flex items-start justify-between gap-3 border-b border-slate-200 px-5 py-4">
          <div className="flex min-w-0 items-start gap-3">
            <span
              className="inline-flex h-9 w-9 flex-shrink-0 items-center justify-center rounded-md bg-slate-100 text-slate-600"
              aria-hidden="true"
            >
              <FileText className="h-4 w-4" />
            </span>
            <div className="min-w-0">
              <h2
                id="preview-modal-title"
                className="truncate text-[13.5px] font-semibold text-slate-900"
              >
                {doc.name}
              </h2>
              <p className="mt-0.5 text-[11.5px] text-slate-500">
                {doc.format} · {doc.size} · Uploaded {doc.uploadedAt}
              </p>
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

        <div className="flex flex-col gap-4 p-5">
          <div className="flex flex-wrap items-center gap-2">
            <StatusPill config={config}>
              <ConfigIcon className="h-3 w-3" aria-hidden="true" />
              {config.label}
            </StatusPill>
            <span
              className={cx(
                'inline-flex items-center rounded-full border px-2 py-0.5 text-[10.5px] font-semibold uppercase tracking-wider',
                doc.required
                  ? 'border-red-200 bg-red-50 text-red-700'
                  : 'border-slate-200 bg-slate-100 text-slate-600'
              )}
            >
              {doc.required ? 'Mandatory' : 'Optional'}
            </span>
          </div>

          <div>
            <p className="text-[10.5px] font-semibold uppercase tracking-wider text-slate-500">
              Submitted By
            </p>
            <p className="mt-0.5 text-[12.5px] font-medium text-slate-800">
              {bidderName}
            </p>
          </div>

          <div>
            <p className="text-[10.5px] font-semibold uppercase tracking-wider text-slate-500">
              AI OCR Finding
            </p>
            <div className="mt-1 rounded-md border border-slate-200 bg-slate-50 p-3">
              <p className="text-[12px] leading-relaxed text-slate-700">
                {doc.ocrSnippet}
              </p>
            </div>
          </div>
        </div>

        <footer className="flex items-center justify-end gap-2 border-t border-slate-200 bg-slate-50 px-5 py-3">
          <button
            type="button"
            onClick={onClose}
            className="inline-flex h-9 items-center rounded-md border border-slate-200 bg-white px-3.5 text-[12.5px] font-semibold text-slate-700 transition-colors hover:bg-slate-50 focus:outline-none focus-visible:ring-2 focus-visible:ring-emerald-600 focus-visible:ring-offset-1"
          >
            Close
          </button>
          <button
            type="button"
            onClick={() => {
              onDownload(doc);
              onClose();
            }}
            className="inline-flex h-9 items-center gap-1.5 rounded-md bg-emerald-600 px-3.5 text-[12.5px] font-semibold text-white transition-colors hover:bg-emerald-700 focus:outline-none focus-visible:ring-2 focus-visible:ring-emerald-600 focus-visible:ring-offset-2"
          >
            <Download className="h-3.5 w-3.5" aria-hidden="true" />
            Download
          </button>
        </footer>
      </div>
    </div>
  );
}

/* ================================================================== */
/*  PAGE                                                              */
/* ================================================================== */

export default function BidDetails() {
  const { id } = useParams();
  const [activeTab, setActiveTab] = useState('documents');
  const [previewDoc, setPreviewDoc] = useState(null);
  const [toast, setToast] = useState(null);

  const bid = useMemo(() => BID_REGISTRY[id] ?? null, [id]);

  /* ---------------- Toast auto-dismiss ---------------- */
  useEffect(() => {
    if (!toast) return;
    const timeout = setTimeout(() => setToast(null), 2600);
    return () => clearTimeout(timeout);
  }, [toast]);

  /* ---------------- Derived metrics via reduce ---------------- */
  const metrics = useMemo(() => {
    if (!bid) {
      return { total: 0, verified: 0, failed: 0, review: 0, pending: 0 };
    }
    return bid.documents.reduce(
      (acc, doc) => {
        acc.total += 1;
        if (doc.verification === 'verified') acc.verified += 1;
        else if (doc.verification === 'failed') acc.failed += 1;
        else if (doc.verification === 'review') acc.review += 1;
        else if (doc.verification === 'pending') acc.pending += 1;
        return acc;
      },
      { total: 0, verified: 0, failed: 0, review: 0, pending: 0 }
    );
  }, [bid]);

  /* ---------------- Handlers ---------------- */
  const handleRerun = useCallback(() => {
    setToast('AI verification re-run queued for this bid.');
  }, []);

  const handleDownload = useCallback((doc) => {
    setToast(`Downloading ${doc.name}…`);
  }, []);

  const handlePreview = useCallback((doc) => {
    setPreviewDoc(doc);
  }, []);

  const handleClosePreview = useCallback(() => {
    setPreviewDoc(null);
  }, []);

  /* ---------------- Fallback ---------------- */
  if (!bid) {
    return <BidNotFound routeId={id} />;
  }

  /* ---------------- Tabs ---------------- */
  const tabs = [
    {
      id: 'documents',
      label: 'Submitted Documents',
      count: metrics.total,
    },
    {
      id: 'rules',
      label: 'Compliance Rule Matrix',
      count: bid.complianceRules.length,
    },
    { id: 'profile', label: 'Bidder Business Profile' },
    { id: 'tender', label: 'Associated Tender' },
  ];

  const metricCards = [
    {
      id: 'total',
      label: 'Total Files',
      value: metrics.total,
      Icon: FileText,
      tone: 'slate',
    },
    {
      id: 'verified',
      label: 'Verified',
      value: metrics.verified,
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
      label: 'Requires Review',
      value: metrics.review,
      Icon: AlertTriangle,
      tone: 'amber',
    },
    {
      id: 'pending',
      label: 'Pending',
      value: metrics.pending,
      Icon: Clock,
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
          <span>{toast}</span>
        </div>
      ) : null}

      {/* Header */}
      <PageHeader bid={bid} onRerun={handleRerun} />

      {/* Compliance banner */}
      <ComplianceBanner score={bid.complianceScore} />

      {/* Metric cards */}
      <section aria-label="Document verification metrics">
        <ul className="grid grid-cols-2 gap-3 lg:grid-cols-5">
          {metricCards.map((card) => {
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

      {/* Tabs */}
      <Tabs tabs={tabs} activeTab={activeTab} onChange={setActiveTab} />

      {/* Tab panels */}
      {activeTab === 'documents' ? (
        <div
          role="tabpanel"
          id="tabpanel-documents"
          aria-labelledby="tab-documents"
        >
          <DocumentsTab
            documents={bid.documents}
            onPreview={handlePreview}
            onDownload={handleDownload}
          />
        </div>
      ) : null}

      {activeTab === 'rules' ? (
        <div
          role="tabpanel"
          id="tabpanel-rules"
          aria-labelledby="tab-rules"
        >
          <RulesTab rules={bid.complianceRules} />
        </div>
      ) : null}

      {activeTab === 'profile' ? (
        <div
          role="tabpanel"
          id="tabpanel-profile"
          aria-labelledby="tab-profile"
        >
          <ProfileTab
            bidder={bid.bidder}
            quotedAmount={bid.quotedAmount}
            emdExempt={bid.emdExempt}
            emdReason={bid.emdReason}
          />
        </div>
      ) : null}

      {activeTab === 'tender' ? (
        <div
          role="tabpanel"
          id="tabpanel-tender"
          aria-labelledby="tab-tender"
        >
          <TenderTab bid={bid} />
        </div>
      ) : null}

      {/* Preview modal */}
      {previewDoc ? (
        <PreviewModal
          doc={previewDoc}
          bidderName={bid.bidder.name}
          onClose={handleClosePreview}
          onDownload={handleDownload}
        />
      ) : null}
    </div>
  );
}