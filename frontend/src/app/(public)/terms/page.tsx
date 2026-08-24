'use client';

import React from 'react';
import { Navbar } from '../../../components/layout/Navbar';
import { Footer } from '../../../components/layout/Footer';
import { Card } from '../../../components/ui/Card';
import { ShieldCheck } from 'lucide-react';

export default function TermsOfServicePage() {
  return (
    <div className="flex min-h-screen flex-col bg-[#F8FAFC]">
      <Navbar />

      <main className="flex-1 py-12">
        <div className="mx-auto max-w-4xl px-4 sm:px-6 lg:px-8 space-y-6">
          <div className="border-b border-[#E4E4E7] pb-4">
            <h1 className="text-3xl font-black text-zinc-900 flex items-center gap-2">
              <ShieldCheck className="h-8 w-8 text-[#C2410C]" /> Terms of Service
            </h1>
            <p className="text-xs text-[#71717A] mt-1">Last Updated: August 2026</p>
          </div>

          <Card className="p-8 space-y-6 bg-white shadow-md border-[#E4E4E7] text-xs text-zinc-800 leading-relaxed">
            <section className="space-y-2">
              <h2 className="text-base font-bold text-zinc-900">1. Marketplace Conduct</h2>
              <p>
                RoundIQ connects students with verified senior software engineering mentors. Both candidates and interviewers agree to adhere to professional conduct guidelines during live video sessions.
              </p>
            </section>

            <section className="space-y-2">
              <h2 className="text-base font-bold text-zinc-900">2. Session Attendance & No-Shows</h2>
              <p>
                Participants must join scheduled Google Meet sessions on time. No-show occurrences are tracked by platform telemetry and impact user trust reputation scores.
              </p>
            </section>
          </Card>
        </div>
      </main>

      <Footer />
    </div>
  );
}
