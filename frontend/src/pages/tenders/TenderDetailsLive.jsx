import { useEffect, useState } from 'react';
import { Link, useParams } from 'react-router-dom';
import { AlertCircle, ArrowLeft } from 'lucide-react';
import { getApiErrorMessage } from '../../services/api';
import { getTender } from '../../services/tenders';

const STATUS_LABELS = {
  DRAFT: 'Draft',
  PUBLISHED: 'Published',
  CLOSED: 'Closed',
};

function formatDate(value) {
  if (!value) return '—';
  const date = new Date(value);
  return Number.isNaN(date.getTime())
    ? value
    : date.toLocaleString('en-IN', {
        dateStyle: 'medium',
        timeStyle: 'short',
      });
}

export default function TenderDetailsLive() {
  const { id } = useParams();
  const [result, setResult] = useState({ id: null, tender: null, error: '' });

  useEffect(() => {
    let active = true;

    getTender(id)
      .then((result) => {
        if (active) setResult({ id, tender: result, error: '' });
      })
      .catch((requestError) => {
        if (active) {
          setResult({
            id,
            tender: null,
            error: getApiErrorMessage(requestError),
          });
        }
      })

    return () => {
      active = false;
    };
  }, [id]);

  const loading = result.id !== id;
  const tender = loading ? null : result.tender;
  const error = loading ? '' : result.error;
  if (loading) return <p className="p-8 text-sm text-slate-600">Loading tender…</p>;

  return (
    <section className="mx-auto w-full max-w-4xl p-5 sm:p-8">
      <Link to="/tenders" className="inline-flex items-center gap-1 text-sm text-slate-600 hover:text-slate-900">
        <ArrowLeft className="h-4 w-4" aria-hidden="true" />
        Back to tenders
      </Link>
      {error ? (
        <div role="alert" className="mt-5 flex gap-2 rounded-md border border-red-200 bg-red-50 p-3 text-sm text-red-700">
          <AlertCircle className="h-4 w-4 flex-shrink-0" aria-hidden="true" />
          <span>{error}</span>
        </div>
      ) : tender ? (
        <>
          <p className="mt-5 text-xs font-semibold uppercase tracking-wide text-emerald-700">
            {tender.reference_number}
          </p>
          <div className="mt-1 flex flex-wrap items-start justify-between gap-3">
            <h1 className="text-2xl font-semibold tracking-tight text-slate-900">{tender.title}</h1>
            <span className="rounded-full bg-slate-100 px-3 py-1 text-xs font-semibold text-slate-700">
              {STATUS_LABELS[tender.status] || tender.status}
            </span>
          </div>
          <p className="mt-3 whitespace-pre-wrap text-sm leading-6 text-slate-700">{tender.description}</p>
          <dl className="mt-6 grid gap-4 rounded-lg border border-slate-200 bg-white p-5 sm:grid-cols-2">
            <div>
              <dt className="text-xs font-semibold uppercase text-slate-500">Department</dt>
              <dd className="mt-1 text-sm text-slate-900">{tender.department}</dd>
            </div>
            <div>
              <dt className="text-xs font-semibold uppercase text-slate-500">Category</dt>
              <dd className="mt-1 text-sm text-slate-900">{tender.category || 'Not specified'}</dd>
            </div>
            <div>
              <dt className="text-xs font-semibold uppercase text-slate-500">Estimated value</dt>
              <dd className="mt-1 text-sm text-slate-900">
                {tender.estimated_value
                  ? new Intl.NumberFormat('en-IN', { style: 'currency', currency: 'INR' }).format(Number(tender.estimated_value))
                  : 'Not specified'}
              </dd>
            </div>
            <div>
              <dt className="text-xs font-semibold uppercase text-slate-500">Submission deadline</dt>
              <dd className="mt-1 text-sm text-slate-900">{formatDate(tender.submission_deadline)}</dd>
            </div>
            <div>
              <dt className="text-xs font-semibold uppercase text-slate-500">Published</dt>
              <dd className="mt-1 text-sm text-slate-900">{formatDate(tender.published_at)}</dd>
            </div>
            <div>
              <dt className="text-xs font-semibold uppercase text-slate-500">Created by</dt>
              <dd className="mt-1 text-sm text-slate-900">{tender.created_by_email || '—'}</dd>
            </div>
          </dl>
        </>
      ) : null}
    </section>
  );
}
