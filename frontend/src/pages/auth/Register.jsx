import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import {
  User,
  Mail,
  Lock,
  Eye,
  EyeOff,
  UserCheck,
  ShieldCheck,
  CheckCircle2,
  AlertCircle,
  ArrowRight,
  Building2,
} from 'lucide-react';

/* ------------------------------------------------------------------ */
/*  Constants                                                         */
/* ------------------------------------------------------------------ */
const EMAIL_REGEX = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

const ROLE_OPTIONS = [
  { value: '', label: 'Select a role…' },
  { value: 'procurement_admin', label: 'Procurement Administrator' },
  { value: 'compliance_analyst', label: 'Compliance Analyst' },
  { value: 'reviewer', label: 'Reviewer' },
];

const BRAND_HIGHLIGHTS = [
  {
    Icon: Building2,
    title: 'Built for Government Procurement',
    detail:
      'Aligned with GeM workflows, ministry hierarchies, and NIC compliance standards.',
  },
  {
    Icon: ShieldCheck,
    title: 'Role-Scoped Access Control',
    detail:
      'Administrators, analysts, and reviewers each see exactly what they need.',
  },
  {
    Icon: UserCheck,
    title: 'Verified Institution Onboarding',
    detail:
      'Account provisioning is validated against your registered organisation email.',
  },
];

/* ------------------------------------------------------------------ */
/*  Validation                                                        */
/* ------------------------------------------------------------------ */
const validateField = (name, value, form) => {
  switch (name) {
    case 'fullName': {
      const trimmed = value.trim();
      if (!trimmed) return 'Full name is required.';
      if (trimmed.length < 3) return 'Name must be at least 3 characters.';
      if (trimmed.length > 80) return 'Name must be 80 characters or fewer.';
      return '';
    }
    case 'email': {
      const trimmed = value.trim();
      if (!trimmed) return 'Work email is required.';
      if (!EMAIL_REGEX.test(trimmed)) return 'Enter a valid email address.';
      return '';
    }
    case 'password': {
      if (!value) return 'Password is required.';
      if (value.length < 8) return 'Password must be at least 8 characters.';
      if (!/[A-Za-z]/.test(value) || !/[0-9]/.test(value)) {
        return 'Password must contain both letters and numbers.';
      }
      return '';
    }
    case 'confirmPassword': {
      if (!value) return 'Please confirm your password.';
      if (value !== form.password) return 'Passwords do not match.';
      return '';
    }
    case 'role': {
      if (!value) return 'Please select a role.';
      return '';
    }
    case 'terms': {
      if (!value) return 'You must accept the terms and conditions.';
      return '';
    }
    default:
      return '';
  }
};

/* ------------------------------------------------------------------ */
/*  Register                                                          */
/* ------------------------------------------------------------------ */
export default function Register() {
  const navigate = useNavigate();

  const [form, setForm] = useState({
    fullName: '',
    email: '',
    password: '',
    confirmPassword: '',
    role: '',
    terms: false,
  });

  const [errors, setErrors] = useState({
    fullName: '',
    email: '',
    password: '',
    confirmPassword: '',
    role: '',
    terms: '',
  });

  const [touched, setTouched] = useState({
    fullName: false,
    email: false,
    password: false,
    confirmPassword: false,
    role: false,
    terms: false,
  });

  const [showPassword, setShowPassword] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [banner, setBanner] = useState(null); // { type: 'success' | 'error', message }

  const fullNameRef = useRef(null);
  const emailRef = useRef(null);
  const passwordRef = useRef(null);
  const confirmRef = useRef(null);
  const roleRef = useRef(null);
  const termsRef = useRef(null);

  /* ---------------- Autofocus first field ---------------- */
  useEffect(() => {
    fullNameRef.current?.focus();
  }, []);

  /* ---------------- Field change ---------------- */
  const handleChange = useCallback(
    (event) => {
      const { name, value, type, checked } = event.target;
      const nextValue = type === 'checkbox' ? checked : value;

      setForm((prev) => {
        const nextForm = { ...prev, [name]: nextValue };

        // Re-validate current + cross-field dependents when touched
        if (touched[name]) {
          setErrors((prevErrors) => {
            const updated = {
              ...prevErrors,
              [name]: validateField(name, nextValue, nextForm),
            };

            // Re-check confirmPassword if password changed
            if (name === 'password' && touched.confirmPassword) {
              updated.confirmPassword = validateField(
                'confirmPassword',
                nextForm.confirmPassword,
                nextForm
              );
            }
            return updated;
          });
        }

        return nextForm;
      });

      if (banner?.type === 'error') setBanner(null);
    },
    [touched, banner]
  );

  /* ---------------- Field blur ---------------- */
  const handleBlur = useCallback(
    (event) => {
      const { name, value, type, checked } = event.target;
      const fieldValue = type === 'checkbox' ? checked : value;

      setTouched((prev) => ({ ...prev, [name]: true }));
      setErrors((prev) => ({
        ...prev,
        [name]: validateField(name, fieldValue, form),
      }));
    },
    [form]
  );

  /* ---------------- Derived validity ---------------- */
  const isFormValid = useMemo(() => {
    return (
      validateField('fullName', form.fullName, form) === '' &&
      validateField('email', form.email, form) === '' &&
      validateField('password', form.password, form) === '' &&
      validateField('confirmPassword', form.confirmPassword, form) === '' &&
      validateField('role', form.role, form) === '' &&
      validateField('terms', form.terms, form) === ''
    );
  }, [form]);

  /* ---------------- Submit ---------------- */
  const handleSubmit = useCallback(
    async (event) => {
      event.preventDefault();
      setBanner(null);

      const nextErrors = {
        fullName: validateField('fullName', form.fullName, form),
        email: validateField('email', form.email, form),
        password: validateField('password', form.password, form),
        confirmPassword: validateField(
          'confirmPassword',
          form.confirmPassword,
          form
        ),
        role: validateField('role', form.role, form),
        terms: validateField('terms', form.terms, form),
      };

      setErrors(nextErrors);
      setTouched({
        fullName: true,
        email: true,
        password: true,
        confirmPassword: true,
        role: true,
        terms: true,
      });

      // Focus first invalid field in document order
      const order = [
        ['fullName', fullNameRef],
        ['email', emailRef],
        ['password', passwordRef],
        ['confirmPassword', confirmRef],
        ['role', roleRef],
        ['terms', termsRef],
      ];
      for (const [key, ref] of order) {
        if (nextErrors[key]) {
          ref.current?.focus();
          return;
        }
      }

      setIsSubmitting(true);

      // Simulated network round-trip. Replace with Django endpoint in future step.
      await new Promise((resolve) => setTimeout(resolve, 1000));

      setIsSubmitting(false);
      setBanner({
        type: 'success',
        message:
          'Registration submitted. Redirecting to sign in…',
      });

      setTimeout(() => navigate('/login'), 900);
    },
    [form, navigate]
  );

  const submitDisabled = isSubmitting;

  return (
    <div className="grid min-h-screen grid-cols-1 bg-slate-50 lg:grid-cols-2">
      {/* ============================================================= */}
      {/*  LEFT — Brand showcase (desktop only)                         */}
      {/* ============================================================= */}
      <aside
        className="relative hidden flex-col justify-between overflow-hidden bg-slate-900 p-10 text-white lg:flex xl:p-14"
        aria-hidden="false"
      >
        <div
          className="pointer-events-none absolute inset-0 opacity-[0.04]"
          style={{
            backgroundImage:
              'linear-gradient(#fff 1px, transparent 1px), linear-gradient(90deg, #fff 1px, transparent 1px)',
            backgroundSize: '40px 40px',
          }}
          aria-hidden="true"
        />

        {/* Brand lockup */}
        <div className="relative z-10 flex items-center gap-3">
          <span className="inline-flex h-10 w-10 items-center justify-center rounded-md bg-emerald-600">
            <ShieldCheck className="h-5 w-5" aria-hidden="true" />
          </span>
          <span className="flex flex-col leading-tight">
            <span className="text-base font-semibold tracking-tight">
              BidSentinel
            </span>
            <span className="text-[10.5px] font-medium uppercase tracking-wider text-slate-400">
              GeM Compliance Platform
            </span>
          </span>
        </div>

        {/* Value proposition */}
        <div className="relative z-10 max-w-md">
          <p className="mb-3 text-[11px] font-semibold uppercase tracking-[0.18em] text-emerald-500">
            Account Provisioning
          </p>
          <h2 className="mb-4 text-2xl font-semibold leading-tight tracking-tight xl:text-3xl">
            Register your institutional account to begin verifying GeM bids.
          </h2>
          <p className="text-sm leading-relaxed text-slate-400">
            Access is granted per role within your organisation — procurement
            administrators, compliance analysts, and reviewers each receive
            scoped permissions aligned to their function.
          </p>
        </div>

        {/* Feature highlights */}
        <ul className="relative z-10 flex flex-col gap-4">
          {BRAND_HIGHLIGHTS.map(({ Icon, title, detail }) => (
            <li key={title} className="flex items-start gap-3">
              <span className="mt-0.5 inline-flex h-8 w-8 flex-shrink-0 items-center justify-center rounded-md border border-slate-700 bg-slate-800 text-emerald-500">
                <Icon className="h-4 w-4" aria-hidden="true" />
              </span>
              <span className="flex flex-col">
                <span className="text-[13px] font-semibold text-white">
                  {title}
                </span>
                <span className="text-[12px] leading-relaxed text-slate-400">
                  {detail}
                </span>
              </span>
            </li>
          ))}
        </ul>

        {/* Footer */}
        <div className="relative z-10 flex items-center justify-between border-t border-slate-800 pt-5 text-[11px] text-slate-500">
          <span>© {new Date().getFullYear()} BidSentinel</span>
          <span>Government of India · GeM Portal Integration</span>
        </div>
      </aside>

      {/* ============================================================= */}
      {/*  RIGHT — Registration form                                    */}
      {/* ============================================================= */}
      <main className="flex items-center justify-center px-4 py-10 sm:px-8 lg:px-12">
        <div className="w-full max-w-md">
          {/* Mobile brand lockup */}
          <div className="mb-8 flex items-center gap-2.5 lg:hidden">
            <span className="inline-flex h-9 w-9 items-center justify-center rounded-md bg-emerald-600 text-white">
              <ShieldCheck className="h-4 w-4" aria-hidden="true" />
            </span>
            <span className="flex flex-col leading-tight">
              <span className="text-sm font-semibold tracking-tight text-slate-900">
                BidSentinel
              </span>
              <span className="text-[10px] font-medium uppercase tracking-wider text-slate-500">
                GeM Compliance Platform
              </span>
            </span>
          </div>

          {/* Heading */}
          <div className="mb-6">
            <h1 className="text-xl font-semibold tracking-tight text-slate-900">
              Create your account
            </h1>
            <p className="mt-1 text-[13px] text-slate-600">
              Register with your organisation credentials to access the
              compliance workspace.
            </p>
          </div>

          {/* Banner */}
          {banner ? (
            <div
              role="status"
              aria-live="polite"
              className={[
                'mb-5 flex items-start gap-2.5 rounded-md border px-3 py-2.5 text-[12.5px] leading-relaxed',
                banner.type === 'success'
                  ? 'border-emerald-200 bg-emerald-50 text-emerald-700'
                  : 'border-red-200 bg-red-50 text-red-600',
              ].join(' ')}
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

          {/* Form */}
          <form onSubmit={handleSubmit} noValidate className="flex flex-col gap-4">
            {/* Full Name */}
            <div className="flex flex-col gap-1.5">
              <label
                htmlFor="register-fullname"
                className="text-[12.5px] font-medium text-slate-700"
              >
                Full Name
              </label>
              <div className="relative">
                <span className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-3 text-slate-400">
                  <User className="h-4 w-4" aria-hidden="true" />
                </span>
                <input
                  ref={fullNameRef}
                  id="register-fullname"
                  name="fullName"
                  type="text"
                  autoComplete="name"
                  value={form.fullName}
                  onChange={handleChange}
                  onBlur={handleBlur}
                  placeholder="e.g. Ananya Sharma"
                  aria-invalid={Boolean(errors.fullName)}
                  aria-describedby={
                    errors.fullName ? 'register-fullname-error' : undefined
                  }
                  aria-required="true"
                  disabled={isSubmitting}
                  className={[
                    'h-10 w-full rounded-md border bg-white pl-9 pr-3 text-sm text-slate-900 placeholder:text-slate-400',
                    'transition-colors focus:outline-none focus:ring-2 disabled:cursor-not-allowed disabled:bg-slate-50 disabled:text-slate-400',
                    errors.fullName
                      ? 'border-red-200 focus:border-red-600 focus:ring-red-600/20'
                      : 'border-slate-200 focus:border-emerald-600 focus:ring-emerald-600/20',
                  ].join(' ')}
                />
              </div>
              {errors.fullName ? (
                <p
                  id="register-fullname-error"
                  role="alert"
                  className="flex items-center gap-1.5 text-[11.5px] font-medium text-red-600"
                >
                  <AlertCircle
                    className="h-3.5 w-3.5 flex-shrink-0"
                    aria-hidden="true"
                  />
                  {errors.fullName}
                </p>
              ) : null}
            </div>

            {/* Email */}
            <div className="flex flex-col gap-1.5">
              <label
                htmlFor="register-email"
                className="text-[12.5px] font-medium text-slate-700"
              >
                Work / Organization Email
              </label>
              <div className="relative">
                <span className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-3 text-slate-400">
                  <Mail className="h-4 w-4" aria-hidden="true" />
                </span>
                <input
                  ref={emailRef}
                  id="register-email"
                  name="email"
                  type="email"
                  autoComplete="email"
                  value={form.email}
                  onChange={handleChange}
                  onBlur={handleBlur}
                  placeholder="officer@gem.gov.in"
                  aria-invalid={Boolean(errors.email)}
                  aria-describedby={
                    errors.email ? 'register-email-error' : undefined
                  }
                  aria-required="true"
                  disabled={isSubmitting}
                  className={[
                    'h-10 w-full rounded-md border bg-white pl-9 pr-3 text-sm text-slate-900 placeholder:text-slate-400',
                    'transition-colors focus:outline-none focus:ring-2 disabled:cursor-not-allowed disabled:bg-slate-50 disabled:text-slate-400',
                    errors.email
                      ? 'border-red-200 focus:border-red-600 focus:ring-red-600/20'
                      : 'border-slate-200 focus:border-emerald-600 focus:ring-emerald-600/20',
                  ].join(' ')}
                />
              </div>
              {errors.email ? (
                <p
                  id="register-email-error"
                  role="alert"
                  className="flex items-center gap-1.5 text-[11.5px] font-medium text-red-600"
                >
                  <AlertCircle
                    className="h-3.5 w-3.5 flex-shrink-0"
                    aria-hidden="true"
                  />
                  {errors.email}
                </p>
              ) : null}
            </div>

            {/* Password */}
            <div className="flex flex-col gap-1.5">
              <label
                htmlFor="register-password"
                className="text-[12.5px] font-medium text-slate-700"
              >
                Password
              </label>
              <div className="relative">
                <span className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-3 text-slate-400">
                  <Lock className="h-4 w-4" aria-hidden="true" />
                </span>
                <input
                  ref={passwordRef}
                  id="register-password"
                  name="password"
                  type={showPassword ? 'text' : 'password'}
                  autoComplete="new-password"
                  value={form.password}
                  onChange={handleChange}
                  onBlur={handleBlur}
                  placeholder="Minimum 8 characters"
                  aria-invalid={Boolean(errors.password)}
                  aria-describedby={
                    errors.password
                      ? 'register-password-error'
                      : 'register-password-hint'
                  }
                  aria-required="true"
                  disabled={isSubmitting}
                  className={[
                    'h-10 w-full rounded-md border bg-white pl-9 pr-10 text-sm text-slate-900 placeholder:text-slate-400',
                    'transition-colors focus:outline-none focus:ring-2 disabled:cursor-not-allowed disabled:bg-slate-50 disabled:text-slate-400',
                    errors.password
                      ? 'border-red-200 focus:border-red-600 focus:ring-red-600/20'
                      : 'border-slate-200 focus:border-emerald-600 focus:ring-emerald-600/20',
                  ].join(' ')}
                />
                <button
                  type="button"
                  onClick={() => setShowPassword((prev) => !prev)}
                  aria-label={showPassword ? 'Hide password' : 'Show password'}
                  aria-pressed={showPassword}
                  className="absolute inset-y-0 right-0 flex items-center px-3 text-slate-400 transition-colors hover:text-slate-600 focus:outline-none focus-visible:text-emerald-600"
                >
                  {showPassword ? (
                    <EyeOff className="h-4 w-4" aria-hidden="true" />
                  ) : (
                    <Eye className="h-4 w-4" aria-hidden="true" />
                  )}
                </button>
              </div>
              {errors.password ? (
                <p
                  id="register-password-error"
                  role="alert"
                  className="flex items-center gap-1.5 text-[11.5px] font-medium text-red-600"
                >
                  <AlertCircle
                    className="h-3.5 w-3.5 flex-shrink-0"
                    aria-hidden="true"
                  />
                  {errors.password}
                </p>
              ) : (
                <p
                  id="register-password-hint"
                  className="text-[11px] text-slate-500"
                >
                  Use at least 8 characters with a mix of letters and numbers.
                </p>
              )}
            </div>

            {/* Confirm Password */}
            <div className="flex flex-col gap-1.5">
              <label
                htmlFor="register-confirm"
                className="text-[12.5px] font-medium text-slate-700"
              >
                Confirm Password
              </label>
              <div className="relative">
                <span className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-3 text-slate-400">
                  <Lock className="h-4 w-4" aria-hidden="true" />
                </span>
                <input
                  ref={confirmRef}
                  id="register-confirm"
                  name="confirmPassword"
                  type={showConfirm ? 'text' : 'password'}
                  autoComplete="new-password"
                  value={form.confirmPassword}
                  onChange={handleChange}
                  onBlur={handleBlur}
                  placeholder="Re-enter your password"
                  aria-invalid={Boolean(errors.confirmPassword)}
                  aria-describedby={
                    errors.confirmPassword
                      ? 'register-confirm-error'
                      : undefined
                  }
                  aria-required="true"
                  disabled={isSubmitting}
                  className={[
                    'h-10 w-full rounded-md border bg-white pl-9 pr-10 text-sm text-slate-900 placeholder:text-slate-400',
                    'transition-colors focus:outline-none focus:ring-2 disabled:cursor-not-allowed disabled:bg-slate-50 disabled:text-slate-400',
                    errors.confirmPassword
                      ? 'border-red-200 focus:border-red-600 focus:ring-red-600/20'
                      : 'border-slate-200 focus:border-emerald-600 focus:ring-emerald-600/20',
                  ].join(' ')}
                />
                <button
                  type="button"
                  onClick={() => setShowConfirm((prev) => !prev)}
                  aria-label={
                    showConfirm
                      ? 'Hide confirm password'
                      : 'Show confirm password'
                  }
                  aria-pressed={showConfirm}
                  className="absolute inset-y-0 right-0 flex items-center px-3 text-slate-400 transition-colors hover:text-slate-600 focus:outline-none focus-visible:text-emerald-600"
                >
                  {showConfirm ? (
                    <EyeOff className="h-4 w-4" aria-hidden="true" />
                  ) : (
                    <Eye className="h-4 w-4" aria-hidden="true" />
                  )}
                </button>
              </div>
              {errors.confirmPassword ? (
                <p
                  id="register-confirm-error"
                  role="alert"
                  className="flex items-center gap-1.5 text-[11.5px] font-medium text-red-600"
                >
                  <AlertCircle
                    className="h-3.5 w-3.5 flex-shrink-0"
                    aria-hidden="true"
                  />
                  {errors.confirmPassword}
                </p>
              ) : null}
            </div>

            {/* Role */}
            <div className="flex flex-col gap-1.5">
              <label
                htmlFor="register-role"
                className="text-[12.5px] font-medium text-slate-700"
              >
                Role
              </label>
              <div className="relative">
                <span className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-3 text-slate-400">
                  <UserCheck className="h-4 w-4" aria-hidden="true" />
                </span>
                <select
                  ref={roleRef}
                  id="register-role"
                  name="role"
                  value={form.role}
                  onChange={handleChange}
                  onBlur={handleBlur}
                  aria-invalid={Boolean(errors.role)}
                  aria-describedby={
                    errors.role ? 'register-role-error' : undefined
                  }
                  aria-required="true"
                  disabled={isSubmitting}
                  className={[
                    'h-10 w-full cursor-pointer appearance-none rounded-md border bg-white pl-9 pr-9 text-sm',
                    'transition-colors focus:outline-none focus:ring-2 disabled:cursor-not-allowed disabled:bg-slate-50',
                    form.role ? 'text-slate-900' : 'text-slate-400',
                    errors.role
                      ? 'border-red-200 focus:border-red-600 focus:ring-red-600/20'
                      : 'border-slate-200 focus:border-emerald-600 focus:ring-emerald-600/20',
                  ].join(' ')}
                >
                  {ROLE_OPTIONS.map((option) => (
                    <option
                      key={option.value}
                      value={option.value}
                      disabled={option.value === ''}
                    >
                      {option.label}
                    </option>
                  ))}
                </select>
                <span className="pointer-events-none absolute inset-y-0 right-0 flex items-center pr-3 text-slate-400">
                  <svg
                    className="h-4 w-4"
                    viewBox="0 0 20 20"
                    fill="currentColor"
                    aria-hidden="true"
                  >
                    <path
                      fillRule="evenodd"
                      d="M5.23 7.21a.75.75 0 0 1 1.06.02L10 11.14l3.71-3.91a.75.75 0 1 1 1.08 1.04l-4.25 4.48a.75.75 0 0 1-1.08 0L5.21 8.27a.75.75 0 0 1 .02-1.06Z"
                      clipRule="evenodd"
                    />
                  </svg>
                </span>
              </div>
              {errors.role ? (
                <p
                  id="register-role-error"
                  role="alert"
                  className="flex items-center gap-1.5 text-[11.5px] font-medium text-red-600"
                >
                  <AlertCircle
                    className="h-3.5 w-3.5 flex-shrink-0"
                    aria-hidden="true"
                  />
                  {errors.role}
                </p>
              ) : null}
            </div>

            {/* Terms */}
            <div className="flex flex-col gap-1.5 pt-1">
              <label
                htmlFor="register-terms"
                className="flex cursor-pointer select-none items-start gap-2 text-[12.5px] leading-relaxed text-slate-600"
              >
                <input
                  ref={termsRef}
                  id="register-terms"
                  name="terms"
                  type="checkbox"
                  checked={form.terms}
                  onChange={handleChange}
                  onBlur={handleBlur}
                  disabled={isSubmitting}
                  aria-invalid={Boolean(errors.terms)}
                  aria-describedby={
                    errors.terms ? 'register-terms-error' : undefined
                  }
                  aria-required="true"
                  className="mt-0.5 h-3.5 w-3.5 flex-shrink-0 cursor-pointer rounded border-slate-300 text-emerald-600 focus:ring-2 focus:ring-emerald-600/30 focus:ring-offset-0 disabled:cursor-not-allowed"
                />
                <span>
                  I agree to the{' '}
                  <a
                    href="#terms"
                    className="font-medium text-emerald-600 underline-offset-2 hover:underline focus:outline-none focus-visible:underline"
                  >
                    Terms of Service
                  </a>{' '}
                  and{' '}
                  <a
                    href="#privacy"
                    className="font-medium text-emerald-600 underline-offset-2 hover:underline focus:outline-none focus-visible:underline"
                  >
                    Privacy Policy
                  </a>
                  .
                </span>
              </label>
              {errors.terms ? (
                <p
                  id="register-terms-error"
                  role="alert"
                  className="flex items-center gap-1.5 text-[11.5px] font-medium text-red-600"
                >
                  <AlertCircle
                    className="h-3.5 w-3.5 flex-shrink-0"
                    aria-hidden="true"
                  />
                  {errors.terms}
                </p>
              ) : null}
            </div>

            {/* Submit */}
            <button
              type="submit"
              disabled={submitDisabled}
              aria-busy={isSubmitting}
              className={[
                'group mt-2 inline-flex h-10 w-full items-center justify-center gap-2 rounded-md px-4 text-sm font-semibold text-white',
                'transition-colors focus:outline-none focus-visible:ring-2 focus-visible:ring-emerald-600 focus-visible:ring-offset-2',
                isSubmitting
                  ? 'cursor-wait bg-emerald-600/70'
                  : 'bg-emerald-600 hover:bg-emerald-700',
              ].join(' ')}
            >
              {isSubmitting ? (
                <>
                  <span
                    className="h-4 w-4 animate-spin rounded-full border-2 border-white/40 border-t-white"
                    aria-hidden="true"
                  />
                  Creating account…
                </>
              ) : (
                <>
                  Create account
                  <ArrowRight
                    className="h-4 w-4 transition-transform group-hover:translate-x-0.5"
                    aria-hidden="true"
                  />
                </>
              )}
            </button>
          </form>

          {/* Divider + login hint */}
          <div className="mt-8 border-t border-slate-200 pt-5">
            <p className="text-center text-[12.5px] text-slate-600">
              Already have an account?{' '}
              <Link
                to="/login"
                className="font-semibold text-emerald-600 transition-colors hover:text-emerald-700 focus:outline-none focus-visible:underline"
              >
                Sign in
              </Link>
            </p>
          </div>

          {/* Security note */}
          <p className="mt-6 flex items-center justify-center gap-1.5 text-[11px] text-slate-500">
            <Lock className="h-3 w-3" aria-hidden="true" />
            Secured connection · NIC-compliant registration
          </p>
        </div>
      </main>
    </div>
  );
}