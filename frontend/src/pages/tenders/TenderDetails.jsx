import { useCallback, useMemo, useState } from 'react';
import { Link, useParams } from 'react-router-dom';
import {
  ArrowLeft,
  FileText,
  Building2,
  Calendar,
  DollarSign,
  CheckCircle2,
  Clock,
  AlertTriangle,
  XCircle,
  Download,
  Eye,
  ShieldAlert,
  Edit3,
  Users,
  FileCheck,
  Layers,
  ExternalLink,
  ChevronRight,
} from 'lucide-react';

/* ================================================================== */
/*  MOCK DATA — replace with Django REST responses in future step     */
/* ================================================================== */

const TENDER_REGISTRY = {
  'GEM/2024/B/5521091': {
    id: 'GEM/2024/B/5521091',
    title: 'Supply of Desktop Computers & Peripherals',
    organization: 'Ministry of Education',
    category: 'IT Hardware',
    tenderType: 'Open Tender',
    publicationDate: '2024-12-01',
    bidSubmissionStart: '2024-12-05',
    bidSubmissionDeadline: '2025-01-14',
    technicalEvaluationDate: '2025-01-20',
    financialEvaluationDate: '2025-01-28',
    estimatedValue: '₹ 2,40,00,000',
    bidSecurityAmount: '₹ 4,80,000',
    performanceSecurity: '5%',
    status: 'active',
    description:
      'The Ministry of Education invites sealed bids from eligible and qualified vendors for the supply, installation, and commissioning of desktop computers, monitors, keyboards, mice, and associated peripherals across 42 designated institutions in the National Capital Region. The scope includes a three-year on-site warranty, spare parts availability guarantee, and quarterly preventive maintenance visits. Bidders must demonstrate prior experience in supplying IT hardware to central or state government bodies, hold valid OEM authorisations, and comply with the Government of India\'s Public Procurement (Preference to Make in India) Order. All equipment must meet the technical specifications laid down in Annexure-I, with mandatory compliance to BIS standards and MeitY guidelines for e-waste disposal.',
    requirements: [
      {
        id: 'req-1',
        name: 'GST Registration Certificate',
        type: 'GST',
        mandatory: true,
        description: 'Active GSTIN with at least 3 years of continuous filing history.',
      },
      {
        id: 'req-2',
        name: 'PAN Card',
        type: 'PAN',
        mandatory: true,
        description: 'Company PAN or proprietor PAN linked to the registered entity.',
      },
      {
        id: 'req-3',
        name: 'MSME / Udyam Registration',
        type: 'MSME',
        mandatory: false,
        description: 'Optional — enables MSE purchase preference benefits under PPP-MII.',
      },
      {
        id: 'req-4',
        name: 'Income Tax Returns (3 Years)',
        type: 'ITR',
        mandatory: true,
        description: 'ITR acknowledgements for the last three financial years.',
      },
      {
        id: 'req-5',
        name: 'Audited Financial Statements',
        type: 'Financial',
        mandatory: true,
        description: 'CA-certified balance sheet and P&L for FY22, FY23, and FY24.',
      },
      {
        id: 'req-6',
        name: 'Past Experience Certificates',
        type: 'Experience',
        mandatory: true,
        description: 'Minimum 3 similar supply orders of ≥ ₹ 50 Lakhs in the last 5 years.',
      },
      {
        id: 'req-7',
        name: 'OEM Authorisation Letter',
        type: 'Experience',
        mandatory: true,
        description: 'Original authorisation from the OEM for dealership / distribution.',
      },
      {
        id: 'req-8',
        name: 'ISO 9001:2015 Certificate',
        type: 'ISO',
        mandatory: true,
        description: 'Valid quality management system certification.',
      },
    ],
    documents: [
      {
        id: 'doc-1',
        name: 'Tender Document — Main.pdf',
        format: 'PDF',
        size: '2.4 MB',
        uploadedAt: '2024-12-01 10:15 IST',
      },
      {
        id: 'doc-2',
        name: 'Technical Specifications — Annexure-I.pdf',
        format: 'PDF',
        size: '1.8 MB',
        uploadedAt: '2024-12-01 10:16 IST',
      },
      {
        id: 'doc-3',
        name: 'Bill of Quantities.xlsx',
        format: 'XLSX',
        size: '342 KB',
        uploadedAt: '2024-12-01 10:18 IST',
      },
      {
        id: 'doc-4',
        name: 'Commercial Terms & Conditions.pdf',
        format: 'PDF',
        size: '890 KB',
        uploadedAt: '2024-12-01 10:20 IST',
      },
      {
        id: 'doc-5',
        name: 'Scope of Work.docx',
        format: 'DOCX',
        size: '215 KB',
        uploadedAt: '2024-12-01 10:22 IST',
      },
    ],
    complianceSummary: {
      total: 42,
      compliant: 31,
      nonCompliant: 4,
      review: 7,
    },
    bids: [
      {
        id: 'BID-8821',
        vendor: 'Dell Technologies India Pvt Ltd',
        submittedAt: '2025-01-08 14:22 IST',
        documentCount: 12,
        compliance: 'compliant',
      },
      {
        id: 'BID-8820',
        vendor: 'HP India Sales Pvt Ltd',
        submittedAt: '2025-01-08 11:05 IST',
        documentCount: 11,
        compliance: 'compliant',
      },
      {
        id: 'BID-8819',
        vendor: 'Lenovo India Pvt Ltd',
        submittedAt: '2025-01-07 16:48 IST',
        documentCount: 13,
        compliance: 'review',
      },
      {
        id: 'BID-8818',
        vendor: 'Acer India Pvt Ltd',
        submittedAt: '2025-01-07 09:34 IST',
        documentCount: 10,
        compliance: 'compliant',
      },
      {
        id: 'BID-8817',
        vendor: 'Compuage Infocom Ltd',
        submittedAt: '2025-01-06 17:12 IST',
        documentCount: 9,
        compliance: 'non-compliant',
      },
      {
        id: 'BID-8816',
        vendor: 'Ingram Micro India Pvt Ltd',
        submittedAt: '2025-01-06 13:50 IST',
        documentCount: 12,
        compliance: 'review',
      },
    ],
  },
  'GEM/2024/B/5518023': {
    id: 'GEM/2024/B/5518023',
    title: 'Annual Maintenance of Network Infrastructure',
    organization: 'Indian Railways — Northern Zone',
    category: 'IT Services',
    tenderType: 'Limited Tender',
    publicationDate: '2024-11-28',
    bidSubmissionStart: '2024-12-02',
    bidSubmissionDeadline: '2025-01-09',
    technicalEvaluationDate: '2025-01-15',
    financialEvaluationDate: '2025-01-22',
    estimatedValue: '₹ 88,00,000',
    bidSecurityAmount: '₹ 1,76,000',
    performanceSecurity: '5%',
    status: 'review',
    description:
      'Indian Railways — Northern Zone requires comprehensive Annual Maintenance Contract (AMC) services for its wide-area network infrastructure comprising 187 routers, 412 switches, and 96 firewalls deployed across 34 divisional offices. The scope includes 24×7 on-site support, quarterly preventive maintenance, firmware updates, configuration backups, and incident response within defined SLAs. Bidders must demonstrate established local presence in the Northern Zone with a minimum of 5 years of AMC experience for government or public sector networks, and hold valid OEM service partner certifications for Cisco, Juniper, and Fortinet equipment.',
    requirements: [
      {
        id: 'req-1',
        name: 'GST Registration Certificate',
        type: 'GST',
        mandatory: true,
        description: 'Active GSTIN with service category registration.',
      },
      {
        id: 'req-2',
        name: 'PAN Card',
        type: 'PAN',
        mandatory: true,
        description: 'Company PAN with matching legal entity name.',
      },
      {
        id: 'req-3',
        name: 'Service Tax / GST Returns (4 Quarters)',
        type: 'Financial',
        mandatory: true,
        description: 'Filed returns for the last four financial quarters.',
      },
      {
        id: 'req-4',
        name: 'Certified Engineer Proofs',
        type: 'Experience',
        mandatory: true,
        description: 'Minimum 5 CCNA / CCNP certified engineers on payroll.',
      },
      {
        id: 'req-5',
        name: 'Local Office Address Proof',
        type: 'Experience',
        mandatory: true,
        description: 'Registered office or service centre in the Northern Zone.',
      },
      {
        id: 'req-6',
        name: 'OEM Service Partner Certifications',
        type: 'ISO',
        mandatory: true,
        description: 'Valid Cisco, Juniper, and Fortinet partner authorisations.',
      },
    ],
    documents: [
      {
        id: 'doc-1',
        name: 'AMC Tender Document.pdf',
        format: 'PDF',
        size: '1.9 MB',
        uploadedAt: '2024-11-28 09:30 IST',
      },
      {
        id: 'doc-2',
        name: 'SLA Framework.pdf',
        format: 'PDF',
        size: '620 KB',
        uploadedAt: '2024-11-28 09:32 IST',
      },
      {
        id: 'doc-3',
        name: 'Equipment Inventory.xlsx',
        format: 'XLSX',
        size: '412 KB',
        uploadedAt: '2024-11-28 09:35 IST',
      },
    ],
    complianceSummary: {
      total: 18,
      compliant: 12,
      nonCompliant: 2,
      review: 4,
    },
    bids: [
      {
        id: 'BID-7712',
        vendor: 'Netlink Systems Pvt Ltd',
        submittedAt: '2025-01-05 15:40 IST',
        documentCount: 10,
        compliance: 'review',
      },
      {
        id: 'BID-7711',
        vendor: 'Wipro Infrastructure Services',
        submittedAt: '2025-01-05 11:22 IST',
        documentCount: 12,
        compliance: 'compliant',
      },
      {
        id: 'BID-7710',
        vendor: 'HCL Services Ltd',
        submittedAt: '2025-01-04 16:18 IST',
        documentCount: 11,
        compliance: 'compliant',
      },
      {
        id: 'BID-7709',
        vendor: 'Sify Technologies Ltd',
        submittedAt: '2025-01-04 10:05 IST',
        documentCount: 9,
        compliance: 'non-compliant',
      },
    ],
  },
};

/* ================================================================== */
/*  CONFIG MAPS                                                       */
/* ================================================================== */

const STATUS_CONFIG = {
  active: {
    label: 'Active',
    className: 'bg-emerald-50 text-emerald-700 border-emerald-200',
  },
  review: {
    label: 'Under Review',
    className: 'bg-amber-50 text-amber-700 border-amber-200',
  },
  closed: {
    label: 'Closed',
    className: 'bg-slate-100 text-slate-600 border-slate-200',
  },
  draft: {
    label: 'Draft',
    className: 'bg-slate-100 text-slate-700 border-slate-200',
  },
};

const COMPLIANCE_CONFIG = {
  compliant: {
    label: 'Compliant',
    className: 'bg-emerald-50 text-emerald-700 border-emerald-200',
    Icon: CheckCircle2,
  },
  'non-compliant': {
    label: 'Non-Compliant',
    className: 'bg-red-50 text-red-700 border-red-200',
    Icon: XCircle,
  },
  review: {
    label: 'Requires Review',
    className: 'bg-amber-50 text-amber-700 border-amber-200',
    Icon: AlertTriangle,
  },
};

const FORMAT_COLORS = {
  PDF: 'bg-red-50 text-red-700 border-red-200',
  DOCX: 'bg-blue-50 text-blue-700 border-blue-200',
  XLSX: 'bg-emerald-50 text-emerald-700 border-emerald-200',
  CSV: 'bg-slate-100 text-slate-700 border-slate-200',
};

/* ================================================================== */
/*  HELPERS                                                           */
/* ================================================================== */

const cx = (...parts) => parts.filter(Boolean).join(' ');

const formatDate = (iso) => {
  if (!iso) return '—';
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

const formatNumber = (value) =>
  typeof value === 'number' ? value.toLocaleString('en-IN') : String(value);

/* ================================================================== */
/*  SUB-COMPONENTS                                                    */
/* ================================================================== */

/* ---------------- Status badge ---------------- */
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

/* ---------------- Compliance badge ---------------- */
function ComplianceBadge({ state }) {
  const config = COMPLIANCE_CONFIG[state] ?? COMPLIANCE_CONFIG.review;
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

/* ---------------- Tabs ---------------- */
function Tabs({ tabs, activeTab, onChange }) {
  return (
    <div
      role="tablist"
      aria-label="Tender details sections"
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

/* ---------------- Overview metadata ---------------- */
function OverviewMetadata({ tender }) {
  const items = [
    {
      label: 'Tender Ref',
      value: tender.id,
      Icon: FileText,
      mono: true,
    },
    {
      label: 'Organization',
      value: tender.organization,
      Icon: Building2,
    },
    {
      label: 'Category',
      value: tender.category,
      Icon: Layers,
    },
    {
      label: 'Tender Type',
      value: tender.tenderType,
      Icon: FileCheck,
    },
    {
      label: 'Publication Date',
      value: formatDate(tender.publicationDate),
      Icon: Calendar,
    },
    {
      label: 'Submission Start',
      value: formatDate(tender.bidSubmissionStart),
      Icon: Calendar,
    },
    {
      label: 'Submission Deadline',
      value: formatDate(tender.bidSubmissionDeadline),
      Icon: Clock,
    },
    {
      label: 'Estimated Value',
      value: tender.estimatedValue,
      Icon: DollarSign,
    },
    {
      label: 'Bid Security (EMD)',
      value: tender.bidSecurityAmount,
      Icon: DollarSign,
    },
    {
      label: 'Performance Security',
      value: tender.performanceSecurity,
      Icon: ShieldAlert,
    },
    {
      label: 'Total Bids',
      value: formatNumber(tender.bids.length),
      Icon: Users,
    },
    {
      label: 'Status',
      value: <StatusBadge status={tender.status} />,
      Icon: CheckCircle2,
    },
  ];

  return (
    <section
      aria-label="Tender overview"
      className="overflow-hidden rounded-lg border border-slate-200 bg-white shadow-sm"
    >
      <header className="border-b border-slate-200 px-5 py-4">
        <h2 className="text-[13.5px] font-semibold text-slate-900">
          Tender Overview
        </h2>
        <p className="mt-0.5 text-[12px] text-slate-500">
          Core reference metadata and procurement parameters
        </p>
      </header>

      <dl className="grid grid-cols-1 divide-y divide-slate-100 sm:grid-cols-2 sm:divide-y-0 lg:grid-cols-3">
        {items.map((item) => {
          const ItemIcon = item.Icon;
          return (
            <div
              key={item.label}
              className="flex items-start gap-3 border-slate-100 p-4 sm:border-b sm:border-r lg:[&:nth-child(3n)]:border-r-0 [&:nth-last-child(-n+3)]:sm:border-b-0"
            >
              <span
                className="inline-flex h-8 w-8 flex-shrink-0 items-center justify-center rounded-md bg-slate-100 text-slate-600"
                aria-hidden="true"
              >
                <ItemIcon className="h-4 w-4" />
              </span>
              <div className="min-w-0">
                <dt className="text-[10.5px] font-semibold uppercase tracking-wider text-slate-500">
                  {item.label}
                </dt>
                <dd
                  className={cx(
                    'mt-0.5 text-[13px] font-medium text-slate-800',
                    item.mono ? 'font-mono text-[11.5px]' : ''
                  )}
                >
                  {item.value}
                </dd>
              </div>
            </div>
          );
        })}
      </dl>
    </section>
  );
}

/* ---------------- Description ---------------- */
function DescriptionSection({ tender }) {
  return (
    <section
      aria-label="Tender scope description"
      className="rounded-lg border border-slate-200 bg-white shadow-sm"
    >
      <header className="flex items-start gap-3 border-b border-slate-200 px-5 py-4">
        <span
          className="inline-flex h-8 w-8 flex-shrink-0 items-center justify-center rounded-md bg-emerald-50 text-emerald-600"
          aria-hidden="true"
        >
          <FileText className="h-4 w-4" />
        </span>
        <div className="min-w-0">
          <h2 className="text-[13.5px] font-semibold text-slate-900">
            Scope & Description
          </h2>
          <p className="mt-0.5 text-[12px] text-slate-500">
            Detailed narrative of procurement scope and deliverables
          </p>
        </div>
      </header>
      <div className="p-5">
        <p className="text-[13px] leading-relaxed text-slate-700">
          {tender.description}
        </p>
      </div>
    </section>
  );
}

/* ---------------- Timeline ---------------- */
function TimelineSection({ tender }) {
  const phases = useMemo(() => {
    const now = new Date('2025-01-08T12:00:00Z').getTime();
    const phases = [
      { id: 'published', label: 'Published', date: tender.publicationDate },
      { id: 'submission-start', label: 'Submission Start', date: tender.bidSubmissionStart },
      { id: 'deadline', label: 'Submission Deadline', date: tender.bidSubmissionDeadline },
      { id: 'tech-eval', label: 'Technical Evaluation', date: tender.technicalEvaluationDate },
      { id: 'fin-eval', label: 'Financial Evaluation', date: tender.financialEvaluationDate },
      { id: 'award', label: 'Award', date: null },
    ];

    return phases.map((phase) => {
      if (!phase.date) return { ...phase, state: 'upcoming' };
      const ts = new Date(phase.date).getTime();
      if (ts < now) return { ...phase, state: 'completed' };
      const diffDays = (ts - now) / (1000 * 60 * 60 * 24);
      if (diffDays <= 7) return { ...phase, state: 'active' };
      return { ...phase, state: 'upcoming' };
    });
  }, [tender]);

  const stateStyles = {
    completed: {
      dot: 'bg-emerald-600 border-emerald-600',
      inner: 'bg-white',
      line: 'bg-emerald-600',
      label: 'text-slate-900',
      date: 'text-slate-600',
      badge: 'bg-emerald-50 text-emerald-700 border-emerald-200',
      badgeLabel: 'Completed',
    },
    active: {
      dot: 'bg-amber-500 border-amber-500',
      inner: 'bg-white',
      line: 'bg-slate-200',
      label: 'text-slate-900',
      date: 'text-amber-700',
      badge: 'bg-amber-50 text-amber-700 border-amber-200',
      badgeLabel: 'In Progress',
    },
    upcoming: {
      dot: 'bg-white border-slate-300',
      inner: 'bg-white',
      line: 'bg-slate-200',
      label: 'text-slate-500',
      date: 'text-slate-400',
      badge: 'bg-slate-100 text-slate-500 border-slate-200',
      badgeLabel: 'Upcoming',
    },
  };

  return (
    <section
      aria-label="Procurement timeline"
      className="rounded-lg border border-slate-200 bg-white shadow-sm"
    >
      <header className="flex items-start gap-3 border-b border-slate-200 px-5 py-4">
        <span
          className="inline-flex h-8 w-8 flex-shrink-0 items-center justify-center rounded-md bg-emerald-50 text-emerald-600"
          aria-hidden="true"
        >
          <Calendar className="h-4 w-4" />
        </span>
        <div className="min-w-0">
          <h2 className="text-[13.5px] font-semibold text-slate-900">
            Procurement Timeline
          </h2>
          <p className="mt-0.5 text-[12px] text-slate-500">
            Milestone progression across the tender lifecycle
          </p>
        </div>
      </header>

      <div className="p-5">
        <ol className="relative flex flex-col gap-4">
          {phases.map((phase, index) => {
            const style = stateStyles[phase.state];
            const isLast = index === phases.length - 1;
            return (
              <li key={phase.id} className="relative flex items-start gap-4">
                {/* Vertical connector */}
                {!isLast ? (
                  <span
                    className={cx(
                      'absolute left-[11px] top-6 h-[calc(100%+16px)] w-0.5',
                      style.line
                    )}
                    aria-hidden="true"
                  />
                ) : null}

                {/* Dot */}
                <span
                  className={cx(
                    'relative z-10 mt-0.5 inline-flex h-6 w-6 flex-shrink-0 items-center justify-center rounded-full border-2',
                    style.dot
                  )}
                  aria-hidden="true"
                >
                  {phase.state === 'completed' ? (
                    <CheckCircle2 className="h-3.5 w-3.5 text-white" />
                  ) : phase.state === 'active' ? (
                    <Clock className="h-3 w-3 text-white" />
                  ) : null}
                </span>

                {/* Content */}
                <div className="flex min-w-0 flex-1 flex-col gap-1 sm:flex-row sm:items-center sm:justify-between">
                  <div className="min-w-0">
                    <p
                      className={cx(
                        'text-[13px] font-semibold',
                        style.label
                      )}
                    >
                      {phase.label}
                    </p>
                    <p className={cx('text-[12px]', style.date)}>
                      {phase.date ? formatDate(phase.date) : 'To be announced'}
                    </p>
                  </div>
                  <span
                    className={cx(
                      'inline-flex w-fit items-center rounded-full border px-2 py-0.5 text-[10.5px] font-semibold uppercase tracking-wider',
                      style.badge
                    )}
                  >
                    {style.badgeLabel}
                  </span>
                </div>
              </li>
            );
          })}
        </ol>
      </div>
    </section>
  );
}

/* ---------------- Eligibility criteria ---------------- */
function EligibilitySection({ tender }) {
  return (
    <section
      aria-label="Eligibility and compliance requirements"
      className="rounded-lg border border-slate-200 bg-white shadow-sm"
    >
      <header className="flex items-start gap-3 border-b border-slate-200 px-5 py-4">
        <span
          className="inline-flex h-8 w-8 flex-shrink-0 items-center justify-center rounded-md bg-emerald-50 text-emerald-600"
          aria-hidden="true"
        >
          <ShieldAlert className="h-4 w-4" />
        </span>
        <div className="min-w-0 flex-1">
          <h2 className="text-[13.5px] font-semibold text-slate-900">
            Eligibility & Compliance Requirements
          </h2>
          <p className="mt-0.5 text-[12px] text-slate-500">
            Extracted criteria for bidder qualification and document verification
          </p>
        </div>
      </header>

      <ul className="divide-y divide-slate-100">
        {tender.requirements.map((req) => (
          <li key={req.id} className="flex items-start gap-3 p-4">
            <span
              className={cx(
                'mt-0.5 inline-flex h-7 w-7 flex-shrink-0 items-center justify-center rounded-md',
                req.mandatory
                  ? 'bg-red-50 text-red-600'
                  : 'bg-slate-100 text-slate-500'
              )}
              aria-hidden="true"
            >
              {req.mandatory ? (
                <ShieldAlert className="h-3.5 w-3.5" />
              ) : (
                <FileCheck className="h-3.5 w-3.5" />
              )}
            </span>

            <div className="min-w-0 flex-1">
              <div className="flex flex-wrap items-center gap-2">
                <p className="text-[13px] font-semibold text-slate-800">
                  {req.name}
                </p>
                <span className="inline-flex items-center rounded border border-slate-200 bg-slate-50 px-1.5 py-0.5 text-[10px] font-semibold uppercase tracking-wider text-slate-600">
                  {req.type}
                </span>
                <span
                  className={cx(
                    'inline-flex items-center rounded-full border px-2 py-0.5 text-[10px] font-semibold uppercase tracking-wider',
                    req.mandatory
                      ? 'border-red-200 bg-red-50 text-red-700'
                      : 'border-slate-200 bg-slate-100 text-slate-600'
                  )}
                >
                  {req.mandatory ? 'Mandatory' : 'Optional'}
                </span>
              </div>
              <p className="mt-1 text-[12px] leading-relaxed text-slate-600">
                {req.description}
              </p>
            </div>
          </li>
        ))}
      </ul>
    </section>
  );
}

/* ---------------- Documents registry ---------------- */
function DocumentsSection({ tender, onAction }) {
  return (
    <section
      aria-label="Tender documents registry"
      className="overflow-hidden rounded-lg border border-slate-200 bg-white shadow-sm"
    >
      <header className="flex items-start gap-3 border-b border-slate-200 px-5 py-4">
        <span
          className="inline-flex h-8 w-8 flex-shrink-0 items-center justify-center rounded-md bg-emerald-50 text-emerald-600"
          aria-hidden="true"
        >
          <FileText className="h-4 w-4" />
        </span>
        <div className="min-w-0">
          <h2 className="text-[13.5px] font-semibold text-slate-900">
            Documents Registry
          </h2>
          <p className="mt-0.5 text-[12px] text-slate-500">
            {tender.documents.length} file(s) attached to this tender
          </p>
        </div>
      </header>

      <div className="overflow-x-auto">
        <table className="w-full min-w-[720px] border-collapse text-left text-[12.5px]">
          <caption className="sr-only">
            List of tender documents with format, size, and available actions
          </caption>
          <thead>
            <tr className="border-b border-slate-200 bg-slate-50 text-[11px] font-semibold uppercase tracking-wider text-slate-500">
              <th scope="col" className="px-5 py-2.5">
                File Name
              </th>
              <th scope="col" className="px-5 py-2.5">
                Format
              </th>
              <th scope="col" className="px-5 py-2.5">
                Size
              </th>
              <th scope="col" className="px-5 py-2.5">
                Uploaded
              </th>
              <th scope="col" className="px-5 py-2.5 text-right">
                Actions
              </th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100">
            {tender.documents.map((doc) => (
              <tr
                key={doc.id}
                className="transition-colors hover:bg-slate-50/70"
              >
                <td className="px-5 py-3">
                  <span className="inline-flex items-center gap-2 font-medium text-slate-800">
                    <FileText
                      className="h-3.5 w-3.5 flex-shrink-0 text-slate-400"
                      aria-hidden="true"
                    />
                    {doc.name}
                  </span>
                </td>
                <td className="px-5 py-3">
                  <span
                    className={cx(
                      'inline-flex items-center rounded border px-2 py-0.5 text-[10.5px] font-semibold uppercase tracking-wider',
                      FORMAT_COLORS[doc.format] ?? FORMAT_COLORS.CSV
                    )}
                  >
                    {doc.format}
                  </span>
                </td>
                <td className="whitespace-nowrap px-5 py-3 tabular-nums text-slate-600">
                  {doc.size}
                </td>
                <td className="whitespace-nowrap px-5 py-3 text-slate-600">
                  {doc.uploadedAt}
                </td>
                <td className="whitespace-nowrap px-5 py-3 text-right">
                  <div className="flex items-center justify-end gap-1">
                    <button
                      type="button"
                      onClick={() => onAction(`Viewing ${doc.name}`)}
                      aria-label={`View ${doc.name}`}
                      className="inline-flex h-7 w-7 items-center justify-center rounded-md text-slate-500 transition-colors hover:bg-slate-100 hover:text-slate-800 focus:outline-none focus-visible:ring-2 focus-visible:ring-emerald-600 focus-visible:ring-offset-1"
                    >
                      <Eye className="h-3.5 w-3.5" aria-hidden="true" />
                    </button>
                    <button
                      type="button"
                      onClick={() => onAction(`Downloading ${doc.name}`)}
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

/* ---------------- Compliance breakdown ---------------- */
function ComplianceBreakdown({ summary }) {
  const { total, compliant, nonCompliant, review } = summary;

  const segments = [
    { key: 'compliant', label: 'Compliant', count: compliant, bar: 'bg-emerald-600' },
    { key: 'review', label: 'Requires Review', count: review, bar: 'bg-amber-500' },
    { key: 'non-compliant', label: 'Non-Compliant', count: nonCompliant, bar: 'bg-red-600' },
  ];

  const pct = (n) => (total > 0 ? (n / total) * 100 : 0);

  const kpis = [
    {
      id: 'total',
      label: 'Total Bids',
      value: total,
      Icon: Users,
      tone: 'slate',
    },
    {
      id: 'compliant',
      label: 'Compliant',
      value: compliant,
      Icon: CheckCircle2,
      tone: 'emerald',
    },
    {
      id: 'review',
      label: 'Requires Review',
      value: review,
      Icon: AlertTriangle,
      tone: 'amber',
    },
    {
      id: 'non-compliant',
      label: 'Non-Compliant',
      value: nonCompliant,
      Icon: XCircle,
      tone: 'red',
    },
  ];

  const toneIcon = {
    slate: 'bg-slate-100 text-slate-700',
    emerald: 'bg-emerald-50 text-emerald-600',
    amber: 'bg-amber-50 text-amber-600',
    red: 'bg-red-50 text-red-600',
  };

  return (
    <div className="flex flex-col gap-4">
      {/* KPI cards */}
      <section aria-label="Bid compliance KPIs">
        <ul className="grid grid-cols-2 gap-3 lg:grid-cols-4">
          {kpis.map((kpi) => {
            const KpiIcon = kpi.Icon;
            return (
              <li
                key={kpi.id}
                className="rounded-lg border border-slate-200 bg-white p-3.5 shadow-sm"
              >
                <div className="flex items-center justify-between gap-2">
                  <span className="text-[11px] font-semibold uppercase tracking-wider text-slate-500">
                    {kpi.label}
                  </span>
                  <span
                    className={cx(
                      'inline-flex h-7 w-7 flex-shrink-0 items-center justify-center rounded-md',
                      toneIcon[kpi.tone]
                    )}
                    aria-hidden="true"
                  >
                    <KpiIcon className="h-3.5 w-3.5" />
                  </span>
                </div>
                <p className="mt-2 text-xl font-semibold tabular-nums tracking-tight text-slate-900">
                  {formatNumber(kpi.value)}
                </p>
              </li>
            );
          })}
        </ul>
      </section>

      {/* Segmented distribution */}
      <section
        aria-label="Compliance distribution"
        className="rounded-lg border border-slate-200 bg-white p-5 shadow-sm"
      >
        <header className="mb-4">
          <h3 className="text-[13.5px] font-semibold text-slate-900">
            Compliance Distribution
          </h3>
          <p className="mt-0.5 text-[12px] text-slate-500">
            Breakdown across {formatNumber(total)} evaluated bid submissions
          </p>
        </header>

        <div
          role="img"
          aria-label={segments
            .map((s) => `${s.label}: ${s.count} bids`)
            .join(', ')}
          className="mb-4 flex h-3 w-full overflow-hidden rounded-full bg-slate-100"
        >
          {segments.map((seg) => (
            <span
              key={seg.key}
              style={{ width: `${pct(seg.count)}%` }}
              className={cx('block h-full', seg.bar)}
            />
          ))}
        </div>

        <ul className="flex flex-col gap-3">
          {segments.map((seg) => (
            <li
              key={seg.key}
              className="flex items-center justify-between gap-3 text-[12.5px]"
            >
              <span className="flex items-center gap-2 text-slate-700">
                <span
                  className={cx(
                    'inline-block h-2.5 w-2.5 rounded-sm',
                    seg.bar
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
                  {pct(seg.count).toFixed(1)}%
                </span>
              </span>
            </li>
          ))}
        </ul>
      </section>
    </div>
  );
}

/* ---------------- Recent bids table ---------------- */
function RecentBids({ tender }) {
  return (
    <section
      aria-label="Recent bid submissions"
      className="overflow-hidden rounded-lg border border-slate-200 bg-white shadow-sm"
    >
      <header className="flex items-start justify-between gap-3 border-b border-slate-200 px-5 py-4">
        <div className="min-w-0">
          <h2 className="text-[13.5px] font-semibold text-slate-900">
            Recent Bids
          </h2>
          <p className="mt-0.5 text-[12px] text-slate-500">
            {tender.bids.length} bidder submission(s) received
          </p>
        </div>
        <Link
          to={`/bids?tender=${encodeURIComponent(tender.id)}`}
          className="hidden flex-shrink-0 items-center gap-1 text-[12px] font-semibold text-emerald-600 transition-colors hover:text-emerald-700 focus:outline-none focus-visible:underline sm:inline-flex"
        >
          View all bids
          <ExternalLink className="h-3.5 w-3.5" aria-hidden="true" />
        </Link>
      </header>

      <div className="overflow-x-auto">
        <table className="w-full min-w-[760px] border-collapse text-left text-[12.5px]">
          <caption className="sr-only">
            List of bidder submissions with compliance status and document counts
          </caption>
          <thead>
            <tr className="border-b border-slate-200 bg-slate-50 text-[11px] font-semibold uppercase tracking-wider text-slate-500">
              <th scope="col" className="px-5 py-2.5">
                Bid ID
              </th>
              <th scope="col" className="px-5 py-2.5">
                Vendor
              </th>
              <th scope="col" className="px-5 py-2.5">
                Submitted At
              </th>
              <th scope="col" className="px-5 py-2.5 text-right">
                Docs
              </th>
              <th scope="col" className="px-5 py-2.5">
                Compliance
              </th>
              <th scope="col" className="px-5 py-2.5 text-right">
                Action
              </th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100">
            {tender.bids.map((bid) => (
              <tr
                key={bid.id}
                className="transition-colors hover:bg-slate-50/70"
              >
                <td className="whitespace-nowrap px-5 py-3 font-mono text-[11.5px] font-semibold text-slate-700">
                  {bid.id}
                </td>
                <td className="max-w-[260px] px-5 py-3">
                  <span className="line-clamp-1 font-medium text-slate-800">
                    {bid.vendor}
                  </span>
                </td>
                <td className="whitespace-nowrap px-5 py-3 text-slate-600">
                  <span className="inline-flex items-center gap-1.5">
                    <Clock
                      className="h-3.5 w-3.5 text-slate-400"
                      aria-hidden="true"
                    />
                    {bid.submittedAt}
                  </span>
                </td>
                <td className="px-5 py-3 text-right tabular-nums font-medium text-slate-800">
                  {formatNumber(bid.documentCount)}
                </td>
                <td className="px-5 py-3">
                  <ComplianceBadge state={bid.compliance} />
                </td>
                <td className="whitespace-nowrap px-5 py-3 text-right">
                  <Link
                    to={`/bids/${bid.id}`}
                    className="inline-flex items-center gap-1 text-[12px] font-semibold text-emerald-600 transition-colors hover:text-emerald-700 focus:outline-none focus-visible:underline"
                  >
                    Open
                    <ChevronRight className="h-3.5 w-3.5" aria-hidden="true" />
                  </Link>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <footer className="flex items-center justify-end border-t border-slate-200 px-5 py-3 sm:hidden">
        <Link
          to={`/bids?tender=${encodeURIComponent(tender.id)}`}
          className="inline-flex items-center gap-1 text-[12px] font-semibold text-emerald-600"
        >
          View all bids
          <ExternalLink className="h-3.5 w-3.5" aria-hidden="true" />
        </Link>
      </footer>
    </section>
  );
}

/* ---------------- Not found state ---------------- */
function NotFoundState({ routeId }) {
  return (
    <div className="flex flex-col items-center justify-center gap-4 rounded-lg border border-slate-200 bg-white px-6 py-16 text-center shadow-sm">
      <span
        className="inline-flex h-12 w-12 items-center justify-center rounded-md bg-amber-50 text-amber-600"
        aria-hidden="true"
      >
        <AlertTriangle className="h-6 w-6" />
      </span>
      <div className="max-w-md">
        <h1 className="text-[15px] font-semibold text-slate-900">
          Tender Not Found
        </h1>
        <p className="mt-1.5 text-[12.5px] leading-relaxed text-slate-600">
          No tender record exists with the reference{' '}
          <span className="font-mono font-semibold text-slate-800">
            {routeId || 'unknown'}
          </span>
          . It may have been removed, archived, or the URL is incorrect.
        </p>
      </div>
      <Link
        to="/tenders"
        className="inline-flex h-9 items-center gap-1.5 rounded-md bg-emerald-600 px-3.5 text-[12.5px] font-semibold text-white transition-colors hover:bg-emerald-700 focus:outline-none focus-visible:ring-2 focus-visible:ring-emerald-600 focus-visible:ring-offset-2"
      >
        <ArrowLeft className="h-3.5 w-3.5" aria-hidden="true" />
        Back to Tenders
      </Link>
    </div>
  );
}

/* ================================================================== */
/*  PAGE                                                              */
/* ================================================================== */

export default function TenderDetails() {
  const { id } = useParams();
  const [activeTab, setActiveTab] = useState('overview');
  const [notification, setNotification] = useState(null);

  const tender = useMemo(() => TENDER_REGISTRY[id] ?? null, [id]);

  const handleAction = useCallback((message) => {
    setNotification(message);
    window.clearTimeout(handleAction._t);
    handleAction._t = window.setTimeout(() => setNotification(null), 2400);
  }, []);

  if (!tender) {
    return <NotFoundState routeId={id} />;
  }

  const tabs = [
    { id: 'overview', label: 'Overview & Scope' },
    {
      id: 'eligibility',
      label: 'Eligibility Criteria',
      count: tender.requirements.length,
    },
    {
      id: 'documents',
      label: 'Documents',
      count: tender.documents.length,
    },
    {
      id: 'bids',
      label: 'Bids & Compliance',
      count: tender.bids.length,
    },
  ];

  return (
    <div className="flex flex-col gap-5">
      {/* ============================================================ */}
      {/*  Notification toast                                          */}
      {/* ============================================================ */}
      {notification ? (
        <div
          role="status"
          aria-live="polite"
          className="fixed bottom-5 right-5 z-50 flex max-w-sm items-start gap-2.5 rounded-md border border-emerald-200 bg-emerald-50 px-3 py-2.5 text-[12.5px] text-emerald-700 shadow-lg"
        >
          <CheckCircle2
            className="mt-0.5 h-4 w-4 flex-shrink-0"
            aria-hidden="true"
          />
          <span>{notification}</span>
        </div>
      ) : null}

      {/* ============================================================ */}
      {/*  Page header                                                 */}
      {/* ============================================================ */}
      <div className="flex flex-col gap-4">
        <Link
          to="/tenders"
          className="inline-flex w-fit items-center gap-1 text-[12px] font-medium text-slate-500 transition-colors hover:text-slate-800 focus:outline-none focus-visible:underline"
        >
          <ArrowLeft className="h-3.5 w-3.5" aria-hidden="true" />
          Back to Tenders
        </Link>

        <div className="flex flex-col gap-4 lg:flex-row lg:items-start lg:justify-between">
          <div className="min-w-0 flex-1">
            <div className="flex flex-wrap items-center gap-2">
              <span className="font-mono text-[11.5px] font-semibold text-slate-500">
                {tender.id}
              </span>
              <StatusBadge status={tender.status} />
            </div>
            <h1 className="mt-1.5 text-xl font-semibold tracking-tight text-slate-900 sm:text-2xl">
              {tender.title}
            </h1>
            <div className="mt-2 flex flex-wrap items-center gap-3 text-[12.5px] text-slate-600">
              <span className="inline-flex items-center gap-1.5">
                <Building2
                  className="h-3.5 w-3.5 text-slate-400"
                  aria-hidden="true"
                />
                {tender.organization}
              </span>
              <span aria-hidden="true" className="text-slate-300">
                ·
              </span>
              <span className="inline-flex items-center gap-1.5">
                <Layers
                  className="h-3.5 w-3.5 text-slate-400"
                  aria-hidden="true"
                />
                {tender.category}
              </span>
              <span aria-hidden="true" className="text-slate-300">
                ·
              </span>
              <span className="inline-flex items-center gap-1.5">
                <DollarSign
                  className="h-3.5 w-3.5 text-slate-400"
                  aria-hidden="true"
                />
                {tender.estimatedValue}
              </span>
            </div>
          </div>

          <div className="flex flex-wrap items-center gap-2">
            <button
              type="button"
              onClick={() => handleAction('Edit Tender — demo only')}
              className="inline-flex h-9 items-center gap-2 rounded-md border border-slate-200 bg-white px-3 text-[12.5px] font-semibold text-slate-700 shadow-sm transition-colors hover:bg-slate-50 focus:outline-none focus-visible:ring-2 focus-visible:ring-emerald-600 focus-visible:ring-offset-1"
            >
              <Edit3 className="h-3.5 w-3.5" aria-hidden="true" />
              Edit Tender
            </button>
            <Link
              to={`/bids?tender=${encodeURIComponent(tender.id)}`}
              className="inline-flex h-9 items-center gap-2 rounded-md border border-slate-200 bg-white px-3 text-[12.5px] font-semibold text-slate-700 shadow-sm transition-colors hover:bg-slate-50 focus:outline-none focus-visible:ring-2 focus-visible:ring-emerald-600 focus-visible:ring-offset-1"
            >
              <Users className="h-3.5 w-3.5" aria-hidden="true" />
              View Bids
            </Link>
            <button
              type="button"
              onClick={() => handleAction('Close Tender — demo only')}
              className="inline-flex h-9 items-center gap-2 rounded-md bg-emerald-600 px-3.5 text-[12.5px] font-semibold text-white shadow-sm transition-colors hover:bg-emerald-700 focus:outline-none focus-visible:ring-2 focus-visible:ring-emerald-600 focus-visible:ring-offset-2"
            >
              <CheckCircle2 className="h-3.5 w-3.5" aria-hidden="true" />
              Close Tender
            </button>
          </div>
        </div>
      </div>

      {/* ============================================================ */}
      {/*  Tabs                                                        */}
      {/* ============================================================ */}
      <Tabs tabs={tabs} activeTab={activeTab} onChange={setActiveTab} />

      {/* ============================================================ */}
      {/*  Tab panels                                                  */}
      {/* ============================================================ */}

      {activeTab === 'overview' ? (
        <div
          role="tabpanel"
          id="tabpanel-overview"
          aria-labelledby="tab-overview"
          className="flex flex-col gap-4"
        >
          <OverviewMetadata tender={tender} />
          <DescriptionSection tender={tender} />
          <TimelineSection tender={tender} />
        </div>
      ) : null}

      {activeTab === 'eligibility' ? (
        <div
          role="tabpanel"
          id="tabpanel-eligibility"
          aria-labelledby="tab-eligibility"
          className="flex flex-col gap-4"
        >
          <EligibilitySection tender={tender} />
        </div>
      ) : null}

      {activeTab === 'documents' ? (
        <div
          role="tabpanel"
          id="tabpanel-documents"
          aria-labelledby="tab-documents"
          className="flex flex-col gap-4"
        >
          <DocumentsSection tender={tender} onAction={handleAction} />
        </div>
      ) : null}

      {activeTab === 'bids' ? (
        <div
          role="tabpanel"
          id="tabpanel-bids"
          aria-labelledby="tab-bids"
          className="flex flex-col gap-4"
        >
          <ComplianceBreakdown summary={tender.complianceSummary} />
          <RecentBids tender={tender} />
        </div>
      ) : null}
    </div>
  );
}