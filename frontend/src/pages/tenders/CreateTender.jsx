import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import {
  FileText,
  Calendar,
  DollarSign,
  ShieldCheck,
  UploadCloud,
  Plus,
  Trash2,
  ArrowLeft,
  CheckCircle2,
  AlertCircle,
  X,
  File,
  Clock,
} from 'lucide-react';

/* ================================================================== */
/*  CONSTANTS                                                         */
/* ================================================================== */

const CATEGORY_OPTIONS = [
  { value: '', label: 'Select category…' },
  { value: 'it-hardware', label: 'IT Hardware' },
  { value: 'it-services', label: 'IT Services' },
  { value: 'medical', label: 'Medical Equipment' },
  { value: 'facility', label: 'Facility Management' },
  { value: 'civil', label: 'Civil Works' },
  { value: 'consulting', label: 'Consulting Services' },
];

const TENDER_TYPE_OPTIONS = [
  { value: '', label: 'Select tender type…' },
  { value: 'open', label: 'Open Tender' },
  { value: 'limited', label: 'Limited Tender' },
  { value: 'rfp', label: 'Request for Proposal (RFP)' },
  { value: 'rfq', label: 'Request for Quotation (RFQ)' },
];

const CURRENCY_OPTIONS = [
  { value: 'INR', label: 'INR — Indian Rupee (₹)' },
  { value: 'USD', label: 'USD — US Dollar ($)' },
  { value: 'EUR', label: 'EUR — Euro (€)' },
];

const DEFAULT_REQUIREMENTS = [
  {
    id: 'req-gst',
    name: 'GST Registration Certificate',
    type: 'gst',
    mandatory: true,
    notes: 'Valid GSTIN with active status',
  },
  {
    id: 'req-pan',
    name: 'PAN Card',
    type: 'pan',
    mandatory: true,
    notes: 'Company PAN or proprietor PAN',
  },
  {
    id: 'req-msme',
    name: 'MSME / Udyam Registration',
    type: 'msme',
    mandatory: false,
    notes: 'Optional — for MSME benefits',
  },
  {
    id: 'req-financial',
    name: 'Audited Financial Statements (3 Years)',
    type: 'financial',
    mandatory: true,
    notes: 'CA-certified balance sheet and P&L',
  },
  {
    id: 'req-experience',
    name: 'Past Experience Certificates',
    type: 'experience',
    mandatory: true,
    notes: 'Similar work completion proofs',
  },
];

const REQUIREMENT_TYPES = [
  { value: 'gst', label: 'GST' },
  { value: 'pan', label: 'PAN' },
  { value: 'msme', label: 'MSME' },
  { value: 'income-tax', label: 'Income Tax Return' },
  { value: 'financial', label: 'Financial Statements' },
  { value: 'experience', label: 'Experience Certificate' },
  { value: 'iso', label: 'ISO Certification' },
  { value: 'other', label: 'Other Document' },
];

const MAX_FILE_SIZE_BYTES = 25 * 1024 * 1024; // 25 MB per file

/* ================================================================== */
/*  INITIAL STATE                                                     */
/* ================================================================== */

const INITIAL_FORM = {
  /* Section 1: Basic Info */
  title: '',
  referenceNumber: '',
  organization: '',
  category: '',
  tenderType: '',
  description: '',

  /* Section 2: Timeline */
  publicationDate: '',
  bidSubmissionStart: '',
  bidSubmissionDeadline: '',
  technicalEvaluationDate: '',
  financialEvaluationDate: '',

  /* Section 3: Financial */
  estimatedValue: '',
  bidSecurityAmount: '',
  performanceSecurityPercent: '',
  currency: 'INR',

  /* Section 4: Requirements */
  requirements: DEFAULT_REQUIREMENTS,

  /* Section 5: Documents */
  documents: [],
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
  return parts.length > 1 ? parts.pop().toUpperCase() : 'FILE';
};

const isAfter = (a, b) => {
  if (!a || !b) return false;
  return new Date(a).getTime() > new Date(b).getTime();
};

const isSameOrAfter = (a, b) => {
  if (!a || !b) return false;
  return new Date(a).getTime() >= new Date(b).getTime();
};

/* ================================================================== */
/*  VALIDATION                                                        */
/* ================================================================== */

const validateForm = (form) => {
  const errors = {};

  /* Section 1 */
  if (!form.title.trim()) errors.title = 'Tender title is required.';
  else if (form.title.trim().length < 10)
    errors.title = 'Title must be at least 10 characters.';

  if (!form.referenceNumber.trim())
    errors.referenceNumber = 'Reference number is required.';
  else if (!/^[A-Za-z0-9/_-]+$/.test(form.referenceNumber.trim()))
    errors.referenceNumber =
      'Use only letters, numbers, slashes, hyphens, or underscores.';

  if (!form.organization.trim())
    errors.organization = 'Organization / department is required.';

  if (!form.category) errors.category = 'Please select a procurement category.';

  if (!form.tenderType) errors.tenderType = 'Please select a tender type.';

  if (!form.description.trim())
    errors.description = 'Description is required.';
  else if (form.description.trim().length < 20)
    errors.description = 'Description must be at least 20 characters.';

  /* Section 2 — Timeline */
  if (!form.publicationDate)
    errors.publicationDate = 'Publication date is required.';

  if (!form.bidSubmissionStart)
    errors.bidSubmissionStart = 'Bid submission start date is required.';
  else if (
    form.publicationDate &&
    !isSameOrAfter(form.bidSubmissionStart, form.publicationDate)
  )
    errors.bidSubmissionStart =
      'Start date cannot precede publication date.';

  if (!form.bidSubmissionDeadline)
    errors.bidSubmissionDeadline = 'Bid submission deadline is required.';
  else if (
    form.bidSubmissionStart &&
    !isAfter(form.bidSubmissionDeadline, form.bidSubmissionStart)
  )
    errors.bidSubmissionDeadline =
      'Deadline must be after the submission start date.';

  if (!form.technicalEvaluationDate)
    errors.technicalEvaluationDate = 'Technical evaluation date is required.';
  else if (
    form.bidSubmissionDeadline &&
    !isSameOrAfter(form.technicalEvaluationDate, form.bidSubmissionDeadline)
  )
    errors.technicalEvaluationDate =
      'Technical evaluation cannot precede bid deadline.';

  if (!form.financialEvaluationDate)
    errors.financialEvaluationDate = 'Financial evaluation date is required.';
  else if (
    form.technicalEvaluationDate &&
    !isSameOrAfter(form.financialEvaluationDate, form.technicalEvaluationDate)
  )
    errors.financialEvaluationDate =
      'Financial evaluation cannot precede technical evaluation.';

  /* Section 3 — Financial */
  if (form.estimatedValue === '')
    errors.estimatedValue = 'Estimated value is required.';
  else if (Number(form.estimatedValue) <= 0)
    errors.estimatedValue = 'Estimated value must be greater than zero.';

  if (form.bidSecurityAmount !== '' && Number(form.bidSecurityAmount) < 0)
    errors.bidSecurityAmount = 'Bid security cannot be negative.';

  if (form.performanceSecurityPercent !== '') {
    const ps = Number(form.performanceSecurityPercent);
    if (Number.isNaN(ps) || ps < 0 || ps > 100)
      errors.performanceSecurityPercent =
        'Performance security must be between 0 and 100.';
  }

  /* Section 4 — Requirements */
  if (form.requirements.length === 0)
    errors.requirements = 'Add at least one compliance requirement.';
  else {
    const names = form.requirements.map((r) => r.name.trim().toLowerCase());
    if (names.some((n) => !n))
      errors.requirements = 'Every requirement must have a name.';
    else if (new Set(names).size !== names.length)
      errors.requirements = 'Requirement names must be unique.';
  }

  /* Section 5 — Documents */
  if (form.documents.length === 0)
    errors.documents = 'Attach at least one tender document.';

  return errors;
};

/* ================================================================== */
/*  FIELD PRIMITIVES                                                  */
/* ================================================================== */

function Field({ label, htmlFor, error, hint, required, children }) {
  return (
    <div className="flex flex-col gap-1.5">
      <label
        htmlFor={htmlFor}
        className="text-[12.5px] font-medium text-slate-700"
      >
        {label}
        {required ? (
          <span className="ml-1 text-red-600" aria-hidden="true">
            *
          </span>
        ) : null}
      </label>
      {children}
      {error ? (
        <p
          id={`${htmlFor}-error`}
          role="alert"
          className="flex items-center gap-1.5 text-[11.5px] font-medium text-red-600"
        >
          <AlertCircle className="h-3.5 w-3.5 flex-shrink-0" aria-hidden="true" />
          {error}
        </p>
      ) : hint ? (
        <p id={`${htmlFor}-hint`} className="text-[11px] text-slate-500">
          {hint}
        </p>
      ) : null}
    </div>
  );
}

const inputClass = (hasError) =>
  cx(
    'h-9 w-full rounded-md border bg-white px-3 text-[13px] text-slate-900 placeholder:text-slate-400',
    'transition-colors focus:outline-none focus:ring-2 disabled:cursor-not-allowed disabled:bg-slate-50 disabled:text-slate-400',
    hasError
      ? 'border-red-200 focus:border-red-600 focus:ring-red-600/20'
      : 'border-slate-200 focus:border-emerald-600 focus:ring-emerald-600/20'
  );

const textareaClass = (hasError) =>
  cx(
    'w-full rounded-md border bg-white px-3 py-2 text-[13px] text-slate-900 placeholder:text-slate-400',
    'transition-colors focus:outline-none focus:ring-2 disabled:cursor-not-allowed disabled:bg-slate-50 disabled:text-slate-400',
    hasError
      ? 'border-red-200 focus:border-red-600 focus:ring-red-600/20'
      : 'border-slate-200 focus:border-emerald-600 focus:ring-emerald-600/20'
  );

/* ================================================================== */
/*  SECTION CARD                                                      */
/* ================================================================== */

function SectionCard({ icon: Icon, title, description, children }) {
  return (
    <section className="overflow-hidden rounded-lg border border-slate-200 bg-white shadow-sm">
      <header className="flex items-start gap-3 border-b border-slate-200 px-5 py-4">
        <span
          className="inline-flex h-8 w-8 flex-shrink-0 items-center justify-center rounded-md bg-emerald-50 text-emerald-600"
          aria-hidden="true"
        >
          <Icon className="h-4 w-4" />
        </span>
        <div className="min-w-0">
          <h2 className="text-[13.5px] font-semibold text-slate-900">
            {title}
          </h2>
          {description ? (
            <p className="mt-0.5 text-[12px] leading-relaxed text-slate-500">
              {description}
            </p>
          ) : null}
        </div>
      </header>
      <div className="p-5">{children}</div>
    </section>
  );
}

/* ================================================================== */
/*  PAGE                                                              */
/* ================================================================== */

export default function CreateTender() {
  const navigate = useNavigate();

  const [formData, setFormData] = useState(INITIAL_FORM);
  const [errors, setErrors] = useState({});
  const [touched, setTouched] = useState({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [banner, setBanner] = useState(null);
  const [fileDragActive, setFileDragActive] = useState(false);

  const fileInputRef = useRef(null);
  const formTopRef = useRef(null);

  /* ---------------- Field updates ---------------- */
  const setField = useCallback(
    (name, value) => {
      setFormData((prev) => ({ ...prev, [name]: value }));
      if (errors[name]) {
        setErrors((prev) => ({ ...prev, [name]: undefined }));
      }
      if (banner?.type === 'error') setBanner(null);
    },
    [errors, banner]
  );

  const handleInputChange = useCallback(
    (event) => {
      const { name, value } = event.target;
      setField(name, value);
    },
    [setField]
  );

  const handleBlur = useCallback(
    (event) => {
      const { name } = event.target;
      setTouched((prev) => ({ ...prev, [name]: true }));
      const nextErrors = validateForm(formData);
      if (nextErrors[name]) {
        setErrors((prev) => ({ ...prev, [name]: nextErrors[name] }));
      }
    },
    [formData]
  );

  /* ================================================================ */
  /*  REQUIREMENTS ROW MANAGER                                        */
  /* ================================================================ */

  const handleAddRequirement = useCallback(() => {
    setFormData((prev) => ({
      ...prev,
      requirements: [
        ...prev.requirements,
        {
          id: `req-custom-${Date.now()}`,
          name: '',
          type: 'other',
          mandatory: true,
          notes: '',
        },
      ],
    }));
  }, []);

  const handleRemoveRequirement = useCallback((id) => {
    setFormData((prev) => ({
      ...prev,
      requirements: prev.requirements.filter((r) => r.id !== id),
    }));
  }, []);

  const handleUpdateRequirement = useCallback((id, patch) => {
    setFormData((prev) => ({
      ...prev,
      requirements: prev.requirements.map((r) =>
        r.id === id ? { ...r, ...patch } : r
      ),
    }));
  }, []);

  /* ================================================================ */
  /*  DOCUMENT UPLOADER                                               */
  /* ================================================================ */

  const acceptFiles = useCallback((fileList) => {
    const incoming = Array.from(fileList || []);
    if (incoming.length === 0) return;

    const accepted = [];
    const rejected = [];

    for (const file of incoming) {
      if (file.size > MAX_FILE_SIZE_BYTES) {
        rejected.push({
          name: file.name,
          reason: `Exceeds ${formatFileSize(MAX_FILE_SIZE_BYTES)} limit`,
        });
        continue;
      }
      accepted.push({
        id: `doc-${Date.now()}-${file.name}`,
        name: file.name,
        size: file.size,
        type: getFileExtension(file.name),
        addedAt: new Date().toISOString(),
      });
    }

    if (accepted.length > 0) {
      setFormData((prev) => ({
        ...prev,
        documents: [...prev.documents, ...accepted],
      }));
      if (errors.documents) {
        setErrors((prev) => ({ ...prev, documents: undefined }));
      }
    }

    if (rejected.length > 0) {
      setBanner({
        type: 'error',
        message: `${rejected.length} file(s) skipped: ${rejected
          .map((r) => `${r.name} (${r.reason})`)
          .join(', ')}`,
      });
    }
  }, [errors.documents]);

  const handleFileInputChange = useCallback(
    (event) => {
      acceptFiles(event.target.files);
      event.target.value = '';
    },
    [acceptFiles]
  );

  const handleDrop = useCallback(
    (event) => {
      event.preventDefault();
      setFileDragActive(false);
      acceptFiles(event.dataTransfer.files);
    },
    [acceptFiles]
  );

  const handleDragOver = useCallback((event) => {
    event.preventDefault();
    setFileDragActive(true);
  }, []);

  const handleDragLeave = useCallback((event) => {
    event.preventDefault();
    setFileDragActive(false);
  }, []);

  const handleRemoveDocument = useCallback((id) => {
    setFormData((prev) => ({
      ...prev,
      documents: prev.documents.filter((d) => d.id !== id),
    }));
  }, []);

  /* ================================================================ */
  /*  SUBMIT HANDLERS                                                 */
  /* ================================================================ */

  const focusFirstError = useCallback((nextErrors) => {
    const order = [
      'title',
      'referenceNumber',
      'organization',
      'category',
      'tenderType',
      'description',
      'publicationDate',
      'bidSubmissionStart',
      'bidSubmissionDeadline',
      'technicalEvaluationDate',
      'financialEvaluationDate',
      'estimatedValue',
      'bidSecurityAmount',
      'performanceSecurityPercent',
      'requirements',
      'documents',
    ];
    for (const key of order) {
      if (nextErrors[key]) {
        const el = document.getElementById(key) || document.getElementById(`${key}-anchor`);
        if (el) {
          el.scrollIntoView({ behavior: 'smooth', block: 'center' });
          el.focus?.();
        }
        return;
      }
    }
    formTopRef.current?.scrollIntoView({ behavior: 'smooth', block: 'start' });
  }, []);

  const runSubmit = useCallback(
    async (mode) => {
      setBanner(null);
      const nextErrors = validateForm(formData);
      setErrors(nextErrors);
      setTouched((prev) => {
        const allTouched = { ...prev };
        Object.keys(nextErrors).forEach((key) => {
          allTouched[key] = true;
        });
        return allTouched;
      });

      if (Object.keys(nextErrors).length > 0) {
        setBanner({
          type: 'error',
          message: `Please correct ${Object.keys(nextErrors).length} field(s) before continuing.`,
        });
        focusFirstError(nextErrors);
        return;
      }

      setIsSubmitting(true);

      // Simulated network round-trip. Replace with Django endpoint in future step.
      await new Promise((resolve) => setTimeout(resolve, 900));

      setIsSubmitting(false);
      setBanner({
        type: 'success',
        message:
          mode === 'draft'
            ? 'Tender saved as draft. Redirecting to Tenders…'
            : 'Tender created successfully. Redirecting to Tenders…',
      });

      setTimeout(() => navigate('/tenders'), 800);
    },
    [formData, focusFirstError, navigate]
  );

  const handleSaveDraft = useCallback(
    (event) => {
      event.preventDefault();
      runSubmit('draft');
    },
    [runSubmit]
  );

  const handleCreateTender = useCallback(
    (event) => {
      event.preventDefault();
      runSubmit('create');
    },
    [runSubmit]
  );

  const handleCancel = useCallback(
    (event) => {
      event.preventDefault();
      navigate('/tenders');
    },
    [navigate]
  );

  /* ---------------- Derived ---------------- */
  const totalDocumentSize = useMemo(
    () => formData.documents.reduce((sum, d) => sum + (d.size || 0), 0),
    [formData.documents]
  );

  const completionPercent = useMemo(() => {
    const tracked = [
      formData.title,
      formData.referenceNumber,
      formData.organization,
      formData.category,
      formData.tenderType,
      formData.description,
      formData.publicationDate,
      formData.bidSubmissionStart,
      formData.bidSubmissionDeadline,
      formData.technicalEvaluationDate,
      formData.financialEvaluationDate,
      formData.estimatedValue,
    ];
    const filled = tracked.filter((v) => v !== '' && v !== null && v !== undefined).length;
    return Math.round((filled / tracked.length) * 100);
  }, [formData]);

  /* ---------------- Prevent accidental tab close ---------------- */
  useEffect(() => {
    const handler = (event) => {
      if (isSubmitting) return;
      const hasContent =
        formData.title ||
        formData.referenceNumber ||
        formData.organization ||
        formData.documents.length > 0;
      if (!hasContent) return;
      event.preventDefault();
      event.returnValue = '';
    };
    window.addEventListener('beforeunload', handler);
    return () => window.removeEventListener('beforeunload', handler);
  }, [formData, isSubmitting]);

  return (
    <div className="flex flex-col gap-5" ref={formTopRef}>
      {/* ============================================================ */}
      {/*  PAGE HEADER                                                */}
      {/* ============================================================ */}
      <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
        <div className="min-w-0">
          <Link
            to="/tenders"
            className="inline-flex items-center gap-1 text-[12px] font-medium text-slate-500 transition-colors hover:text-slate-800 focus:outline-none focus-visible:underline"
          >
            <ArrowLeft className="h-3.5 w-3.5" aria-hidden="true" />
            Back to Tenders
          </Link>
          <h1 className="mt-1.5 text-xl font-semibold tracking-tight text-slate-900 sm:text-2xl">
            Create New Tender
          </h1>
          <p className="mt-1 max-w-2xl text-[13px] leading-relaxed text-slate-600">
            Register a new GeM tender for AI-driven bid compliance
            verification. Fields marked with{' '}
            <span className="text-red-600">*</span> are mandatory.
          </p>
        </div>

        <div className="flex flex-shrink-0 items-center gap-3 self-start rounded-md border border-slate-200 bg-white px-3 py-2 shadow-sm">
          <div className="flex flex-col">
            <span className="text-[10.5px] font-semibold uppercase tracking-wider text-slate-500">
              Form Completion
            </span>
            <span className="text-[13px] font-semibold tabular-nums text-slate-800">
              {completionPercent}%
            </span>
          </div>
          <div className="h-8 w-px bg-slate-200" aria-hidden="true" />
          <div className="flex h-8 w-16 items-center">
            <div className="h-1.5 w-full overflow-hidden rounded-full bg-slate-100">
              <div
                className="h-full rounded-full bg-emerald-600 transition-[width] duration-300"
                style={{ width: `${completionPercent}%` }}
              />
            </div>
          </div>
        </div>
      </div>

      {/* ============================================================ */}
      {/*  BANNER                                                     */}
      {/* ============================================================ */}
      {banner ? (
        <div
          role="status"
          aria-live="polite"
          className={cx(
            'flex items-start gap-2.5 rounded-md border px-3 py-2.5 text-[12.5px] leading-relaxed',
            banner.type === 'success'
              ? 'border-emerald-200 bg-emerald-50 text-emerald-700'
              : 'border-red-200 bg-red-50 text-red-600'
          )}
        >
          {banner.type === 'success' ? (
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
          <span>{banner.message}</span>
        </div>
      ) : null}

      {/* ============================================================ */}
      {/*  FORM                                                       */}
      {/* ============================================================ */}
      <form onSubmit={handleCreateTender} noValidate className="flex flex-col gap-5">
        {/* ---------- 1. Basic Info ---------- */}
        <SectionCard
          icon={FileText}
          title="Basic Tender Information"
          description="Core identity and classification of the tender."
        >
          <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
            <div className="md:col-span-2">
              <Field
                label="Tender Title"
                htmlFor="title"
                required
                error={touched.title ? errors.title : ''}
              >
                <input
                  id="title"
                  name="title"
                  type="text"
                  value={formData.title}
                  onChange={handleInputChange}
                  onBlur={handleBlur}
                  placeholder="e.g. Supply of Desktop Computers & Peripherals"
                  aria-invalid={Boolean(touched.title && errors.title)}
                  aria-describedby={
                    touched.title && errors.title ? 'title-error' : undefined
                  }
                  aria-required="true"
                  disabled={isSubmitting}
                  className={inputClass(Boolean(touched.title && errors.title))}
                />
              </Field>
            </div>

            <Field
              label="Reference Number"
              htmlFor="referenceNumber"
              required
              error={touched.referenceNumber ? errors.referenceNumber : ''}
              hint="e.g. GEM/2024/B/5521091"
            >
              <input
                id="referenceNumber"
                name="referenceNumber"
                type="text"
                value={formData.referenceNumber}
                onChange={handleInputChange}
                onBlur={handleBlur}
                placeholder="GEM/2024/B/5521091"
                aria-invalid={Boolean(touched.referenceNumber && errors.referenceNumber)}
                aria-describedby={
                  touched.referenceNumber && errors.referenceNumber
                    ? 'referenceNumber-error'
                    : 'referenceNumber-hint'
                }
                aria-required="true"
                disabled={isSubmitting}
                className={inputClass(
                  Boolean(touched.referenceNumber && errors.referenceNumber)
                )}
              />
            </Field>

            <Field
              label="Organization / Department"
              htmlFor="organization"
              required
              error={touched.organization ? errors.organization : ''}
            >
              <input
                id="organization"
                name="organization"
                type="text"
                value={formData.organization}
                onChange={handleInputChange}
                onBlur={handleBlur}
                placeholder="e.g. Ministry of Education"
                aria-invalid={Boolean(touched.organization && errors.organization)}
                aria-describedby={
                  touched.organization && errors.organization
                    ? 'organization-error'
                    : undefined
                }
                aria-required="true"
                disabled={isSubmitting}
                className={inputClass(
                  Boolean(touched.organization && errors.organization)
                )}
              />
            </Field>

            <Field
              label="Procurement Category"
              htmlFor="category"
              required
              error={touched.category ? errors.category : ''}
            >
              <select
                id="category"
                name="category"
                value={formData.category}
                onChange={handleInputChange}
                onBlur={handleBlur}
                aria-invalid={Boolean(touched.category && errors.category)}
                aria-describedby={
                  touched.category && errors.category ? 'category-error' : undefined
                }
                aria-required="true"
                disabled={isSubmitting}
                className={cx(
                  inputClass(Boolean(touched.category && errors.category)),
                  'cursor-pointer appearance-none',
                  formData.category ? 'text-slate-900' : 'text-slate-400'
                )}
              >
                {CATEGORY_OPTIONS.map((opt) => (
                  <option
                    key={opt.value}
                    value={opt.value}
                    disabled={opt.value === ''}
                  >
                    {opt.label}
                  </option>
                ))}
              </select>
            </Field>

            <Field
              label="Tender Type"
              htmlFor="tenderType"
              required
              error={touched.tenderType ? errors.tenderType : ''}
            >
              <select
                id="tenderType"
                name="tenderType"
                value={formData.tenderType}
                onChange={handleInputChange}
                onBlur={handleBlur}
                aria-invalid={Boolean(touched.tenderType && errors.tenderType)}
                aria-describedby={
                  touched.tenderType && errors.tenderType
                    ? 'tenderType-error'
                    : undefined
                }
                aria-required="true"
                disabled={isSubmitting}
                className={cx(
                  inputClass(Boolean(touched.tenderType && errors.tenderType)),
                  'cursor-pointer appearance-none',
                  formData.tenderType ? 'text-slate-900' : 'text-slate-400'
                )}
              >
                {TENDER_TYPE_OPTIONS.map((opt) => (
                  <option
                    key={opt.value}
                    value={opt.value}
                    disabled={opt.value === ''}
                  >
                    {opt.label}
                  </option>
                ))}
              </select>
            </Field>

            <div className="md:col-span-2">
              <Field
                label="Description"
                htmlFor="description"
                required
                error={touched.description ? errors.description : ''}
                hint="Minimum 20 characters describing scope, deliverables, and key expectations."
              >
                <textarea
                  id="description"
                  name="description"
                  rows={4}
                  value={formData.description}
                  onChange={handleInputChange}
                  onBlur={handleBlur}
                  placeholder="Provide a clear summary of the tender scope…"
                  aria-invalid={Boolean(touched.description && errors.description)}
                  aria-describedby={
                    touched.description && errors.description
                      ? 'description-error'
                      : 'description-hint'
                  }
                  aria-required="true"
                  disabled={isSubmitting}
                  className={textareaClass(
                    Boolean(touched.description && errors.description)
                  )}
                />
              </Field>
            </div>
          </div>
        </SectionCard>

        {/* ---------- 2. Timeline ---------- */}
        <SectionCard
          icon={Calendar}
          title="Tender Timeline"
          description="Chronological milestones — dates must follow a valid sequence."
        >
          <div className="grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-3">
            <Field
              label="Publication Date"
              htmlFor="publicationDate"
              required
              error={touched.publicationDate ? errors.publicationDate : ''}
            >
              <input
                id="publicationDate"
                name="publicationDate"
                type="date"
                value={formData.publicationDate}
                onChange={handleInputChange}
                onBlur={handleBlur}
                aria-invalid={Boolean(touched.publicationDate && errors.publicationDate)}
                aria-describedby={
                  touched.publicationDate && errors.publicationDate
                    ? 'publicationDate-error'
                    : undefined
                }
                aria-required="true"
                disabled={isSubmitting}
                className={inputClass(
                  Boolean(touched.publicationDate && errors.publicationDate)
                )}
              />
            </Field>

            <Field
              label="Bid Submission Start"
              htmlFor="bidSubmissionStart"
              required
              error={
                touched.bidSubmissionStart ? errors.bidSubmissionStart : ''
              }
            >
              <input
                id="bidSubmissionStart"
                name="bidSubmissionStart"
                type="date"
                value={formData.bidSubmissionStart}
                onChange={handleInputChange}
                onBlur={handleBlur}
                aria-invalid={Boolean(
                  touched.bidSubmissionStart && errors.bidSubmissionStart
                )}
                aria-describedby={
                  touched.bidSubmissionStart && errors.bidSubmissionStart
                    ? 'bidSubmissionStart-error'
                    : undefined
                }
                aria-required="true"
                disabled={isSubmitting}
                className={inputClass(
                  Boolean(touched.bidSubmissionStart && errors.bidSubmissionStart)
                )}
              />
            </Field>

            <Field
              label="Bid Submission Deadline"
              htmlFor="bidSubmissionDeadline"
              required
              error={
                touched.bidSubmissionDeadline
                  ? errors.bidSubmissionDeadline
                  : ''
              }
            >
              <input
                id="bidSubmissionDeadline"
                name="bidSubmissionDeadline"
                type="date"
                value={formData.bidSubmissionDeadline}
                onChange={handleInputChange}
                onBlur={handleBlur}
                aria-invalid={Boolean(
                  touched.bidSubmissionDeadline && errors.bidSubmissionDeadline
                )}
                aria-describedby={
                  touched.bidSubmissionDeadline && errors.bidSubmissionDeadline
                    ? 'bidSubmissionDeadline-error'
                    : undefined
                }
                aria-required="true"
                disabled={isSubmitting}
                className={inputClass(
                  Boolean(
                    touched.bidSubmissionDeadline && errors.bidSubmissionDeadline
                  )
                )}
              />
            </Field>

            <Field
              label="Technical Evaluation Date"
              htmlFor="technicalEvaluationDate"
              required
              error={
                touched.technicalEvaluationDate
                  ? errors.technicalEvaluationDate
                  : ''
              }
            >
              <input
                id="technicalEvaluationDate"
                name="technicalEvaluationDate"
                type="date"
                value={formData.technicalEvaluationDate}
                onChange={handleInputChange}
                onBlur={handleBlur}
                aria-invalid={Boolean(
                  touched.technicalEvaluationDate &&
                    errors.technicalEvaluationDate
                )}
                aria-describedby={
                  touched.technicalEvaluationDate &&
                  errors.technicalEvaluationDate
                    ? 'technicalEvaluationDate-error'
                    : undefined
                }
                aria-required="true"
                disabled={isSubmitting}
                className={inputClass(
                  Boolean(
                    touched.technicalEvaluationDate &&
                      errors.technicalEvaluationDate
                  )
                )}
              />
            </Field>

            <Field
              label="Financial Evaluation Date"
              htmlFor="financialEvaluationDate"
              required
              error={
                touched.financialEvaluationDate
                  ? errors.financialEvaluationDate
                  : ''
              }
            >
              <input
                id="financialEvaluationDate"
                name="financialEvaluationDate"
                type="date"
                value={formData.financialEvaluationDate}
                onChange={handleInputChange}
                onBlur={handleBlur}
                aria-invalid={Boolean(
                  touched.financialEvaluationDate &&
                    errors.financialEvaluationDate
                )}
                aria-describedby={
                  touched.financialEvaluationDate &&
                  errors.financialEvaluationDate
                    ? 'financialEvaluationDate-error'
                    : undefined
                }
                aria-required="true"
                disabled={isSubmitting}
                className={inputClass(
                  Boolean(
                    touched.financialEvaluationDate &&
                      errors.financialEvaluationDate
                  )
                )}
              />
            </Field>
          </div>
        </SectionCard>

        {/* ---------- 3. Financial ---------- */}
        <SectionCard
          icon={DollarSign}
          title="Financial Information"
          description="Estimated value, security deposits, and currency."
        >
          <div className="grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-4">
            <Field
              label="Currency"
              htmlFor="currency"
              required
            >
              <select
                id="currency"
                name="currency"
                value={formData.currency}
                onChange={handleInputChange}
                disabled={isSubmitting}
                className={cx(inputClass(false), 'cursor-pointer appearance-none')}
              >
                {CURRENCY_OPTIONS.map((opt) => (
                  <option key={opt.value} value={opt.value}>
                    {opt.label}
                  </option>
                ))}
              </select>
            </Field>

            <Field
              label="Estimated Value"
              htmlFor="estimatedValue"
              required
              error={touched.estimatedValue ? errors.estimatedValue : ''}
            >
              <input
                id="estimatedValue"
                name="estimatedValue"
                type="number"
                min="0"
                step="0.01"
                inputMode="decimal"
                value={formData.estimatedValue}
                onChange={handleInputChange}
                onBlur={handleBlur}
                placeholder="0.00"
                aria-invalid={Boolean(touched.estimatedValue && errors.estimatedValue)}
                aria-describedby={
                  touched.estimatedValue && errors.estimatedValue
                    ? 'estimatedValue-error'
                    : undefined
                }
                aria-required="true"
                disabled={isSubmitting}
                className={inputClass(
                  Boolean(touched.estimatedValue && errors.estimatedValue)
                )}
              />
            </Field>

            <Field
              label="Bid Security (EMD)"
              htmlFor="bidSecurityAmount"
              error={touched.bidSecurityAmount ? errors.bidSecurityAmount : ''}
              hint="Optional. Enter 0 if not applicable."
            >
              <input
                id="bidSecurityAmount"
                name="bidSecurityAmount"
                type="number"
                min="0"
                step="0.01"
                inputMode="decimal"
                value={formData.bidSecurityAmount}
                onChange={handleInputChange}
                onBlur={handleBlur}
                placeholder="0.00"
                aria-invalid={Boolean(
                  touched.bidSecurityAmount && errors.bidSecurityAmount
                )}
                aria-describedby={
                  touched.bidSecurityAmount && errors.bidSecurityAmount
                    ? 'bidSecurityAmount-error'
                    : 'bidSecurityAmount-hint'
                }
                disabled={isSubmitting}
                className={inputClass(
                  Boolean(touched.bidSecurityAmount && errors.bidSecurityAmount)
                )}
              />
            </Field>

            <Field
              label="Performance Security (%)"
              htmlFor="performanceSecurityPercent"
              error={
                touched.performanceSecurityPercent
                  ? errors.performanceSecurityPercent
                  : ''
              }
              hint="Typically 5–10% of contract value."
            >
              <input
                id="performanceSecurityPercent"
                name="performanceSecurityPercent"
                type="number"
                min="0"
                max="100"
                step="0.1"
                inputMode="decimal"
                value={formData.performanceSecurityPercent}
                onChange={handleInputChange}
                onBlur={handleBlur}
                placeholder="e.g. 5"
                aria-invalid={Boolean(
                  touched.performanceSecurityPercent &&
                    errors.performanceSecurityPercent
                )}
                aria-describedby={
                  touched.performanceSecurityPercent &&
                  errors.performanceSecurityPercent
                    ? 'performanceSecurityPercent-error'
                    : 'performanceSecurityPercent-hint'
                }
                disabled={isSubmitting}
                className={inputClass(
                  Boolean(
                    touched.performanceSecurityPercent &&
                      errors.performanceSecurityPercent
                  )
                )}
              />
            </Field>
          </div>
        </SectionCard>

        {/* ---------- 4. Requirements ---------- */}
        <SectionCard
          icon={ShieldCheck}
          title="Eligibility & Compliance Requirements"
          description="Configure the mandatory document checklist bidders must submit."
        >
          <div
            id="requirements-anchor"
            tabIndex={-1}
            className="flex flex-col gap-3"
          >
            {/* Header row (desktop only) */}
            <div className="hidden gap-3 px-1 md:grid md:grid-cols-12">
              <span className="md:col-span-4 text-[11px] font-semibold uppercase tracking-wider text-slate-500">
                Requirement Name
              </span>
              <span className="md:col-span-3 text-[11px] font-semibold uppercase tracking-wider text-slate-500">
                Type
              </span>
              <span className="md:col-span-2 text-[11px] font-semibold uppercase tracking-wider text-slate-500">
                Mandatory
              </span>
              <span className="md:col-span-2 text-[11px] font-semibold uppercase tracking-wider text-slate-500">
                Notes
              </span>
              <span className="md:col-span-1" aria-hidden="true" />
            </div>

            <ul className="flex flex-col gap-2">
              {formData.requirements.map((req) => (
                <li
                  key={req.id}
                  className="grid grid-cols-1 gap-3 rounded-md border border-slate-200 bg-white p-3 md:grid-cols-12 md:items-center md:p-2"
                >
                  <div className="md:col-span-4">
                    <label
                      htmlFor={`${req.id}-name`}
                      className="mb-1 block text-[10.5px] font-semibold uppercase tracking-wider text-slate-500 md:hidden"
                    >
                      Requirement Name
                    </label>
                    <input
                      id={`${req.id}-name`}
                      type="text"
                      value={req.name}
                      onChange={(event) =>
                        handleUpdateRequirement(req.id, {
                          name: event.target.value,
                        })
                      }
                      placeholder="Requirement name"
                      disabled={isSubmitting}
                      className="h-8 w-full rounded-md border border-slate-200 bg-white px-2.5 text-[12.5px] text-slate-900 placeholder:text-slate-400 transition-colors focus:border-emerald-600 focus:outline-none focus:ring-2 focus:ring-emerald-600/20 disabled:cursor-not-allowed disabled:bg-slate-50"
                    />
                  </div>

                  <div className="md:col-span-3">
                    <label
                      htmlFor={`${req.id}-type`}
                      className="mb-1 block text-[10.5px] font-semibold uppercase tracking-wider text-slate-500 md:hidden"
                    >
                      Type
                    </label>
                    <select
                      id={`${req.id}-type`}
                      value={req.type}
                      onChange={(event) =>
                        handleUpdateRequirement(req.id, {
                          type: event.target.value,
                        })
                      }
                      disabled={isSubmitting}
                      className="h-8 w-full cursor-pointer appearance-none rounded-md border border-slate-200 bg-white px-2.5 text-[12.5px] text-slate-900 transition-colors focus:border-emerald-600 focus:outline-none focus:ring-2 focus:ring-emerald-600/20 disabled:cursor-not-allowed disabled:bg-slate-50"
                    >
                      {REQUIREMENT_TYPES.map((opt) => (
                        <option key={opt.value} value={opt.value}>
                          {opt.label}
                        </option>
                      ))}
                    </select>
                  </div>

                  <div className="md:col-span-2">
                    <label
                      htmlFor={`${req.id}-mandatory`}
                      className="mb-1 block text-[10.5px] font-semibold uppercase tracking-wider text-slate-500 md:hidden"
                    >
                      Mandatory
                    </label>
                    <label
                      className="flex cursor-pointer select-none items-center gap-2 text-[12px] text-slate-700"
                      htmlFor={`${req.id}-mandatory`}
                    >
                      <input
                        id={`${req.id}-mandatory`}
                        type="checkbox"
                        checked={req.mandatory}
                        onChange={(event) =>
                          handleUpdateRequirement(req.id, {
                            mandatory: event.target.checked,
                          })
                        }
                        disabled={isSubmitting}
                        className="h-3.5 w-3.5 cursor-pointer rounded border-slate-300 text-emerald-600 focus:ring-2 focus:ring-emerald-600/30 focus:ring-offset-0 disabled:cursor-not-allowed"
                      />
                      <span>{req.mandatory ? 'Required' : 'Optional'}</span>
                    </label>
                  </div>

                  <div className="md:col-span-2">
                    <label
                      htmlFor={`${req.id}-notes`}
                      className="mb-1 block text-[10.5px] font-semibold uppercase tracking-wider text-slate-500 md:hidden"
                    >
                      Notes
                    </label>
                    <input
                      id={`${req.id}-notes`}
                      type="text"
                      value={req.notes}
                      onChange={(event) =>
                        handleUpdateRequirement(req.id, {
                          notes: event.target.value,
                        })
                      }
                      placeholder="Notes"
                      disabled={isSubmitting}
                      className="h-8 w-full rounded-md border border-slate-200 bg-white px-2.5 text-[12.5px] text-slate-900 placeholder:text-slate-400 transition-colors focus:border-emerald-600 focus:outline-none focus:ring-2 focus:ring-emerald-600/20 disabled:cursor-not-allowed disabled:bg-slate-50"
                    />
                  </div>

                  <div className="flex justify-end md:col-span-1">
                    <button
                      type="button"
                      onClick={() => handleRemoveRequirement(req.id)}
                      disabled={isSubmitting}
                      aria-label={`Remove requirement ${req.name || req.id}`}
                      className="inline-flex h-8 w-8 items-center justify-center rounded-md text-slate-500 transition-colors hover:bg-red-50 hover:text-red-600 focus:outline-none focus-visible:ring-2 focus-visible:ring-red-500 focus-visible:ring-offset-1 disabled:cursor-not-allowed disabled:opacity-50"
                    >
                      <Trash2 className="h-4 w-4" aria-hidden="true" />
                    </button>
                  </div>
                </li>
              ))}
            </ul>

            <div className="flex items-center justify-between gap-3 border-t border-slate-100 pt-3">
              <button
                type="button"
                onClick={handleAddRequirement}
                disabled={isSubmitting}
                className="inline-flex h-8 items-center gap-1.5 rounded-md border border-slate-200 bg-white px-3 text-[12px] font-semibold text-slate-700 transition-colors hover:bg-slate-50 focus:outline-none focus-visible:ring-2 focus-visible:ring-emerald-600 focus-visible:ring-offset-1 disabled:cursor-not-allowed disabled:opacity-50"
              >
                <Plus className="h-3.5 w-3.5" aria-hidden="true" />
                Add Requirement
              </button>
              <span className="text-[11.5px] text-slate-500">
                {formData.requirements.length}{' '}
                {formData.requirements.length === 1
                  ? 'requirement'
                  : 'requirements'}{' '}
                configured
              </span>
            </div>

            {touched.requirements && errors.requirements ? (
              <p
                role="alert"
                className="flex items-center gap-1.5 text-[11.5px] font-medium text-red-600"
              >
                <AlertCircle className="h-3.5 w-3.5 flex-shrink-0" aria-hidden="true" />
                {errors.requirements}
              </p>
            ) : null}
          </div>
        </SectionCard>

        {/* ---------- 5. Documents ---------- */}
        <SectionCard
          icon={UploadCloud}
          title="Tender Documents"
          description="Attach the tender PDF, specification sheets, and supporting files."
        >
          <div id="documents-anchor" tabIndex={-1} className="flex flex-col gap-3">
            {/* Drop zone */}
            <div
              onDrop={handleDrop}
              onDragOver={handleDragOver}
              onDragLeave={handleDragLeave}
              onClick={() => fileInputRef.current?.click()}
              onKeyDown={(event) => {
                if (event.key === 'Enter' || event.key === ' ') {
                  event.preventDefault();
                  fileInputRef.current?.click();
                }
              }}
              role="button"
              tabIndex={0}
              aria-label="Upload tender documents by clicking or dragging files here"
              className={cx(
                'flex cursor-pointer flex-col items-center justify-center gap-2 rounded-md border-2 border-dashed px-4 py-8 text-center transition-colors focus:outline-none focus-visible:ring-2 focus-visible:ring-emerald-600 focus-visible:ring-offset-1',
                fileDragActive
                  ? 'border-emerald-500 bg-emerald-50'
                  : errors.documents && touched.documents
                  ? 'border-red-200 bg-red-50/40'
                  : 'border-slate-300 bg-slate-50 hover:border-emerald-500 hover:bg-emerald-50/40'
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
                  PDF, DOCX, XLSX up to {formatFileSize(MAX_FILE_SIZE_BYTES)} per file
                </p>
              </div>
              <input
                ref={fileInputRef}
                type="file"
                multiple
                accept=".pdf,.doc,.docx,.xls,.xlsx,.csv,.txt,.png,.jpg,.jpeg"
                onChange={handleFileInputChange}
                className="sr-only"
                disabled={isSubmitting}
                tabIndex={-1}
              />
            </div>

            {touched.documents && errors.documents ? (
              <p
                role="alert"
                className="flex items-center gap-1.5 text-[11.5px] font-medium text-red-600"
              >
                <AlertCircle className="h-3.5 w-3.5 flex-shrink-0" aria-hidden="true" />
                {errors.documents}
              </p>
            ) : null}

            {/* File list */}
            {formData.documents.length > 0 ? (
              <div className="flex flex-col gap-2">
                <div className="flex items-center justify-between border-t border-slate-100 pt-3">
                  <span className="text-[12px] font-semibold text-slate-700">
                    Attached Files ({formData.documents.length})
                  </span>
                  <span className="text-[11.5px] text-slate-500">
                    Total: {formatFileSize(totalDocumentSize)}
                  </span>
                </div>

                <ul className="flex flex-col gap-2">
                  {formData.documents.map((doc) => (
                    <li
                      key={doc.id}
                      className="flex items-center gap-3 rounded-md border border-slate-200 bg-white px-3 py-2"
                    >
                      <span
                        className="inline-flex h-8 w-8 flex-shrink-0 items-center justify-center rounded-md bg-slate-100 text-slate-600"
                        aria-hidden="true"
                      >
                        <File className="h-4 w-4" />
                      </span>

                      <div className="min-w-0 flex-1">
                        <p className="truncate text-[12.5px] font-medium text-slate-800">
                          {doc.name}
                        </p>
                        <p className="mt-0.5 flex items-center gap-2 text-[11px] text-slate-500">
                          <span className="font-mono uppercase">{doc.type}</span>
                          <span aria-hidden="true">·</span>
                          <span>{formatFileSize(doc.size)}</span>
                          <span aria-hidden="true">·</span>
                          <span className="inline-flex items-center gap-1">
                            <Clock className="h-3 w-3" aria-hidden="true" />
                            Just added
                          </span>
                        </p>
                      </div>

                      <button
                        type="button"
                        onClick={() => handleRemoveDocument(doc.id)}
                        disabled={isSubmitting}
                        aria-label={`Remove file ${doc.name}`}
                        className="inline-flex h-7 w-7 flex-shrink-0 items-center justify-center rounded-md text-slate-500 transition-colors hover:bg-red-50 hover:text-red-600 focus:outline-none focus-visible:ring-2 focus-visible:ring-red-500 focus-visible:ring-offset-1 disabled:cursor-not-allowed disabled:opacity-50"
                      >
                        <X className="h-4 w-4" aria-hidden="true" />
                      </button>
                    </li>
                  ))}
                </ul>
              </div>
            ) : null}
          </div>
        </SectionCard>

        {/* ---------- 6. Action bar ---------- */}
        <div className="sticky bottom-0 -mx-4 flex flex-col gap-2 border-t border-slate-200 bg-slate-50/95 px-4 py-3 backdrop-blur sm:mx-0 sm:flex-row sm:items-center sm:justify-between sm:rounded-lg sm:border sm:px-5">
          <div className="flex items-center gap-2 text-[11.5px] text-slate-500">
            <ShieldCheck className="h-3.5 w-3.5 text-emerald-600" aria-hidden="true" />
            All changes are retained locally until submission.
          </div>

          <div className="flex flex-col-reverse items-stretch gap-2 sm:flex-row sm:items-center">
            <button
              type="button"
              onClick={handleCancel}
              disabled={isSubmitting}
              className="inline-flex h-9 items-center justify-center rounded-md border border-slate-200 bg-white px-3.5 text-[12.5px] font-semibold text-slate-700 transition-colors hover:bg-slate-50 focus:outline-none focus-visible:ring-2 focus-visible:ring-emerald-600 focus-visible:ring-offset-1 disabled:cursor-not-allowed disabled:opacity-50"
            >
              Cancel
            </button>

            <button
              type="button"
              onClick={handleSaveDraft}
              disabled={isSubmitting}
              className="inline-flex h-9 items-center justify-center rounded-md border border-slate-200 bg-white px-3.5 text-[12.5px] font-semibold text-slate-700 transition-colors hover:bg-slate-50 focus:outline-none focus-visible:ring-2 focus-visible:ring-emerald-600 focus-visible:ring-offset-1 disabled:cursor-not-allowed disabled:opacity-50"
            >
              Save as Draft
            </button>

            <button
              type="submit"
              disabled={isSubmitting}
              aria-busy={isSubmitting}
              className={cx(
                'inline-flex h-9 items-center justify-center gap-2 rounded-md px-3.5 text-[12.5px] font-semibold text-white transition-colors focus:outline-none focus-visible:ring-2 focus-visible:ring-emerald-600 focus-visible:ring-offset-2',
                isSubmitting
                  ? 'cursor-wait bg-emerald-600/70'
                  : 'bg-emerald-600 hover:bg-emerald-700'
              )}
            >
              {isSubmitting ? (
                <>
                  <span
                    className="h-4 w-4 animate-spin rounded-full border-2 border-white/40 border-t-white"
                    aria-hidden="true"
                  />
                  Submitting…
                </>
              ) : (
                <>
                  <CheckCircle2 className="h-4 w-4" aria-hidden="true" />
                  Create Tender
                </>
              )}
            </button>
          </div>
        </div>
      </form>
    </div>
  );
}