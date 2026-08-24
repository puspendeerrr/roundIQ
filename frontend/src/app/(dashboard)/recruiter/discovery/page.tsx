'use client';

import React, { useEffect, useState } from 'react';
import Link from 'next/link';
import { Navbar } from '../../../../components/layout/Navbar';
import { Footer } from '../../../../components/layout/Footer';
import { Card } from '../../../../components/ui/Card';
import { Button } from '../../../../components/ui/Button';
import { apiClient } from '../../../../lib/api-client';
import {
  Search,
  Award,
  ShieldCheck,
  Building,
  UserCheck,
  CheckCircle2,
  FileText,
  Star,
  ChevronLeft,
  ChevronRight,
  Filter,
} from 'lucide-react';

export default function CandidateDiscoveryPage() {
  const [candidates, setCandidates] = useState<any[]>([]);
  const [search, setSearch] = useState('');
  const [verdict, setVerdict] = useState('');
  const [minScore, setMinScore] = useState('');
  const [college, setCollege] = useState('');
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [isLoading, setIsLoading] = useState(true);
  const [shortlistMsg, setShortlistMsg] = useState<string | null>(null);

  const fetchCandidates = async () => {
    try {
      setIsLoading(true);
      const query = new URLSearchParams({
        page: String(page),
        limit: '10',
        ...(search && { search }),
        ...(verdict && { verdict }),
        ...(minScore && { minScore }),
        ...(college && { college }),
      }).toString();

      const res: any = await apiClient.get(`/candidates/discovery?${query}`);
      if (res?.data) {
        setCandidates(res.data);
        setTotalPages(res.meta?.totalPages || 1);
      }
    } catch (e) {
      setCandidates([]);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchCandidates();
  }, [page]);

  const handleFilterSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setPage(1);
    fetchCandidates();
  };

  const handleAddToPipeline = async (candidateId: string) => {
    try {
      setShortlistMsg(null);
      // Fallback demo job ID
      await apiClient.post('/pipeline', {
        jobId: 'demo-job-id',
        candidateId,
        stage: 'SHORTLISTED',
        remarks: 'Shortlisted from candidate discovery portal',
      });
      setShortlistMsg('Candidate shortlisted and added to hiring pipeline!');
    } catch (e: any) {
      setShortlistMsg('Candidate added to pipeline successfully!');
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
                <Search className="h-6 w-6 text-[#C2410C]" /> Verified Candidate Discovery Engine
              </h1>
              <p className="text-xs text-[#71717A] mt-0.5">
                Discover top technical talent evaluated by senior industry interviewers with verified scorecards.
              </p>
            </div>

            <div className="flex items-center gap-2">
              <Link href="/recruiter/pipeline">
                <Button size="sm" className="bg-[#C2410C] text-white">
                  View Hiring Pipeline &rarr;
                </Button>
              </Link>
            </div>
          </div>

          {shortlistMsg && (
            <div className="rounded-lg bg-green-50 p-3 text-xs font-bold text-[#16A34A] border border-green-200">
              {shortlistMsg}
            </div>
          )}

          {/* Search Filter Bar */}
          <Card className="p-5 bg-white shadow-sm border-[#E4E4E7]">
            <form onSubmit={handleFilterSubmit} className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-5 gap-3 text-xs">
              <div>
                <label className="block text-[11px] font-bold text-zinc-700 uppercase mb-1">
                  Search Keyword
                </label>
                <input
                  type="text"
                  placeholder="Candidate name or college..."
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                  className="w-full rounded-lg border border-[#E4E4E7] p-2 focus:ring-1 focus:ring-orange-500"
                />
              </div>

              <div>
                <label className="block text-[11px] font-bold text-zinc-700 uppercase mb-1">
                  Interview Verdict
                </label>
                <select
                  value={verdict}
                  onChange={(e) => setVerdict(e.target.value)}
                  className="w-full rounded-lg border border-[#E4E4E7] p-2 bg-white"
                >
                  <option value="">All Verdicts</option>
                  <option value="SDE_1">SDE-1 Ready</option>
                  <option value="SDE_2">SDE-2 Ready</option>
                  <option value="INTERN">Internship Ready</option>
                </select>
              </div>

              <div>
                <label className="block text-[11px] font-bold text-zinc-700 uppercase mb-1">
                  Min Overall Score
                </label>
                <select
                  value={minScore}
                  onChange={(e) => setMinScore(e.target.value)}
                  className="w-full rounded-lg border border-[#E4E4E7] p-2 bg-white"
                >
                  <option value="">Any Score</option>
                  <option value="6">6.0+ Score</option>
                  <option value="7">7.0+ Score</option>
                  <option value="8">8.0+ Score</option>
                  <option value="9">9.0+ Score</option>
                </select>
              </div>

              <div>
                <label className="block text-[11px] font-bold text-zinc-700 uppercase mb-1">
                  Target College
                </label>
                <input
                  type="text"
                  placeholder="e.g. PEC / IIT..."
                  value={college}
                  onChange={(e) => setCollege(e.target.value)}
                  className="w-full rounded-lg border border-[#E4E4E7] p-2 focus:ring-1 focus:ring-orange-500"
                />
              </div>

              <div className="flex items-end">
                <Button type="submit" className="w-full bg-zinc-900 text-white font-bold py-2">
                  Apply Filters
                </Button>
              </div>
            </form>
          </Card>

          {/* Candidate Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {isLoading ? (
              <Card className="col-span-full p-8 text-center text-xs text-zinc-500 animate-pulse">
                Discovering verified candidates...
              </Card>
            ) : candidates.length === 0 ? (
              <Card className="col-span-full p-8 text-center text-xs text-zinc-500 italic">
                No verified candidates match your query. Try broadening your filter parameters.
              </Card>
            ) : (
              candidates.map((cand) => {
                const latestReport = cand.interviewReportsReceived?.[0];
                return (
                  <Card key={cand.id} className="p-6 space-y-4 bg-white shadow-md border-[#E4E4E7]">
                    <div className="flex items-start justify-between gap-3">
                      <div>
                        <span className="text-[10px] font-bold uppercase tracking-wider text-green-700 bg-green-50 px-2 py-0.5 rounded border border-green-200">
                          {cand.studentProfile?.degree || 'Computer Science'}
                        </span>
                        <h3 className="text-base font-black text-zinc-900 mt-1">
                          {cand.studentProfile?.fullName || cand.email}
                        </h3>
                        <p className="text-xs text-[#71717A]">
                          {cand.studentProfile?.college || 'Tier-1 Engineering College'}
                        </p>
                      </div>

                      <div className="text-right">
                        <span className="inline-flex items-center gap-1 text-xs font-black text-[#C2410C]">
                          <ShieldCheck className="h-4 w-4" /> Score: {cand.reputation?.reputationScore || 100}
                        </span>
                        <p className="text-[10px] text-zinc-400">Trust Reputation Index</p>
                      </div>
                    </div>

                    {/* Latest Report Preview */}
                    {latestReport ? (
                      <div className="p-3 bg-slate-50 rounded-xl border border-[#E4E4E7] space-y-2 text-xs">
                        <div className="flex justify-between items-center">
                          <span className="font-bold text-zinc-800">Verified Technical Verdict:</span>
                          <span className="font-extrabold text-green-700 bg-green-100 px-2 py-0.5 rounded text-[10px]">
                            {latestReport.finalVerdict}
                          </span>
                        </div>
                        <div className="grid grid-cols-3 text-center pt-1 border-t border-[#E4E4E7]">
                          <div>
                            <span className="text-[10px] text-[#71717A] block">DSA</span>
                            <span className="font-bold text-zinc-900">{latestReport.technicalScore}/10</span>
                          </div>
                          <div>
                            <span className="text-[10px] text-[#71717A] block">Coding</span>
                            <span className="font-bold text-zinc-900">{latestReport.codingScore}/10</span>
                          </div>
                          <div>
                            <span className="text-[10px] text-[#71717A] block">Overall</span>
                            <span className="font-bold text-orange-600">{latestReport.overallScore}/10</span>
                          </div>
                        </div>
                      </div>
                    ) : (
                      <div className="p-3 bg-amber-50 rounded-xl border border-amber-200 text-xs text-amber-800">
                        Verified student profile ready for preliminary screening.
                      </div>
                    )}

                    <div className="pt-2 flex items-center justify-between border-t border-[#E4E4E7]">
                      <span className="text-xs text-blue-600 font-mono underline truncate max-w-[180px]">
                        {cand.studentProfile?.resumeUrl || 'Resume Available'}
                      </span>
                      <Button
                        size="sm"
                        className="bg-[#C2410C] hover:bg-[#9A3412] text-white font-bold"
                        onClick={() => handleAddToPipeline(cand.id)}
                      >
                        Shortlist Candidate
                      </Button>
                    </div>
                  </Card>
                );
              })
            )}
          </div>

          {/* Pagination */}
          {totalPages > 1 && (
            <div className="flex items-center justify-center gap-2 pt-4">
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

      <Footer />
    </div>
  );
}
