import { useEffect, useMemo, useState } from 'react';
import { Link, useOutletContext } from 'react-router-dom';
import { AlertCircle, FileText, Plus, RefreshCw, Search } from 'lucide-react';
import { getApiErrorMessage } from '../../services/api';
import { getTenders } from '../../services/tenders';

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
    : date.toLocaleDateString('en-IN', {
        day: '2-digit',
        month: 'short',
        year: 'numeric',
      });
}

function formatValue(value) {
  if (value === null || value === undefined || value === '') return 'Not specified';
  return new Intl.NumberFormat('en-IN', {
    style: 'currency',
    currency: 'INR',
    maximumFractionDigits: 2,
  }).format(Number(value));
}

export default function TendersLive() {
  const user = useOutletContext();
  const [tenders, setTenders] = useState([]);
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('ALL');
  const [categoryFilter, setCategoryFilter] = useState('ALL');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    let active = true;

    getTenders()
      .then((result) => {
        if (active) setTenders(result);
      })
      .catch((requestError) => {
        if (active) setError(getApiErrorMessage(requestError));
      })
      .finally(() => {
        if (active) setLoading(false);
      });

    return () => {
      active = false;
    };
  }, []);

  const categories = useMemo(
    () => [...new Set(tenders.map((tender) => tender.category).filter(Boolean))].sort(),
    [tenders]
  );
  const filtered = useMemo(() => {
    const query = search.trim().toLowerCase();
    return tenders.filter((tender) => {
      const matchesSearch =
        !query ||
        [tender.reference_number, tender.title, tender.department, tender.category]
          .filter(Boolean)
          .some((value) => value.toLowerCase().includes(query));
      return (
        matchesSearch &&
        (statusFilter === 'ALL' || tender.status === statusFilter) &&
        (categoryFilter === 'ALL' || tender.category === categoryFilter)
      );
    });
  }, [tenders, search, statusFilter, categoryFilter]);

  const isTenderAuthority = ['ADMIN', 'TENDER_MANAGER'].includes(user?.role);

  return (
    <section className="mx-auto w-full max-w-7xl p-5 sm:p-8">
      <header className="flex flex-wrap items-start justify-between gap-4">
        <div>
          <p className="text-xs font-semibold uppercase tracking-[0.16em] text-emerald-700">
            Procurement
          </p>
          <h1 className="mt-1 text-2xl font-semibold tracking-tight text-slate-900">
            Tender Management
          </h1>
          <p className="mt-2 text-sm text-slate-600">
            Tenders loaded from the project database.
          </p>
        </div>
        {isTenderAuthority ? (
          <Link
            to="/tenders/create"
            className="inline-flex h-9 items-center gap-2 rounded-md bg-emerald-700 px-3 text-sm font-semibold text-white hover:bg-emerald-800"
          >
            <Plus className="h-4 w-4" aria-hidden="true" />
            Create tender
          </Link>
        ) : null}
      </header>

      <div className="mt-6 grid gap-3 sm:grid-cols-3">
        {[
          ['Total', tenders.length],
          ['Published', tenders.filter((item) => item.status === 'PUBLISHED').length],
          ['Drafts', tenders.filter((item) => item.status === 'DRAFT').length],
        ].map(([label, count]) => (
          <div key={label} className="rounded-lg border border-slate-200 bg-white p-4">
            <p className="text-xs font-semibold uppercase tracking-wide text-slate-500">{label}</p>
            <p className="mt-2 text-2xl font-semibold text-slate-900">{count}</p>
          </div>
        ))}
      </div>

      <div className="mt-6 grid gap-3 rounded-lg border border-slate-200 bg-white p-4 md:grid-cols-[1fr_180px_220px]">
        <label className="relative">
          <span className="sr-only">Search tenders</span>
          <Search className="absolute left-3 top-2.5 h-4 w-4 text-slate-400" aria-hidden="true" />
          <input
            type="search"
            value={search}
            onChange={(event) => setSearch(event.target.value)}
            placeholder="Search reference, title, department…"
            className="h-9 w-full rounded-md border border-slate-300 pl-9 pr-3 text-sm"
          />
        </label>
        <label>
          <span className="sr-only">Filter by status</span>
          <select
            value={statusFilter}
            onChange={(event) => setStatusFilter(event.target.value)}
            className="h-9 w-full rounded-md border border-slate-300 px-3 text-sm"
          >
            <option value="ALL">All statuses</option>
            {Object.entries(STATUS_LABELS).map(([value, label]) => (
              <option key={value} value={value}>{label}</option>
            ))}
          </select>
        </label>
        <label>
          <span className="sr-only">Filter by category</span>
          <select
            value={categoryFilter}
            onChange={(event) => setCategoryFilter(event.target.value)}
            className="h-9 w-full rounded-md border border-slate-300 px-3 text-sm"
          >
            <option value="ALL">All categories</option>
            {categories.map((category) => (
              <option key={category} value={category}>{category}</option>
            ))}
          </select>
        </label>
      </div>

      {error ? (
        <div role="alert" className="mt-5 flex gap-2 rounded-md border border-red-200 bg-red-50 p-3 text-sm text-red-700">
          <AlertCircle className="h-4 w-4 flex-shrink-0" aria-hidden="true" />
          <span>{error}</span>
        </div>
      ) : null}

      <div className="mt-5 overflow-hidden rounded-lg border border-slate-200 bg-white">
        {loading ? (
          <p className="p-6 text-sm text-slate-600">Loading tenders…</p>
        ) : error ? null : filtered.length === 0 ? (
          <div className="flex flex-col items-center gap-2 p-10 text-center">
            <FileText className="h-8 w-8 text-slate-400" aria-hidden="true" />
            <p className="font-medium text-slate-800">
              {tenders.length === 0 ? 'No tenders in the database yet.' : 'No tenders match these filters.'}
            </p>
            <p className="text-sm text-slate-500">
              {tenders.length === 0
                ? 'Create a tender to see it appear here.'
                : 'Try a different search or filter.'}
            </p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full min-w-[760px] text-left text-sm">
              <thead className="bg-slate-50 text-xs uppercase text-slate-500">
                <tr>
                  <th className="px-4 py-3">Reference</th>
                  <th className="px-4 py-3">Title</th>
                  <th className="px-4 py-3">Department</th>
                  <th className="px-4 py-3">Deadline</th>
                  <th className="px-4 py-3">Status</th>
                  <th className="px-4 py-3">Value</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {filtered.map((tender) => (
                  <tr key={tender.id} className="hover:bg-slate-50">
                    <td className="px-4 py-3 font-medium text-emerald-800">
                      <Link to={`/tenders/${tender.id}`}>{tender.reference_number}</Link>
                    </td>
                    <td className="px-4 py-3 text-slate-900">{tender.title}</td>
                    <td className="px-4 py-3 text-slate-600">{tender.department}</td>
                    <td className="whitespace-nowrap px-4 py-3 text-slate-600">
                      {formatDate(tender.submission_deadline)}
                    </td>
                    <td className="px-4 py-3">
                      {STATUS_LABELS[tender.status] || tender.status}
                    </td>
                    <td className="whitespace-nowrap px-4 py-3 text-slate-600">
                      {formatValue(tender.estimated_value)}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {loading ? (
        <p className="mt-3 flex items-center gap-2 text-xs text-slate-500">
          <RefreshCw className="h-3.5 w-3.5 animate-spin" aria-hidden="true" />
          Connecting to the tender API
        </p>
      ) : null}
    </section>
  );
}
