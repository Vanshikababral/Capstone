import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { Link, useNavigate, useParams } from 'react-router-dom';
import {
  UploadCloud,
  FileText,
  CheckCircle2,
  AlertCircle,
  ArrowLeft,
  Clock,
  Trash2,
  Eye,
  RefreshCw,
  ShieldAlert,
  Layers,
} from 'lucide-react';
import {
  deleteBidDocument,
  getBid,
  getBidDocuments,
  getTender,
  getTenderRequirements,
  uploadBidDocument,
} from '../../services/documents';
import { getApiErrorMessage } from '../../services/api';

/* ================================================================== */
/*  CONSTANTS                                                         */
/* ================================================================== */

const ALLOWED_EXTENSIONS = ['pdf', 'doc', 'docx', 'txt'];

const MAX_FILE_SIZE_BYTES = 10 * 1024 * 1024; // 10 MB

/* Document lifecycle states — NEVER auto-mark new uploads as "verified" */
const DOC_STATUS = {
  staged: {
    label: 'Staged',
    className: 'bg-slate-100 text-slate-700 border-slate-200',
    Icon: FileText,
  },
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
    return `.${ext} is not an allowed format. Accepted: PDF, DOC, DOCX, TXT.`;
  }
  if (file.size > MAX_FILE_SIZE_BYTES) {
    return `File exceeds ${formatFileSize(MAX_FILE_SIZE_BYTES)} size limit.`;
  }
  if (file.size === 0) return 'File is empty.';
  return '';
};

function mapDocumentStatus(document) {
  if (document.processing_status === 'PROCESSING') return 'processing';
  if (document.processing_status === 'FAILED') return 'failed';
  if (document.processing_status === 'UPLOADED') return 'uploaded';

  const result = document.extraction_result ?? {};
  return result.extraction_status === 'EXTRACTED' ? 'ready' : 'review';
}

function mapApiDocument(document) {
  return {
    id: document.id,
    name: document.original_filename || document.title,
    requirementId: document.requirement ? String(document.requirement) : '',
    uploadedAt: new Date(document.uploaded_at).toLocaleString(),
    size: '—',
    status: mapDocumentStatus(document),
    extractionResult: document.extraction_result ?? {},
    extractedText: document.extracted_text ?? '',
    processingError: document.processing_error ?? '',
  };
}

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
        to="/bids"
        className="inline-flex w-fit items-center gap-1 text-[12px] font-medium text-slate-500 transition-colors hover:text-slate-800 focus:outline-none focus-visible:underline"
      >
        <ArrowLeft className="h-3.5 w-3.5" aria-hidden="true" />
        Back to Bids
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
            Upload the documents required by this tender. Review the
            server-side extraction status and map each file to a requirement.
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
      const rank = {
        ready: 5,
        processing: 4,
        review: 3,
        uploaded: 2,
        staged: 1,
        failed: 0,
      };
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
        {bid.requirements.length === 0 ? (
          <li className="px-5 py-4 text-sm text-amber-700">
            No tender requirements are configured for this bid. Add a
            requirement before uploading documents.
          </li>
        ) : null}
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

function DropZone({ onFiles, disabled, requirementsAvailable }) {
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
          {requirementsAvailable
            ? `Accepted: PDF, DOC, DOCX, TXT. Max ${formatFileSize(MAX_FILE_SIZE_BYTES)} per file.`
            : 'Add a tender requirement before uploading documents.'}
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
            accept=".pdf,.doc,.docx,.txt"
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
                    {doc.processingError ? (
                      <p className="mt-1 text-[11px] text-red-600">
                        {doc.processingError}
                      </p>
                    ) : null}
                    {Object.keys(
                      doc.extractionResult?.extracted_fields ?? {}
                    ).length > 0 ||
                    doc.extractedText ||
                    doc.extractionResult?.source_pages?.length ? (
                      <details className="mt-1 text-[11px] text-slate-600">
                        <summary className="cursor-pointer font-medium">
                          View extraction details
                        </summary>
                        {doc.extractionResult?.extraction_status ? (
                          <p className="mt-1">
                            Status: {doc.extractionResult.extraction_status}
                          </p>
                        ) : null}
                        <dl className="mt-1 space-y-1">
                          {Object.entries(
                            doc.extractionResult.extracted_fields
                          ).map(([field, value]) => (
                            <div key={field}>
                              <dt className="inline font-semibold">{field}: </dt>
                              <dd className="inline">
                                {typeof value === 'string'
                                  ? value
                                  : JSON.stringify(value)}
                              </dd>
                            </div>
                          ))}
                        </dl>
                        {doc.extractionResult?.missing_fields?.length ? (
                          <p className="mt-1">
                            Missing: {doc.extractionResult.missing_fields.join(', ')}
                          </p>
                        ) : null}
                        {doc.extractionResult?.source_pages?.length ? (
                          <p className="mt-1">
                            Source pages: {doc.extractionResult.source_pages.join(', ')}
                          </p>
                        ) : null}
                        {doc.extractedText ? (
                          <pre className="mt-2 max-h-40 overflow-auto whitespace-pre-wrap rounded bg-slate-50 p-2">
                            {doc.extractedText}
                          </pre>
                        ) : null}
                      </details>
                    ) : null}
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

  const [bidData, setBidData] = useState({
    id: null,
    bid: null,
    existingDocs: [],
    error: '',
  });
  const [stagedState, setStagedState] = useState({ bidId: null, docs: [] });
  const bid = bidData.id === id ? bidData.bid : null;
  const existingDocs =
    bidData.id === id ? bidData.existingDocs : [];
  const loadError = bidData.id === id ? bidData.error : '';
  const isLoading = bidData.id !== id;
  const stagedDocs = useMemo(
    () => (stagedState.bidId === id ? stagedState.docs : []),
    [id, stagedState]
  );
  const [isProcessing, setIsProcessing] = useState(false);
  const [toast, setToast] = useState(null);

  const setStagedDocs = useCallback(
    (update) => {
      setStagedState((previous) => {
        const currentDocs = previous.bidId === id ? previous.docs : [];
        const docs =
          typeof update === 'function' ? update(currentDocs) : update;
        return { bidId: id, docs };
      });
    },
    [id]
  );

  /* Load the real bid, its tender requirements, and previously uploaded docs. */
  useEffect(() => {
    let active = true;

    async function loadBidData() {
      try {
        const [apiBid, apiDocuments] = await Promise.all([
          getBid(id),
          getBidDocuments(id),
        ]);
        const [tender, requirements] = await Promise.all([
          getTender(apiBid.tender),
          getTenderRequirements(apiBid.tender),
        ]);

        if (!active) return;
        setBidData({
          id,
          bid: {
            id: apiBid.id,
            bidder: { name: apiBid.bidder_email },
            tender: {
              ref: apiBid.tender_reference,
              title: tender.title,
              organization: tender.department,
              category: tender.category,
            },
            requirements: requirements.map((requirement) => ({
              id: String(requirement.id),
              name: requirement.title,
              mandatory: requirement.priority === 'MANDATORY',
              category: requirement.category,
            })),
          },
          existingDocs: apiDocuments.map(mapApiDocument),
          error: '',
        });
      } catch (error) {
        if (active) {
          setBidData({
            id,
            bid: null,
            existingDocs: [],
            error: getApiErrorMessage(error),
          });
        }
      }
    }

    loadBidData();
    return () => {
      active = false;
    };
  }, [id]);

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
        file,
        requirementId: '',
        status: 'staged',
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
  }, [setStagedDocs]);

  /* ---------------- Staged row mutations ---------------- */
  const handleUpdateMapping = useCallback((docId, requirementId) => {
    setStagedDocs((prev) =>
      prev.map((doc) =>
        doc.id === docId
          ? { ...doc, requirementId, error: '' }
          : doc
      )
    );
  }, [setStagedDocs]);

  const handleRemoveStaged = useCallback((docId) => {
    setStagedDocs((prev) => prev.filter((doc) => doc.id !== docId));
  }, [setStagedDocs]);

  const handleRemoveExisting = useCallback(async (docId) => {
    try {
      await deleteBidDocument(docId);
      setBidData((previous) =>
        previous.id === id
          ? {
              ...previous,
              existingDocs: previous.existingDocs.filter(
                (doc) => doc.id !== docId
              ),
            }
          : previous
      );
    } catch (error) {
      setToast({ type: 'error', message: getApiErrorMessage(error) });
    }
  }, [id]);

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
  }, [setStagedDocs, stagedDocs]);

  /* ---------------- Upload and server-side processing ---------------- */
  const handleProcess = useCallback(async () => {
    if (isProcessing) return;
    if (!validateStaged()) return;

    setIsProcessing(true);
    const targets = stagedDocs.filter((doc) => !doc.serverId);
    if (targets.length === 0) {
      setIsProcessing(false);
      setToast({
        type: 'success',
        message: 'All staged documents have already been uploaded.',
      });
      return;
    }

    let uploadedCount = 0;

    for (const doc of targets) {
      setStagedDocs((prev) =>
        prev.map((item) =>
          item.id === doc.id
            ? { ...item, status: 'processing', error: '' }
            : item
        )
      );

      const requirement = bid.requirements.find(
        (item) => item.id === doc.requirementId
      );
      const documentType = [
        'TECHNICAL',
        'FINANCIAL',
        'ELIGIBILITY',
        'EXPERIENCE',
        'CERTIFICATION',
      ].includes(requirement?.category)
        ? requirement.category
        : 'OTHER';

      try {
        const savedDocument = await uploadBidDocument({
          bidId: bid.id,
          requirementId: doc.requirementId,
          documentType,
          file: doc.file,
        });
        uploadedCount += 1;
        const mappedDocument = mapApiDocument(savedDocument);
        setStagedDocs((prev) =>
          prev.map((item) =>
            item.id === doc.id
              ? {
                  ...item,
                  serverId: savedDocument.id,
                  status: mappedDocument.status,
                  extractionResult: mappedDocument.extractionResult,
                  error: mappedDocument.processingError,
                }
              : item
          )
        );
      } catch (error) {
        setStagedDocs((prev) =>
          prev.map((item) =>
            item.id === doc.id
              ? { ...item, status: 'failed', error: getApiErrorMessage(error) }
              : item
          )
        );
      }
    }

    setIsProcessing(false);
    setToast(
      uploadedCount
        ? {
            type: 'success',
            message: `${uploadedCount} document(s) uploaded. Check their processing status below.`,
          }
        : {
            type: 'error',
            message: 'No documents were uploaded. Review the errors and try again.',
          }
    );
  }, [bid, isProcessing, setStagedDocs, stagedDocs, validateStaged]);

  /* ---------------- Save & Continue ---------------- */
  const handleSaveAndContinue = useCallback(async () => {
    if (stagedDocs.length === 0) {
      navigate('/bids');
      return;
    }

    const notUploaded = stagedDocs.filter((doc) => !doc.serverId);
    if (notUploaded.length > 0) {
      setToast({
        type: 'error',
        message: `${notUploaded.length} document(s) must be uploaded before continuing.`,
      });
      return;
    }

    try {
      const documents = await getBidDocuments(id);
      setBidData((previous) =>
        previous.id === id
          ? {
              ...previous,
              existingDocs: documents.map(mapApiDocument),
            }
          : previous
      );
      setStagedDocs([]);
      setToast({
        type: 'success',
        message: 'Documents saved. Redirecting to bids…',
      });
      setTimeout(() => navigate('/bids'), 900);
    } catch (error) {
      setToast({ type: 'error', message: getApiErrorMessage(error) });
    }
  }, [stagedDocs, id, navigate, setStagedDocs]);

  const handleCancel = useCallback(() => {
    navigate('/bids');
  }, [navigate]);

  if (isLoading) {
    return (
      <p className="py-12 text-center text-sm text-slate-600">
        Loading bid…
      </p>
    );
  }

  if (!bid) {
    return loadError ? (
      <div
        role="alert"
        className="rounded-md border border-red-200 bg-red-50 p-4 text-sm text-red-700"
      >
        {loadError}
      </div>
    ) : (
      <BidNotFound routeId={id} />
    );
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
      <DropZone
        onFiles={handleFilesAdded}
        disabled={isProcessing || bid.requirements.length === 0}
        requirementsAvailable={bid.requirements.length > 0}
      />

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
          Extraction results are advisory. Review them before using them for
          compliance decisions.
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