'use client';

import React, { useEffect, useState } from 'react';
import Link from 'next/link';
import { Navbar } from '../../../../components/layout/Navbar';
import { Footer } from '../../../../components/layout/Footer';
import { Card } from '../../../../components/ui/Card';
import { Button } from '../../../../components/ui/Button';
import { apiClient } from '../../../../lib/api-client';
import {
  Sliders,
  AlertTriangle,
  Globe,
  CheckCircle2,
  ChevronLeft,
} from 'lucide-react';

export default function AdminSettingsPage() {
  const [maintenanceMode, setMaintenanceMode] = useState(false);
  const [announcementBanner, setAnnouncementBanner] = useState('');
  const [seoTitle, setSeoTitle] = useState('');
  const [seoDescription, setSeoDescription] = useState('');
  const [commissionPercentage, setCommissionPercentage] = useState('20.0');
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [msg, setMsg] = useState<string | null>(null);

  const fetchSettings = async () => {
    try {
      setIsLoading(true);
      const res: any = await apiClient.get('/platform-settings');
      if (res?.data) {
        setMaintenanceMode(res.data.maintenanceMode || false);
        setAnnouncementBanner(res.data.announcementBanner || '');
        setSeoTitle(res.data.seoTitle || '');
        setSeoDescription(res.data.seoDescription || '');
        setCommissionPercentage(String(res.data.commissionPercentage || 20.0));
      }
    } catch (e) {
      // Fallback
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchSettings();
  }, []);

  const handleSaveSettings = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      setIsSaving(true);
      setMsg(null);
      await apiClient.patch('/platform-settings/admin', {
        maintenanceMode,
        announcementBanner,
        seoTitle,
        seoDescription,
        commissionPercentage: Number(commissionPercentage),
      });
      setMsg('Platform settings updated successfully!');
      fetchSettings();
    } catch (err: any) {
      setMsg(err?.error?.message || 'Failed to update platform settings.');
    } finally {
      setIsSaving(false);
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
                <Sliders className="h-6 w-6 text-[#C2410C]" /> Global Platform Settings & Maintenance Control
              </h1>
              <p className="text-xs text-[#71717A] mt-0.5">
                Manage feature flags, site-wide announcement banners, maintenance mode, and SEO metadata.
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

          <Card className="p-6 space-y-6 bg-white shadow-md border-[#E4E4E7]">
            <form onSubmit={handleSaveSettings} className="space-y-5 text-xs">
              {/* Maintenance Mode Toggle */}
              <div className="flex items-center justify-between p-4 rounded-xl bg-amber-50 border border-amber-200">
                <div>
                  <h3 className="font-bold text-zinc-900 text-sm flex items-center gap-1.5">
                    <AlertTriangle className="h-4 w-4 text-amber-600" /> Platform Maintenance Mode
                  </h3>
                  <p className="text-xs text-amber-800">
                    When enabled, non-admin users will see a maintenance notice.
                  </p>
                </div>
                <input
                  type="checkbox"
                  checked={maintenanceMode}
                  onChange={(e) => setMaintenanceMode(e.target.checked)}
                  className="h-5 w-5 rounded border-amber-300 text-orange-600 focus:ring-orange-500"
                />
              </div>

              {/* Announcement Banner */}
              <div>
                <label className="block text-[11px] font-bold text-zinc-700 uppercase mb-1">
                  Global Announcement Banner Message
                </label>
                <input
                  type="text"
                  placeholder="e.g. ⚡ Special Offer: Use code ROUNDIQ10 for 10% off your mock session!"
                  value={announcementBanner}
                  onChange={(e) => setAnnouncementBanner(e.target.value)}
                  className="w-full rounded-lg border border-[#E4E4E7] p-2.5 text-xs text-zinc-900 focus:ring-1 focus:ring-orange-500"
                />
              </div>

              {/* Platform Commission Rate */}
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-[11px] font-bold text-zinc-700 uppercase mb-1">
                    Platform Commission Rate (%)
                  </label>
                  <input
                    type="number"
                    value={commissionPercentage}
                    onChange={(e) => setCommissionPercentage(e.target.value)}
                    className="w-full rounded-lg border border-[#E4E4E7] p-2.5 font-bold text-zinc-900"
                  />
                </div>
              </div>

              {/* SEO Settings */}
              <div className="space-y-3 pt-3 border-t border-[#E4E4E7]">
                <h3 className="text-xs font-bold text-zinc-900 uppercase tracking-wider flex items-center gap-1.5">
                  <Globe className="h-4 w-4 text-[#C2410C]" /> Global SEO Metadata
                </h3>

                <div>
                  <label className="block text-[11px] font-bold text-zinc-700 uppercase mb-1">SEO Title</label>
                  <input
                    type="text"
                    value={seoTitle}
                    onChange={(e) => setSeoTitle(e.target.value)}
                    className="w-full rounded-lg border border-[#E4E4E7] p-2 text-xs"
                  />
                </div>

                <div>
                  <label className="block text-[11px] font-bold text-zinc-700 uppercase mb-1">SEO Description</label>
                  <textarea
                    rows={3}
                    value={seoDescription}
                    onChange={(e) => setSeoDescription(e.target.value)}
                    className="w-full rounded-lg border border-[#E4E4E7] p-2 text-xs"
                  />
                </div>
              </div>

              <div className="pt-4 flex justify-end">
                <Button type="submit" className="bg-[#C2410C] text-white font-bold" isLoading={isSaving}>
                  Save Platform Settings
                </Button>
              </div>
            </form>
          </Card>
        </div>
      </main>

      <Footer />
    </div>
  );
}
