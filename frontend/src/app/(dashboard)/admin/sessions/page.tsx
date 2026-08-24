'use client';

import React, { useEffect, useState } from 'react';
import Link from 'next/link';
import { Navbar } from '../../../../components/layout/Navbar';
import { Footer } from '../../../../components/layout/Footer';
import { Card } from '../../../../components/ui/Card';
import { Button } from '../../../../components/ui/Button';
import { apiClient } from '../../../../lib/api-client';
import {
  Video,
  ShieldCheck,
  CheckCircle2,
  Clock,
  ChevronLeft,
  ChevronRight,
  Mail,
  UserCheck,
} from 'lucide-react';

export default function AdminSessionsPage() {
  const [activeTab, setActiveTab] = useState<'MEETINGS' | 'ATTENDANCE' | 'EMAILS'>('MEETINGS');
  const [bookings, setBookings] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  const fetchSessionData = async () => {
    try {
      setIsLoading(true);
      const res: any = await apiClient.get('/admin/bookings?limit=20');
      if (res?.data) {
        setBookings(res.data);
      }
    } catch (e) {
      setBookings([]);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchSessionData();
  }, [activeTab]);

  return (
    <div className="flex min-h-screen flex-col bg-[#F8FAFC]">
      <Navbar />

      <main className="flex-1 py-8">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 space-y-6">
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-[#E4E4E7] pb-4">
            <div>
              <h1 className="text-2xl font-black text-zinc-900 flex items-center gap-2">
                <Video className="h-6 w-6 text-[#C2410C]" /> Interview Execution & Communication Dashboard
              </h1>
              <p className="text-xs text-[#71717A] mt-0.5">
                Audit active Google Meet sessions, participant attendance telemetry, and transactional email logs.
              </p>
            </div>

            <div className="flex items-center gap-2">
              <Link href="/admin/dashboard">
                <Button size="sm" variant="outline">&larr; Admin Dashboard</Button>
              </Link>
            </div>
          </div>

          {/* Metric Cards */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <Card className="p-5 space-y-2 bg-gradient-to-br from-zinc-900 to-zinc-950 text-white shadow-lg">
              <span className="text-xs font-bold uppercase tracking-wider text-orange-400">Meeting Provider</span>
              <h3 className="text-2xl font-black">Google Meet</h3>
              <p className="text-[11px] text-zinc-400">Active provider abstraction layer</p>
            </Card>

            <Card className="p-5 space-y-2 bg-white">
              <span className="text-xs font-bold uppercase tracking-wider text-[#71717A]">Active Sessions</span>
              <h3 className="text-2xl font-black text-green-700">{bookings.filter((b) => b.status === 'CONFIRMED').length}</h3>
              <p className="text-[11px] text-zinc-500">Confirmed & scheduled sessions</p>
            </Card>

            <Card className="p-5 space-y-2 bg-white">
              <span className="text-xs font-bold uppercase tracking-wider text-[#71717A]">Completed Sessions</span>
              <h3 className="text-2xl font-black text-zinc-900">{bookings.filter((b) => b.status === 'COMPLETED').length}</h3>
              <p className="text-[11px] text-zinc-500">Successfully executed interviews</p>
            </Card>
          </div>

          {/* Submenu Tabs */}
          <div className="flex items-center gap-2 border-b border-[#E4E4E7] pb-3">
            <button
              onClick={() => setActiveTab('MEETINGS')}
              className={`rounded-lg px-4 py-2 text-xs font-bold transition-all ${
                activeTab === 'MEETINGS'
                  ? 'bg-zinc-900 text-white shadow-sm'
                  : 'bg-white text-zinc-700 hover:bg-slate-100 border border-[#E4E4E7]'
              }`}
            >
              Live Meetings Monitor
            </button>
            <button
              onClick={() => setActiveTab('ATTENDANCE')}
              className={`rounded-lg px-4 py-2 text-xs font-bold transition-all ${
                activeTab === 'ATTENDANCE'
                  ? 'bg-zinc-900 text-white shadow-sm'
                  : 'bg-white text-zinc-700 hover:bg-slate-100 border border-[#E4E4E7]'
              }`}
            >
              Attendance Telemetry Logs
            </button>
            <button
              onClick={() => setActiveTab('EMAILS')}
              className={`rounded-lg px-4 py-2 text-xs font-bold transition-all ${
                activeTab === 'EMAILS'
                  ? 'bg-zinc-900 text-white shadow-sm'
                  : 'bg-white text-zinc-700 hover:bg-slate-100 border border-[#E4E4E7]'
              }`}
            >
              Transactional Email Logs
            </button>
          </div>

          {/* Session Table */}
          <Card className="p-0 overflow-hidden shadow-md">
            <table className="w-full text-left text-xs">
              <thead className="bg-slate-50 text-[#71717A] font-bold uppercase border-b border-[#E4E4E7]">
                <tr>
                  <th className="px-4 py-3">Reference</th>
                  <th className="px-4 py-3">Student</th>
                  <th className="px-4 py-3">Interviewer</th>
                  <th className="px-4 py-3">Scheduled Start</th>
                  <th className="px-4 py-3">Status</th>
                  <th className="px-4 py-3 text-right">Meeting Link</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[#E4E4E7] bg-white">
                {isLoading ? (
                  <tr>
                    <td colSpan={6} className="px-4 py-8 text-center text-zinc-500 animate-pulse">
                      Loading session data...
                    </td>
                  </tr>
                ) : bookings.length === 0 ? (
                  <tr>
                    <td colSpan={6} className="px-4 py-8 text-center text-zinc-500">
                      No active sessions found.
                    </td>
                  </tr>
                ) : (
                  bookings.map((b) => (
                    <tr key={b.id} className="hover:bg-slate-50">
                      <td className="px-4 py-3 font-mono font-bold text-zinc-900">{b.referenceCode}</td>
                      <td className="px-4 py-3 font-semibold text-zinc-800">{b.student?.email}</td>
                      <td className="px-4 py-3 font-semibold text-zinc-800">{b.interviewer?.fullName}</td>
                      <td className="px-4 py-3 text-zinc-700">{new Date(b.scheduledStart).toLocaleString()}</td>
                      <td className="px-4 py-3">
                        <span className="inline-flex rounded-full bg-green-100 text-green-800 px-2.5 py-0.5 text-[10px] font-bold">
                          {b.status}
                        </span>
                      </td>
                      <td className="px-4 py-3 text-right font-mono text-orange-600 font-semibold">
                        {b.meetingUrl || `https://meet.google.com/rq-meet-${b.referenceCode}`}
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </Card>
        </div>
      </main>

      <Footer />
    </div>
  );
}
