'use client';

import React, { useEffect, useState } from 'react';
import Link from 'next/link';
import { Navbar } from '../../../../components/layout/Navbar';
import { Footer } from '../../../../components/layout/Footer';
import { Card } from '../../../../components/ui/Card';
import { Button } from '../../../../components/ui/Button';
import { Input } from '../../../../components/ui/Input';
import { apiClient } from '../../../../lib/api-client';
import { PayoutMethod, WithdrawalStatus } from '../../../../types';
import {
  Wallet,
  ArrowUpRight,
  ShieldCheck,
  Clock,
  ChevronLeft,
  ChevronRight,
  CheckCircle2,
  AlertCircle,
  X,
  PlusCircle,
  Building,
} from 'lucide-react';

export default function InterviewerWithdrawalsPage() {
  const [walletSummary, setWalletSummary] = useState<any>(null);
  const [withdrawals, setWithdrawals] = useState<any[]>([]);
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [isLoading, setIsLoading] = useState(true);

  // Request Modal State
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [amount, setAmount] = useState<number>(500);
  const [method, setMethod] = useState<PayoutMethod>('UPI');
  const [upiId, setUpiId] = useState('');
  const [accountNumber, setAccountNumber] = useState('');
  const [ifscCode, setIfscCode] = useState('');
  const [accountHolderName, setAccountHolderName] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [modalMsg, setModalMsg] = useState<string | null>(null);

  const fetchWithdrawalData = async () => {
    try {
      setIsLoading(true);
      const [sumRes, wdRes]: any = await Promise.all([
        apiClient.get('/wallet/summary'),
        apiClient.get(`/withdrawals/me?page=${page}&limit=10`),
      ]);

      if (sumRes?.data) setWalletSummary(sumRes.data);
      if (wdRes?.data) {
        setWithdrawals(wdRes.data);
        setTotalPages(wdRes.meta?.totalPages || 1);
      }
    } catch (e) {
      setWithdrawals([]);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchWithdrawalData();
  }, [page]);

  const handleSubmitRequest = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      setIsSubmitting(true);
      setModalMsg(null);

      const accountDetails =
        method === 'UPI'
          ? { upiId }
          : { accountNumber, ifscCode, accountHolderName };

      await apiClient.post('/withdrawals', {
        amount: Number(amount),
        method,
        accountDetails,
      });

      setModalMsg('Withdrawal request submitted successfully!');
      setIsModalOpen(false);
      fetchWithdrawalData();
    } catch (err: any) {
      setModalMsg(err?.error?.message || 'Failed to submit withdrawal request.');
    } finally {
      setIsSubmitting(false);
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
                <ArrowUpRight className="h-6 w-6 text-[#C2410C]" /> Interviewer Payouts & Withdrawals
              </h1>
              <p className="text-xs text-[#71717A] mt-0.5">
                Request payouts from your withdrawable earnings balance via Bank Transfer or UPI.
              </p>
            </div>

            <div className="flex items-center gap-2">
              <Link href="/interviewer/wallet">
                <Button size="sm" variant="outline">&larr; Wallet & Earnings</Button>
              </Link>
              <Button
                size="sm"
                className="bg-[#C2410C] hover:bg-[#9A3412] text-white"
                onClick={() => setIsModalOpen(true)}
                leftIcon={<PlusCircle className="h-4 w-4" />}
              >
                Request Payout
              </Button>
            </div>
          </div>

          {/* Balance Metric Cards */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <Card className="p-6 space-y-2 bg-gradient-to-br from-zinc-900 to-zinc-950 text-white shadow-lg">
              <span className="text-xs font-bold uppercase tracking-wider text-green-400">
                Withdrawable Earnings
              </span>
              <h3 className="text-3xl font-black">
                ₹{walletSummary?.withdrawableBalance?.toFixed(2) || '0.00'}
              </h3>
              <p className="text-[11px] text-zinc-400">Earnings from completed mock sessions</p>
            </Card>

            <Card className="p-6 space-y-2 bg-white">
              <span className="text-xs font-bold uppercase tracking-wider text-[#71717A]">
                Pending Session Earnings
              </span>
              <h3 className="text-3xl font-black text-zinc-900">
                ₹{walletSummary?.pendingBalance?.toFixed(2) || '0.00'}
              </h3>
              <p className="text-[11px] text-zinc-500">Confirmed sessions awaiting completion</p>
            </Card>

            <Card className="p-6 space-y-2 bg-white">
              <span className="text-xs font-bold uppercase tracking-wider text-[#71717A]">
                Minimum Payout Threshold
              </span>
              <h3 className="text-3xl font-black text-[#C2410C]">₹500.00</h3>
              <p className="text-[11px] text-zinc-500">Configured in platform settings</p>
            </Card>
          </div>

          {/* Withdrawal History Table */}
          <div className="space-y-4">
            <h2 className="text-base font-bold text-zinc-900">Withdrawal Request History</h2>

            <Card className="p-0 overflow-hidden shadow-md">
              <table className="w-full text-left text-xs">
                <thead className="bg-slate-50 text-[#71717A] font-bold uppercase border-b border-[#E4E4E7]">
                  <tr>
                    <th className="px-4 py-3">Reference</th>
                    <th className="px-4 py-3">Amount</th>
                    <th className="px-4 py-3">Payout Method</th>
                    <th className="px-4 py-3">Status</th>
                    <th className="px-4 py-3">Admin Remarks</th>
                    <th className="px-4 py-3 text-right">Requested At</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-[#E4E4E7] bg-white">
                  {isLoading ? (
                    <tr>
                      <td colSpan={6} className="px-4 py-8 text-center text-zinc-500 animate-pulse">
                        Loading withdrawal history...
                      </td>
                    </tr>
                  ) : withdrawals.length === 0 ? (
                    <tr>
                      <td colSpan={6} className="px-4 py-8 text-center text-zinc-500 italic">
                        No withdrawal requests submitted yet.
                      </td>
                    </tr>
                  ) : (
                    withdrawals.map((w) => (
                      <tr key={w.id} className="hover:bg-slate-50">
                        <td className="px-4 py-3 font-mono font-bold text-zinc-900">{w.referenceCode}</td>
                        <td className="px-4 py-3 font-bold text-zinc-900">₹{w.amount.toFixed(2)}</td>
                        <td className="px-4 py-3 font-semibold text-zinc-700">{w.method}</td>
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
                        <td className="px-4 py-3 text-zinc-600">{w.adminRemarks || 'N/A'}</td>
                        <td className="px-4 py-3 text-right text-[#71717A]">
                          {new Date(w.createdAt).toLocaleString()}
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

      {/* Payout Request Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
          <Card className="w-full max-w-md p-6 space-y-4 bg-white relative shadow-2xl">
            <button
              onClick={() => setIsModalOpen(false)}
              className="absolute right-4 top-4 text-zinc-400 hover:text-zinc-700"
            >
              <X className="h-5 w-5" />
            </button>

            <h3 className="text-base font-bold text-zinc-900 border-b border-[#E4E4E7] pb-3">
              Submit Payout Request
            </h3>

            {modalMsg && (
              <div className="rounded-lg bg-red-50 p-3 text-xs font-medium text-[#DC2626] border border-red-200">
                {modalMsg}
              </div>
            )}

            <form onSubmit={handleSubmitRequest} className="space-y-4">
              <Input
                label="Withdrawal Amount (₹)"
                type="number"
                min={500}
                placeholder="500"
                value={amount}
                onChange={(e) => setAmount(Number(e.target.value))}
                required
              />

              <div className="space-y-1">
                <label className="block text-xs font-bold uppercase text-zinc-700">Payout Method</label>
                <select
                  value={method}
                  onChange={(e) => setMethod(e.target.value as PayoutMethod)}
                  className="w-full rounded-lg border border-[#E4E4E7] p-2 text-xs text-zinc-900 bg-white"
                >
                  <option value="UPI">UPI Virtual Payment Address (VPA)</option>
                  <option value="BANK">Bank Account Direct Transfer</option>
                </select>
              </div>

              {method === 'UPI' ? (
                <Input
                  label="UPI VPA ID (e.g. interviewer@upi)"
                  placeholder="priya@okicici"
                  value={upiId}
                  onChange={(e) => setUpiId(e.target.value)}
                  required
                />
              ) : (
                <div className="space-y-3">
                  <Input
                    label="Account Holder Name"
                    placeholder="Priya Verma"
                    value={accountHolderName}
                    onChange={(e) => setAccountHolderName(e.target.value)}
                    required
                  />
                  <Input
                    label="Bank Account Number"
                    placeholder="918239120391"
                    value={accountNumber}
                    onChange={(e) => setAccountNumber(e.target.value)}
                    required
                  />
                  <Input
                    label="IFSC Code"
                    placeholder="SBIN0001234"
                    value={ifscCode}
                    onChange={(e) => setIfscCode(e.target.value)}
                    required
                  />
                </div>
              )}

              <Button type="submit" isLoading={isSubmitting} className="w-full bg-[#C2410C] hover:bg-[#9A3412]">
                Submit Payout Request
              </Button>
            </form>
          </Card>
        </div>
      )}

      <Footer />
    </div>
  );
}
