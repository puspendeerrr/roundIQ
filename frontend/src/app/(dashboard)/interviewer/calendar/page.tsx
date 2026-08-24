'use client';

import React, { useEffect, useState } from 'react';
import Link from 'next/link';
import { Navbar } from '../../../../components/layout/Navbar';
import { Footer } from '../../../../components/layout/Footer';
import { Card } from '../../../../components/ui/Card';
import { Button } from '../../../../components/ui/Button';
import { apiClient } from '../../../../lib/api-client';
import { Booking } from '../../../../types';
import { Calendar as CalendarIcon, Clock, ChevronLeft, ChevronRight, User } from 'lucide-react';

export default function InterviewerCalendarPage() {
  const [viewMode, setViewMode] = useState<'MONTH' | 'WEEK' | 'DAY'>('MONTH');
  const [currentDate, setCurrentDate] = useState<Date>(new Date());
  const [bookings, setBookings] = useState<Booking[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const fetchCalendarBookings = async () => {
      try {
        setIsLoading(true);
        const res: any = await apiClient.get('/bookings/interviewer?limit=50');
        if (res?.data) {
          setBookings(res.data);
        }
      } catch (e) {
        setBookings([]);
      } finally {
        setIsLoading(false);
      }
    };
    fetchCalendarBookings();
  }, []);

  const handlePrev = () => {
    const d = new Date(currentDate);
    if (viewMode === 'MONTH') d.setMonth(d.getMonth() - 1);
    if (viewMode === 'WEEK') d.setDate(d.getDate() - 7);
    if (viewMode === 'DAY') d.setDate(d.getDate() - 1);
    setCurrentDate(d);
  };

  const handleNext = () => {
    const d = new Date(currentDate);
    if (viewMode === 'MONTH') d.setMonth(d.getMonth() + 1);
    if (viewMode === 'WEEK') d.setDate(d.getDate() + 7);
    if (viewMode === 'DAY') d.setDate(d.getDate() + 1);
    setCurrentDate(d);
  };

  return (
    <div className="flex min-h-screen flex-col bg-[#F8FAFC]">
      <Navbar />

      <main className="flex-1 py-8">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 space-y-6">
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-[#E4E4E7] pb-4">
            <div>
              <h1 className="text-2xl font-black text-zinc-900 flex items-center gap-2">
                <CalendarIcon className="h-6 w-6 text-[#C2410C]" /> Interview Booking Calendar
              </h1>
              <p className="text-xs text-[#71717A] mt-0.5">
                Internal calendar view of confirmed and requested mock sessions.
              </p>
            </div>

            <div className="flex items-center gap-3">
              <div className="flex items-center rounded-lg border border-[#E4E4E7] bg-white p-1">
                {(['MONTH', 'WEEK', 'DAY'] as const).map((mode) => (
                  <button
                    key={mode}
                    onClick={() => setViewMode(mode)}
                    className={`rounded-md px-3 py-1 text-xs font-bold transition-all ${
                      viewMode === mode
                        ? 'bg-zinc-900 text-white shadow-sm'
                        : 'text-zinc-600 hover:bg-slate-100'
                    }`}
                  >
                    {mode}
                  </button>
                ))}
              </div>

              <div className="flex items-center gap-1">
                <Button variant="outline" size="sm" onClick={handlePrev}>
                  <ChevronLeft className="h-4 w-4" />
                </Button>
                <Button variant="outline" size="sm" onClick={() => setCurrentDate(new Date())}>
                  Today
                </Button>
                <Button variant="outline" size="sm" onClick={handleNext}>
                  <ChevronRight className="h-4 w-4" />
                </Button>
              </div>
            </div>
          </div>

          <Card className="p-6 bg-white shadow-md space-y-4">
            <div className="flex items-center justify-between border-b border-[#E4E4E7] pb-3">
              <h2 className="text-base font-bold text-zinc-900">
                {currentDate.toLocaleDateString('en-US', {
                  month: 'long',
                  year: 'numeric',
                  day: viewMode === 'DAY' ? 'numeric' : undefined,
                })}
              </h2>
              <span className="text-xs font-semibold text-[#71717A]">
                {bookings.length} Total Sessions
              </span>
            </div>

            {/* Calendar Grid Representation */}
            {isLoading ? (
              <div className="py-16 text-center text-xs text-zinc-400 animate-pulse">
                Loading internal calendar...
              </div>
            ) : bookings.length === 0 ? (
              <div className="py-12 text-center text-xs text-zinc-500 italic">
                No session bookings found on this calendar view.
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {bookings.map((b) => {
                  const start = new Date(b.scheduledStart);
                  return (
                    <div
                      key={b.id}
                      className="p-4 rounded-xl border border-[#E4E4E7] bg-slate-50 space-y-2 hover:shadow-md transition-shadow"
                    >
                      <div className="flex items-center justify-between">
                        <span className="font-mono text-xs font-bold text-zinc-900">
                          {b.referenceCode}
                        </span>
                        <span
                          className={`rounded-full px-2 py-0.5 text-[10px] font-bold ${
                            b.status === 'CONFIRMED'
                              ? 'bg-green-100 text-green-800'
                              : b.status === 'REQUESTED'
                              ? 'bg-blue-100 text-blue-800'
                              : 'bg-zinc-200 text-zinc-700'
                          }`}
                        >
                          {b.status}
                        </span>
                      </div>

                      <div className="text-xs space-y-1">
                        <p className="font-bold text-zinc-900">
                          Student: {b.student?.studentProfile?.fullName || b.student?.email}
                        </p>
                        <p className="text-zinc-600 flex items-center gap-1 font-semibold">
                          <Clock className="h-3.5 w-3.5 text-[#C2410C]" />
                          {start.toLocaleDateString()} @ {start.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                        </p>
                        <p className="text-[11px] text-[#71717A]">Duration: {b.durationMinutes} Mins</p>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </Card>
        </div>
      </main>

      <Footer />
    </div>
  );
}
