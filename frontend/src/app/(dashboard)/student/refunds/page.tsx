'use client';

import React, { useEffect, useState } from 'react';
import Link from 'next/link';
import { Navbar } from '../../../../components/layout/Navbar';
import { Footer } from '../../../../components/layout/Footer';
import { Card } from '../../../../components/ui/Card';
import { Button } from '../../../../components/ui/Button';
import { apiClient } from '../../../../lib/api-client';
import { RotateCcw, ShieldCheck, Clock, ChevronLeft, ChevronRight } from 'lucide-react';

export default function StudentRefundsPage() {
  const [refunds, setRefunds] = useState<any[]>([]);
  const [walletSummary, setWalletSummary] = useState<any>(null);
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [isLoading, setIsLoading] = useState(true);

  const fetchRefundData = async () => {
    try {
      setIsLoading(true);
      const [sumRes, refRes]: any = await Promise.all([
        apiClient.get('/wallet/summary'),
        apiClient.get(`/refunds/me?page=${page}&limit=10`),
      ]);

      if (sumRes?.data) setWalletSummary(sumRes.data);
      if (refRes?.data) {
        setRefunds(refRes.data);
        setTotalPages(refRes.meta?.totalPages || 1);
      }
    } catch (e) {
      setRefunds([]);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchRefundData();
  }, [page]);

  return (
    <div className="flex min-h-screen flex-col bg-[#F8FAFC]">
      <Navbar />

      <main className="flex-1 py-8">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 space-y-6">
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-[#E4E4E7] pb-4">
            <div>
              <h1 className="text-2xl font-black text-zinc-900 flex items-center gap-2">
                <RotateCcw className="h-6 w-6 text-[#C2410C]" /> Student Refund History
              </h1>
              <p className="text-xs text-[#71717A] mt-0.5">
                Track cancellation refunds and wallet credit adjustments automatically processed by policy.
              </p>
            </div>

            <div className="flex items-center gap-2">
              <Link href="/student/wallet">
                <Button size="sm" variant="outline">&larr; Student Wallet</Button>
              </Link>
            </div>
          </div>

          {/* Cancellation Policy Banner */}
          <Card className="p-6 bg-gradient-to-r from-orange-500/10 via-amber-500/10 to-orange-500/10 border border-orange-200 space-y-2">
            <h3 className="text-sm font-bold text-[#C2410C] flex items-center gap-2">
              <ShieldCheck className="h-4 w-4" /> Automated Cancellation & Refund Policy
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-xs text-zinc-700 pt-1">
              <div className="p-3 bg-white rounded-lg border border-orange-100">
                <span className="font-bold text-green-700 block mb-0.5">&gt; 48 Hours Notice</span>
                <span>100% Full Refund credited to student wallet balance.</span>
              </div>
              <div className="p-3 bg-white rounded-lg border border-orange-100">
                <span className="font-bold text-amber-700 block mb-0.5">24 – 48 Hours Notice</span>
                <span>50% Partial Refund credited to student wallet.</span>
              </div>
              <div className="p-3 bg-white rounded-lg border border-orange-100">
                <span className="font-bold text-red-700 block mb-0.5">&lt; 24 Hours Notice</span>
                <span>No refund applicable for late student cancellations.</span>
              </div>
            </div>
          </Card>

          {/* Refund History Table */}
          <div className="space-y-4">
            <h2 className="text-base font-bold text-zinc-900">Refund Transactions</h2>

            <Card className="p-0 overflow-hidden shadow-md">
              <table className="w-full text-left text-xs">
                <thead className="bg-slate-50 text-[#71717A] font-bold uppercase border-b border-[#E4E4E7]">
                  <tr>
                    <th className="px-4 py-3">Refund Reference</th>
                    <th className="px-4 py-3">Booking Code</th>
                    <th className="px-4 py-3">Amount Credited</th>
                    <th className="px-4 py-3">Reason / Policy</th>
                    <th className="px-4 py-3">Status</th>
                    <th className="px-4 py-3 text-right">Processed At</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-[#E4E4E7] bg-white">
                  {isLoading ? (
                    <tr>
                      <td colSpan={6} className="px-4 py-8 text-center text-zinc-500 animate-pulse">
                        Loading refund history...
                      </td>
                    </tr>
                  ) : refunds.length === 0 ? (
                    <tr>
                      <td colSpan={6} className="px-4 py-8 text-center text-zinc-500 italic">
                        No refund entries found.
                      </td>
                    </tr>
                  ) : (
                    refunds.map((r) => (
                      <tr key={r.id} className="hover:bg-slate-50">
                        <td className="px-4 py-3 font-mono font-bold text-zinc-900">{r.referenceCode}</td>
                        <td className="px-4 py-3 font-mono text-zinc-700">
                          {r.booking?.referenceCode || 'N/A'}
                        </td>
                        <td className="px-4 py-3 font-bold text-green-700">+₹{r.amount.toFixed(2)}</td>
                        <td className="px-4 py-3 text-zinc-600">{r.reason}</td>
                        <td className="px-4 py-3">
                          <span className="inline-flex rounded-full bg-green-100 text-green-800 px-2.5 py-0.5 text-[10px] font-bold">
                            {r.status}
                          </span>
                        </td>
                        <td className="px-4 py-3 text-right text-[#71717A]">
                          {new Date(r.createdAt).toLocaleString()}
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
        </div>
      </main>

      <Footer />
    </div>
  );
}
