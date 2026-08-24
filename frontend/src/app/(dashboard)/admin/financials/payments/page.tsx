'use client';

import React, { useEffect, useState } from 'react';
import Link from 'next/link';
import { Navbar } from '../../../../../components/layout/Navbar';
import { Footer } from '../../../../../components/layout/Footer';
import { Card } from '../../../../../components/ui/Card';
import { Button } from '../../../../../components/ui/Button';
import { apiClient } from '../../../../../lib/api-client';
import { PaymentStatus } from '../../../../../types';
import {
  CreditCard,
  Search,
  ChevronLeft,
  ChevronRight,
  ShieldCheck,
  CheckCircle2,
  XCircle,
  FileText,
  X,
} from 'lucide-react';

export default function AdminPaymentsPage() {
  const [payments, setPayments] = useState<any[]>([]);
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('');
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [isLoading, setIsLoading] = useState(true);

  // Gateway Response Modal State
  const [selectedPayment, setSelectedPayment] = useState<any | null>(null);

  const fetchPayments = async () => {
    try {
      setIsLoading(true);
      const params = new URLSearchParams();
      if (search) params.set('search', search);
      if (statusFilter) params.set('status', statusFilter);
      params.set('page', String(page));
      params.set('limit', '10');

      const res: any = await apiClient.get(`/payments/admin?${params.toString()}`);
      if (res?.data) {
        setPayments(res.data);
        setTotalPages(res.meta?.totalPages || 1);
      }
    } catch (e) {
      setPayments([]);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchPayments();
  }, [search, statusFilter, page]);

  return (
    <div className="flex min-h-screen flex-col bg-[#F8FAFC]">
      <Navbar />

      <main className="flex-1 py-8">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 space-y-6">
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-[#E4E4E7] pb-4">
            <div>
              <h1 className="text-2xl font-black text-zinc-900 flex items-center gap-2">
                <CreditCard className="h-6 w-6 text-[#C2410C]" /> Razorpay Payment Monitoring
              </h1>
              <p className="text-xs text-[#71717A] mt-0.5">
                Audit gateway transactions, payment order statuses, and platform commission revenues.
              </p>
            </div>
            <div className="flex items-center gap-2">
              <Link href="/admin/financials">
                <Button size="sm" variant="outline">&larr; Financial Control Center</Button>
              </Link>
            </div>
          </div>

          <Card className="p-4 flex flex-col md:flex-row gap-3">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-2.5 h-4 w-4 text-[#71717A]" />
              <input
                type="text"
                placeholder="Search by Payment Reference, Razorpay Order ID, or Payer Email..."
                value={search}
                onChange={(e) => {
                  setSearch(e.target.value);
                  setPage(1);
                }}
                className="w-full rounded-lg border border-[#E4E4E7] pl-9 pr-3 py-1.5 text-xs text-zinc-900 focus:ring-1 focus:ring-orange-500"
              />
            </div>

            <select
              value={statusFilter}
              onChange={(e) => {
                setStatusFilter(e.target.value);
                setPage(1);
              }}
              className="rounded-lg border border-[#E4E4E7] px-3 py-1.5 text-xs text-zinc-800 bg-white"
            >
              <option value="">All Payment Statuses</option>
              <option value="CAPTURED">Captured</option>
              <option value="PENDING">Pending</option>
              <option value="FAILED">Failed</option>
              <option value="REFUNDED">Refunded</option>
            </select>
          </Card>

          <Card className="p-0 overflow-hidden shadow-md">
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs">
                <thead className="bg-slate-50 text-[#71717A] font-bold uppercase border-b border-[#E4E4E7]">
                  <tr>
                    <th className="px-4 py-3">Payment Reference</th>
                    <th className="px-4 py-3">Razorpay Order ID</th>
                    <th className="px-4 py-3">Payer</th>
                    <th className="px-4 py-3">Amount</th>
                    <th className="px-4 py-3">Commission</th>
                    <th className="px-4 py-3">Status</th>
                    <th className="px-4 py-3 text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-[#E4E4E7] bg-white">
                  {isLoading ? (
                    <tr>
                      <td colSpan={7} className="px-4 py-8 text-center text-zinc-500 animate-pulse">
                        Loading gateway payments...
                      </td>
                    </tr>
                  ) : payments.length === 0 ? (
                    <tr>
                      <td colSpan={7} className="px-4 py-8 text-center text-zinc-500">
                        No payments found matching search criteria.
                      </td>
                    </tr>
                  ) : (
                    payments.map((p) => (
                      <tr key={p.id} className="hover:bg-slate-50">
                        <td className="px-4 py-3 font-mono font-bold text-zinc-900">{p.referenceCode}</td>
                        <td className="px-4 py-3 font-mono text-zinc-600">{p.razorpayOrderId || 'N/A'}</td>
                        <td className="px-4 py-3 font-semibold text-zinc-900">{p.payer?.email}</td>
                        <td className="px-4 py-3 font-bold text-zinc-900">₹{p.amount.toFixed(2)}</td>
                        <td className="px-4 py-3 text-[#C2410C] font-bold">₹{p.platformCommission.toFixed(2)}</td>
                        <td className="px-4 py-3">
                          <span
                            className={`inline-flex rounded-full px-2.5 py-0.5 text-[10px] font-bold ${
                              p.status === 'CAPTURED'
                                ? 'bg-green-100 text-green-800'
                                : p.status === 'PENDING'
                                ? 'bg-amber-100 text-amber-800'
                                : 'bg-red-100 text-red-800'
                            }`}
                          >
                            {p.status}
                          </span>
                        </td>
                        <td className="px-4 py-3 text-right">
                          <Button size="sm" variant="outline" onClick={() => setSelectedPayment(p)}>
                            Inspect Details
                          </Button>
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
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

      {/* Gateway Response Modal */}
      {selectedPayment && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
          <Card className="w-full max-w-lg p-6 space-y-4 bg-white relative shadow-2xl max-h-[90vh] overflow-y-auto">
            <button
              onClick={() => setSelectedPayment(null)}
              className="absolute right-4 top-4 text-zinc-400 hover:text-zinc-700"
            >
              <X className="h-5 w-5" />
            </button>

            <h3 className="text-base font-bold text-zinc-900">
              Payment Gateway Audit: {selectedPayment.referenceCode}
            </h3>

            <div className="space-y-2 text-xs">
              <div className="flex justify-between">
                <span className="text-[#71717A]">Razorpay Payment ID:</span>
                <span className="font-mono font-bold text-zinc-900">
                  {selectedPayment.razorpayPaymentId || 'N/A'}
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-[#71717A]">Interviewer Amount:</span>
                <span className="font-bold text-green-700">₹{selectedPayment.interviewerAmount.toFixed(2)}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-[#71717A]">Platform Commission:</span>
                <span className="font-bold text-[#C2410C]">₹{selectedPayment.platformCommission.toFixed(2)}</span>
              </div>
            </div>

            <div>
              <span className="block text-xs font-bold uppercase text-zinc-700 mb-1">
                Raw Gateway Response
              </span>
              <pre className="bg-slate-900 text-green-400 p-3 rounded-lg text-[10px] overflow-x-auto max-h-48">
                {JSON.stringify(selectedPayment.gatewayResponse || { status: 'PENDING' }, null, 2)}
              </pre>
            </div>
          </Card>
        </div>
      )}

      <Footer />
    </div>
  );
}
