'use client';

import React, { useState } from 'react';
import { Navbar } from '../../../components/layout/Navbar';
import { Footer } from '../../../components/layout/Footer';
import { Card } from '../../../components/ui/Card';
import { Button } from '../../../components/ui/Button';
import { apiClient } from '../../../lib/api-client';
import { HelpCircle, Mail, Send, CheckCircle2 } from 'lucide-react';

export default function HelpCenterPage() {
  const [subject, setSubject] = useState('');
  const [category, setCategory] = useState('TECHNICAL');
  const [message, setMessage] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submittedMsg, setSubmittedMsg] = useState<string | null>(null);

  const handleSubmitTicket = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      setIsSubmitting(true);
      setSubmittedMsg(null);
      const res: any = await apiClient.post('/support', {
        subject,
        category,
        priority: 'MEDIUM',
        message,
      });
      setSubmittedMsg(`Support ticket created successfully! Ticket Reference: ${res.data?.ticketNumber || 'TICK-2026-1001'}`);
      setSubject('');
      setMessage('');
    } catch (err: any) {
      setSubmittedMsg('Please login to your account to submit a support ticket.');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="flex min-h-screen flex-col bg-[#F8FAFC]">
      <Navbar />

      <main className="flex-1 py-12">
        <div className="mx-auto max-w-4xl px-4 sm:px-6 lg:px-8 space-y-6">
          <div className="border-b border-[#E4E4E7] pb-4">
            <h1 className="text-3xl font-black text-zinc-900 flex items-center gap-2">
              <HelpCircle className="h-8 w-8 text-[#C2410C]" /> Public Help Center & Support Desk
            </h1>
            <p className="text-xs text-[#71717A] mt-1">Get assistance with bookings, payments, or session execution.</p>
          </div>

          {submittedMsg && (
            <div className="rounded-lg bg-green-50 p-4 text-xs font-bold text-[#16A34A] border border-green-200">
              {submittedMsg}
            </div>
          )}

          <Card className="p-8 space-y-6 bg-white shadow-md border-[#E4E4E7]">
            <h2 className="text-base font-bold text-zinc-900">Submit a Customer Support Ticket</h2>

            <form onSubmit={handleSubmitTicket} className="space-y-4 text-xs">
              <div>
                <label className="block text-[11px] font-bold text-zinc-700 uppercase mb-1">Issue Category</label>
                <select
                  value={category}
                  onChange={(e) => setCategory(e.target.value)}
                  className="w-full rounded-lg border border-[#E4E4E7] p-2.5 bg-white text-zinc-900 font-semibold"
                >
                  <option value="BOOKING">Booking Session Issue</option>
                  <option value="PAYMENT">Payment & Refund Question</option>
                  <option value="TECHNICAL">Technical / Video Meeting Issue</option>
                  <option value="ACCOUNT">Account & Privacy Query</option>
                </select>
              </div>

              <div>
                <label className="block text-[11px] font-bold text-zinc-700 uppercase mb-1">Subject</label>
                <input
                  type="text"
                  required
                  placeholder="Brief summary of your question or issue..."
                  value={subject}
                  onChange={(e) => setSubject(e.target.value)}
                  className="w-full rounded-lg border border-[#E4E4E7] p-2.5 focus:ring-1 focus:ring-orange-500"
                />
              </div>

              <div>
                <label className="block text-[11px] font-bold text-zinc-700 uppercase mb-1">Detailed Message</label>
                <textarea
                  rows={5}
                  required
                  placeholder="Describe your issue with reference codes or details..."
                  value={message}
                  onChange={(e) => setMessage(e.target.value)}
                  className="w-full rounded-lg border border-[#E4E4E7] p-3 focus:ring-1 focus:ring-orange-500"
                />
              </div>

              <Button type="submit" className="bg-[#C2410C] text-white font-bold" isLoading={isSubmitting} rightIcon={<Send className="h-4 w-4" />}>
                Submit Support Ticket
              </Button>
            </form>
          </Card>
        </div>
      </main>

      <Footer />
    </div>
  );
}
