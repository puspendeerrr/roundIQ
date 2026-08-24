'use client';

import React, { useEffect, useState } from 'react';
import Link from 'next/link';
import { Navbar } from '../../../../components/layout/Navbar';
import { Footer } from '../../../../components/layout/Footer';
import { Card } from '../../../../components/ui/Card';
import { Button } from '../../../../components/ui/Button';
import { apiClient } from '../../../../lib/api-client';
import {
  LifeBuoy,
  MessageSquare,
  CheckCircle2,
  Clock,
  ChevronLeft,
  ChevronRight,
  ShieldCheck,
  Send,
} from 'lucide-react';

export default function AdminSupportPage() {
  const [tickets, setTickets] = useState<any[]>([]);
  const [selectedTicket, setSelectedTicket] = useState<any | null>(null);
  const [replyMessage, setReplyMessage] = useState('');
  const [isInternalNote, setIsInternalNote] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [isSending, setIsSending] = useState(false);

  const fetchTickets = async () => {
    try {
      setIsLoading(true);
      const res: any = await apiClient.get('/support/admin');
      if (res?.data) {
        setTickets(res.data);
        if (res.data.length > 0) setSelectedTicket(res.data[0]);
      }
    } catch (e) {
      setTickets([]);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchTickets();
  }, []);

  const handleSendReply = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedTicket || !replyMessage.trim()) return;

    try {
      setIsSending(true);
      await apiClient.post(`/support/${selectedTicket.id}/message`, {
        message: replyMessage,
        isInternalNote,
      });
      setReplyMessage('');
      fetchTickets();
    } catch (e) {
      // Ignore
    } finally {
      setIsSending(false);
    }
  };

  const handleUpdateStatus = async (ticketId: string, status: string) => {
    try {
      await apiClient.patch(`/support/admin/${ticketId}`, { status });
      fetchTickets();
    } catch (e) {
      // Ignore
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
                <LifeBuoy className="h-6 w-6 text-[#C2410C]" /> Customer Support Ticket Desk & SLA Monitor
              </h1>
              <p className="text-xs text-[#71717A] mt-0.5">
                Audit incoming support tickets, dispatch agent replies, and record internal support notes.
              </p>
            </div>

            <div className="flex items-center gap-2">
              <Link href="/admin/dashboard">
                <Button size="sm" variant="outline">&larr; Admin Dashboard</Button>
              </Link>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-12 gap-6">
            {/* Ticket Queue Sidebar */}
            <div className="md:col-span-5 space-y-3">
              <h3 className="text-xs font-bold text-zinc-900 uppercase tracking-wider">Ticket Desk Queue</h3>

              {isLoading ? (
                <Card className="p-4 text-center text-xs text-zinc-400 animate-pulse">Loading support tickets...</Card>
              ) : tickets.length === 0 ? (
                <Card className="p-4 text-center text-xs text-zinc-500 italic">No support tickets found.</Card>
              ) : (
                tickets.map((t) => (
                  <Card
                    key={t.id}
                    className={`p-4 cursor-pointer transition-all ${
                      selectedTicket?.id === t.id
                        ? 'border-2 border-[#C2410C] bg-orange-50/50 shadow-md'
                        : 'bg-white hover:bg-slate-50 border-[#E4E4E7]'
                    }`}
                    onClick={() => setSelectedTicket(t)}
                  >
                    <div className="flex justify-between items-center mb-1">
                      <span className="font-mono text-xs font-bold text-zinc-900">{t.ticketNumber}</span>
                      <span className="text-[10px] font-bold px-2 py-0.5 rounded bg-blue-100 text-blue-800">
                        {t.priority}
                      </span>
                    </div>

                    <h4 className="text-xs font-bold text-zinc-900 truncate">{t.subject}</h4>
                    <p className="text-[11px] text-[#71717A] truncate mt-1">User: {t.user?.email}</p>
                  </Card>
                ))
              )}
            </div>

            {/* Selected Ticket Timeline & Reply Panel */}
            <div className="md:col-span-7">
              {selectedTicket ? (
                <Card className="p-6 space-y-4 bg-white shadow-md border-[#E4E4E7]">
                  <div className="flex justify-between items-start border-b border-[#E4E4E7] pb-3">
                    <div>
                      <span className="font-mono text-xs font-bold text-[#C2410C]">{selectedTicket.ticketNumber}</span>
                      <h3 className="text-base font-black text-zinc-900">{selectedTicket.subject}</h3>
                      <p className="text-xs text-[#71717A]">Created by: {selectedTicket.user?.email}</p>
                    </div>

                    <div className="flex items-center gap-2">
                      <Button
                        size="sm"
                        className="bg-green-700 hover:bg-green-800 text-white font-bold"
                        onClick={() => handleUpdateStatus(selectedTicket.id, 'RESOLVED')}
                      >
                        Mark Resolved
                      </Button>
                    </div>
                  </div>

                  {/* Messages Stream */}
                  <div className="space-y-3 max-h-80 overflow-y-auto pr-1">
                    {selectedTicket.messages?.map((m: any) => (
                      <div
                        key={m.id}
                        className={`p-3 rounded-xl text-xs space-y-1 ${
                          m.isInternalNote
                            ? 'bg-amber-50 border border-amber-200 text-amber-900'
                            : m.sender?.role === 'ADMIN'
                            ? 'bg-orange-50 border border-orange-200 text-zinc-900'
                            : 'bg-slate-50 border border-[#E4E4E7] text-zinc-900'
                        }`}
                      >
                        <div className="flex justify-between text-[10px] text-[#71717A]">
                          <span className="font-bold">{m.sender?.email} {m.isInternalNote && '(INTERNAL NOTE)'}</span>
                          <span>{new Date(m.createdAt).toLocaleString()}</span>
                        </div>
                        <p className="leading-relaxed">{m.message}</p>
                      </div>
                    ))}
                  </div>

                  {/* Reply Input Form */}
                  <form onSubmit={handleSendReply} className="space-y-3 pt-3 border-t border-[#E4E4E7] text-xs">
                    <textarea
                      rows={3}
                      placeholder="Type agent response or internal note..."
                      value={replyMessage}
                      onChange={(e) => setReplyMessage(e.target.value)}
                      className="w-full rounded-lg border border-[#E4E4E7] p-2.5 text-xs text-zinc-900 focus:ring-1 focus:ring-orange-500"
                    />

                    <div className="flex items-center justify-between">
                      <label className="flex items-center gap-2 text-amber-800 font-semibold cursor-pointer">
                        <input
                          type="checkbox"
                          checked={isInternalNote}
                          onChange={(e) => setIsInternalNote(e.target.checked)}
                          className="h-4 w-4 rounded border-amber-300 text-amber-600 focus:ring-amber-500"
                        />
                        Internal Agent Note (Visible to team only)
                      </label>

                      <Button type="submit" className="bg-[#C2410C] text-white font-bold" isLoading={isSending}>
                        Send Message
                      </Button>
                    </div>
                  </form>
                </Card>
              ) : (
                <Card className="p-8 text-center text-xs text-zinc-500 italic">Select a ticket to inspect.</Card>
              )}
            </div>
          </div>
        </div>
      </main>

      <Footer />
    </div>
  );
}
