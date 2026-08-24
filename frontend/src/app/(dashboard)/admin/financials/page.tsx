'use client';

import React, { useEffect, useState } from 'react';
import Link from 'next/link';
import { Navbar } from '../../../../components/layout/Navbar';
import { Footer } from '../../../../components/layout/Footer';
import { Card } from '../../../../components/ui/Card';
import { Button } from '../../../../components/ui/Button';
import { Input } from '../../../../components/ui/Input';
import { TransactionTable } from '../../../../components/financial/TransactionTable';
import { apiClient } from '../../../../lib/api-client';
import {
  DollarSign,
  TrendingUp,
  Sliders,
  Wallet,
  FileText,
  Search,
  ChevronLeft,
  ChevronRight,
  ShieldCheck,
} from 'lucide-react';

export default function AdminFinancialsPage() {
  const [activeTab, setActiveTab] = useState<'SUMMARY' | 'SETTINGS' | 'WALLETS' | 'LEDGER'>('SUMMARY');
  const [summary, setSummary] = useState<any>(null);
  const [wallets, setWallets] = useState<any[]>([]);
  const [ledger, setLedger] = useState<any[]>([]);

  // Settings Form State
  const [commissionPct, setCommissionPct] = useState<number>(20);
  const [gstPct, setGstPct] = useState<number>(18);
  const [minWithdrawal, setMinWithdrawal] = useState<number>(500);
  const [invoicePrefix, setInvoicePrefix] = useState<string>('INV');

  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [msg, setMsg] = useState<string | null>(null);

  const fetchFinancials = async () => {
    try {
      setIsLoading(true);
      const [sumRes, settRes]: any = await Promise.all([
        apiClient.get('/admin/financial-summary'),
        apiClient.get('/admin/financial-settings'),
      ]);

      if (sumRes?.data) setSummary(sumRes.data);
      if (settRes?.data) {
        setCommissionPct(settRes.data.commissionPercentage || 20);
        setGstPct(settRes.data.gstPercentage || 18);
        setMinWithdrawal(settRes.data.minWithdrawalAmount || 500);
        setInvoicePrefix(settRes.data.invoicePrefix || 'INV');
      }
    } catch (e) {
      // Fallback
    } finally {
      setIsLoading(false);
    }
  };

  const fetchWallets = async () => {
    try {
      const res: any = await apiClient.get('/admin/wallets?limit=20');
      if (res?.data) setWallets(res.data);
    } catch (e) {
      setWallets([]);
    }
  };

  const fetchLedger = async () => {
    try {
      const res: any = await apiClient.get('/admin/ledger?limit=30');
      if (res?.data) setLedger(res.data);
    } catch (e) {
      setLedger([]);
    }
  };

  useEffect(() => {
    fetchFinancials();
  }, []);

  useEffect(() => {
    if (activeTab === 'WALLETS') fetchWallets();
    if (activeTab === 'LEDGER') fetchLedger();
  }, [activeTab]);

  const handleSaveSettings = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      setIsSaving(true);
      setMsg(null);
      await apiClient.put('/admin/financial-settings', {
        commissionPercentage: Number(commissionPct),
        gstPercentage: Number(gstPct),
        minWithdrawalAmount: Number(minWithdrawal),
        invoicePrefix,
      });
      setMsg('Platform financial settings updated successfully!');
      fetchFinancials();
    } catch (e: any) {
      setMsg(e?.error?.message || 'Failed to update settings');
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
                <DollarSign className="h-6 w-6 text-purple-600" /> Financial Foundation Control Center
              </h1>
              <p className="text-xs text-[#71717A] mt-0.5">
                Audit system wallets, platform revenue settings, immutable ledger events, and invoice metrics.
              </p>
            </div>

            <div className="flex items-center gap-2">
              <Link href="/admin/dashboard">
                <Button size="sm" variant="outline">&larr; Admin Dashboard</Button>
              </Link>
            </div>
          </div>

          {/* Submenu Tabs */}
          <div className="flex items-center gap-2 border-b border-[#E4E4E7] pb-3 overflow-x-auto">
            <button
              onClick={() => setActiveTab('SUMMARY')}
              className={`rounded-lg px-3.5 py-1.5 text-xs font-bold transition-all ${
                activeTab === 'SUMMARY'
                  ? 'bg-zinc-900 text-white shadow-sm'
                  : 'bg-white text-zinc-700 hover:bg-slate-100 border border-[#E4E4E7]'
              }`}
            >
              Financial Summary
            </button>
            <button
              onClick={() => setActiveTab('SETTINGS')}
              className={`rounded-lg px-3.5 py-1.5 text-xs font-bold transition-all ${
                activeTab === 'SETTINGS'
                  ? 'bg-zinc-900 text-white shadow-sm'
                  : 'bg-white text-zinc-700 hover:bg-slate-100 border border-[#E4E4E7]'
              }`}
            >
              Commission & Settings
            </button>
            <button
              onClick={() => setActiveTab('WALLETS')}
              className={`rounded-lg px-3.5 py-1.5 text-xs font-bold transition-all ${
                activeTab === 'WALLETS'
                  ? 'bg-zinc-900 text-white shadow-sm'
                  : 'bg-white text-zinc-700 hover:bg-slate-100 border border-[#E4E4E7]'
              }`}
            >
              Wallets Viewer
            </button>
            <button
              onClick={() => setActiveTab('LEDGER')}
              className={`rounded-lg px-3.5 py-1.5 text-xs font-bold transition-all ${
                activeTab === 'LEDGER'
                  ? 'bg-zinc-900 text-white shadow-sm'
                  : 'bg-white text-zinc-700 hover:bg-slate-100 border border-[#E4E4E7]'
              }`}
            >
              Ledger Explorer
            </button>
          </div>

          {msg && (
            <div className="rounded-lg bg-green-50 p-3 text-xs font-bold text-[#16A34A] border border-green-200">
              {msg}
            </div>
          )}

          {/* TAB 1: FINANCIAL SUMMARY */}
          {activeTab === 'SUMMARY' && (
            <div className="space-y-6">
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
                <Card className="p-5 space-y-2 bg-gradient-to-br from-zinc-900 to-zinc-950 text-white shadow-lg">
                  <span className="text-xs font-bold uppercase tracking-wider text-orange-400">Total System Volume</span>
                  <h3 className="text-2xl font-black">₹{summary?.totalTransactionVolume?.toFixed(2) || '0.00'}</h3>
                  <p className="text-[11px] text-zinc-400">Aggregate ledger volume</p>
                </Card>

                <Card className="p-5 space-y-2 bg-white">
                  <span className="text-xs font-bold uppercase tracking-wider text-[#71717A]">Active Wallets</span>
                  <h3 className="text-2xl font-black text-zinc-900">{summary?.totalWallets || 0}</h3>
                  <p className="text-[11px] text-zinc-500">Auto-created user wallets</p>
                </Card>

                <Card className="p-5 space-y-2 bg-white">
                  <span className="text-xs font-bold uppercase tracking-wider text-[#71717A]">Current Platform Commission Rate</span>
                  <h3 className="text-2xl font-black text-[#C2410C]">{summary?.settings?.commissionPercentage || 20}%</h3>
                  <p className="text-[11px] text-zinc-500">Configured revenue take-rate</p>
                </Card>

                <Card className="p-5 space-y-2 bg-white">
                  <span className="text-xs font-bold uppercase tracking-wider text-[#71717A]">Total Invoices Generated</span>
                  <h3 className="text-2xl font-black text-purple-700">{summary?.totalInvoices || 0}</h3>
                  <p className="text-[11px] text-zinc-500">Sequence prefix: {summary?.settings?.invoicePrefix || 'INV'}</p>
                </Card>
              </div>
            </div>
          )}

          {/* TAB 2: PLATFORM SETTINGS */}
          {activeTab === 'SETTINGS' && (
            <Card className="max-w-2xl p-6 space-y-5 bg-white shadow-md">
              <h3 className="text-base font-bold text-zinc-900 border-b border-[#E4E4E7] pb-3 flex items-center gap-2">
                <Sliders className="h-5 w-5 text-[#C2410C]" /> Configure Platform Financial Rules
              </h3>

              <form onSubmit={handleSaveSettings} className="space-y-4">
                <Input
                  label="Platform Commission Fee (%)"
                  type="number"
                  placeholder="20"
                  value={commissionPct}
                  onChange={(e) => setCommissionPct(Number(e.target.value))}
                  required
                />

                <Input
                  label="GST Tax Rate (%)"
                  type="number"
                  placeholder="18"
                  value={gstPct}
                  onChange={(e) => setGstPct(Number(e.target.value))}
                  required
                />

                <Input
                  label="Minimum Withdrawal Threshold (₹)"
                  type="number"
                  placeholder="500"
                  value={minWithdrawal}
                  onChange={(e) => setMinWithdrawal(Number(e.target.value))}
                  required
                />

                <Input
                  label="Invoice Number Sequence Prefix"
                  placeholder="INV"
                  value={invoicePrefix}
                  onChange={(e) => setInvoicePrefix(e.target.value)}
                  required
                />

                <Button type="submit" isLoading={isSaving} className="w-full bg-[#C2410C] hover:bg-[#9A3412]">
                  Save Platform Financial Settings
                </Button>
              </form>
            </Card>
          )}

          {/* TAB 3: WALLETS VIEWER */}
          {activeTab === 'WALLETS' && (
            <Card className="p-0 overflow-hidden shadow-md">
              <table className="w-full text-left text-xs">
                <thead className="bg-slate-50 text-[#71717A] font-bold uppercase border-b border-[#E4E4E7]">
                  <tr>
                    <th className="px-4 py-3">User Email</th>
                    <th className="px-4 py-3">Role</th>
                    <th className="px-4 py-3">Balance</th>
                    <th className="px-4 py-3">Pending Balance</th>
                    <th className="px-4 py-3">Withdrawable</th>
                    <th className="px-4 py-3 text-right">Lifetime Credits</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-[#E4E4E7] bg-white">
                  {wallets.length === 0 ? (
                    <tr>
                      <td colSpan={6} className="px-4 py-6 text-center text-zinc-500">
                        No user wallets found.
                      </td>
                    </tr>
                  ) : (
                    wallets.map((w) => (
                      <tr key={w.id} className="hover:bg-slate-50">
                        <td className="px-4 py-3 font-bold text-zinc-900">{w.user?.email}</td>
                        <td className="px-4 py-3">
                          <span className="rounded-full bg-slate-100 px-2 py-0.5 font-bold text-[10px] text-zinc-800">
                            {w.user?.role}
                          </span>
                        </td>
                        <td className="px-4 py-3 font-bold text-zinc-900">₹{w.balance.toFixed(2)}</td>
                        <td className="px-4 py-3 text-zinc-700">₹{w.pendingBalance.toFixed(2)}</td>
                        <td className="px-4 py-3 text-green-700 font-bold">₹{w.withdrawableBalance.toFixed(2)}</td>
                        <td className="px-4 py-3 text-right font-mono text-zinc-800">₹{w.lifetimeCredits.toFixed(2)}</td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </Card>
          )}

          {/* TAB 4: IMMUTABLE LEDGER EXPLORER */}
          {activeTab === 'LEDGER' && (
            <TransactionTable transactions={ledger} isLoading={isLoading} />
          )}
        </div>
      </main>

      <Footer />
    </div>
  );
}
