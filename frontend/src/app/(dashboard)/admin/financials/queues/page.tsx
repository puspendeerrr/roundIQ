'use client';

import React, { useEffect, useState } from 'react';
import Link from 'next/link';
import { Navbar } from '../../../../../components/layout/Navbar';
import { Footer } from '../../../../../components/layout/Footer';
import { Card } from '../../../../../components/ui/Card';
import { Button } from '../../../../../components/ui/Button';
import { Input } from '../../../../../components/ui/Input';
import { apiClient } from '../../../../../lib/api-client';
import { WithdrawalStatus, RefundStatus } from '../../../../../types';
import {
  ShieldCheck,
  CheckCircle2,
  XCircle,
  Clock,
  ChevronLeft,
  ChevronRight,
  X,
  Sliders,
  RotateCcw,
  ArrowUpRight,
} from 'lucide-react';

export default function AdminFinancialQueuesPage() {
  const [activeTab, setActiveTab] = useState<'WITHDRAWALS' | 'REFUNDS'>('WITHDRAWALS');
  const [withdrawals, setWithdrawals] = useState<any[]>([]);
  const [refunds, setRefunds] = useState<any[]>([]);
  const [statusFilter, setStatusFilter] = useState<string>('');
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [isLoading, setIsLoading] = useState(true);

  // Admin Processing Modal State
  const [selectedWithdrawal, setSelectedWithdrawal] = useState<any | null>(null);
  const [newStatus, setNewStatus] = useState<WithdrawalStatus>('COMPLETED');
  const [remarks, setRemarks] = useState('');
  const [isSaving, setIsSaving] = useState(false);
  const [msg, setMsg] = useState<string | null>(null);

  const fetchQueues = async () => {
    try {
      setIsLoading(true);
      if (activeTab === 'WITHDRAWALS') {
        const res: any = await apiClient.get(
          `/admin/withdrawals?page=${page}&limit=10${statusFilter ? `&status=${statusFilter}` : ''}`
        );
        if (res?.data) {
          setWithdrawals(res.data);
          setTotalPages(res.meta?.totalPages || 1);
        }
      } else {
        const res: any = await apiClient.get(
          `/admin/refunds?page=${page}&limit=10${statusFilter ? `&status=${statusFilter}` : ''}`
        );
        if (res?.data) {
          setRefunds(res.data);
          setTotalPages(res.meta?.totalPages || 1);
        }
      }
    } catch (e) {
      if (activeTab === 'WITHDRAWALS') setWithdrawals([]);
      else setRefunds([]);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchQueues();
  }, [activeTab, statusFilter, page]);

  const handleUpdateWithdrawalStatus = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedWithdrawal) return;

    try {
      setIsSaving(true);
      setMsg(null);
      await apiClient.patch(`/admin/withdrawals/${selectedWithdrawal.id}`, {
        status: newStatus,
        adminRemarks: remarks,
      });

      setMsg(`Withdrawal ${selectedWithdrawal.referenceCode} updated to ${newStatus}`);
      setSelectedWithdrawal(null);
      fetchQueues();
    } catch (err: any) {
      setMsg(err?.error?.message || 'Failed to update withdrawal status');
    } finally {
      setIsSaving(false);
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
                <ShieldCheck className="h-6 w-6 text-[#C2410C]" /> Financial Queue & Payout Management
              </h1>
              <p className="text-xs text-[#71717A] mt-0.5">
                Approve interviewer withdrawal requests and review automated refund logs.
              </p>
            </div>

            <div className="flex items-center gap-2">
              <Link href="/admin/financials">
                <Button size="sm" variant="outline">&larr; Financial Control Center</Button>
              </Link>
            </div>
          </div>

          {msg && (
            <div className="rounded-lg bg-green-50 p-3 text-xs font-bold text-[#16A34A] border border-green-200">
              {msg}
            </div>
          )}

          {/* Submenu Tabs */}
          <div className="flex items-center justify-between border-b border-[#E4E4E7] pb-3">
            <div className="flex items-center gap-2">
              <button
                onClick={() => {
                  setActiveTab('WITHDRAWALS');
                  setStatusFilter('');
                  setPage(1);
                }}
                className={`rounded-lg px-4 py-2 text-xs font-bold transition-all flex items-center gap-1.5 ${
                  activeTab === 'WITHDRAWALS'
                    ? 'bg-zinc-900 text-white shadow-sm'
                    : 'bg-white text-zinc-700 hover:bg-slate-100 border border-[#E4E4E7]'
                }`}
              >
                <ArrowUpRight className="h-4 w-4 text-orange-400" /> Withdrawal Approval Queue
              </button>
              <button
                onClick={() => {
                  setActiveTab('REFUNDS');
                  setStatusFilter('');
                  setPage(1);
                }}
                className={`rounded-lg px-4 py-2 text-xs font-bold transition-all flex items-center gap-1.5 ${
                  activeTab === 'REFUNDS'
                    ? 'bg-zinc-900 text-white shadow-sm'
                    : 'bg-white text-zinc-700 hover:bg-slate-100 border border-[#E4E4E7]'
                }`}
              >
                <RotateCcw className="h-4 w-4 text-blue-400" /> Refund Logs Queue
              </button>
            </div>

            <select
              value={statusFilter}
              onChange={(e) => {
                setStatusFilter(e.target.value);
                setPage(1);
              }}
              className="rounded-lg border border-[#E4E4E7] px-3 py-1.5 text-xs text-zinc-800 bg-white"
            >
              <option value="">All Statuses</option>
              {activeTab === 'WITHDRAWALS' ? (
                <>
                  <option value="PENDING">Pending Review</option>
                  <option value="PROCESSING">Processing</option>
                  <option value="COMPLETED">Completed</option>
                  <option value="REJECTED">Rejected</option>
                </>
              ) : (
                <>
                  <option value="COMPLETED">Completed</option>
                  <option value="PENDING">Pending</option>
                </>
              )}
            </select>
          </div>

          {/* TAB 1: WITHDRAWAL QUEUE */}
          {activeTab === 'WITHDRAWALS' && (
            <Card className="p-0 overflow-hidden shadow-md">
              <table className="w-full text-left text-xs">
                <thead className="bg-slate-50 text-[#71717A] font-bold uppercase border-b border-[#E4E4E7]">
                  <tr>
                    <th className="px-4 py-3">Reference</th>
                    <th className="px-4 py-3">User Email</th>
                    <th className="px-4 py-3">Amount</th>
                    <th className="px-4 py-3">Method</th>
                    <th className="px-4 py-3">Account Details</th>
                    <th className="px-4 py-3">Status</th>
                    <th className="px-4 py-3 text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-[#E4E4E7] bg-white">
                  {isLoading ? (
                    <tr>
                      <td colSpan={7} className="px-4 py-8 text-center text-zinc-500 animate-pulse">
                        Loading withdrawal approval queue...
                      </td>
                    </tr>
                  ) : withdrawals.length === 0 ? (
                    <tr>
                      <td colSpan={7} className="px-4 py-8 text-center text-zinc-500 italic">
                        No pending withdrawal requests in queue.
                      </td>
                    </tr>
                  ) : (
                    withdrawals.map((w) => (
                      <tr key={w.id} className="hover:bg-slate-50">
                        <td className="px-4 py-3 font-mono font-bold text-zinc-900">{w.referenceCode}</td>
                        <td className="px-4 py-3 font-semibold text-zinc-900">{w.wallet?.user?.email}</td>
                        <td className="px-4 py-3 font-bold text-zinc-900">₹{w.amount.toFixed(2)}</td>
                        <td className="px-4 py-3 font-semibold text-zinc-700">{w.method}</td>
                        <td className="px-4 py-3 text-zinc-600 max-w-xs truncate font-mono text-[11px]">
                          {JSON.stringify(w.accountDetails)}
                        </td>
                        <td className="px-4 py-3">
                          <span
                            className={`inline-flex rounded-full px-2.5 py-0.5 text-[10px] font-bold ${
                              w.status === 'COMPLETED'
                                ? 'bg-green-100 text-green-800'
                                : w.status === 'PENDING' || w.status === 'PROCESSING'
                                ? 'bg-amber-100 text-amber-800'
                                : 'bg-red-100 text-red-800'
                            }`}
                          >
                            {w.status}
                          </span>
                        </td>
                        <td className="px-4 py-3 text-right">
                          <Button size="sm" variant="outline" onClick={() => setSelectedWithdrawal(w)}>
                            Process Payout
                          </Button>
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </Card>
          )}

          {/* TAB 2: REFUND QUEUE */}
          {activeTab === 'REFUNDS' && (
            <Card className="p-0 overflow-hidden shadow-md">
              <table className="w-full text-left text-xs">
                <thead className="bg-slate-50 text-[#71717A] font-bold uppercase border-b border-[#E4E4E7]">
                  <tr>
                    <th className="px-4 py-3">Refund Reference</th>
                    <th className="px-4 py-3">Booking Code</th>
                    <th className="px-4 py-3">Student Email</th>
                    <th className="px-4 py-3">Amount</th>
                    <th className="px-4 py-3">Reason</th>
                    <th className="px-4 py-3">Status</th>
                    <th className="px-4 py-3 text-right">Processed Date</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-[#E4E4E7] bg-white">
                  {isLoading ? (
                    <tr>
                      <td colSpan={7} className="px-4 py-8 text-center text-zinc-500 animate-pulse">
                        Loading refund logs...
                      </td>
                    </tr>
                  ) : refunds.length === 0 ? (
                    <tr>
                      <td colSpan={7} className="px-4 py-8 text-center text-zinc-500 italic">
                        No refund entries logged yet.
                      </td>
                    </tr>
                  ) : (
                    refunds.map((r) => (
                      <tr key={r.id} className="hover:bg-slate-50">
                        <td className="px-4 py-3 font-mono font-bold text-zinc-900">{r.referenceCode}</td>
                        <td className="px-4 py-3 font-mono text-zinc-700">
                          {r.booking?.referenceCode || 'N/A'}
                        </td>
                        <td className="px-4 py-3 font-semibold text-zinc-900">{r.requestedBy?.email}</td>
                        <td className="px-4 py-3 font-bold text-green-700">+₹{r.amount.toFixed(2)}</td>
                        <td className="px-4 py-3 text-zinc-600 max-w-xs truncate">{r.reason}</td>
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
          )}

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

      {/* Process Withdrawal Modal */}
      {selectedWithdrawal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
          <Card className="w-full max-w-md p-6 space-y-4 bg-white relative shadow-2xl">
            <button
              onClick={() => setSelectedWithdrawal(null)}
              className="absolute right-4 top-4 text-zinc-400 hover:text-zinc-700"
            >
              <X className="h-5 w-5" />
            </button>

            <h3 className="text-base font-bold text-zinc-900 border-b border-[#E4E4E7] pb-3">
              Process Payout: {selectedWithdrawal.referenceCode}
            </h3>

            <div className="rounded-xl bg-slate-50 p-3 text-xs space-y-1.5">
              <div className="flex justify-between">
                <span className="text-[#71717A]">Payout Amount:</span>
                <span className="font-bold text-zinc-900">₹{selectedWithdrawal.amount.toFixed(2)}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-[#71717A]">Method:</span>
                <span className="font-semibold text-zinc-800">{selectedWithdrawal.method}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-[#71717A]">Target Account:</span>
                <span className="font-mono text-[11px]">
                  {JSON.stringify(selectedWithdrawal.accountDetails)}
                </span>
              </div>
            </div>

            <form onSubmit={handleUpdateWithdrawalStatus} className="space-y-4">
              <div className="space-y-1">
                <label className="block text-xs font-bold uppercase text-zinc-700">Update Status</label>
                <select
                  value={newStatus}
                  onChange={(e) => setNewStatus(e.target.value as WithdrawalStatus)}
                  className="w-full rounded-lg border border-[#E4E4E7] p-2 text-xs text-zinc-900 bg-white"
                >
                  <option value="PROCESSING">Mark Processing</option>
                  <option value="COMPLETED">Approve & Complete Payout (Deducts Balance)</option>
                  <option value="REJECTED">Reject Payout Request</option>
                </select>
              </div>

              <Input
                label="Admin Processing Remarks"
                placeholder="Reference UTR #9812391203"
                value={remarks}
                onChange={(e) => setRemarks(e.target.value)}
              />

              <Button type="submit" isLoading={isSaving} className="w-full bg-[#C2410C] hover:bg-[#9A3412]">
                Update Payout Status
              </Button>
            </form>
          </Card>
        </div>
      )}

      <Footer />
    </div>
  );
}
