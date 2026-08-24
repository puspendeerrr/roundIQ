'use client';

import React, { useEffect, useState } from 'react';
import Link from 'next/link';
import { useParams } from 'next/navigation';
import { Navbar } from '../../../../../components/layout/Navbar';
import { Footer } from '../../../../../components/layout/Footer';
import { Card } from '../../../../../components/ui/Card';
import { Button } from '../../../../../components/ui/Button';
import { apiClient } from '../../../../../lib/api-client';
import { Booking } from '../../../../../types';
import {
  Video,
  ExternalLink,
  CheckCircle2,
  ChevronLeft,
  FileText,
  User,
  Clock,
} from 'lucide-react';

export default function InterviewerSessionPage() {
  const params = useParams();
  const bookingId = (params?.bookingId as string) || '';
  const [booking, setBooking] = useState<Booking | null>(null);
  const [meeting, setMeeting] = useState<any>(null);
  const [notes, setNotes] = useState('');
  const [isLoading, setIsLoading] = useState(true);
  const [isCompleting, setIsCompleting] = useState(false);
  const [completedMsg, setCompletedMsg] = useState<string | null>(null);

  useEffect(() => {
    const fetchSessionDetails = async () => {
      try {
        setIsLoading(true);
        const [bookingRes, meetingRes]: any = await Promise.all([
          apiClient.get(`/bookings/${bookingId}`),
          apiClient.get(`/meetings/${bookingId}`),
        ]);

        if (bookingRes?.data) setBooking(bookingRes.data);
        if (meetingRes?.data) setMeeting(meetingRes.data);
      } catch (e) {
        // Fallback
      } finally {
        setIsLoading(false);
      }
    };

    if (bookingId) fetchSessionDetails();
  }, [bookingId]);

  const handleJoinHostMeeting = async () => {
    if (!meeting?.meetingUrl) return;

    try {
      await apiClient.post('/attendance/join', {
        bookingId,
        device: 'Interviewer Host Workstation',
      });
    } catch (e) {
      // Ignore
    }

    window.open(meeting.hostUrl || meeting.meetingUrl, '_blank');
  };

  const handleCompleteSession = async () => {
    try {
      setIsCompleting(true);
      await apiClient.post(`/bookings/${bookingId}/complete`);
      setCompletedMsg('Session marked COMPLETED successfully! Pending earnings have been moved to withdrawable balance.');
    } catch (e: any) {
      setCompletedMsg(e?.error?.message || 'Failed to complete session.');
    } finally {
      setIsCompleting(false);
    }
  };

  if (isLoading) {
    return (
      <div className="flex min-h-screen flex-col bg-[#F8FAFC]">
        <Navbar />
        <main className="flex-1 py-16 text-center text-xs text-zinc-500 animate-pulse">
          Loading interviewer candidate & meeting room...
        </main>
        <Footer />
      </div>
    );
  }

  return (
    <div className="flex min-h-screen flex-col bg-[#F8FAFC]">
      <Navbar />

      <main className="flex-1 py-8">
        <div className="mx-auto max-w-5xl px-4 sm:px-6 lg:px-8 space-y-6">
          <Link
            href="/interviewer/bookings"
            className="inline-flex items-center gap-1 text-xs font-semibold text-[#71717A] hover:text-zinc-900"
          >
            <ChevronLeft className="h-4 w-4" /> Back to Session Requests
          </Link>

          <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-[#E4E4E7] pb-4">
            <div>
              <span className="inline-flex items-center gap-1.5 text-xs font-bold text-green-700 bg-green-50 px-3 py-1 rounded-full border border-green-200 mb-2">
                <CheckCircle2 className="h-3.5 w-3.5" /> Host Controls Active
              </span>
              <h1 className="text-2xl font-black text-zinc-900 flex items-center gap-2">
                <Video className="h-6 w-6 text-[#C2410C]" /> Interviewer Control Portal
              </h1>
              <p className="text-xs text-[#71717A] mt-0.5">
                Reference Code: <strong className="font-mono text-zinc-900">{booking?.referenceCode}</strong>
              </p>
            </div>

            <div className="flex items-center gap-2">
              <Button
                size="sm"
                className="bg-green-700 hover:bg-green-800 text-white font-bold"
                onClick={handleCompleteSession}
                isLoading={isCompleting}
              >
                Complete Session & Release Earnings
              </Button>
            </div>
          </div>

          {completedMsg && (
            <div className="rounded-lg bg-green-50 p-4 text-xs font-bold text-[#16A34A] border border-green-200">
              {completedMsg}
            </div>
          )}

          <div className="grid grid-cols-1 md:grid-cols-12 gap-6">
            {/* Host Meeting Banner & Notes */}
            <div className="md:col-span-7 space-y-6">
              <Card className="p-6 space-y-4 bg-gradient-to-br from-zinc-900 to-zinc-950 text-white shadow-xl border border-zinc-800">
                <span className="text-xs font-bold uppercase tracking-wider text-orange-400">
                  Google Meet Host Portal
                </span>
                <h2 className="text-xl font-black">Launch Host Meeting</h2>

                <Button
                  size="lg"
                  className="w-full bg-[#C2410C] hover:bg-[#9A3412] text-white font-bold py-3 shadow-lg"
                  onClick={handleJoinHostMeeting}
                  rightIcon={<ExternalLink className="h-4 w-4" />}
                >
                  Join Google Meet as Host
                </Button>
              </Card>

              {/* Private Interviewer Notes Pad */}
              <Card className="p-6 space-y-3 bg-white shadow-md">
                <h3 className="text-sm font-bold text-zinc-900 uppercase tracking-wider border-b border-[#E4E4E7] pb-2">
                  Private Session Notes
                </h3>
                <textarea
                  rows={6}
                  placeholder="Record private candidate feedback on DSA problem solving, system design, or code quality..."
                  value={notes}
                  onChange={(e) => setNotes(e.target.value)}
                  className="w-full rounded-xl border border-[#E4E4E7] p-3 text-xs text-zinc-900 focus:ring-1 focus:ring-orange-500"
                />
              </Card>
            </div>

            {/* Candidate Details Sidebar */}
            <div className="md:col-span-5 space-y-6">
              <Card className="p-6 space-y-4 bg-white shadow-md">
                <h3 className="text-xs font-bold text-zinc-900 uppercase tracking-wider border-b border-[#E4E4E7] pb-2 flex items-center gap-2">
                  <User className="h-4 w-4 text-[#C2410C]" /> Candidate Profile
                </h3>

                <div className="space-y-3 text-xs">
                  <div>
                    <span className="text-[#71717A] uppercase font-semibold">Student Name</span>
                    <p className="font-bold text-zinc-900 text-sm">
                      {booking?.studentProfile?.fullName || 'Student'}
                    </p>
                  </div>
                  <div>
                    <span className="text-[#71717A] uppercase font-semibold">College / Degree</span>
                    <p className="font-semibold text-zinc-800">
                      {booking?.studentProfile?.college || 'PEC Chandigarh'} (
                      {booking?.studentProfile?.degree || 'B.Tech CS'})
                    </p>
                  </div>
                  <div>
                    <span className="text-[#71717A] uppercase font-semibold">Resume URL</span>
                    <p className="font-mono text-blue-600 truncate">
                      {booking?.studentResumeUrl || booking?.studentProfile?.resumeUrl || 'None provided'}
                    </p>
                  </div>
                  <div>
                    <span className="text-[#71717A] uppercase font-semibold">Preparation Notes</span>
                    <p className="text-zinc-700 bg-slate-50 p-3 rounded-lg border border-[#E4E4E7] mt-1">
                      {booking?.studentNotes || 'Preparing for Tier-1 SDE roles.'}
                    </p>
                  </div>
                </div>
              </Card>
            </div>
          </div>
        </div>
      </main>

      <Footer />
    </div>
  );
}
