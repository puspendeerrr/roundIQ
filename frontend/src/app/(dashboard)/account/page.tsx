'use client';

import React, { useEffect, useState } from 'react';
import Link from 'next/link';
import { Navbar } from '../../../components/layout/Navbar';
import { Footer } from '../../../components/layout/Footer';
import { Card } from '../../../components/ui/Card';
import { Button } from '../../../components/ui/Button';
import { useAuth } from '../../../context/AuthContext';
import { apiClient, getApiBaseUrl } from '../../../lib/api-client';
import {
  ShieldCheck,
  Download,
  Trash2,
  Lock,
  Smartphone,
  Globe,
} from 'lucide-react';

export default function AccountSettingsPage() {
  const { user, logout } = useAuth();
  const [loginHistory, setLoginHistory] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [msg, setMsg] = useState<string | null>(null);

  useEffect(() => {
    const fetchHistory = async () => {
      try {
        setIsLoading(true);
        const res: any = await apiClient.get('/account/login-history');
        if (res?.data) setLoginHistory(res.data);
      } catch (e) {
        setLoginHistory([]);
      } finally {
        setIsLoading(false);
      }
    };

    fetchHistory();
  }, []);

  const handleExportData = () => {
    window.open(`${getApiBaseUrl()}/account/export-data`, '_blank');
  };

  const handleDeleteAccount = async () => {
    if (!confirm('Are you sure you want to delete your account? This action is compliant with GDPR right-to-be-forgotten rules.')) return;

    try {
      await apiClient.delete('/account/me');
      await logout();
    } catch (e: any) {
      setMsg(e?.error?.message || 'Failed to delete account.');
    }
  };

  return (
    <div className="flex min-h-screen flex-col bg-[#F8FAFC]">
      <Navbar />

      <main className="flex-1 py-8">
        <div className="mx-auto max-w-4xl px-4 sm:px-6 lg:px-8 space-y-6">
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-[#E4E4E7] pb-4">
            <div>
              <h1 className="text-2xl font-black text-zinc-900 flex items-center gap-2">
                <ShieldCheck className="h-6 w-6 text-[#C2410C]" /> Account Security & Data Privacy Center
              </h1>
              <p className="text-xs text-[#71717A] mt-0.5">
                Manage your security login history, GDPR data exports, active sessions, and account data deletion.
              </p>
            </div>
          </div>

          {msg && (
            <div className="rounded-lg bg-green-50 p-3 text-xs font-bold text-[#16A34A] border border-green-200">
              {msg}
            </div>
          )}

          {/* User Account Overview */}
          <Card className="p-6 space-y-3 bg-white shadow-md border-[#E4E4E7]">
            <h3 className="text-xs font-bold text-zinc-900 uppercase tracking-wider border-b border-[#E4E4E7] pb-2">
              User Profile Overview
            </h3>

            <div className="grid grid-cols-2 gap-4 text-xs">
              <div>
                <span className="text-[#71717A] block">Email Address</span>
                <span className="font-bold text-zinc-900">{user?.email}</span>
              </div>
              <div>
                <span className="text-[#71717A] block">Platform Role</span>
                <span className="font-bold text-[#C2410C]">{user?.role}</span>
              </div>
            </div>
          </Card>

          {/* GDPR Data Privacy & Export Section */}
          <Card className="p-6 space-y-4 bg-white shadow-md border-[#E4E4E7]">
            <h3 className="text-xs font-bold text-zinc-900 uppercase tracking-wider border-b border-[#E4E4E7] pb-2 flex items-center gap-2">
              <Download className="h-4 w-4 text-blue-600" /> GDPR Data Privacy & Download Rights
            </h3>

            <div className="space-y-3 text-xs">
              <p className="text-zinc-700 leading-relaxed">
                Under European Union GDPR guidelines, you have the right to download a complete machine-readable copy of your personal data stored on RoundIQ, including interview reports, reviews, wallet transactions, and booking history.
              </p>

              <Button
                size="sm"
                variant="outline"
                onClick={handleExportData}
                leftIcon={<Download className="h-4 w-4 text-blue-600" />}
              >
                Download My Personal Data Package (JSON)
              </Button>
            </div>
          </Card>

          {/* Security Login History */}
          <Card className="p-6 space-y-4 bg-white shadow-md border-[#E4E4E7]">
            <h3 className="text-xs font-bold text-zinc-900 uppercase tracking-wider border-b border-[#E4E4E7] pb-2 flex items-center gap-2">
              <Smartphone className="h-4 w-4 text-orange-600" /> Security Login History & Devices
            </h3>

            <div className="space-y-2 text-xs">
              {isLoading ? (
                <p className="text-center text-zinc-400 animate-pulse">Loading login history...</p>
              ) : loginHistory.length === 0 ? (
                <p className="text-zinc-500 italic">No recent login records found.</p>
              ) : (
                loginHistory.map((h) => (
                  <div key={h.id} className="flex justify-between items-center p-2.5 bg-slate-50 rounded-lg border border-[#E4E4E7]">
                    <div>
                      <span className="font-bold text-zinc-900 block">{h.device || 'Web Browser'}</span>
                      <span className="text-[10px] text-[#71717A]">{h.ipAddress || '127.0.0.1'}</span>
                    </div>
                    <span className="text-[11px] font-mono text-zinc-600">
                      {new Date(h.createdAt).toLocaleString()}
                    </span>
                  </div>
                ))
              )}
            </div>
          </Card>

          {/* Delete Account Right To Be Forgotten */}
          <Card className="p-6 space-y-3 bg-red-50/50 border border-red-200">
            <h3 className="text-xs font-bold text-red-900 uppercase tracking-wider flex items-center gap-2">
              <Trash2 className="h-4 w-4 text-red-600" /> Danger Zone: Delete Account
            </h3>

            <p className="text-xs text-red-800 leading-relaxed">
              Soft-delete your RoundIQ user account and revoke all active refresh tokens.
            </p>

            <Button
              size="sm"
              className="bg-red-700 hover:bg-red-800 text-white font-bold"
              onClick={handleDeleteAccount}
              leftIcon={<Trash2 className="h-4 w-4" />}
            >
              Delete My Account
            </Button>
          </Card>
        </div>
      </main>

      <Footer />
    </div>
  );
}
