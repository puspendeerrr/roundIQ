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
  Clock,
  Calendar,
  CheckCircle2,
  ChevronLeft,
  ExternalLink,
  ShieldCheck,
  User,
  Building,
} from 'lucide-react';

export default function StudentSessionPage() {
  const params = useParams();
  const bookingId = (params?.bookingId as string) || '';
  const [booking, setBooking] = useState<Booking | null>(null);
  const [meeting, setMeeting] = useState<any>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [joined, setJoined] = useState(false);

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

  const handleJoinMeeting = async () => {
    if (!meeting?.meetingUrl) return;

    try {
      // Record telemetry join
      await apiClient.post('/attendance/join', {
        bookingId,
        device: 'Web Browser',
      });
      setJoined(true);
    } catch (e) {
      // Ignore
    }

    // Open Google Meet in new tab
    window.open(meeting.meetingUrl, '_blank');
  };

  if (isLoading) {
    return (
      <div className="flex min-h-screen flex-col bg-[#F8FAFC]">
        <Navbar />
        <main className="flex-1 py-16 text-center text-xs text-zinc-500 animate-pulse">
          Loading live session portal & meeting credentials...
        </main>
        <Footer />
      </div>
    );
  }

  return (
    <div className="flex min-h-screen flex-col bg-[#F8FAFC]">
      <Navbar />

      <main className="flex-1 py-8">
        <div className="mx-auto max-w-4xl px-4 sm:px-6 lg:px-8 space-y-6">
          <Link
            href="/student/bookings"
            className="inline-flex items-center gap-1 text-xs font-semibold text-[#71717A] hover:text-zinc-900"
          >
            <ChevronLeft className="h-4 w-4" /> Back to My Bookings
          </Link>

          <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-[#E4E4E7] pb-4">
            <div>
              <span className="inline-flex items-center gap-1.5 text-xs font-bold text-green-700 bg-green-50 px-3 py-1 rounded-full border border-green-200 mb-2">
                <CheckCircle2 className="h-3.5 w-3.5" /> Session Confirmed
              </span>
              <h1 className="text-2xl font-black text-zinc-900 flex items-center gap-2">
                <Video className="h-6 w-6 text-[#C2410C]" /> Live Mock Interview Room
              </h1>
              <p className="text-xs text-[#71717A] mt-0.5">
                Reference Code: <strong className="font-mono text-zinc-900">{booking?.referenceCode}</strong>
              </p>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-12 gap-6">
            {/* Main Meeting Banner */}
            <div className="md:col-span-8 space-y-6">
              <Card className="p-8 space-y-6 bg-gradient-to-br from-zinc-900 to-zinc-950 text-white shadow-xl border border-zinc-800">
                <div className="space-y-2">
                  <span className="text-xs font-bold uppercase tracking-wider text-orange-400">
                    Google Meet Provider Integration
                  </span>
                  <h2 className="text-xl font-black">Ready to Join Session</h2>
                  <p className="text-xs text-zinc-400 leading-relaxed">
                    Ensure your camera, microphone, and internet connection are tested before joining.
                  </p>
                </div>

                <div className="p-4 rounded-xl bg-zinc-800/80 border border-zinc-700 space-y-2 text-xs">
                  <div className="flex justify-between">
                    <span className="text-zinc-400">Scheduled Time:</span>
                    <span className="font-bold text-white">
                      {booking?.scheduledStart ? new Date(booking.scheduledStart).toLocaleString() : 'N/A'}
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-zinc-400">Duration:</span>
                    <span className="font-bold text-white">{booking?.durationMinutes} Minutes</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-zinc-400">Meeting Link:</span>
                    <span className="font-mono text-orange-400 font-bold">{meeting?.meetingUrl}</span>
                  </div>
                </div>

                <Button
                  size="lg"
                  className="w-full bg-[#C2410C] hover:bg-[#9A3412] text-white font-bold py-3 shadow-lg"
                  onClick={handleJoinMeeting}
                  rightIcon={<ExternalLink className="h-4 w-4" />}
                >
                  Join Google Meet Session
                </Button>

                {joined && (
                  <p className="text-xs text-center text-green-400 font-semibold animate-pulse">
                    ✓ Join telemetry recorded in session attendance log.
                  </p>
                )}
              </Card>
            </div>

            {/* Interviewer Details Sidebar */}
            <div className="md:col-span-4 space-y-6">
              <Card className="p-6 space-y-4 bg-white shadow-md">
                <h3 className="text-xs font-bold text-zinc-900 uppercase tracking-wider border-b border-[#E4E4E7] pb-2">
                  Interviewer Profile
                </h3>

                <div className="space-y-3 text-xs">
                  <div>
                    <span className="text-[#71717A] uppercase font-semibold">Name</span>
                    <p className="font-bold text-zinc-900 text-sm">{booking?.interviewer?.fullName}</p>
                  </div>
                  <div>
                    <span className="text-[#71717A] uppercase font-semibold">Headline</span>
                    <p className="font-semibold text-zinc-800">{booking?.interviewer?.headline || 'Senior SDE'}</p>
                  </div>
                  <div>
                    <span className="text-[#71717A] uppercase font-semibold">Current Company</span>
                    <p className="font-semibold text-zinc-800">{booking?.interviewer?.currentCompany || 'Tech Company'}</p>
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
