'use client';

import React from 'react';
import { Navbar } from '../../../components/layout/Navbar';
import { Footer } from '../../../components/layout/Footer';
import { Card } from '../../../components/ui/Card';
import { DollarSign } from 'lucide-react';

export default function RefundPolicyPage() {
  return (
    <div className="flex min-h-screen flex-col bg-[#F8FAFC]">
      <Navbar />

      <main className="flex-1 py-12">
        <div className="mx-auto max-w-4xl px-4 sm:px-6 lg:px-8 space-y-6">
          <div className="border-b border-[#E4E4E7] pb-4">
            <h1 className="text-3xl font-black text-zinc-900 flex items-center gap-2">
              <DollarSign className="h-8 w-8 text-[#C2410C]" /> Cancellation & Refund Policy
            </h1>
            <p className="text-xs text-[#71717A] mt-1">Last Updated: August 2026</p>
          </div>

          <Card className="p-8 space-y-6 bg-white shadow-md border-[#E4E4E7] text-xs text-zinc-800 leading-relaxed">
            <section className="space-y-2">
              <h2 className="text-base font-bold text-zinc-900">1. Cancellation Timelines</h2>
              <ul className="list-disc pl-5 space-y-1 text-zinc-700">
                <li><strong>Over 48 Hours Notice:</strong> 100% full refund credited to student wallet/original payment source.</li>
                <li><strong>24–48 Hours Notice:</strong> 50% refund credited.</li>
                <li><strong>Under 24 Hours Notice:</strong> 0% refund (interviewer slot reservation fee applies).</li>
              </ul>
            </section>

            <section className="space-y-2">
              <h2 className="text-base font-bold text-zinc-900">2. Interviewer Cancellation</h2>
              <p>
                If an interviewer declines or cancels a confirmed session, the student receives an automatic 100% full refund.
              </p>
            </section>
          </Card>
        </div>
      </main>

      <Footer />
    </div>
  );
}
