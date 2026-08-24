'use client';

import React, { useEffect, useState } from 'react';
import Link from 'next/link';
import { Navbar } from '../../../../components/layout/Navbar';
import { Footer } from '../../../../components/layout/Footer';
import { Card } from '../../../../components/ui/Card';
import { Button } from '../../../../components/ui/Button';
import { apiClient } from '../../../../lib/api-client';
import {
  Kanban,
  UserCheck,
  CheckCircle2,
  ChevronRight,
  ShieldCheck,
  Building,
} from 'lucide-react';

const KANBAN_STAGES = [
  { id: 'DISCOVERED', title: 'Discovered', color: 'bg-slate-100 border-slate-300' },
  { id: 'SHORTLISTED', title: 'Shortlisted', color: 'bg-blue-50 border-blue-200' },
  { id: 'CONTACTED', title: 'Contacted', color: 'bg-purple-50 border-purple-200' },
  { id: 'INTERVIEWING', title: 'Interviewing', color: 'bg-amber-50 border-amber-200' },
  { id: 'OFFERED', title: 'Offered', color: 'bg-orange-50 border-orange-200' },
  { id: 'HIRED', title: 'Hired', color: 'bg-green-50 border-green-200' },
];

export default function RecruiterPipelinePage() {
  const [pipelineData, setPipelineData] = useState<any>(null);
  const [isLoading, setIsLoading] = useState(true);

  const fetchPipeline = async () => {
    try {
      setIsLoading(true);
      const res: any = await apiClient.get('/pipeline/job/demo-job-id');
      if (res?.data) {
        setPipelineData(res.data);
      }
    } catch (e) {
      setPipelineData({ stages: {} });
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchPipeline();
  }, []);

  const handleStageAdvance = async (pipelineId: string, nextStage: string) => {
    try {
      await apiClient.patch(`/pipeline/${pipelineId}/stage`, { stage: nextStage });
      fetchPipeline();
    } catch (e) {
      // Ignore
    }
  };

  return (
    <div className="flex min-h-screen flex-col bg-[#F8FAFC]">
      <Navbar />

      <main className="flex-1 py-8">
        <div className="mx-auto max-w-[1400px] px-4 sm:px-6 lg:px-8 space-y-6">
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-[#E4E4E7] pb-4">
            <div>
              <h1 className="text-2xl font-black text-zinc-900 flex items-center gap-2">
                <Kanban className="h-6 w-6 text-[#C2410C]" /> Visual Hiring Pipeline Kanban Board
              </h1>
              <p className="text-xs text-[#71717A] mt-0.5">
                Track candidate progression from initial discovery through technical evaluation and final offer release.
              </p>
            </div>

            <div className="flex items-center gap-2">
              <Link href="/recruiter/discovery">
                <Button size="sm" variant="outline">
                  &larr; Discover Candidates
                </Button>
              </Link>
            </div>
          </div>

          {/* Kanban Columns */}
          <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-6 gap-4 overflow-x-auto pb-6">
            {KANBAN_STAGES.map((col) => {
              const columnItems = pipelineData?.stages?.[col.id] || [];

              return (
                <div key={col.id} className={`rounded-xl border p-3 space-y-3 min-h-[500px] ${col.color}`}>
                  <div className="flex items-center justify-between border-b border-[#E4E4E7] pb-2">
                    <h3 className="text-xs font-black text-zinc-900 uppercase tracking-wider">{col.title}</h3>
                    <span className="flex h-5 w-5 items-center justify-center rounded-full bg-white text-[10px] font-bold text-zinc-800 shadow-xs">
                      {columnItems.length}
                    </span>
                  </div>

                  <div className="space-y-3">
                    {columnItems.map((item: any) => (
                      <Card key={item.id} className="p-3 space-y-2 bg-white shadow-sm border-[#E4E4E7]">
                        <div>
                          <span className="text-[9px] font-mono font-bold text-[#C2410C] block">
                            Ref: {item.candidate?.id?.slice(0, 8)}
                          </span>
                          <h4 className="text-xs font-bold text-zinc-900 truncate">
                            {item.candidate?.studentProfile?.fullName || item.candidate?.email}
                          </h4>
                          <p className="text-[10px] text-[#71717A] truncate">
                            {item.candidate?.studentProfile?.college || 'PEC Chandigarh'}
                          </p>
                        </div>

                        <div className="flex items-center justify-between text-[10px] pt-1 border-t border-slate-100">
                          <span className="font-bold text-green-700">
                            Trust: {item.candidate?.reputation?.reputationScore || 100}
                          </span>
                          {col.id !== 'HIRED' && (
                            <button
                              onClick={() => {
                                const currentIndex = KANBAN_STAGES.findIndex((s) => s.id === col.id);
                                if (currentIndex < KANBAN_STAGES.length - 1) {
                                  handleStageAdvance(item.id, KANBAN_STAGES[currentIndex + 1].id);
                                }
                              }}
                              className="font-bold text-[#C2410C] hover:underline flex items-center gap-0.5"
                            >
                              Next Stage &rarr;
                            </button>
                          )}
                        </div>
                      </Card>
                    ))}
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </main>

      <Footer />
    </div>
  );
}
