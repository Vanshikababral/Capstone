import { useCallback, useEffect, useState } from 'react';
import { Navigate, useOutletContext } from 'react-router-dom';
import { AlertCircle, Check, Clock3, RefreshCw, X } from 'lucide-react';
import { getApiErrorMessage } from '../../services/api';
import {
  decideRoleRequest,
  getPendingRoleRequests,
} from '../../services/auth';

export default function RoleRequests() {
  const user = useOutletContext();
  const [requests, setRequests] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [actingOn, setActingOn] = useState(null);
  const [error, setError] = useState('');
  const [notice, setNotice] = useState('');

  const loadRequests = useCallback(async () => {
    setIsLoading(true);
    setError('');
    try {
      const result = await getPendingRoleRequests();
      setRequests(result.requests);
    } catch (requestError) {
      setError(getApiErrorMessage(requestError));
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    let active = true;

    getPendingRoleRequests()
      .then((result) => {
        if (active) setRequests(result.requests);
      })
      .catch((requestError) => {
        if (active) setError(getApiErrorMessage(requestError));
      })
      .finally(() => {
        if (active) setIsLoading(false);
      });

    return () => {
      active = false;
    };
  }, []);

  const handleDecision = async (request, decision) => {
    setActingOn(request.id);
    setError('');
    setNotice('');
    try {
      const result = await decideRoleRequest(request.id, decision);
      setRequests((current) =>
        current.filter((item) => item.id !== request.id)
      );
      setNotice(result.message);
    } catch (requestError) {
      setError(getApiErrorMessage(requestError));
    } finally {
      setActingOn(null);
    }
  };

  if (user?.role !== 'ADMIN') return <Navigate to="/dashboard" replace />;

  return (
    <section className="mx-auto w-full max-w-6xl p-5 sm:p-8">
      <div className="flex flex-wrap items-start justify-between gap-4">
        <div>
          <p className="text-xs font-semibold uppercase tracking-[0.16em] text-emerald-700">
            Administration
          </p>
          <h1 className="mt-1 text-2xl font-semibold tracking-tight text-slate-900">
            Role requests
          </h1>
          <p className="mt-2 max-w-2xl text-sm text-slate-600">
            Review registrations and approve or reject the role each user
            requested.
          </p>
        </div>
        <button
          type="button"
          onClick={loadRequests}
          disabled={isLoading}
          className="inline-flex h-9 items-center gap-2 rounded-md border border-slate-300 bg-white px-3 text-sm font-medium text-slate-700 hover:bg-slate-50 disabled:cursor-wait disabled:opacity-60"
        >
          <RefreshCw
            className={`h-4 w-4 ${isLoading ? 'animate-spin' : ''}`}
            aria-hidden="true"
          />
          Refresh
        </button>
      </div>

      {error ? (
        <div
          role="alert"
          className="mt-6 flex items-start gap-2 rounded-md border border-red-200 bg-red-50 p-3 text-sm text-red-700"
        >
          <AlertCircle className="mt-0.5 h-4 w-4 flex-shrink-0" />
          <span>{error}</span>
        </div>
      ) : null}
      {notice ? (
        <div
          role="status"
          className="mt-6 rounded-md border border-emerald-200 bg-emerald-50 p-3 text-sm text-emerald-800"
        >
          {notice}
        </div>
      ) : null}

      <div className="mt-6 overflow-hidden rounded-lg border border-slate-200 bg-white shadow-sm">
        <div className="flex items-center gap-2 border-b border-slate-200 px-4 py-3">
          <Clock3 className="h-4 w-4 text-amber-600" aria-hidden="true" />
          <h2 className="text-sm font-semibold text-slate-800">
            Pending approval
          </h2>
          {!isLoading ? (
            <span className="rounded-full bg-slate-100 px-2 py-0.5 text-xs font-medium text-slate-600">
              {requests.length}
            </span>
          ) : null}
        </div>

        {isLoading ? (
          <p className="p-6 text-sm text-slate-600">Loading role requests…</p>
        ) : requests.length === 0 ? (
          <p className="p-6 text-sm text-slate-600">
            There are no pending role requests.
          </p>
        ) : (
          <ul className="divide-y divide-slate-200">
            {requests.map((request) => {
              const name =
                [request.first_name, request.last_name]
                  .filter(Boolean)
                  .join(' ') || 'Name not provided';
              const role = (request.requested_role || '')
                .toLowerCase()
                .replace(/_/g, ' ')
                .replace(/\b\w/g, (letter) => letter.toUpperCase());
              const isActing = actingOn === request.id;

              return (
                <li
                  key={request.id}
                  className="flex flex-col gap-4 p-4 sm:flex-row sm:items-center sm:justify-between"
                >
                  <div className="min-w-0">
                    <p className="font-medium text-slate-900">{name}</p>
                    <p className="mt-0.5 break-all text-sm text-slate-600">
                      {request.email}
                    </p>
                    <p className="mt-1 text-xs text-slate-500">
                      Requested role: <span className="font-medium">{role}</span>
                      {' · '}Current role: {request.role}
                    </p>
                  </div>
                  <div className="flex flex-shrink-0 gap-2">
                    <button
                      type="button"
                      onClick={() => handleDecision(request, 'REJECT')}
                      disabled={Boolean(actingOn)}
                      className="inline-flex h-9 items-center gap-1.5 rounded-md border border-red-200 px-3 text-sm font-medium text-red-700 hover:bg-red-50 disabled:opacity-60"
                    >
                      <X className="h-4 w-4" aria-hidden="true" />
                      Reject
                    </button>
                    <button
                      type="button"
                      onClick={() => handleDecision(request, 'APPROVE')}
                      disabled={Boolean(actingOn)}
                      className="inline-flex h-9 items-center gap-1.5 rounded-md bg-emerald-700 px-3 text-sm font-medium text-white hover:bg-emerald-800 disabled:opacity-60"
                    >
                      <Check className="h-4 w-4" aria-hidden="true" />
                      {isActing ? 'Saving…' : 'Approve'}
                    </button>
                  </div>
                </li>
              );
            })}
          </ul>
        )}
      </div>
    </section>
  );
}
