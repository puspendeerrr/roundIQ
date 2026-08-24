'use client';

import React, { useEffect, useState } from 'react';
import Link from 'next/link';
import { Navbar } from '../../../../components/layout/Navbar';
import { Footer } from '../../../../components/layout/Footer';
import { Card } from '../../../../components/ui/Card';
import { Button } from '../../../../components/ui/Button';
import { apiClient } from '../../../../lib/api-client';
import {
  Users,
  ShieldCheck,
  Clock,
  Briefcase,
  FolderTree,
  Tag,
  ArrowRight,
  Shield,
} from 'lucide-react';

export default function AdminDashboardPage() {
  const [stats, setStats] = useState<any>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const fetchStats = async () => {
      try {
        const res: any = await apiClient.get('/admin/stats');
        if (res?.data) {
          setStats(res.data);
        }
      } catch (e) {
        // Handle error
      } finally {
        setIsLoading(false);
      }
    };
    fetchStats();
  }, []);

  return (
    <div className="flex min-h-screen flex-col bg-[#F8FAFC]">
      <Navbar />

      <main className="flex-1 py-8">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 space-y-6">
          {/* Admin Header Banner */}
          <div className="rounded-2xl bg-zinc-900 p-6 text-white shadow-lg flex flex-col md:flex-row md:items-center justify-between gap-4">
            <div>
              <div className="inline-flex items-center gap-2 text-xs font-semibold text-purple-400 uppercase tracking-wider mb-1">
                <Shield className="h-4 w-4" /> Admin Control Plane
              </div>
              <h1 className="text-2xl font-black">Platform Overview & Operations</h1>
              <p className="text-sm text-zinc-400 mt-1">
                Review interviewer verification requests, manage users, categories, and audit logs.
              </p>
            </div>

            <div className="flex flex-wrap gap-2">
              <Link href="/admin/verifications">
                <Button size="sm" className="bg-[#C2410C] hover:bg-[#9A3412]" leftIcon={<Clock className="h-4 w-4" />}>
                  Verification Queue
                </Button>
              </Link>
              <Link href="/admin/users">
                <Button size="sm" variant="outline" className="bg-white/10 text-white hover:bg-white/20 border-white/20">
                  Manage Users
                </Button>
              </Link>
            </div>
          </div>

          {/* Submenu Tabs */}
          <div className="flex items-center gap-2 border-b border-[#E4E4E7] pb-3 overflow-x-auto">
            <Link href="/admin/dashboard" className="rounded-lg bg-zinc-900 px-3.5 py-1.5 text-xs font-bold text-white">
              Overview Stats
            </Link>
            <Link href="/admin/verifications" className="rounded-lg bg-white px-3.5 py-1.5 text-xs font-semibold text-zinc-700 hover:bg-slate-100 border border-[#E4E4E7]">
              Verifications Queue
            </Link>
            <Link href="/admin/users" className="rounded-lg bg-white px-3.5 py-1.5 text-xs font-semibold text-zinc-700 hover:bg-slate-100 border border-[#E4E4E7]">
              User Management
            </Link>
            <Link href="/admin/categories" className="rounded-lg bg-white px-3.5 py-1.5 text-xs font-semibold text-zinc-700 hover:bg-slate-100 border border-[#E4E4E7]">
              Categories
            </Link>
            <Link href="/admin/skills" className="rounded-lg bg-white px-3.5 py-1.5 text-xs font-semibold text-zinc-700 hover:bg-slate-100 border border-[#E4E4E7]">
              Skills
            </Link>
          </div>

          {/* KPI Cards Grid */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
            <Card className="p-5 flex items-center gap-4">
              <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-orange-100 text-[#C2410C]">
                <Clock className="h-6 w-6" />
              </div>
              <div>
                <span className="text-xs font-semibold text-[#71717A] uppercase">Pending Verifications</span>
                <h3 className="text-2xl font-black text-zinc-900">{isLoading ? '...' : stats?.pendingVerifications || 0}</h3>
              </div>
            </Card>

            <Card className="p-5 flex items-center gap-4">
              <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-green-100 text-[#16A34A]">
                <ShieldCheck className="h-6 w-6" />
              </div>
              <div>
                <span className="text-xs font-semibold text-[#71717A] uppercase">Approved Interviewers</span>
                <h3 className="text-2xl font-black text-zinc-900">{isLoading ? '...' : stats?.approvedInterviewers || 0}</h3>
              </div>
            </Card>

            <Card className="p-5 flex items-center gap-4">
              <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-blue-100 text-blue-600">
                <Users className="h-6 w-6" />
              </div>
              <div>
                <span className="text-xs font-semibold text-[#71717A] uppercase">Total Users</span>
                <h3 className="text-2xl font-black text-zinc-900">{isLoading ? '...' : stats?.totalUsers || 0}</h3>
              </div>
            </Card>

            <Card className="p-5 flex items-center gap-4">
              <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-purple-100 text-purple-600">
                <FolderTree className="h-6 w-6" />
              </div>
              <div>
                <span className="text-xs font-semibold text-[#71717A] uppercase">Active Categories</span>
                <h3 className="text-2xl font-black text-zinc-900">{isLoading ? '...' : stats?.activeCategories || 0}</h3>
              </div>
            </Card>
          </div>

          {/* Action Links */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 pt-4">
            <Card hoverEffect className="p-6 space-y-3">
              <div className="flex items-center justify-between">
                <h3 className="text-base font-bold text-zinc-900 flex items-center gap-2">
                  <Clock className="h-5 w-5 text-[#C2410C]" /> Review Verification Applications
                </h3>
                <span className="rounded-full bg-amber-100 px-2.5 py-0.5 text-xs font-bold text-amber-800">
                  {stats?.pendingVerifications || 0} Pending
                </span>
              </div>
              <p className="text-xs text-[#71717A]">
                Inspect claimed engineering credentials, LinkedIn/GitHub/Resume links, and approve or reject interviewer applicants.
              </p>
              <Link href="/admin/verifications" className="inline-flex items-center gap-1 text-xs font-bold text-[#C2410C] hover:underline pt-2">
                Open Verification Queue <ArrowRight className="h-3.5 w-3.5" />
              </Link>
            </Card>

            <Card hoverEffect className="p-6 space-y-3">
              <div className="flex items-center justify-between">
                <h3 className="text-base font-bold text-zinc-900 flex items-center gap-2">
                  <Users className="h-5 w-5 text-blue-600" /> User Moderation & Status Control
                </h3>
                <span className="rounded-full bg-blue-100 px-2.5 py-0.5 text-xs font-bold text-blue-800">
                  {stats?.totalUsers || 0} Total
                </span>
              </div>
              <p className="text-xs text-[#71717A]">
                Search all accounts, manage active/suspended/banned statuses, and view user metadata.
              </p>
              <Link href="/admin/users" className="inline-flex items-center gap-1 text-xs font-bold text-blue-600 hover:underline pt-2">
                Open User Management <ArrowRight className="h-3.5 w-3.5" />
              </Link>
            </Card>
          </div>
        </div>
      </main>

      <Footer />
    </div>
  );
}
