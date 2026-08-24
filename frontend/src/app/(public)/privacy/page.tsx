'use client';

import React from 'react';
import { Navbar } from '../../../components/layout/Navbar';
import { Footer } from '../../../components/layout/Footer';
import { Card } from '../../../components/ui/Card';
import { ShieldCheck } from 'lucide-react';

export default function PrivacyPolicyPage() {
  return (
    <div className="flex min-h-screen flex-col bg-[#F8FAFC]">
      <Navbar />

      <main className="flex-1 py-12">
        <div className="mx-auto max-w-4xl px-4 sm:px-6 lg:px-8 space-y-6">
          <div className="border-b border-[#E4E4E7] pb-4">
            <h1 className="text-3xl font-black text-zinc-900 flex items-center gap-2">
              <ShieldCheck className="h-8 w-8 text-[#C2410C]" /> Privacy Policy
            </h1>
            <p className="text-xs text-[#71717A] mt-1">Last Updated: August 2026</p>
          </div>

          <Card className="p-8 space-y-6 bg-white shadow-md border-[#E4E4E7] text-xs text-zinc-800 leading-relaxed">
            <section className="space-y-2">
              <h2 className="text-base font-bold text-zinc-900">1. Data Collection & Usage</h2>
              <p>
                RoundIQ collects personal information including name, email address, timezone, and professional background to facilitate 1-on-1 human technical mock interviews.
              </p>
            </section>

            <section className="space-y-2">
              <h2 className="text-base font-bold text-zinc-900">2. GDPR Compliance & Data Portability</h2>
              <p>
                In compliance with EU GDPR regulations, users retain full ownership of their data. You can download a complete machine-readable copy of your profile data or request account deletion via your Account Security Center.
              </p>
            </section>

            <section className="space-y-2">
              <h2 className="text-base font-bold text-zinc-900">3. Payment & Security Standards</h2>
              <p>
                Payments are processed securely via Razorpay under PCI-DSS Level 1 compliance. RoundIQ does not store credit card or UPI security credentials on platform servers.
              </p>
            </section>
          </Card>
        </div>
      </main>

      <Footer />
    </div>
  );
}
