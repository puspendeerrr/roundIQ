'use client';

import React from 'react';
import Link from 'next/link';
import { Navbar } from '../../../components/layout/Navbar';
import { Footer } from '../../../components/layout/Footer';
import { Card } from '../../../components/ui/Card';
import { Button } from '../../../components/ui/Button';
import { ShieldCheck, UserCheck, Search, CheckCircle2, ArrowRight } from 'lucide-react';

export default function HowItWorksPage() {
  return (
    <div className="flex min-h-screen flex-col bg-white">
      <Navbar />

      <main className="flex-1 py-16">
        <div className="mx-auto max-w-5xl px-4 sm:px-6 lg:px-8 space-y-12">
          <div className="text-center max-w-2xl mx-auto space-y-3">
            <h1 className="text-3xl font-black text-zinc-900 sm:text-4xl">How RoundIQ Works</h1>
            <p className="text-sm text-[#71717A]">
              Our three-step marketplace foundation built around 100% human-verified software engineers.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <Card className="p-6 space-y-4">
              <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-orange-100 font-black text-[#C2410C]">
                1
              </div>
              <h3 className="text-base font-bold text-zinc-900">1. Discover & Filter</h3>
              <p className="text-xs text-[#71717A] leading-relaxed">
                Filter verified interviewers by category (DSA, Frontend, Backend, System Design), current company, years of experience, and technical skill tags.
              </p>
            </Card>

            <Card className="p-6 space-y-4">
              <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-blue-100 font-black text-blue-600">
                2
              </div>
              <h3 className="text-base font-bold text-zinc-900">2. Inspect Verified Profiles</h3>
              <p className="text-xs text-[#71717A] leading-relaxed">
                Review verified engineer profiles, current and previous company history, LinkedIn & GitHub profiles, and verified skills.
              </p>
            </Card>

            <Card className="p-6 space-y-4">
              <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-green-100 font-black text-[#16A34A]">
                3
              </div>
              <h3 className="text-base font-bold text-zinc-900">3. Admin Quality Vetting</h3>
              <p className="text-xs text-[#71717A] leading-relaxed">
                Every interviewer passes through RoundIQ's manual operations review before becoming publicly visible to ensure complete authenticity.
              </p>
            </Card>
          </div>

          <div className="rounded-2xl bg-[#F8FAFC] border border-[#E4E4E7] p-8 text-center space-y-4">
            <h2 className="text-xl font-bold text-zinc-900">Explore the Marketplace Now</h2>
            <p className="text-xs text-[#71717A] max-w-md mx-auto">
              Find software engineers who have actually conducted interviews at top tech companies.
            </p>
            <Link href="/directory" className="inline-block">
              <Button rightIcon={<ArrowRight className="h-4 w-4" />}>
                Go to Marketplace Directory
              </Button>
            </Link>
          </div>
        </div>
      </main>

      <Footer />
    </div>
  );
}
