import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import {
  ShieldCheck,
  Lock,
  Mail,
  Eye,
  EyeOff,
  ArrowRight,
  CheckCircle2,
  AlertCircle,
  FileSearch,
  FileCheck,
} from 'lucide-react';

/* ------------------------------------------------------------------ */
/*  Validation rules                                                  */
/* ------------------------------------------------------------------ */
const EMAIL_REGEX = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

const validateField = (name, value) => {
  switch (name) {
    case 'email': {
      const trimmed = value.trim();
      if (!trimmed) return 'Email or username is required.';
      // Accept either a valid email OR a plain username (≥3 chars)
      if (trimmed.includes('@') && !EMAIL_REGEX.test(trimmed)) {
        return 'Enter a valid email address.';
      }
      if (!trimmed.includes('@') && trimmed.length < 3) {
        return 'Username must be at least 3 characters.';
      }
      return '';
    }
    case 'password': {
      if (!value) return 'Password is required.';
      if (value.length < 8) return 'Password must be at least 8 characters.';
      return '';
    }
    default:
      return '';
  }
};

/* ------------------------------------------------------------------ */
/*  Brand showcase copy                                               */
/* ------------------------------------------------------------------ */
const BRAND_HIGHLIGHTS = [
  {
    Icon: FileSearch,
    title: 'AI-Driven Clause Extraction',
    detail:
      'Automated parsing of tender documents against GeM compliance rulesets.',
  },
  {
    Icon: FileCheck,
    title: 'Real-Time Bid Verification',
    detail:
      'Instant flagging of mismatched eligibility, financial, and technical criteria.',
  },
  {
    Icon: ShieldCheck,
    title: 'Audit-Ready Compliance Trail',
    detail:
      'Every decision traced, timestamped, and exportable for regulatory review.',
  },
];

/* ------------------------------------------------------------------ */
/*  Login                                                             */
/* ------------------------------------------------------------------ */
export default function Login() {
  const navigate = useNavigate();

  const [form, setForm] = useState({
    email: '',
    password: '',
    remember: true,
  });
  const [errors, setErrors] = useState({ email: '', password: '' });
  const [touched, setTouched] = useState({ email: false, password: false });
  const [showPassword, setShowPassword] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [banner, setBanner] = useState(null); // { type: 'success' | 'error', message: string }

  const emailRef = useRef(null);
  const passwordRef = useRef(null);

  /* ---------------- Autofocus first field ---------------- */
  useEffect(() => {
    emailRef.current?.focus();
  }, []);

  /* ---------------- Field change handler ---------------- */
  const handleChange = useCallback(
    (event) => {
      const { name, value, type, checked } = event.target;
      const nextValue = type === 'checkbox' ? checked : value;

      setForm((prev) => ({ ...prev, [name]: nextValue }));

      if (name === 'email' || name === 'password') {
        // Re-validate on change only if the field was already touched
        if (touched[name]) {
          setErrors((prev) => ({
            ...prev,
            [name]: validateField(name, nextValue),
          }));
        }
      }

      if (banner?.type === 'error') setBanner(null);
    },
    [touched, banner]
  );

  /* ---------------- Field blur handler ---------------- */
  const handleBlur = useCallback(
    (event) => {
      const { name, value } = event.target;
      setTouched((prev) => ({ ...prev, [name]: true }));
      setErrors((prev) => ({ ...prev, [name]: validateField(name, value) }));
    },
    []
  );

  /* ---------------- Derived validity ---------------- */
  const isFormValid = useMemo(() => {
    return (
      validateField('email', form.email) === '' &&
      validateField('password', form.password) === ''
    );
  }, [form.email, form.password]);

  /* ---------------- Submit handler ---------------- */
  const handleSubmit = useCallback(
    async (event) => {
      event.preventDefault();
      setBanner(null);

      const emailError = validateField('email', form.email);
      const passwordError = validateField('password', form.password);

      setTouched({ email: true, password: true });
      setErrors({ email: emailError, password: passwordError });

      if (emailError) {
        emailRef.current?.focus();
        return;
      }
      if (passwordError) {
        passwordRef.current?.focus();
        return;
      }

      setIsSubmitting(true);

      // Simulated network round-trip. Replace with Django JWT call in future step.
      await new Promise((resolve) => setTimeout(resolve, 900));

      setIsSubmitting(false);
      setBanner({
        type: 'success',
        message: 'Credentials verified. Redirecting to dashboard…',
      });

      // Brief pause so the success banner is perceivable before navigation
      setTimeout(() => navigate('/dashboard'), 700);
    },
    [form.email, form.password, navigate]
  );

  /* ---------------- Prevent double submit ---------------- */
  const submitDisabled = isSubmitting || (!isFormValid && touched.email && touched.password);

  return (
    <div className="grid min-h-screen grid-cols-1 bg-slate-50 lg:grid-cols-2">
      {/* ============================================================= */}
      {/*  LEFT — Brand showcase (desktop only)                         */}
      {/* ============================================================= */}
      <aside
        className="relative hidden flex-col justify-between overflow-hidden bg-slate-900 p-10 text-white lg:flex xl:p-14"
        aria-hidden="false"
      >
        {/* Subtle grid texture */}
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
            Integrated Bid Compliance Verification
          </p>
          <h2 className="mb-4 text-2xl font-semibold leading-tight tracking-tight xl:text-3xl">
            Verify every bid against every clause — before it reaches the
            evaluation committee.
          </h2>
          <p className="text-sm leading-relaxed text-slate-400">
            Purpose-built for GeM procurement workflows: automated document
            intake, AI-assisted compliance scoring, and a full audit trail for
            regulatory review.
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
      {/*  RIGHT — Auth form                                            */}
      {/* ============================================================= */}
      <main className="flex items-center justify-center px-4 py-10 sm:px-8 lg:px-12">
        <div className="w-full max-w-sm">
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
              Sign in to your account
            </h1>
            <p className="mt-1 text-[13px] text-slate-600">
              Access the bid compliance verification workspace.
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
          <form
            onSubmit={handleSubmit}
            noValidate
            className="flex flex-col gap-4"
          >
            {/* Email / Username */}
            <div className="flex flex-col gap-1.5">
              <label
                htmlFor="login-email"
                className="text-[12.5px] font-medium text-slate-700"
              >
                Email or Username
              </label>
              <div className="relative">
                <span className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-3 text-slate-400">
                  <Mail className="h-4 w-4" aria-hidden="true" />
                </span>
                <input
                  ref={emailRef}
                  id="login-email"
                  name="email"
                  type="text"
                  inputMode="email"
                  autoComplete="username"
                  value={form.email}
                  onChange={handleChange}
                  onBlur={handleBlur}
                  placeholder="officer@gem.gov.in"
                  aria-invalid={Boolean(errors.email)}
                  aria-describedby={errors.email ? 'login-email-error' : undefined}
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
                  id="login-email-error"
                  role="alert"
                  className="flex items-center gap-1.5 text-[11.5px] font-medium text-red-600"
                >
                  <AlertCircle className="h-3.5 w-3.5 flex-shrink-0" aria-hidden="true" />
                  {errors.email}
                </p>
              ) : null}
            </div>

            {/* Password */}
            <div className="flex flex-col gap-1.5">
              <div className="flex items-center justify-between">
                <label
                  htmlFor="login-password"
                  className="text-[12.5px] font-medium text-slate-700"
                >
                  Password
                </label>
                <button
                  type="button"
                  className="text-[11.5px] font-medium text-emerald-600 transition-colors hover:text-emerald-700 focus:outline-none focus-visible:underline"
                  onClick={() => {
                    /* Forgot password flow intentionally not implemented */
                  }}
                >
                  Forgot password?
                </button>
              </div>
              <div className="relative">
                <span className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-3 text-slate-400">
                  <Lock className="h-4 w-4" aria-hidden="true" />
                </span>
                <input
                  ref={passwordRef}
                  id="login-password"
                  name="password"
                  type={showPassword ? 'text' : 'password'}
                  autoComplete="current-password"
                  value={form.password}
                  onChange={handleChange}
                  onBlur={handleBlur}
                  placeholder="Enter your password"
                  aria-invalid={Boolean(errors.password)}
                  aria-describedby={
                    errors.password ? 'login-password-error' : undefined
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
                  tabIndex={0}
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
                  id="login-password-error"
                  role="alert"
                  className="flex items-center gap-1.5 text-[11.5px] font-medium text-red-600"
                >
                  <AlertCircle className="h-3.5 w-3.5 flex-shrink-0" aria-hidden="true" />
                  {errors.password}
                </p>
              ) : null}
            </div>

            {/* Remember me */}
            <div className="flex items-center justify-between pt-1">
              <label
                htmlFor="login-remember"
                className="flex cursor-pointer select-none items-center gap-2 text-[12.5px] text-slate-600"
              >
                <input
                  id="login-remember"
                  name="remember"
                  type="checkbox"
                  checked={form.remember}
                  onChange={handleChange}
                  disabled={isSubmitting}
                  className="h-3.5 w-3.5 cursor-pointer rounded border-slate-300 text-emerald-600 focus:ring-2 focus:ring-emerald-600/30 focus:ring-offset-0 disabled:cursor-not-allowed"
                />
                Keep me signed in on this device
              </label>
            </div>

            {/* Submit */}
            <button
              type="submit"
              disabled={isSubmitting}
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
                  Verifying…
                </>
              ) : (
                <>
                  Sign in
                  <ArrowRight
                    className="h-4 w-4 transition-transform group-hover:translate-x-0.5"
                    aria-hidden="true"
                  />
                </>
              )}
            </button>
          </form>

          {/* Divider + register hint */}
          <div className="mt-8 border-t border-slate-200 pt-5">
            <p className="text-center text-[12.5px] text-slate-600">
              Need an account?{' '}
              <Link
                to="/register"
                className="font-semibold text-emerald-600 transition-colors hover:text-emerald-700 focus:outline-none focus-visible:underline"
              >
                Request access
              </Link>
            </p>
          </div>

          {/* Security note */}
          <p className="mt-6 flex items-center justify-center gap-1.5 text-[11px] text-slate-500">
            <Lock className="h-3 w-3" aria-hidden="true" />
            Secured connection · NIC-compliant authentication
          </p>
        </div>
      </main>
    </div>
  );
}