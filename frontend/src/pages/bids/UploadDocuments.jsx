import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { Link, useNavigate, useParams } from 'react-router-dom';
import {
  UploadCloud,
  FileText,
  CheckCircle2,
  AlertCircle,
  X,
  ArrowLeft,
  Clock,
  Trash2,
  Eye,
  RefreshCw,
  ShieldAlert,
  Layers,
} from 'lucide-react';

/* ================================================================== */
/*  MOCK DATA                                                         */
/* ================================================================== */

const BID_REGISTRY = {
  'BID-2026-0087': {
    id: 'BID-2026-0087',
    bidder: {
      name: 'Aarav Infrastructure Solutions Pvt. Ltd.',
      contactPerson: 'Vikram Mehta',
    },
    tender: {
      ref: 'TNDR-2026-0142',
      title: 'Supply & Installation of Network Infrastructure — Phase II',
      organization: 'Ministry of Electronics & Information Technology',
      category: 'IT Infrastructure',
    },
    requirements: [
      {
        id: 'req-gst',
        name: 'GST Registration Certificate',
        mandatory: true,
      },
      { id: 'req-pan', name: 'Company PAN Card', mandatory: true },
      {
        id: 'req-udyam',
        name: 'Udyam / MSME Registration',
        mandatory: false,
      },
      {
        id: 'req-itr',
        name: 'Income Tax Returns (Last 3 Years)',
        mandatory: true,
      },
      {
        id: 'req-experience',
        name: 'Past Experience Certificates',
        mandatory: true,
      },
      {
        id: 'req-financial',
        name: 'Audited Financial Statements',
        mandatory: true,
      },
    ],
    existingDocuments: [
      {
        id: 'existing-1',
        name: 'GST_Registration_AISPL.pdf',
        requirementId: 'req-gst',
        uploadedAt: '2026-01-04 11:22 IST',
        size: '428 KB',
        status: 'ready',
      },
      {
        id: 'existing-2',
        name: 'Company_PAN_AISPL.pdf',
        requirementId: 'req-pan',
        uploadedAt: '2026-01-04 11:24 IST',
        size: '212 KB',
        status: 'ready',
      },
      {
        id: 'existing-3',
        name: 'Financials_FY22-24_Audited.pdf',
        requirementId: 'req-financial',
        uploadedAt: '2026-01-04 11:28 IST',
        size: '3.2 MB',
        status: 'review',
      },
    ],
  },
  'BID-2026-0088': {
    id: 'BID-2026-0088',
    bidder: {
      name: 'Nexus Systems Integrators LLP',
      contactPerson: 'Ananya Rao',
    },
    tender: {
      ref: 'TNDR-2026-0142',
      title: 'Supply & Installation of Network Infrastructure — Phase II',
      organization: 'Ministry of Electronics & Information Technology',
      category: 'IT Infrastructure',
    },
    requirements: [
      { id: 'req-gst', name: 'GST Registration Certificate', mandatory: true },
      { id: 'req-pan', name: 'Company PAN Card', mandatory: true },
      { id: 'req-udyam', name: 'Udyam / MSME Registration', mandatory: false },
      {
        id: 'req-itr',
        name: 'Income Tax Returns (Last 3 Years)',
        mandatory: true,
      },
      {
        id: 'req-experience',
        name: 'Past Experience Certificates',
        mandatory: true,
      },
      {
        id: 'req-financial',
        name: 'Audited Financial Statements',
        mandatory: true,
      },
    ],
    existingDocuments: [
      {
        id: 'existing-1',
        name: 'GST_Certificate_NexusSystems.pdf',
        requirementId: 'req-gst',
        uploadedAt: '2026-01-05 09:14 IST',
        size: '384 KB',
        status: 'ready',
      },
    ],
  },
};

/* ================================================================== */
/*  CONSTANTS                                                         */
/* ================================================================== */

const ALLOWED_EXTENSIONS = [
  'pdf',
  'doc',
  'docx',
  'xls',
  'xlsx',
  'jpg',
  'jpeg',
  'png',
];

const MAX_FILE_SIZE_BYTES = 10 * 1024 * 1024; // 10 MB

/* Document lifecycle states — NEVER auto-mark new uploads as "verified" */
const DOC_STATUS = {
  uploaded: {
    label: 'Uploaded',
    className: 'bg-slate-100 text-slate-700 border-slate-200',
    Icon: FileText,
  },
  processing: {
    label: 'Processing',
    className: 'bg-amber-50 text-amber-700 border-amber-200',
    Icon: Clock,
  },
  ready: {
    label: 'Ready for Verification',
    className: 'bg-emerald-50 text-emerald-700 border-emerald-200',
    Icon: CheckCircle2,
  },
  review: {
    label: 'Requires Review',
    className: 'bg-amber-50 text-amber-700 border-amber-200',
    Icon: AlertCircle,
  },
  failed: {
    label: 'Failed',
    className: 'bg-red-50 text-red-700 border-red-200',
    Icon: AlertCircle,
  },
};

/* ================================================================== */
/*  HELPERS                                                           */
/* ================================================================== */

const cx = (...parts) => parts.filter(Boolean).join(' ');

const formatFileSize = (bytes) => {
  if (!bytes) return '0 B';
  const units = ['B', 'KB', 'MB', 'GB'];
  const exponent = Math.min(
    Math.floor(Math.log(bytes) / Math.log(1024)),
    units.length - 1
  );
  const value = bytes / Math.pow(1024, exponent);
  return `${value.toFixed(exponent === 0 ? 0 : 1)} ${units[exponent]}`;
};

const getFileExtension = (name) => {
  const parts = name.split('.');
  return parts.length > 1 ? parts.pop().toLowerCase() : '';
};

const validateFile = (file) => {
  const ext = getFileExtension(file.name);
  if (!ext) return 'File has no extension.';
  if (!ALLOWED_EXTENSIONS.includes(ext)) {
    return `.${ext} is not an allowed format. Accepted: PDF, DOC, DOCX, XLS, XLSX, JPG, JPEG, PNG.`;
  }
  if (file.size > MAX_FILE_SIZE_BYTES) {
    return `File exceeds ${formatFileSize(MAX_FILE_SIZE_BYTES)} size limit.`;
  }
  if (file.size === 0) return 'File is empty.';
  return '';
};

/* ================================================================== */
/*  PRIMITIVES                                                        */
/* ================================================================== */

function DocStatusBadge({ status }) {
  const config = DOC_STATUS[status] ?? DOC_STATUS.uploaded;
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

/* ================================================================== */
/*  NOT FOUND STATE                                                   */
/* ================================================================== */

function BidNotFound({ routeId }) {
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
          . Documents cannot be uploaded against an unknown bid.
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

function PageHeader({ bid }) {
  return (
    <div className="flex flex-col gap-4">
      <Link
        to={`/bids/${encodeURIComponent(bid.id)}`}
        className="inline-flex w-fit items-center gap-1 text-[12px] font-medium text-slate-500 transition-colors hover:text-slate-800 focus:outline-none focus-visible:underline"
      >
        <ArrowLeft className="h-3.5 w-3.5" aria-hidden="true" />
        Back to Bid Details
      </Link>

      <div className="flex flex-col gap-4 lg:flex-row lg:items-start lg:justify-between">
        <div className="min-w-0 flex-1">
          <p className="text-[11px] font-semibold uppercase tracking-[0.15em] text-emerald-600">
            Bidder Intake
          </p>
          <h1 className="mt-1 text-xl font-semibold tracking-tight text-slate-900 sm:text-2xl">
            Upload Bid Documents
          </h1>
          <p className="mt-1.5 max-w-2xl text-[13px] leading-relaxed text-slate-600">
            Attach all required documents to this bid. Files go through a
            client-side staging step; downstream AI verification will run
            separately once the bid is submitted for evaluation.
          </p>

          <dl className="mt-3 flex flex-wrap items-center gap-x-4 gap-y-2 text-[12px]">
            <div className="inline-flex items-center gap-1.5">
              <dt className="font-semibold uppercase tracking-wider text-slate-500">
                Bid
              </dt>
              <dd className="font-mono text-[11.5px] font-semibold text-slate-800">
                {bid.id}
              </dd>
            </div>
            <span aria-hidden="true" className="text-slate-300">
              ·
            </span>
            <div className="inline-flex items-center gap-1.5">
              <dt className="font-semibold uppercase tracking-wider text-slate-500">
                Bidder
              </dt>
              <dd className="text-slate-700">{bid.bidder.name}</dd>
            </div>
            <span aria-hidden="true" className="text-slate-300">
              ·
            </span>
            <div className="inline-flex items-center gap-1.5">
              <dt className="font-semibold uppercase tracking-wider text-slate-500">
                Tender
              </dt>
              <dd className="font-mono text-[11.5px] font-semibold text-slate-800">
                {bid.tender.ref}
              </dd>
            </div>
          </dl>

          <p className="mt-1 text-[12px] text-slate-500">
            {bid.tender.title} · {bid.tender.organization}
          </p>
        </div>
      </div>
    </div>
  );
}

/* ================================================================== */
/*  CHECKLIST SECTION                                                 */
/* ================================================================== */

function ChecklistSection({ bid, existingDocs, stagedDocs }) {
  /* Map requirement id -> best status among staged/existing docs */
  const statusByReq = useMemo(() => {
    const map = new Map();

    const upgrade = (current, candidate) => {
      const rank = { ready: 5, processing: 4, review: 3, uploaded: 2, failed: 1 };
      if (!current) return candidate;
      return (rank[candidate] ?? 0) > (rank[current] ?? 0) ? candidate : current;
    };

    for (const doc of existingDocs) {
      if (!doc.requirementId) continue;
      map.set(
        doc.requirementId,
        upgrade(map.get(doc.requirementId), doc.status)
      );
    }
    for (const doc of stagedDocs) {
      if (!doc.requirementId) continue;
      map.set(
        doc.requirementId,
        upgrade(map.get(doc.requirementId), doc.status)
      );
    }
    return map;
  }, [existingDocs, stagedDocs]);

  return (
    <section
      aria-label="Required documents checklist"
      className="overflow-hidden rounded-lg border border-slate-200 bg-white shadow-sm"
    >
      <header className="border-b border-slate-200 px-5 py-4">
        <h2 className="text-[13.5px] font-semibold text-slate-900">
          Required Document Checklist
        </h2>
        <p className="mt-0.5 text-[12px] text-slate-500">
          Upload status reflects staged and pre-existing documents for this bid
        </p>
      </header>

      <ul className="divide-y divide-slate-100">
        {bid.requirements.map((req) => {
          const status = statusByReq.get(req.id);
          return (
            <li
              key={req.id}
              className="flex flex-col gap-2 px-5 py-3.5 sm:flex-row sm:items-center sm:justify-between"
            >
              <div className="flex min-w-0 items-start gap-3">
                <span
                  className={cx(
                    'mt-0.5 inline-flex h-7 w-7 flex-shrink-0 items-center justify-center rounded-md',
                    req.mandatory
                      ? 'bg-red-50 text-red-600'
                      : 'bg-slate-100 text-slate-500'
                  )}
                  aria-hidden="true"
                >
                  <FileText className="h-3.5 w-3.5" />
                </span>
                <div className="min-w-0">
                  <p className="text-[12.5px] font-semibold text-slate-800">
                    {req.name}
                  </p>
                  <span
                    className={cx(
                      'mt-0.5 inline-flex items-center rounded-full border px-2 py-0.5 text-[10px] font-semibold uppercase tracking-wider',
                      req.mandatory
                        ? 'border-red-200 bg-red-50 text-red-700'
                        : 'border-slate-200 bg-slate-100 text-slate-600'
                    )}
                  >
                    {req.mandatory ? 'Mandatory' : 'Optional'}
                  </span>
                </div>
              </div>

              <div className="flex flex-shrink-0 items-center gap-2">
                {status ? (
                  <DocStatusBadge status={status} />
                ) : (
                  <span className="inline-flex items-center rounded-full border border-slate-200 bg-slate-50 px-2 py-0.5 text-[10.5px] font-semibold uppercase tracking-wider text-slate-500">
                    Not Uploaded
                  </span>
                )}
              </div>
            </li>
          );
        })}
      </ul>
    </section>
  );
}

/* ================================================================== */
/*  DROP ZONE                                                         */
/* ================================================================== */

function DropZone({ onFiles, disabled }) {
  const [dragActive, setDragActive] = useState(false);
  const inputRef = useRef(null);

  const handleDrop = useCallback(
    (event) => {
      event.preventDefault();
      setDragActive(false);
      if (disabled) return;
      onFiles(event.dataTransfer.files);
    },
    [onFiles, disabled]
  );

  const handleDragOver = useCallback(
    (event) => {
      event.preventDefault();
      if (!disabled) setDragActive(true);
    },
    [disabled]
  );

  const handleDragLeave = useCallback((event) => {
    event.preventDefault();
    setDragActive(false);
  }, []);

  const handleBrowseClick = useCallback(() => {
    if (disabled) return;
    inputRef.current?.click();
  }, [disabled]);

  const handleInputChange = useCallback(
    (event) => {
      onFiles(event.target.files);
      event.target.value = '';
    },
    [onFiles]
  );

  return (
    <section
      aria-label="Upload bid documents"
      className="rounded-lg border border-slate-200 bg-white shadow-sm"
    >
      <header className="border-b border-slate-200 px-5 py-4">
        <h2 className="text-[13.5px] font-semibold text-slate-900">
          Stage New Documents
        </h2>
        <p className="mt-0.5 text-[12px] text-slate-500">
          Drag files or click to browse. Accepted: PDF, DOC/DOCX, XLS/XLSX,
          JPG/JPEG, PNG. Max {formatFileSize(MAX_FILE_SIZE_BYTES)} per file.
        </p>
      </header>

      <div className="p-5">
        <div
          role="button"
          tabIndex={0}
          aria-disabled={disabled}
          onClick={handleBrowseClick}
          onKeyDown={(event) => {
            if (disabled) return;
            if (event.key === 'Enter' || event.key === ' ') {
              event.preventDefault();
              handleBrowseClick();
            }
          }}
          onDrop={handleDrop}
          onDragOver={handleDragOver}
          onDragLeave={handleDragLeave}
          className={cx(
            'flex flex-col items-center justify-center gap-2 rounded-md border-2 border-dashed px-4 py-8 text-center transition-colors focus:outline-none focus-visible:ring-2 focus-visible:ring-emerald-600 focus-visible:ring-offset-1',
            disabled
              ? 'cursor-not-allowed border-slate-200 bg-slate-50 opacity-60'
              : dragActive
              ? 'cursor-pointer border-emerald-500 bg-emerald-50'
              : 'cursor-pointer border-slate-300 bg-slate-50 hover:border-emerald-500 hover:bg-emerald-50/40'
          )}
        >
          <span
            className="inline-flex h-10 w-10 items-center justify-center rounded-md bg-white text-emerald-600 shadow-sm"
            aria-hidden="true"
          >
            <UploadCloud className="h-5 w-5" />
          </span>
          <div>
            <p className="text-[13px] font-semibold text-slate-800">
              Click to browse or drag files here
            </p>
            <p className="mt-0.5 text-[11.5px] text-slate-500">
              Multiple files can be staged in one drop
            </p>
          </div>
          <input
            ref={inputRef}
            type="file"
            multiple
            accept=".pdf,.doc,.docx,.xls,.xlsx,.jpg,.jpeg,.png"
            onChange={handleInputChange}
            className="sr-only"
            disabled={disabled}
            tabIndex={-1}
          />
        </div>
      </div>
    </section>
  );
}

/* ================================================================== */
/*  STAGED FILES LIST                                                 */
/* ================================================================== */

function StagedFilesList({
  stagedDocs,
  requirements,
  onUpdateMapping,
  onRemove,
  onProcess,
  isProcessing,
}) {
  if (stagedDocs.length === 0) return null;

  return (
    <section
      aria-label="Staged documents"
      className="overflow-hidden rounded-lg border border-slate-200 bg-white shadow-sm"
    >
      <header className="flex flex-wrap items-start justify-between gap-3 border-b border-slate-200 px-5 py-4">
        <div>
          <h2 className="text-[13.5px] font-semibold text-slate-900">
            Staged Documents ({stagedDocs.length})
          </h2>
          <p className="mt-0.5 text-[12px] text-slate-500">
            Map each file to a checklist requirement before processing
          </p>
        </div>
        <button
          type="button"
          onClick={onProcess}
          disabled={isProcessing || stagedDocs.length === 0}
          className={cx(
            'inline-flex h-9 items-center gap-2 rounded-md px-3.5 text-[12.5px] font-semibold text-white shadow-sm transition-colors focus:outline-none focus-visible:ring-2 focus-visible:ring-emerald-600 focus-visible:ring-offset-2',
            isProcessing || stagedDocs.length === 0
              ? 'cursor-not-allowed bg-emerald-600/60'
              : 'bg-emerald-600 hover:bg-emerald-700'
          )}
        >
          {isProcessing ? (
            <>
              <RefreshCw className="h-3.5 w-3.5 animate-spin" aria-hidden="true" />
              Processing…
            </>
          ) : (
            <>
              <UploadCloud className="h-3.5 w-3.5" aria-hidden="true" />
              Upload & Process
            </>
          )}
        </button>
      </header>

      <ul className="divide-y divide-slate-100">
        {stagedDocs.map((doc) => (
          <li
            key={doc.id}
            className="grid grid-cols-1 gap-3 px-5 py-4 md:grid-cols-12 md:items-center"
          >
            {/* File identity */}
            <div className="min-w-0 md:col-span-4">
              <div className="flex items-start gap-3">
                <span
                  className="inline-flex h-8 w-8 flex-shrink-0 items-center justify-center rounded-md bg-slate-100 text-slate-600"
                  aria-hidden="true"
                >
                  <FileText className="h-4 w-4" />
                </span>
                <div className="min-w-0">
                  <p className="truncate text-[12.5px] font-medium text-slate-800">
                    {doc.name}
                  </p>
                  <p className="mt-0.5 flex flex-wrap items-center gap-2 text-[11px] text-slate-500">
                    <span className="font-mono uppercase">{doc.extension}</span>
                    <span aria-hidden="true">·</span>
                    <span>{formatFileSize(doc.size)}</span>
                  </p>
                </div>
              </div>
            </div>

            {/* Mapping */}
            <div className="md:col-span-5">
              <label
                htmlFor={`map-${doc.id}`}
                className="mb-1 block text-[10.5px] font-semibold uppercase tracking-wider text-slate-500 md:hidden"
              >
                Requirement
              </label>
              <select
                id={`map-${doc.id}`}
                value={doc.requirementId}
                onChange={(event) => onUpdateMapping(doc.id, event.target.value)}
                disabled={isProcessing || doc.status === 'ready'}
                className={cx(
                  'h-9 w-full cursor-pointer appearance-none rounded-md border bg-white px-2.5 text-[12.5px] transition-colors focus:outline-none focus:ring-2 disabled:cursor-not-allowed disabled:bg-slate-50',
                  doc.requirementId
                    ? 'border-slate-200 text-slate-900 focus:border-emerald-600 focus:ring-emerald-600/20'
                    : 'border-amber-200 text-amber-700 focus:border-amber-500 focus:ring-amber-500/20'
                )}
              >
                <option value="">— Select requirement —</option>
                {requirements.map((req) => (
                  <option key={req.id} value={req.id}>
                    {req.name}
                    {req.mandatory ? ' (Mandatory)' : ' (Optional)'}
                  </option>
                ))}
              </select>
            </div>

            {/* Status */}
            <div className="md:col-span-2">
              <DocStatusBadge status={doc.status} />
            </div>

            {/* Actions */}
            <div className="flex items-center justify-end gap-1 md:col-span-1">
              <button
                type="button"
                onClick={() => onRemove(doc.id)}
                disabled={isProcessing}
                aria-label={`Remove ${doc.name}`}
                className="inline-flex h-8 w-8 items-center justify-center rounded-md text-slate-500 transition-colors hover:bg-red-50 hover:text-red-600 focus:outline-none focus-visible:ring-2 focus-visible:ring-red-500 focus-visible:ring-offset-1 disabled:cursor-not-allowed disabled:opacity-50"
              >
                <Trash2 className="h-3.5 w-3.5" aria-hidden="true" />
              </button>
            </div>

            {/* Inline validation warning */}
            {doc.error ? (
              <p
                role="alert"
                className="flex items-center gap-1.5 text-[11.5px] font-medium text-red-600 md:col-span-12"
              >
                <AlertCircle
                  className="h-3.5 w-3.5 flex-shrink-0"
                  aria-hidden="true"
                />
                {doc.error}
              </p>
            ) : null}
          </li>
        ))}
      </ul>
    </section>
  );
}

/* ================================================================== */
/*  EXISTING DOCUMENTS TABLE                                          */
/* ================================================================== */

function ExistingDocumentsTable({ documents, requirements, onRemove }) {
  const reqName = (reqId) =>
    requirements.find((r) => r.id === reqId)?.name ?? '—';

  return (
    <section
      aria-label="Existing documents"
      className="overflow-hidden rounded-lg border border-slate-200 bg-white shadow-sm"
    >
      <header className="border-b border-slate-200 px-5 py-4">
        <h2 className="text-[13.5px] font-semibold text-slate-900">
          Existing Documents ({documents.length})
        </h2>
        <p className="mt-0.5 text-[12px] text-slate-500">
          Documents already attached to this bid
        </p>
      </header>

      {documents.length === 0 ? (
        <div className="flex flex-col items-center gap-2 px-6 py-10 text-center">
          <span
            className="inline-flex h-10 w-10 items-center justify-center rounded-md bg-slate-100 text-slate-500"
            aria-hidden="true"
          >
            <Layers className="h-5 w-5" />
          </span>
          <p className="text-[13px] font-semibold text-slate-800">
            No documents attached yet
          </p>
          <p className="text-[12px] text-slate-500">
            Stage files above to begin the submission.
          </p>
        </div>
      ) : (
        <div className="overflow-x-auto">
          <table className="w-full min-w-[760px] border-collapse text-left text-[12.5px]">
            <caption className="sr-only">
              List of documents already attached to this bid
            </caption>
            <thead>
              <tr className="border-b border-slate-200 bg-slate-50 text-[11px] font-semibold uppercase tracking-wider text-slate-500">
                <th scope="col" className="px-5 py-2.5">File</th>
                <th scope="col" className="px-5 py-2.5">Mapped Requirement</th>
                <th scope="col" className="px-5 py-2.5">Uploaded</th>
                <th scope="col" className="px-5 py-2.5">Size</th>
                <th scope="col" className="px-5 py-2.5">Status</th>
                <th scope="col" className="px-5 py-2.5 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {documents.map((doc) => (
                <tr
                  key={doc.id}
                  className="transition-colors hover:bg-slate-50/70"
                >
                  <td className="max-w-[260px] px-5 py-3">
                    <span className="flex items-center gap-2">
                      <FileText
                        className="h-3.5 w-3.5 flex-shrink-0 text-slate-400"
                        aria-hidden="true"
                      />
                      <span className="truncate font-medium text-slate-800">
                        {doc.name}
                      </span>
                    </span>
                  </td>
                  <td className="px-5 py-3 text-slate-600">
                    <span className="line-clamp-1">
                      {reqName(doc.requirementId)}
                    </span>
                  </td>
                  <td className="whitespace-nowrap px-5 py-3 text-slate-600">
                    {doc.uploadedAt}
                  </td>
                  <td className="whitespace-nowrap px-5 py-3 tabular-nums text-slate-600">
                    {doc.size}
                  </td>
                  <td className="whitespace-nowrap px-5 py-3">
                    <DocStatusBadge status={doc.status} />
                  </td>
                  <td className="whitespace-nowrap px-5 py-3 text-right">
                    <div className="flex items-center justify-end gap-1">
                      <button
                        type="button"
                        aria-label={`View ${doc.name}`}
                        className="inline-flex h-7 w-7 items-center justify-center rounded-md text-slate-500 transition-colors hover:bg-slate-100 hover:text-slate-800 focus:outline-none focus-visible:ring-2 focus-visible:ring-emerald-600 focus-visible:ring-offset-1"
                      >
                        <Eye className="h-3.5 w-3.5" aria-hidden="true" />
                      </button>
                      <button
                        type="button"
                        aria-label={`Replace ${doc.name}`}
                        className="inline-flex h-7 w-7 items-center justify-center rounded-md text-slate-500 transition-colors hover:bg-slate-100 hover:text-slate-800 focus:outline-none focus-visible:ring-2 focus-visible:ring-emerald-600 focus-visible:ring-offset-1"
                      >
                        <RefreshCw className="h-3.5 w-3.5" aria-hidden="true" />
                      </button>
                      <button
                        type="button"
                        onClick={() => onRemove(doc.id)}
                        aria-label={`Remove ${doc.name}`}
                        className="inline-flex h-7 w-7 items-center justify-center rounded-md text-slate-500 transition-colors hover:bg-red-50 hover:text-red-600 focus:outline-none focus-visible:ring-2 focus-visible:ring-red-500 focus-visible:ring-offset-1"
                      >
                        <Trash2 className="h-3.5 w-3.5" aria-hidden="true" />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </section>
  );
}

/* ================================================================== */
/*  COMPLETION SUMMARY                                                */
/* ================================================================== */

function CompletionSummary({ bid, existingDocs, stagedDocs }) {
  const metrics = useMemo(() => {
    const mandatoryReqs = bid.requirements.filter((r) => r.mandatory);
    const optionalReqs = bid.requirements.filter((r) => !r.mandatory);

    const allDocs = [...existingDocs, ...stagedDocs];

    const mandatoryMappedIds = new Set(
      allDocs
        .filter((d) => d.requirementId)
        .map((d) => d.requirementId)
    );

    const mandatoryUploaded = mandatoryReqs.filter((r) =>
      mandatoryMappedIds.has(r.id)
    ).length;
    const mandatoryMissing = mandatoryReqs.length - mandatoryUploaded;

    const optionalUploaded = optionalReqs.filter((r) =>
      mandatoryMappedIds.has(r.id)
    ).length;

    const readyForVerification = allDocs.filter(
      (d) => d.status === 'ready'
    ).length;

    return {
      totalRequired: bid.requirements.length,
      mandatoryRequired: mandatoryReqs.length,
      mandatoryUploaded,
      mandatoryMissing,
      optionalUploaded,
      readyForVerification,
    };
  }, [bid.requirements, existingDocs, stagedDocs]);

  const completionPct = useMemo(() => {
    if (metrics.mandatoryRequired === 0) return 100;
    return Math.round(
      (metrics.mandatoryUploaded / metrics.mandatoryRequired) * 100
    );
  }, [metrics.mandatoryUploaded, metrics.mandatoryRequired]);

  const cards = [
    {
      id: 'total',
      label: 'Total Requirements',
      value: metrics.totalRequired,
      tone: 'slate',
    },
    {
      id: 'mandatory-uploaded',
      label: 'Mandatory Uploaded',
      value: metrics.mandatoryUploaded,
      tone: 'emerald',
    },
    {
      id: 'mandatory-missing',
      label: 'Mandatory Missing',
      value: metrics.mandatoryMissing,
      tone: metrics.mandatoryMissing > 0 ? 'red' : 'slate',
    },
    {
      id: 'optional-uploaded',
      label: 'Optional Uploaded',
      value: metrics.optionalUploaded,
      tone: 'slate',
    },
    {
      id: 'ready',
      label: 'Ready for Verification',
      value: metrics.readyForVerification,
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
    <section
      aria-label="Submission completion summary"
      className="rounded-lg border border-slate-200 bg-white p-5 shadow-sm"
    >
      <div className="mb-4 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h2 className="text-[13.5px] font-semibold text-slate-900">
            Submission Summary
          </h2>
          <p className="mt-0.5 text-[12px] text-slate-500">
            Mandatory coverage: {metrics.mandatoryUploaded} of{' '}
            {metrics.mandatoryRequired} requirements
          </p>
        </div>
        <div className="w-full max-w-xs">
          <div className="mb-1 flex items-center justify-between text-[11px] font-semibold uppercase tracking-wider text-slate-500">
            <span>Mandatory Coverage</span>
            <span className="tabular-nums text-slate-800">
              {completionPct}%
            </span>
          </div>
          <div
            role="progressbar"
            aria-valuenow={completionPct}
            aria-valuemin={0}
            aria-valuemax={100}
            aria-label="Mandatory document coverage"
            className="h-2 w-full overflow-hidden rounded-full bg-slate-100"
          >
            <div
              style={{ width: `${completionPct}%` }}
              className={cx(
                'h-full rounded-full transition-[width] duration-500',
                completionPct === 100
                  ? 'bg-emerald-500'
                  : completionPct >= 50
                  ? 'bg-amber-500'
                  : 'bg-red-500'
              )}
            />
          </div>
        </div>
      </div>

      <ul className="grid grid-cols-2 gap-3 lg:grid-cols-5">
        {cards.map((card) => (
          <li
            key={card.id}
            className="rounded-md border border-slate-200 bg-slate-50 p-3"
          >
            <p className="text-[10.5px] font-semibold uppercase tracking-wider text-slate-500">
              {card.label}
            </p>
            <p
              className={cx(
                'mt-1 inline-flex h-6 w-6 items-center justify-center rounded-md text-[12px] font-semibold tabular-nums',
                toneIcon[card.tone]
              )}
            >
              {card.value}
            </p>
          </li>
        ))}
      </ul>
    </section>
  );
}

/* ================================================================== */
/*  PAGE                                                              */
/* ================================================================== */

export default function UploadDocuments() {
  const { id } = useParams();
  const navigate = useNavigate();

  const bid = useMemo(() => BID_REGISTRY[id] ?? null, [id]);

  const [stagedDocs, setStagedDocs] = useState([]);
  const [existingDocs, setExistingDocs] = useState(
    () => bid?.existingDocuments ?? []
  );
  const [isProcessing, setIsProcessing] = useState(false);
  const [toast, setToast] = useState(null);

  /* Keep existing docs synced with bid swap (route param changes) */
  useEffect(() => {
    if (bid) setExistingDocs(bid.existingDocuments ?? []);
    setStagedDocs([]);
  }, [bid]);

  /* Toast auto-dismiss */
  useEffect(() => {
    if (!toast) return;
    const timeout = setTimeout(() => setToast(null), 2800);
    return () => clearTimeout(timeout);
  }, [toast]);

  /* ---------------- File staging ---------------- */
  const handleFilesAdded = useCallback((fileList) => {
    const incoming = Array.from(fileList || []);
    if (incoming.length === 0) return;

    const newStaged = [];
    const rejected = [];

    for (const file of incoming) {
      const error = validateFile(file);
      if (error) {
        rejected.push({ name: file.name, reason: error });
        continue;
      }
      newStaged.push({
        id: `staged-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`,
        name: file.name,
        size: file.size,
        extension: getFileExtension(file.name).toUpperCase(),
        requirementId: '',
        status: 'uploaded',
        error: '',
      });
    }

    if (newStaged.length > 0) {
      setStagedDocs((prev) => [...prev, ...newStaged]);
    }

    if (rejected.length > 0) {
      setToast({
        type: 'error',
        message: `${rejected.length} file(s) skipped — ${rejected
          .map((r) => `${r.name}: ${r.reason}`)
          .join(' ')}`,
      });
    }
  }, []);

  /* ---------------- Staged row mutations ---------------- */
  const handleUpdateMapping = useCallback((docId, requirementId) => {
    setStagedDocs((prev) =>
      prev.map((doc) =>
        doc.id === docId
          ? { ...doc, requirementId, error: '' }
          : doc
      )
    );
  }, []);

  const handleRemoveStaged = useCallback((docId) => {
    setStagedDocs((prev) => prev.filter((doc) => doc.id !== docId));
  }, []);

  const handleRemoveExisting = useCallback((docId) => {
    setExistingDocs((prev) => prev.filter((doc) => doc.id !== docId));
  }, []);

  /* ---------------- Validation ---------------- */
  const validateStaged = useCallback(() => {
    if (stagedDocs.length === 0) {
      setToast({
        type: 'error',
        message: 'Stage at least one document before processing.',
      });
      return false;
    }

    let hasError = false;
    const validated = stagedDocs.map((doc) => {
      const error = doc.requirementId
        ? ''
        : 'Map this file to a requirement before processing.';
      if (error) hasError = true;
      return { ...doc, error };
    });

    setStagedDocs(validated);
    return !hasError;
  }, [stagedDocs]);

  /* ---------------- Simulated processing ---------------- */
  const handleProcess = useCallback(async () => {
    if (isProcessing) return;
    if (!validateStaged()) return;

    setIsProcessing(true);

    /* Capture the ids we are processing */
    const targets = stagedDocs
      .filter((d) => d.status !== 'ready')
      .map((d) => d.id);

    /* Lifecycle: uploaded -> processing -> ready */
    for (const docId of targets) {
      setStagedDocs((prev) =>
        prev.map((doc) =>
          doc.id === docId ? { ...doc, status: 'processing' } : doc
        )
      );
      // Simulated async step
      await new Promise((resolve) => setTimeout(resolve, 320));

      setStagedDocs((prev) =>
        prev.map((doc) =>
          doc.id === docId ? { ...doc, status: 'ready' } : doc
        )
      );
    }

    setIsProcessing(false);
    setToast({
      type: 'success',
      message: `${targets.length} document(s) processed and ready for verification.`,
    });
  }, [isProcessing, stagedDocs, validateStaged]);

  /* ---------------- Save & Continue ---------------- */
  const handleSaveAndContinue = useCallback(() => {
    if (stagedDocs.length === 0) {
      navigate(`/bids/${encodeURIComponent(id)}`);
      return;
    }

    const notReady = stagedDocs.filter((d) => d.status !== 'ready');
    if (notReady.length > 0) {
      setToast({
        type: 'error',
        message: `${notReady.length} staged document(s) still need to be processed before saving.`,
      });
      return;
    }

    /* Promote staged → existing (simulated confirmation) */
    const promoted = stagedDocs.map((doc) => ({
      id: `existing-${doc.id}`,
      name: doc.name,
      requirementId: doc.requirementId,
      uploadedAt: new Date()
        .toLocaleString('en-IN', { hour12: false })
        .replace(',', '') + ' IST',
      size: formatFileSize(doc.size),
      status: doc.status,
    }));

    setExistingDocs((prev) => [...prev, ...promoted]);
    setStagedDocs([]);
    setToast({
      type: 'success',
      message: 'Documents saved. Redirecting to bid details…',
    });

    setTimeout(() => navigate(`/bids/${encodeURIComponent(id)}`), 900);
  }, [stagedDocs, id, navigate]);

  const handleCancel = useCallback(() => {
    navigate(`/bids/${encodeURIComponent(id)}`);
  }, [id, navigate]);

  /* ---------------- Fallback ---------------- */
  if (!bid) {
    return <BidNotFound routeId={id} />;
  }

  return (
    <div className="flex flex-col gap-5">
      {/* Toast */}
      {toast ? (
        <div
          role="status"
          aria-live="polite"
          className={cx(
            'fixed bottom-5 right-5 z-50 flex max-w-sm items-start gap-2.5 rounded-md border px-3 py-2.5 text-[12.5px] shadow-lg',
            toast.type === 'success'
              ? 'border-emerald-200 bg-emerald-50 text-emerald-700'
              : 'border-red-200 bg-red-50 text-red-600'
          )}
        >
          {toast.type === 'success' ? (
            <CheckCircle2
              className="mt-0.5 h-4 w-4 flex-shrink-0"
              aria-hidden="true"
            />
          ) : (
            <AlertCircle
              className="mt-0.5 h-4 w-4 flex-shrink-0"
              aria-hidden="true"
            />
          )}
          <span>{toast.message}</span>
        </div>
      ) : null}

      {/* Header */}
      <PageHeader bid={bid} />

      {/* Completion summary */}
      <CompletionSummary
        bid={bid}
        existingDocs={existingDocs}
        stagedDocs={stagedDocs}
      />

      {/* Checklist */}
      <ChecklistSection
        bid={bid}
        existingDocs={existingDocs}
        stagedDocs={stagedDocs}
      />

      {/* Drop zone */}
      <DropZone onFiles={handleFilesAdded} disabled={isProcessing} />

      {/* Staged files */}
      <StagedFilesList
        stagedDocs={stagedDocs}
        requirements={bid.requirements}
        onUpdateMapping={handleUpdateMapping}
        onRemove={handleRemoveStaged}
        onProcess={handleProcess}
        isProcessing={isProcessing}
      />

      {/* Existing documents */}
      <ExistingDocumentsTable
        documents={existingDocs}
        requirements={bid.requirements}
        onRemove={handleRemoveExisting}
      />

      {/* Sticky action bar */}
      <div className="sticky bottom-0 -mx-4 flex flex-col gap-2 border-t border-slate-200 bg-slate-50/95 px-4 py-3 backdrop-blur sm:mx-0 sm:flex-row sm:items-center sm:justify-between sm:rounded-lg sm:border sm:px-5">
        <p className="text-[11.5px] text-slate-500">
          Newly uploaded files reach{' '}
          <span className="font-semibold text-slate-700">
            Ready for Verification
          </span>{' '}
          only — AI evaluation runs on the server side after submission.
        </p>

        <div className="flex flex-col-reverse items-stretch gap-2 sm:flex-row sm:items-center">
          <button
            type="button"
            onClick={handleCancel}
            disabled={isProcessing}
            className="inline-flex h-9 items-center justify-center rounded-md border border-slate-200 bg-white px-3.5 text-[12.5px] font-semibold text-slate-700 transition-colors hover:bg-slate-50 focus:outline-none focus-visible:ring-2 focus-visible:ring-emerald-600 focus-visible:ring-offset-1 disabled:cursor-not-allowed disabled:opacity-50"
          >
            Cancel
          </button>
          <button
            type="button"
            onClick={handleSaveAndContinue}
            disabled={isProcessing}
            className="inline-flex h-9 items-center justify-center rounded-md border border-slate-200 bg-white px-3.5 text-[12.5px] font-semibold text-slate-700 transition-colors hover:bg-slate-50 focus:outline-none focus-visible:ring-2 focus-visible:ring-emerald-600 focus-visible:ring-offset-1 disabled:cursor-not-allowed disabled:opacity-50"
          >
            Save & Continue
          </button>
          <button
            type="button"
            onClick={handleProcess}
            disabled={isProcessing || stagedDocs.length === 0}
            aria-busy={isProcessing}
            className={cx(
              'inline-flex h-9 items-center justify-center gap-2 rounded-md px-3.5 text-[12.5px] font-semibold text-white transition-colors focus:outline-none focus-visible:ring-2 focus-visible:ring-emerald-600 focus-visible:ring-offset-2',
              isProcessing || stagedDocs.length === 0
                ? 'cursor-not-allowed bg-emerald-600/60'
                : 'bg-emerald-600 hover:bg-emerald-700'
            )}
          >
            {isProcessing ? (
              <>
                <RefreshCw
                  className="h-3.5 w-3.5 animate-spin"
                  aria-hidden="true"
                />
                Processing…
              </>
            ) : (
              <>
                <UploadCloud className="h-3.5 w-3.5" aria-hidden="true" />
                Upload & Process
              </>
            )}
          </button>
        </div>
      </div>
    </div>
  );
}