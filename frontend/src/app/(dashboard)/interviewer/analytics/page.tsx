'use client';

import React, { useEffect, useState } from 'react';
import Link from 'next/link';
import { Navbar } from '../../../../components/layout/Navbar';
import { Footer } from '../../../../components/layout/Footer';
import { Card } from '../../../../components/ui/Card';
import { Button } from '../../../../components/ui/Button';
import { apiClient } from '../../../../lib/api-client';
import {
  Star,
  Award,
  ShieldCheck,
  TrendingUp,
  MessageSquare,
  CheckCircle2,
} from 'lucide-react';

export default function InterviewerAnalyticsPage() {
  const [reputationData, setReputationData] = useState<any>(null);
  const [reviews, setReviews] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const fetchAnalytics = async () => {
      try {
        setIsLoading(true);
        const [repRes, revRes]: any = await Promise.all([
          apiClient.get('/reputation/me'),
          apiClient.get('/reviews/interviewer/me'),
        ]);

        if (repRes?.data) setReputationData(repRes.data);
        if (revRes?.data) setReviews(revRes.data);
      } catch (e) {
        setReviews([]);
      } finally {
        setIsLoading(false);
      }
    };

    fetchAnalytics();
  }, []);

  const rep = reputationData?.reputation;
  const achievements = reputationData?.achievements || [];

  return (
    <div className="flex min-h-screen flex-col bg-[#F8FAFC]">
      <Navbar />

      <main className="flex-1 py-8">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 space-y-6">
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-[#E4E4E7] pb-4">
            <div>
              <h1 className="text-2xl font-black text-zinc-900 flex items-center gap-2">
                <Star className="h-6 w-6 text-[#C2410C]" /> Interviewer Reputation & Trust Intelligence
              </h1>
              <p className="text-xs text-[#71717A] mt-0.5">
                Audit candidate ratings, completion metrics, unlocked badges, and public reviews.
              </p>
            </div>

            <div className="flex items-center gap-2">
              <Link href="/interviewer/dashboard">
                <Button size="sm" variant="outline">&larr; Interviewer Dashboard</Button>
              </Link>
            </div>
          </div>

          {/* Key Metrics */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
            <Card className="p-5 space-y-2 bg-gradient-to-br from-zinc-900 to-zinc-950 text-white shadow-lg">
              <span className="text-xs font-bold uppercase tracking-wider text-amber-400 flex items-center gap-1">
                <Star className="h-4 w-4 fill-amber-400" /> Average Rating
              </span>
              <h3 className="text-3xl font-black">{rep?.averageRating?.toFixed(2) || '5.00'} / 5.0</h3>
              <p className="text-[11px] text-zinc-400">Based on {rep?.totalReviews || 0} candidate reviews</p>
            </Card>

            <Card className="p-5 space-y-2 bg-white">
              <span className="text-xs font-bold uppercase tracking-wider text-[#71717A]">
                Reputation Trust Score
              </span>
              <h3 className="text-3xl font-black text-green-700">{rep?.reputationScore || 100.0}</h3>
              <p className="text-[11px] text-zinc-500">Backend trust index (0-100)</p>
            </Card>

            <Card className="p-5 space-y-2 bg-white">
              <span className="text-xs font-bold uppercase tracking-wider text-[#71717A]">
                Completion Rate
              </span>
              <h3 className="text-3xl font-black text-blue-700">{rep?.completionRate || 100.0}%</h3>
              <p className="text-[11px] text-zinc-500">Verified completed sessions</p>
            </Card>

            <Card className="p-5 space-y-2 bg-white">
              <span className="text-xs font-bold uppercase tracking-wider text-[#71717A]">
                Unlocked Badges
              </span>
              <h3 className="text-3xl font-black text-[#C2410C]">{achievements.length}</h3>
              <p className="text-[11px] text-zinc-500">Earned achievements catalog</p>
            </Card>
          </div>

          {/* Earned Achievements Badges Section */}
          <div className="space-y-4">
            <h2 className="text-base font-bold text-zinc-900 flex items-center gap-2">
              <Award className="h-5 w-5 text-[#C2410C]" /> Unlocked Achievements Catalog
            </h2>

            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
              {achievements.length === 0 ? (
                <Card className="col-span-full p-6 text-center text-xs text-zinc-500 italic">
                  No achievement badges unlocked yet. Complete more mock sessions to earn platform badges.
                </Card>
              ) : (
                achievements.map((ach: any) => (
                  <Card key={ach.id} className="p-4 flex items-center gap-3 bg-white border border-amber-200">
                    <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-amber-100 text-amber-700 font-bold">
                      <Award className="h-5 w-5" />
                    </div>
                    <div>
                      <h4 className="text-xs font-bold text-zinc-900">{ach.achievement?.badgeName}</h4>
                      <p className="text-[11px] text-zinc-600">{ach.achievement?.description}</p>
                    </div>
                  </Card>
                ))
              )}
            </div>
          </div>

          {/* Student Reviews Section */}
          <div className="space-y-4">
            <h2 className="text-base font-bold text-zinc-900 flex items-center gap-2">
              <MessageSquare className="h-5 w-5 text-[#C2410C]" /> Candidate Feedback & Reviews
            </h2>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
              {isLoading ? (
                <Card className="col-span-full p-6 text-center text-xs text-zinc-500 animate-pulse">
                  Loading candidate reviews...
                </Card>
              ) : reviews.length === 0 ? (
                <Card className="col-span-full p-6 text-center text-xs text-zinc-500 italic">
                  No public reviews submitted yet.
                </Card>
              ) : (
                reviews.map((rev) => (
                  <Card key={rev.id} className="p-5 space-y-3 bg-white shadow-md">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-1 text-amber-500">
                        {Array.from({ length: rev.rating }).map((_, i) => (
                          <Star key={i} className="h-4 w-4 fill-amber-400 text-amber-400" />
                        ))}
                      </div>
                      <span className="text-[11px] text-[#71717A]">
                        {new Date(rev.createdAt).toLocaleDateString()}
                      </span>
                    </div>

                    <h4 className="text-xs font-bold text-zinc-900">{rev.title}</h4>
                    <p className="text-xs text-zinc-700 leading-relaxed">{rev.review}</p>

                    <div className="pt-2 border-t border-[#E4E4E7] flex items-center justify-between text-[11px] text-[#71717A]">
                      <span>Candidate: {rev.reviewer?.studentProfile?.fullName || 'Verified Student'}</span>
                      {rev.wouldRecommend && (
                        <span className="font-bold text-green-700 flex items-center gap-1">
                          <CheckCircle2 className="h-3.5 w-3.5 text-green-600" /> Recommends Mentor
                        </span>
                      )}
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
