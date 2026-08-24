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
  Briefcase,
  Users,
  CheckCircle2,
  ChevronLeft,
  Building,
  Star,
} from 'lucide-react';

export default function RecruiterAnalyticsPage() {
  return (
    <div className="flex min-h-screen flex-col bg-[#F8FAFC]">
      <Navbar />

      <main className="flex-1 py-8">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 space-y-6">
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-[#E4E4E7] pb-4">
            <div>
              <h1 className="text-2xl font-black text-zinc-900 flex items-center gap-2">
                <TrendingUp className="h-6 w-6 text-[#C2410C]" /> Recruiter Hiring Analytics Dashboard
              </h1>
              <p className="text-xs text-[#71717A] mt-0.5">
                Audit recruitment funnel metrics, candidate conversion rates, and company hiring throughput.
              </p>
            </div>

            <div className="flex items-center gap-2">
              <Link href="/recruiter/discovery">
                <Button size="sm" variant="outline">&larr; Candidate Discovery</Button>
              </Link>
            </div>
          </div>

          {/* Metric Cards */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
            <Card className="p-5 space-y-2 bg-gradient-to-br from-zinc-900 to-zinc-950 text-white shadow-lg">
              <span className="text-xs font-bold uppercase tracking-wider text-orange-400">Open Job Postings</span>
              <h3 className="text-3xl font-black">4 Active</h3>
              <p className="text-[11px] text-zinc-400">Published career openings</p>
            </Card>

            <Card className="p-5 space-y-2 bg-white">
              <span className="text-xs font-bold uppercase tracking-wider text-[#71717A]">Candidates Discovered</span>
              <h3 className="text-3xl font-black text-blue-700">142</h3>
              <p className="text-[11px] text-zinc-500">Evaluated candidate profiles</p>
            </Card>

            <Card className="p-5 space-y-2 bg-white">
              <span className="text-xs font-bold uppercase tracking-wider text-[#71717A]">Shortlisted Candidates</span>
              <h3 className="text-3xl font-black text-amber-600">28</h3>
              <p className="text-[11px] text-zinc-500">Pipeline shortlists</p>
            </Card>

            <Card className="p-5 space-y-2 bg-white">
              <span className="text-xs font-bold uppercase tracking-wider text-[#71717A]">Hired Candidates</span>
              <h3 className="text-3xl font-black text-green-700">6 Hired</h3>
              <p className="text-[11px] text-zinc-500">Final offer acceptances</p>
            </Card>
          </div>

          {/* Recruitment Funnel Section */}
          <Card className="p-6 space-y-4 bg-white shadow-md border-[#E4E4E7]">
            <h2 className="text-base font-bold text-zinc-900">Enterprise Recruitment Funnel Conversion</h2>

            <div className="space-y-3 text-xs">
              <div>
                <div className="flex justify-between font-bold mb-1">
                  <span>Discovered & Screened</span>
                  <span className="text-zinc-900">100% (142 Candidates)</span>
                </div>
                <div className="w-full h-3 rounded-full bg-slate-100 overflow-hidden">
                  <div className="h-full bg-zinc-900 w-full" />
                </div>
              </div>

              <div>
                <div className="flex justify-between font-bold mb-1">
                  <span>Shortlisted for Pipeline</span>
                  <span className="text-zinc-900">20% (28 Candidates)</span>
                </div>
                <div className="w-full h-3 rounded-full bg-slate-100 overflow-hidden">
                  <div className="h-full bg-blue-600 w-[20%]" />
                </div>
              </div>

              <div>
                <div className="flex justify-between font-bold mb-1">
                  <span>Technical Interviewing</span>
                  <span className="text-zinc-900">10% (14 Candidates)</span>
                </div>
                <div className="w-full h-3 rounded-full bg-slate-100 overflow-hidden">
                  <div className="h-full bg-amber-500 w-[10%]" />
                </div>
              </div>

              <div>
                <div className="flex justify-between font-bold mb-1">
                  <span>Offers Extended & Accepted</span>
                  <span className="text-zinc-900">4.2% (6 Candidates)</span>
                </div>
                <div className="w-full h-3 rounded-full bg-slate-100 overflow-hidden">
                  <div className="h-full bg-green-600 w-[4.2%]" />
                </div>
              </div>
            </div>
          </Card>
        </div>
      </main>

      <Footer />
    </div>
  );
}
