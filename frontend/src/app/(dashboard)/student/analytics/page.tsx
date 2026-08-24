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
  Award,
  CheckCircle2,
  ChevronLeft,
  FileText,
  Star,
  ShieldCheck,
} from 'lucide-react';

export default function StudentAnalyticsPage() {
  const [reports, setReports] = useState<any[]>([]);
  const [reputation, setReputation] = useState<any>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const fetchAnalytics = async () => {
      try {
        setIsLoading(true);
        const [repRes, repData]: any = await Promise.all([
          apiClient.get('/reputation/me'),
          apiClient.get('/reports/me?limit=10'),
        ]);

        if (repRes?.data) setReputation(repRes.data);
        if (repData?.data) setReports(repData.data);
      } catch (e) {
        setReports([]);
      } finally {
        setIsLoading(false);
      }
    };

    fetchAnalytics();
  }, []);

  return (
    <div className="flex min-h-screen flex-col bg-[#F8FAFC]">
      <Navbar />

      <main className="flex-1 py-8">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 space-y-6">
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-[#E4E4E7] pb-4">
            <div>
              <h1 className="text-2xl font-black text-zinc-900 flex items-center gap-2">
                <TrendingUp className="h-6 w-6 text-[#C2410C]" /> Candidate Performance Analytics
              </h1>
              <p className="text-xs text-[#71717A] mt-0.5">
                Track your technical interview scorecards, strengths, and progression toward tier-1 SDE roles.
              </p>
            </div>

            <div className="flex items-center gap-2">
              <Link href="/student/dashboard">
                <Button size="sm" variant="outline">&larr; Student Dashboard</Button>
              </Link>
            </div>
          </div>

          {/* Key Intelligence Metric Cards */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <Card className="p-6 space-y-2 bg-gradient-to-br from-zinc-900 to-zinc-950 text-white shadow-lg">
              <span className="text-xs font-bold uppercase tracking-wider text-orange-400">
                Completed Mock Interviews
              </span>
              <h3 className="text-3xl font-black">
                {reputation?.reputation?.completedInterviews || 0}
              </h3>
              <p className="text-[11px] text-zinc-400">Total sessions evaluated by verified interviewers</p>
            </Card>

            <Card className="p-6 space-y-2 bg-white">
              <span className="text-xs font-bold uppercase tracking-wider text-[#71717A]">
                Platform Trust Score
              </span>
              <h3 className="text-3xl font-black text-green-700">
                {reputation?.reputation?.reputationScore || 100.0} / 100
              </h3>
              <p className="text-[11px] text-zinc-500">Derived readiness and reliability index</p>
            </Card>

            <Card className="p-6 space-y-2 bg-white">
              <span className="text-xs font-bold uppercase tracking-wider text-[#71717A]">
                Unlocked Badges
              </span>
              <h3 className="text-3xl font-black text-[#C2410C]">
                {reputation?.achievements?.length || 0} Badges
              </h3>
              <p className="text-[11px] text-zinc-500">Earned achievements catalog</p>
            </Card>
          </div>

          {/* Technical Evaluation Reports List */}
          <div className="space-y-4">
            <h2 className="text-base font-bold text-zinc-900">Technical Scorecards & Verdicts</h2>

            <div className="grid grid-cols-1 gap-6">
              {isLoading ? (
                <Card className="p-8 text-center text-xs text-zinc-500 animate-pulse">
                  Loading evaluation reports...
                </Card>
              ) : reports.length === 0 ? (
                <Card className="p-8 text-center text-xs text-zinc-500 italic">
                  No interview evaluation reports generated yet. Complete a mock session to receive feedback.
                </Card>
              ) : (
                reports.map((r) => (
                  <Card key={r.id} className="p-6 space-y-4 bg-white shadow-md border-[#E4E4E7]">
                    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-[#E4E4E7] pb-3">
                      <div>
                        <span className="font-mono text-xs font-bold text-[#C2410C]">
                          Session Ref: {r.booking?.referenceCode}
                        </span>
                        <h3 className="text-base font-bold text-zinc-900 mt-0.5">
                          Final Verdict: <span className="text-green-700 font-extrabold">{r.finalVerdict}</span>
                        </h3>
                      </div>
                      <span className="text-xs font-bold text-zinc-900 bg-orange-50 border border-orange-200 px-3 py-1 rounded-full">
                        Overall Score: {r.overallScore} / 10
                      </span>
                    </div>

                    <div className="grid grid-cols-2 sm:grid-cols-5 gap-3 text-xs text-center">
                      <div className="p-2.5 rounded-lg bg-slate-50 border border-[#E4E4E7]">
                        <span className="text-[#71717A] text-[10px] uppercase font-bold block">DSA & Tech</span>
                        <span className="font-black text-zinc-900 text-sm">{r.technicalScore}/10</span>
                      </div>
                      <div className="p-2.5 rounded-lg bg-slate-50 border border-[#E4E4E7]">
                        <span className="text-[#71717A] text-[10px] uppercase font-bold block">Problem Solving</span>
                        <span className="font-black text-zinc-900 text-sm">{r.problemSolvingScore}/10</span>
                      </div>
                      <div className="p-2.5 rounded-lg bg-slate-50 border border-[#E4E4E7]">
                        <span className="text-[#71717A] text-[10px] uppercase font-bold block">Coding Style</span>
                        <span className="font-black text-zinc-900 text-sm">{r.codingScore}/10</span>
                      </div>
                      <div className="p-2.5 rounded-lg bg-slate-50 border border-[#E4E4E7]">
                        <span className="text-[#71717A] text-[10px] uppercase font-bold block">Communication</span>
                        <span className="font-black text-zinc-900 text-sm">{r.communicationScore}/10</span>
                      </div>
                      <div className="p-2.5 rounded-lg bg-slate-50 border border-[#E4E4E7]">
                        <span className="text-[#71717A] text-[10px] uppercase font-bold block">Confidence</span>
                        <span className="font-black text-zinc-900 text-sm">{r.confidenceScore}/10</span>
                      </div>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-xs pt-2">
                      <div className="p-3 bg-green-50/50 rounded-lg border border-green-200">
                        <span className="font-bold text-green-800 block mb-1">Key Strengths</span>
                        <p className="text-zinc-700 leading-relaxed">{r.strengths}</p>
                      </div>
                      <div className="p-3 bg-amber-50/50 rounded-lg border border-amber-200">
                        <span className="font-bold text-amber-800 block mb-1">Areas for Growth</span>
                        <p className="text-zinc-700 leading-relaxed">{r.weaknesses}</p>
                      </div>
                      <div className="p-3 bg-blue-50/50 rounded-lg border border-blue-200">
                        <span className="font-bold text-blue-800 block mb-1">Actionable Recommendations</span>
                        <p className="text-zinc-700 leading-relaxed">{r.recommendations}</p>
                      </div>
                    </div>
                  </Card>
                ))
              )}
            </div>
          </div>
        </div>
      </main>

      <Footer />
    </div>
  );
}
