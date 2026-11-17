import { useState } from 'react';
import { Link, useNavigate, useOutletContext } from 'react-router-dom';
import { AlertCircle, ArrowLeft, CheckCircle2 } from 'lucide-react';
import { getApiErrorMessage } from '../../services/api';
import { createTender } from '../../services/tenders';

const INITIAL_FORM = {
  title: '',
  reference_number: '',
  department: '',
  category: '',
  description: '',
  estimated_value: '',
  submission_deadline: '',
  status: 'DRAFT',
};

export default function CreateTenderLive() {
  const navigate = useNavigate();
  const user = useOutletContext();
  const [form, setForm] = useState(INITIAL_FORM);
  const [error, setError] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  if (!['ADMIN', 'TENDER_MANAGER'].includes(user?.role)) {
    return (
      <section className="mx-auto max-w-2xl p-8">
        <h1 className="text-xl font-semibold text-slate-900">Not authorized</h1>
        <p className="mt-2 text-sm text-slate-600">
          Only administrators and tender managers can create tenders.
        </p>
        <Link className="mt-4 inline-block text-sm text-emerald-700 underline" to="/tenders">
          Return to tenders
        </Link>
      </section>
    );
  }

  const handleChange = (event) => {
    const { name, value } = event.target;
    setForm((current) => ({ ...current, [name]: value }));
  };

  const handleSubmit = async (event) => {
    event.preventDefault();
    setError('');
    setIsSubmitting(true);

    const payload = {
      ...form,
      reference_number: form.reference_number.trim().toUpperCase(),
      title: form.title.trim(),
      department: form.department.trim(),
      category: form.category.trim(),
      description: form.description.trim(),
      estimated_value: form.estimated_value || null,
      submission_deadline: new Date(form.submission_deadline).toISOString(),
    };

    try {
      await createTender(payload);
      navigate('/tenders', { replace: true });
    } catch (requestError) {
      setError(getApiErrorMessage(requestError));
    } finally {
      setIsSubmitting(false);
    }
  };

  const fields = [
    { name: 'title', label: 'Tender title', type: 'text', required: true },
    { name: 'reference_number', label: 'Reference number', type: 'text', required: true },
    { name: 'department', label: 'Department / organization', type: 'text', required: true },
    { name: 'category', label: 'Category', type: 'text', required: false },
    { name: 'estimated_value', label: 'Estimated value (INR)', type: 'number', required: false },
    { name: 'submission_deadline', label: 'Submission deadline', type: 'datetime-local', required: true },
  ];

  return (
    <section className="mx-auto w-full max-w-3xl p-5 sm:p-8">
      <Link to="/tenders" className="inline-flex items-center gap-1 text-sm text-slate-600 hover:text-slate-900">
        <ArrowLeft className="h-4 w-4" aria-hidden="true" />
        Back to tenders
      </Link>
      <h1 className="mt-4 text-2xl font-semibold tracking-tight text-slate-900">
        Create tender
      </h1>
      <p className="mt-2 text-sm text-slate-600">
        These fields map to the tender API and are saved to the database.
      </p>

      {error ? (
        <div role="alert" className="mt-5 flex gap-2 rounded-md border border-red-200 bg-red-50 p-3 text-sm text-red-700">
          <AlertCircle className="h-4 w-4 flex-shrink-0" aria-hidden="true" />
          <span>{error}</span>
        </div>
      ) : null}

      <form onSubmit={handleSubmit} className="mt-6 space-y-5 rounded-lg border border-slate-200 bg-white p-5 shadow-sm">
        <div className="grid gap-4 sm:grid-cols-2">
          {fields.map((field) => (
            <label key={field.name} className="flex flex-col gap-1.5">
              <span className="text-sm font-medium text-slate-700">
                {field.label}{field.required ? ' *' : ''}
              </span>
              <input
                name={field.name}
                type={field.type}
                required={field.required}
                min={field.type === 'number' ? '0' : undefined}
                step={field.type === 'number' ? '0.01' : undefined}
                value={form[field.name]}
                onChange={handleChange}
                disabled={isSubmitting}
                className="h-10 rounded-md border border-slate-300 px-3 text-sm text-slate-900 focus:border-emerald-600 focus:outline-none focus:ring-2 focus:ring-emerald-600/20 disabled:bg-slate-50"
              />
            </label>
          ))}
        </div>

        <label className="flex flex-col gap-1.5">
          <span className="text-sm font-medium text-slate-700">Description *</span>
          <textarea
            name="description"
            required
            minLength={1}
            rows={5}
            value={form.description}
            onChange={handleChange}
            disabled={isSubmitting}
            className="rounded-md border border-slate-300 px-3 py-2 text-sm text-slate-900 focus:border-emerald-600 focus:outline-none focus:ring-2 focus:ring-emerald-600/20 disabled:bg-slate-50"
          />
        </label>

        <label className="flex flex-col gap-1.5 sm:max-w-xs">
          <span className="text-sm font-medium text-slate-700">Initial status</span>
          <select
            name="status"
            value={form.status}
            onChange={handleChange}
            disabled={isSubmitting}
            className="h-10 rounded-md border border-slate-300 bg-white px-3 text-sm"
          >
            <option value="DRAFT">Save as draft</option>
            <option value="PUBLISHED">Publish now</option>
          </select>
        </label>
        <p className="text-xs text-slate-500">
          The backend currently stores tender information only. Bid schedules,
          requirements, and attached tender files are not included in this API yet.
        </p>

        <div className="flex justify-end gap-2 border-t border-slate-100 pt-4">
          <Link to="/tenders" className="inline-flex h-9 items-center rounded-md border border-slate-300 px-3 text-sm text-slate-700">
            Cancel
          </Link>
          <button
            type="submit"
            disabled={isSubmitting}
            className="inline-flex h-9 items-center gap-2 rounded-md bg-emerald-700 px-4 text-sm font-semibold text-white hover:bg-emerald-800 disabled:cursor-wait disabled:opacity-60"
          >
            {isSubmitting ? 'Saving…' : <><CheckCircle2 className="h-4 w-4" aria-hidden="true" /> Save tender</>}
          </button>
        </div>
      </form>
    </section>
  );
}
