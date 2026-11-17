import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { ArrowRight, FileText } from 'lucide-react';

import { getApiErrorMessage } from '../../services/api';
import { getBids } from '../../services/documents';
import { getCurrentUser } from '../../services/auth';

export default function Bids() {
  const [bids, setBids] = useState([]);
  const [role, setRole] = useState('');
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    let active = true;

    Promise.all([getBids(), getCurrentUser()])
      .then(([results, user]) => {
        if (active) {
          setBids(results);
          setRole(user.role);
        }
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

  return (
    <section className="flex flex-col gap-5">
      <header>
        <p className="text-[11px] font-semibold uppercase tracking-[0.15em] text-emerald-600">
          Workspace
        </p>
        <h1 className="mt-1 text-xl font-semibold text-slate-900">
          {role === 'BIDDER' ? 'My Bids' : 'Bids'}
        </h1>
        <p className="mt-1 text-sm text-slate-600">
          Upload and review the documents attached to each bid.
        </p>
      </header>

      {isLoading ? (
        <p className="py-8 text-center text-sm text-slate-600">Loading bids…</p>
      ) : error ? (
        <p
          role="alert"
          className="rounded-md border border-red-200 bg-red-50 p-4 text-sm text-red-700"
        >
          {error}
        </p>
      ) : bids.length === 0 ? (
        <div className="rounded-lg border border-slate-200 bg-white p-8 text-center">
          <FileText className="mx-auto h-6 w-6 text-slate-400" aria-hidden="true" />
          <p className="mt-2 text-sm font-medium text-slate-800">No bids yet</p>
          <p className="mt-1 text-sm text-slate-500">
            Bids you submit will appear here.
          </p>
        </div>
      ) : (
        <ul className="divide-y divide-slate-100 overflow-hidden rounded-lg border border-slate-200 bg-white">
          {bids.map((bid) => (
            <li
              key={bid.id}
              className="flex flex-col gap-3 p-4 sm:flex-row sm:items-center sm:justify-between"
            >
              <div>
                <p className="font-semibold text-slate-900">
                  {bid.tender_reference}
                </p>
                <p className="mt-1 text-sm text-slate-600">
                  Bid #{bid.id} · {bid.status.replaceAll('_', ' ')}
                </p>
              </div>
              {role === 'BIDDER' ? (
                <Link
                  to={`/bids/${bid.id}/upload`}
                  className="inline-flex h-9 items-center justify-center gap-2 rounded-md bg-emerald-600 px-3 text-sm font-semibold text-white hover:bg-emerald-700 focus:outline-none focus-visible:ring-2 focus-visible:ring-emerald-600 focus-visible:ring-offset-2"
                >
                  Manage documents
                  <ArrowRight className="h-4 w-4" aria-hidden="true" />
                </Link>
              ) : null}
            </li>
          ))}
        </ul>
      )}
    </section>
  );
}
