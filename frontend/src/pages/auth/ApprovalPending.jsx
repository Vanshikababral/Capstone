import { Clock3 } from 'lucide-react';
import { useOutletContext } from 'react-router-dom';

export default function ApprovalPending() {
  const user = useOutletContext();
  const requestedRole = (user?.requested_role || '')
    .toLowerCase()
    .replace(/_/g, ' ')
    .replace(/\b\w/g, (letter) => letter.toUpperCase());

  return (
    <section className="mx-auto flex min-h-[60vh] w-full max-w-2xl items-center justify-center p-6">
      <div className="w-full rounded-xl border border-slate-200 bg-white p-8 text-center shadow-sm">
        <span className="mx-auto inline-flex h-12 w-12 items-center justify-center rounded-full bg-amber-50 text-amber-700">
          <Clock3 className="h-6 w-6" aria-hidden="true" />
        </span>
        <p className="mt-5 text-xs font-semibold uppercase tracking-[0.16em] text-emerald-700">
          Account access
        </p>
        <h1 className="mt-2 text-2xl font-semibold tracking-tight text-slate-900">
          Your role request is pending
        </h1>
        <p className="mx-auto mt-3 max-w-lg text-sm leading-6 text-slate-600">
          Your account was created and you can sign in, but an administrator
          must approve your requested role before you can use the workspace.
        </p>
        {requestedRole ? (
          <p className="mt-5 rounded-md bg-slate-50 px-4 py-3 text-sm text-slate-700">
            Requested role: <span className="font-semibold">{requestedRole}</span>
          </p>
        ) : null}
        <p className="mt-5 text-xs text-slate-500">
          Contact your administrator if you need help with your request.
        </p>
      </div>
    </section>
  );
}
