'use client';

import React from 'react';
import Link from 'next/link';
import { Navbar } from '../components/layout/Navbar';
import { Footer } from '../components/layout/Footer';
import { Button } from '../components/ui/Button';
import { Card } from '../components/ui/Card';
import {
  ShieldCheck,
  Search,
  CheckCircle2,
  Users,
  Award,
  ArrowRight,
  Briefcase,
  Sparkles,
  Zap,
  Target,
  Clock,
  Building,
} from 'lucide-react';

export default function LandingPage() {
  return (
    <div className="flex min-h-screen flex-col bg-white">
      <Navbar />

      {/* Hero Section */}
      <section className="relative overflow-hidden bg-[#F8FAFC] py-20 lg:py-28 border-b border-[#E4E4E7]">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 items-center">
            <div className="lg:col-span-7 space-y-6 text-left">
              <div className="inline-flex items-center gap-2 rounded-full border border-orange-200 bg-orange-50 px-3.5 py-1 text-xs font-bold text-[#C2410C]">
                <Sparkles className="h-3.5 w-3.5" /> 100% Verified Human Interviewers • Zero AI Bots
              </div>

              <h1 className="text-4xl font-black tracking-tight text-zinc-900 sm:text-6xl leading-[1.1]">
                Fail Safely with <span className="text-[#C2410C]">Real Engineers</span> Before Your Real Interview.
              </h1>

              <p className="text-base text-zinc-600 sm:text-lg leading-relaxed max-w-2xl">
                RoundIQ connects students & job seekers with verified software engineers from FAANG and top product companies for 1-on-1 mock technical interviews. Real pressure, real feedback, real growth.
              </p>

              <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3 pt-2">
                <Link href="/directory">
                  <Button size="lg" className="w-full sm:w-auto" rightIcon={<ArrowRight className="h-5 w-5" />}>
                    Explore Verified Interviewers
                  </Button>
                </Link>
                <Link href="/register?role=INTERVIEWER">
                  <Button size="lg" variant="outline" className="w-full sm:w-auto">
                    Become an Interviewer
                  </Button>
                </Link>
              </div>

              {/* Trust Badges */}
              <div className="pt-6 border-t border-[#E4E4E7] grid grid-cols-3 gap-4 text-xs text-[#71717A]">
                <div className="flex items-center gap-2 font-medium">
                  <CheckCircle2 className="h-4 w-4 text-[#16A34A] flex-shrink-0" />
                  <span>Manual ID & Company Vetting</span>
                </div>
                <div className="flex items-center gap-2 font-medium">
                  <CheckCircle2 className="h-4 w-4 text-[#16A34A] flex-shrink-0" />
                  <span>Structured Detailed Feedback</span>
                </div>
                <div className="flex items-center gap-2 font-medium">
                  <CheckCircle2 className="h-4 w-4 text-[#16A34A] flex-shrink-0" />
                  <span>Zero AI Bot Simulations</span>
                </div>
              </div>
            </div>

            {/* Hero Card Preview */}
            <div className="lg:col-span-5 relative">
              <div className="absolute -inset-2 rounded-3xl bg-gradient-to-r from-orange-600 to-amber-600 opacity-20 blur-xl"></div>
              <Card className="relative p-6 space-y-5 bg-white border-2 border-[#E4E4E7] shadow-xl">
                <div className="flex items-center justify-between border-b border-[#E4E4E7] pb-3">
                  <div className="flex items-center gap-2">
                    <div className="flex h-3 w-3 rounded-full bg-red-500" />
                    <div className="flex h-3 w-3 rounded-full bg-amber-500" />
                    <div className="flex h-3 w-3 rounded-full bg-green-500" />
                  </div>
                  <span className="text-[11px] font-mono text-[#71717A]">marketplace-preview</span>
                </div>

                <div className="flex items-start gap-4">
                  <img
                    src="https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=150"
                    alt=""
                    className="h-14 w-14 rounded-xl object-cover border border-[#E4E4E7]"
                  />
                  <div>
                    <div className="flex items-center gap-1">
                      <h3 className="font-bold text-zinc-900 text-sm">Priya Verma</h3>
                      <CheckCircle2 className="h-4 w-4 text-[#16A34A]" />
                    </div>
                    <p className="text-xs text-zinc-600">Senior SDE @ Flipkart | Ex-Amazon</p>
                    <p className="text-[11px] text-[#71717A] mt-1 font-semibold">8 Years Experience • DSA & System Design</p>
                  </div>
                </div>

                <div className="flex flex-wrap gap-1.5 pt-1">
                  <span className="rounded-full bg-orange-50 text-[#C2410C] px-2.5 py-0.5 text-[11px] font-bold">DSA</span>
                  <span className="rounded-full bg-slate-100 text-zinc-700 px-2.5 py-0.5 text-[11px] font-medium">React.js</span>
                  <span className="rounded-full bg-slate-100 text-zinc-700 px-2.5 py-0.5 text-[11px] font-medium">System Architecture</span>
                </div>

                <div className="pt-3 border-t border-[#E4E4E7] flex items-center justify-between text-xs">
                  <span className="font-bold text-green-700 bg-green-50 px-2.5 py-1 rounded-lg">Verified Engineer</span>
                  <Link href="/directory">
                    <Button size="sm">Book Mock Session</Button>
                  </Link>
                </div>
              </Card>
            </div>
          </div>
        </div>
      </section>

      {/* Feature Value Props */}
      <section className="py-16 bg-white">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 space-y-12">
          <div className="text-center max-w-2xl mx-auto">
            <h2 className="text-2xl font-black text-zinc-900 sm:text-3xl">Why RoundIQ?</h2>
            <p className="mt-2 text-sm text-[#71717A]">
              AI mock interviewers can't replicate human judgment, stress, or real hiring bar standards.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <Card className="p-6 space-y-3">
              <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-orange-100 text-[#C2410C]">
                <ShieldCheck className="h-6 w-6" />
              </div>
              <h3 className="text-base font-bold text-zinc-900">Verified Credentials</h3>
              <p className="text-xs text-[#71717A] leading-relaxed">
                Every interviewer is manually audited by RoundIQ operations. We verify company employment, LinkedIn, GitHub, and professional track record.
              </p>
            </Card>

            <Card className="p-6 space-y-3">
              <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-blue-100 text-blue-600">
                <Target className="h-6 w-6" />
              </div>
              <h3 className="text-base font-bold text-zinc-900">Structured Feedback</h3>
              <p className="text-xs text-[#71717A] leading-relaxed">
                Get actionable ratings on Problem Solving, Communication, and Code Quality along with detailed written recommendations after every session.
              </p>
            </Card>

            <Card className="p-6 space-y-3">
              <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-green-100 text-[#16A34A]">
                <Zap className="h-6 w-6" />
              </div>
              <h3 className="text-base font-bold text-zinc-900">Real Hiring Bar</h3>
              <p className="text-xs text-[#71717A] leading-relaxed">
                Experience the actual pressure of live technical interviews with software engineers who conduct interviews for top tech companies.
              </p>
            </Card>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="bg-zinc-900 py-16 text-white text-center">
        <div className="mx-auto max-w-4xl px-4 space-y-6">
          <h2 className="text-3xl font-black sm:text-4xl">Ready to Ace Your Next Technical Interview?</h2>
          <p className="text-sm text-zinc-400 max-w-xl mx-auto">
            Browse our directory of verified software engineers and book your first 1-on-1 human mock interview.
          </p>
          <div className="flex justify-center gap-4 pt-2">
            <Link href="/directory">
              <Button size="lg" className="bg-[#C2410C] hover:bg-[#9A3412]">
                Find Your Interviewer
              </Button>
            </Link>
          </div>
        </div>
      </section>

      <Footer />
    </div>
  );
}
