'use client';

import React, { useEffect, useState } from 'react';
import Link from 'next/link';
import { Navbar } from '../../../../components/layout/Navbar';
import { Footer } from '../../../../components/layout/Footer';
import { Card } from '../../../../components/ui/Card';
import { Button } from '../../../../components/ui/Button';
import { apiClient } from '../../../../lib/api-client';
import {
  TrendingUp,
  Download,
  DollarSign,
  Users,
  Calendar,
  ShieldCheck,
  ChevronLeft,
} from 'lucide-react';

export default function AdminAnalyticsPage() {
  const handleExportBookings = () => {
    window.open(`${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000/api/v1'}/admin/export/bookings`, '_blank');
  };

  const handleExportRevenue = () => {
    window.open(`${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000/api/v1'}/admin/export/revenue`, '_blank');
  };

  return (
    <div className="flex min-h-screen flex-col bg-[#F8FAFC]">
      <Navbar />

      <main className="flex-1 py-8">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 space-y-6">
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-[#E4E4E7] pb-4">
            <div>
              <h1 className="text-2xl font-black text-zinc-900 flex items-center gap-2">
                <TrendingUp className="h-6 w-6 text-[#C2410C]" /> Enterprise Platform Analytics & Data Exporter
              </h1>
              <p className="text-xs text-[#71717A] mt-0.5">
                Audit platform growth, gross marketplace volume (GMV), commission earnings, and export CSV reports.
              </p>
            </div>

            <div className="flex items-center gap-2">
              <Button
                size="sm"
                variant="outline"
                onClick={handleExportBookings}
                leftIcon={<Download className="h-4 w-4 text-blue-600" />}
              >
                Export Bookings CSV
              </Button>
              <Button
                size="sm"
                className="bg-[#C2410C] text-white font-bold"
                onClick={handleExportRevenue}
                leftIcon={<Download className="h-4 w-4" />}
              >
                Export Financial CSV
              </Button>
            </div>
          </div>

          {/* Metric Cards */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
            <Card className="p-5 space-y-2 bg-gradient-to-br from-zinc-900 to-zinc-950 text-white shadow-lg">
              <span className="text-xs font-bold uppercase tracking-wider text-green-400">Total GMV Volume</span>
              <h3 className="text-3xl font-black">₹4,85,000</h3>
              <p className="text-[11px] text-zinc-400">Gross marketplace transaction volume</p>
            </Card>

            <Card className="p-5 space-y-2 bg-white">
              <span className="text-xs font-bold uppercase tracking-wider text-[#71717A]">Platform Commission</span>
              <h3 className="text-3xl font-black text-green-700">₹97,000</h3>
              <p className="text-[11px] text-zinc-500">20% commission revenue captured</p>
            </Card>

            <Card className="p-5 space-y-2 bg-white">
              <span className="text-xs font-bold uppercase tracking-wider text-[#71717A]">Registered Users</span>
              <h3 className="text-3xl font-black text-blue-700">1,240</h3>
              <p className="text-[11px] text-zinc-500">Students, Interviewers & Recruiters</p>
            </Card>

            <Card className="p-5 space-y-2 bg-white">
              <span className="text-xs font-bold uppercase tracking-wider text-[#71717A]">Total Executed Sessions</span>
              <h3 className="text-3xl font-black text-zinc-900">412</h3>
              <p className="text-[11px] text-zinc-500">Completed mock interviews</p>
            </Card>
          </div>

          {/* Revenue Breakdown */}
          <Card className="p-6 space-y-4 bg-white shadow-md border-[#E4E4E7]">
            <h2 className="text-base font-bold text-zinc-900">Monthly Revenue Throughput (2026)</h2>

            <div className="grid grid-cols-6 gap-3 text-center text-xs pt-2">
              <div className="p-3 bg-slate-50 rounded-lg border border-[#E4E4E7]">
                <span className="text-[#71717A] text-[10px] uppercase font-bold block">Jan</span>
                <span className="font-bold text-zinc-900">₹45,000</span>
              </div>
              <div className="p-3 bg-slate-50 rounded-lg border border-[#E4E4E7]">
                <span className="text-[#71717A] text-[10px] uppercase font-bold block">Feb</span>
                <span className="font-bold text-zinc-900">₹62,000</span>
              </div>
              <div className="p-3 bg-slate-50 rounded-lg border border-[#E4E4E7]">
                <span className="text-[#71717A] text-[10px] uppercase font-bold block">Mar</span>
                <span className="font-bold text-zinc-900">₹78,000</span>
              </div>
              <div className="p-3 bg-slate-50 rounded-lg border border-[#E4E4E7]">
                <span className="text-[#71717A] text-[10px] uppercase font-bold block">Apr</span>
                <span className="font-bold text-zinc-900">₹94,000</span>
              </div>
              <div className="p-3 bg-slate-50 rounded-lg border border-[#E4E4E7]">
                <span className="text-[#71717A] text-[10px] uppercase font-bold block">May</span>
                <span className="font-bold text-zinc-900">₹1,02,000</span>
              </div>
              <div className="p-3 bg-orange-50 rounded-lg border border-orange-200">
                <span className="text-[#C2410C] text-[10px] uppercase font-bold block">Jun</span>
                <span className="font-black text-[#C2410C]">₹1,04,000</span>
              </div>
            </div>
          </Card>
        </div>
      </main>

      <Footer />
    </div>
  );
}
