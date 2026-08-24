'use client';

import React, { useEffect, useState } from 'react';
import Link from 'next/link';
import { Navbar } from '../../../../components/layout/Navbar';
import { Footer } from '../../../../components/layout/Footer';
import { BalanceCard } from '../../../../components/financial/BalanceCard';
import { TransactionTable } from '../../../../components/financial/TransactionTable';
import { Card } from '../../../../components/ui/Card';
import { Button } from '../../../../components/ui/Button';
import { apiClient } from '../../../../lib/api-client';
import { Wallet, Clock, ShieldCheck, TrendingUp, ChevronLeft, ChevronRight } from 'lucide-react';

export default function InterviewerWalletPage() {
  const [walletSummary, setWalletSummary] = useState<any>(null);
  const [transactions, setTransactions] = useState<any[]>([]);
  const [selectedType, setSelectedType] = useState<string>('');
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [isLoading, setIsLoading] = useState(true);

  const fetchWalletData = async () => {
    try {
      setIsLoading(true);
      const [sumRes, txRes]: any = await Promise.all([
        apiClient.get('/wallet/summary'),
        apiClient.get(`/wallet/transactions?page=${page}&limit=10${selectedType ? `&type=${selectedType}` : ''}`),
      ]);

      if (sumRes?.data) setWalletSummary(sumRes.data);
      if (txRes?.data) {
        setTransactions(txRes.data);
        setTotalPages(txRes.meta?.totalPages || 1);
      }
    } catch (e) {
      setTransactions([]);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchWalletData();
  }, [selectedType, page]);

  return (
    <div className="flex min-h-screen flex-col bg-[#F8FAFC]">
      <Navbar />

      <main className="flex-1 py-8">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 space-y-6">
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-[#E4E4E7] pb-4">
            <div>
              <h1 className="text-2xl font-black text-zinc-900 flex items-center gap-2">
                <Wallet className="h-6 w-6 text-[#C2410C]" /> Interviewer Earnings & Wallet
              </h1>
              <p className="text-xs text-[#71717A] mt-0.5">
                Track pending earnings, withdrawable balance, lifetime session payouts, and ledger entries.
              </p>
            </div>

            <div className="flex items-center gap-2">
              <Link href="/interviewer/bookings">
                <Button size="sm" variant="outline">
                  Session Requests
                </Button>
              </Link>
              <Link href="/interviewer/availability">
                <Button size="sm" className="bg-[#C2410C] hover:bg-[#9A3412]">
                  Manage Schedule
                </Button>
              </Link>
            </div>
          </div>

          {/* Earnings Metric Cards */}
          <div className="grid grid-cols-1 md:grid-cols-4 gap-5">
            <BalanceCard
              title="Available Balance"
              amount={walletSummary?.balance || 0}
              type="PRIMARY"
              description="Current wallet balance"
            />
            <BalanceCard
              title="Pending Earnings"
              amount={walletSummary?.pendingBalance || 0}
              type="PENDING"
              description="Confirmed sessions awaiting interview completion"
            />
            <BalanceCard
              title="Withdrawable Balance"
              amount={walletSummary?.withdrawableBalance || 0}
              type="WITHDRAWABLE"
              description="Earnings from completed sessions ready for payout"
            />
            <BalanceCard
              title="Lifetime Earnings"
              amount={walletSummary?.lifetimeCredits || 0}
              type="LIFETIME"
              description="Total accumulated earnings from all sessions"
            />
          </div>

          {/* Ledger History */}
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <h2 className="text-base font-bold text-zinc-900">Immutable Ledger History</h2>
              <div className="flex items-center gap-2">
                {['', 'SETTLEMENT', 'CREDIT', 'COMMISSION'].map((t) => (
                  <button
                    key={t}
                    onClick={() => {
                      setSelectedType(t);
                      setPage(1);
                    }}
                    className={`rounded-lg px-3 py-1 text-xs font-bold transition-all ${
                      selectedType === t
                        ? 'bg-zinc-900 text-white shadow-sm'
                        : 'bg-white text-zinc-600 hover:bg-slate-100 border border-[#E4E4E7]'
                    }`}
                  >
                    {t === '' ? 'All Types' : t}
                  </button>
                ))}
              </div>
            </div>

            <TransactionTable transactions={transactions} isLoading={isLoading} />

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
