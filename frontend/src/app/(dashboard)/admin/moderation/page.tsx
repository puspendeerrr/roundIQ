'use client';

import React, { useEffect, useState } from 'react';
import Link from 'next/link';
import { Navbar } from '../../../../components/layout/Navbar';
import { Footer } from '../../../../components/layout/Footer';
import { Card } from '../../../../components/ui/Card';
import { Button } from '../../../../components/ui/Button';
import { apiClient } from '../../../../lib/api-client';
import {
  ShieldCheck,
  AlertTriangle,
  CheckCircle2,
  XCircle,
  EyeOff,
  Trash2,
  ChevronLeft,
  ChevronRight,
} from 'lucide-react';

export default function AdminModerationPage() {
  const [reports, setReports] = useState<any[]>([]);
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [isLoading, setIsLoading] = useState(true);
  const [msg, setMsg] = useState<string | null>(null);

  const fetchReports = async () => {
    try {
      setIsLoading(true);
      const res: any = await apiClient.get(`/admin/moderation?page=${page}&limit=10`);
      if (res?.data) {
        setReports(res.data);
        setTotalPages(res.meta?.totalPages || 1);
      }
    } catch (e) {
      setReports([]);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchReports();
  }, [page]);

  const handleResolveReport = async (reportId: string, action: 'HIDE' | 'REMOVE' | 'DISMISS') => {
    try {
      setMsg(null);
      await apiClient.patch(`/admin/moderation/${reportId}`, { action });
      setMsg(`Report ${reportId} resolved with action: ${action}`);
      fetchReports();
    } catch (err: any) {
      setMsg(err?.error?.message || 'Failed to resolve moderation report.');
    }
  };

  return (
    <div className="flex min-h-screen flex-col bg-[#F8FAFC]">
      <Navbar />

      <main className="flex-1 py-8">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 space-y-6">
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-[#E4E4E7] pb-4">
            <div>
              <h1 className="text-2xl font-black text-zinc-900 flex items-center gap-2">
                <AlertTriangle className="h-6 w-6 text-[#C2410C]" /> Review Moderation Control Center
              </h1>
              <p className="text-xs text-[#71717A] mt-0.5">
                Review flagged user reviews, enforce community guidelines, and hide/remove policy-violating content.
              </p>
            </div>

            <div className="flex items-center gap-2">
              <Link href="/admin/dashboard">
                <Button size="sm" variant="outline">&larr; Admin Dashboard</Button>
              </Link>
            </div>
          </div>

          {msg && (
            <div className="rounded-lg bg-green-50 p-3 text-xs font-bold text-[#16A34A] border border-green-200">
              {msg}
            </div>
          )}

          <Card className="p-0 overflow-hidden shadow-md">
            <table className="w-full text-left text-xs">
              <thead className="bg-slate-50 text-[#71717A] font-bold uppercase border-b border-[#E4E4E7]">
                <tr>
                  <th className="px-4 py-3">Report ID</th>
                  <th className="px-4 py-3">Reporter</th>
                  <th className="px-4 py-3">Flagged Review Content</th>
                  <th className="px-4 py-3">Reason</th>
                  <th className="px-4 py-3">Status</th>
                  <th className="px-4 py-3 text-right">Moderation Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[#E4E4E7] bg-white">
                {isLoading ? (
                  <tr>
                    <td colSpan={6} className="px-4 py-8 text-center text-zinc-500 animate-pulse">
                      Loading moderation queue...
                    </td>
                  </tr>
                ) : reports.length === 0 ? (
                  <tr>
                    <td colSpan={6} className="px-4 py-8 text-center text-zinc-500 italic">
                      No review moderation reports flagged. Community reviews are clean.
                    </td>
                  </tr>
                ) : (
                  reports.map((rep) => (
                    <tr key={rep.id} className="hover:bg-slate-50">
                      <td className="px-4 py-3 font-mono font-bold text-zinc-900 truncate max-w-[120px]">
                        {rep.id}
                      </td>
                      <td className="px-4 py-3 font-semibold text-zinc-800">{rep.reporter?.email}</td>
                      <td className="px-4 py-3 text-zinc-700 max-w-xs truncate">
                        "{rep.review?.review || 'Review'}"
                      </td>
                      <td className="px-4 py-3 text-amber-800 font-medium max-w-xs truncate">
                        {rep.reason}
                      </td>
                      <td className="px-4 py-3">
                        <span
                          className={`inline-flex rounded-full px-2.5 py-0.5 text-[10px] font-bold ${
                            rep.status === 'RESOLVED'
                              ? 'bg-green-100 text-green-800'
                              : 'bg-amber-100 text-amber-800'
                          }`}
                        >
                          {rep.status}
                        </span>
                      </td>
                      <td className="px-4 py-3 text-right space-x-2">
                        {rep.status === 'OPEN' ? (
                          <>
                            <Button
                              size="sm"
                              variant="outline"
                              onClick={() => handleResolveReport(rep.id, 'HIDE')}
                              leftIcon={<EyeOff className="h-3.5 w-3.5" />}
                            >
                              Hide Review
                            </Button>
                            <Button
                              size="sm"
                              className="bg-red-700 hover:bg-red-800 text-white"
                              onClick={() => handleResolveReport(rep.id, 'REMOVE')}
                              leftIcon={<Trash2 className="h-3.5 w-3.5" />}
                            >
                              Remove
                            </Button>
                            <Button
                              size="sm"
                              variant="ghost"
                              onClick={() => handleResolveReport(rep.id, 'DISMISS')}
                            >
                              Dismiss
                            </Button>
                          </>
                        ) : (
                          <span className="text-[11px] text-zinc-500 font-semibold italic">
                            Resolved
                          </span>
                        )}
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </Card>

          {/* Pagination */}
          {totalPages > 1 && (
            <div className="flex items-center justify-center gap-2 pt-2">
              <Button
                variant="outline"
                size="sm"
                disabled={page === 1}
                onClick={() => setPage(page - 1)}
                leftIcon={<ChevronLeft className="h-4 w-4" />}
              >
                Previous
              </Button>
              <span className="text-xs font-semibold text-zinc-700 px-3">
                Page {page} of {totalPages}
              </span>
              <Button
                variant="outline"
                size="sm"
                disabled={page === totalPages}
                onClick={() => setPage(page + 1)}
                rightIcon={<ChevronRight className="h-4 w-4" />}
              >
                Next
              </Button>
            </div>
          )}
        </div>
      </main>

      <Footer />
    </div>
  );
}
