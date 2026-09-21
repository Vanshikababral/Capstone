import { BrowserRouter, Routes, Route, Navigate, Link } from 'react-router-dom';
import { ShieldAlert, ArrowRight } from 'lucide-react';

import AppLayout from './layouts/AppLayout';

import Login from './pages/auth/Login';
import Register from './pages/auth/Register';

import Dashboard from './pages/dashboard/Dashboard';
import Bids from './pages/bids';

import Tenders from './pages/tenders/Tenders';
import CreateTender from './pages/tenders/CreateTender';
import TenderDetails from './pages/tenders/TenderDetails';

import BidDetails from './pages/bids/BidDetails';
import UploadDocuments from './pages/bids/UploadDocuments';

import ComplianceResults from './pages/compliance/ComplianceResults';
import Compliance from './pages/compliance';
import RequirementDetails from './pages/compliance/RequirementDetails';

import ReviewCases from './pages/review/ReviewCases';
import Reports from './pages/reports/Reports';

/* ================================================================== */
/*  LOCAL 404 — NotFound                                              */
/* ================================================================== */

function NotFound() {
  return (
    <div className="flex min-h-screen items-center justify-center bg-slate-900 px-4 py-10">
      <div className="w-full max-w-md rounded-lg border border-slate-800 bg-slate-950/60 p-8 text-center shadow-2xl">
        <span
          className="mx-auto inline-flex h-12 w-12 items-center justify-center rounded-md bg-slate-800 text-emerald-500"
          aria-hidden="true"
        >
          <ShieldAlert className="h-6 w-6" />
        </span>

        <p className="mt-4 text-[11px] font-semibold uppercase tracking-[0.18em] text-emerald-500">
          Error 404
        </p>
        <h1 className="mt-1 text-xl font-semibold tracking-tight text-white sm:text-2xl">
          Page Not Found
        </h1>
        <p className="mt-2 text-[13px] leading-relaxed text-slate-400">
          The page you are looking for does not exist, has been moved, or is
          not accessible with your current permissions.
        </p>

        <Link
          to="/dashboard"
          className="mt-6 inline-flex h-10 items-center gap-2 rounded-md bg-emerald-600 px-4 text-[13px] font-semibold text-white transition-colors hover:bg-emerald-700 focus:outline-none focus-visible:ring-2 focus-visible:ring-emerald-500 focus-visible:ring-offset-2 focus-visible:ring-offset-slate-900"
        >
          Back to Dashboard
          <ArrowRight className="h-4 w-4" aria-hidden="true" />
        </Link>

        <p className="mt-6 text-[11px] text-slate-500">
          BidSentinel · GeM Compliance Platform
        </p>
      </div>
    </div>
  );
}

/* ================================================================== */
/*  APP                                                               */
/* ================================================================== */

export default function App() {
  return (
    <BrowserRouter>
      <Routes>
        {/* ---------- Standalone auth routes (outside AppLayout) ---------- */}
        <Route path="/login" element={<Login />} />
        <Route path="/register" element={<Register />} />

        {/* ---------- Application shell routes (nested in AppLayout) ---------- */}
        <Route element={<AppLayout />}>
          {/* Root redirect */}
          <Route path="/" element={<Navigate to="/dashboard" replace />} />

          {/* Dashboard */}
          <Route path="/dashboard" element={<Dashboard />} />

          {/* Tenders — static before dynamic */}
          <Route path="/tenders" element={<Tenders />} />
          <Route path="/tenders/create" element={<CreateTender />} />
          <Route path="/tenders/:id" element={<TenderDetails />} />

          {/* Bids — static segment before dynamic segment */}
          <Route path="/bids" element={<Bids />} />
          <Route path="/bids/:id" element={<BidDetails />} />
          <Route path="/bids/:id/upload" element={<UploadDocuments />} />

          {/* Compliance — specific requirements path before generic bid path */}
          <Route path="/compliance" element={<Compliance />} />
          <Route
            path="/compliance/requirements/:id"
            element={<RequirementDetails />}
          />
          <Route path="/compliance/:bidId" element={<ComplianceResults />} />

          {/* Review queue */}
          <Route path="/review" element={<ReviewCases />} />

          {/* Reports & analytics */}
          <Route path="/reports" element={<Reports />} />
        </Route>

        {/* ---------- Catch-all 404 ---------- */}
        <Route path="*" element={<NotFound />} />
      </Routes>
    </BrowserRouter>
  );
}