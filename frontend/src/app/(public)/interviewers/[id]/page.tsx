'use client';

import React, { useEffect, useState, use } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { Navbar } from '../../../../components/layout/Navbar';
import { Footer } from '../../../../components/layout/Footer';
import { Card } from '../../../../components/ui/Card';
import { Button } from '../../../../components/ui/Button';
import { apiClient } from '../../../../lib/api-client';
import { useAuth } from '../../../../context/AuthContext';
import { InterviewerProfile, BookingSlot } from '../../../../types';
import {
  CheckCircle2,
  Building,
  Briefcase,
  Linkedin,
  Github,
  FileText,
  Clock,
  Calendar as CalendarIcon,
  ChevronLeft,
  ArrowRight,
  ShieldCheck,
  Globe,
  Sparkles,
  X,
  AlertCircle,
} from 'lucide-react';

export default function PublicInterviewerProfilePage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = use(params);
  const router = useRouter();
  const { user } = useAuth();

  const [profile, setProfile] = useState<InterviewerProfile | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  // Booking Engine State
  const [selectedDate, setSelectedDate] = useState<string>(
    new Date(Date.now() + 86400000).toISOString().split('T')[0] // Tomorrow default
  );
  const [selectedDuration, setSelectedDuration] = useState<number>(60);
  const [availableSlots, setAvailableSlots] = useState<BookingSlot[]>([]);
  const [isLoadingSlots, setIsLoadingSlots] = useState(false);
  const [selectedSlot, setSelectedSlot] = useState<BookingSlot | null>(null);

  // Modal State
  const [isBookingModalOpen, setIsBookingModalOpen] = useState(false);
  const [studentNotes, setStudentNotes] = useState('');
  const [studentResumeUrl, setStudentResumeUrl] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [bookingError, setBookingError] = useState<string | null>(null);
  const [bookingSuccessMsg, setBookingSuccessMsg] = useState<string | null>(null);

  useEffect(() => {
    const fetchProfile = async () => {
      try {
        setIsLoading(true);
        const res: any = await apiClient.get(`/interviewers/profile/${id}`);
        if (res?.data) {
          setProfile(res.data);
        }
      } catch (e) {
        setProfile(null);
      } finally {
        setIsLoading(false);
      }
    };
    fetchProfile();
  }, [id]);

  useEffect(() => {
    if (!id || !selectedDate) return;
    const fetchSlots = async () => {
      try {
        setIsLoadingSlots(true);
        const res: any = await apiClient.get(
          `/availability/interviewers/${id}/slots?date=${selectedDate}&duration=${selectedDuration}`
        );
        if (res?.data) {
          setAvailableSlots(res.data);
        }
      } catch (e) {
        setAvailableSlots([]);
      } finally {
        setIsLoadingSlots(false);
      }
    };
    fetchSlots();
  }, [id, selectedDate, selectedDuration]);

  const handleSlotSelect = (slot: BookingSlot) => {
    if (!user) {
      router.push(`/login?redirect=/interviewers/${id}`);
      return;
    }
    if (user?.role !== 'STUDENT') {
      setBookingError('Only Student accounts can request interview sessions.');
      return;
    }
    setSelectedSlot(slot);
    setBookingError(null);
    setIsBookingModalOpen(true);
  };

  const handleRequestBooking = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedSlot || !profile) return;

    try {
      setIsSubmitting(true);
      setBookingError(null);

      const payload = {
        interviewerProfileId: profile.id,
        scheduledStart: selectedSlot.startTime,
        scheduledEnd: selectedSlot.endTime,
        durationMinutes: selectedSlot.durationMinutes,
        timezone: Intl.DateTimeFormat().resolvedOptions().timeZone || 'Asia/Kolkata',
        studentNotes: studentNotes || undefined,
        studentResumeUrl: studentResumeUrl || undefined,
        bookingSource: 'WEB',
      };

      const res: any = await apiClient.post('/bookings', payload);

      if (res?.data) {
        setBookingSuccessMsg(
          `Request submitted successfully! Reference Code: ${res.data.referenceCode}`
        );
        setTimeout(() => {
          setIsBookingModalOpen(false);
          router.push('/student/bookings');
        }, 1500);
      }
    } catch (err: any) {
      setBookingError(err?.error?.message || err?.message || 'Failed to submit booking request.');
    } finally {
      setIsSubmitting(false);
    }
  };

  if (isLoading) {
    return (
      <div className="flex min-h-screen flex-col bg-[#F8FAFC]">
        <Navbar />
        <main className="flex-1 py-16 text-center text-zinc-500 animate-pulse">
          Loading interviewer profile...
        </main>
        <Footer />
      </div>
    );
  }

  if (!profile) {
    return (
      <div className="flex min-h-screen flex-col bg-[#F8FAFC]">
        <Navbar />
        <main className="flex-1 py-16 text-center">
          <Card className="max-w-md mx-auto p-8 space-y-4">
            <h2 className="text-xl font-bold text-zinc-900">Profile Not Found</h2>
            <p className="text-xs text-[#71717A]">
              This interviewer profile does not exist or is awaiting admin verification.
            </p>
            <Link href="/directory">
              <Button size="sm">Return to Marketplace Directory</Button>
            </Link>
          </Card>
        </main>
        <Footer />
      </div>
    );
  }

  return (
    <div className="flex min-h-screen flex-col bg-[#F8FAFC]">
      <Navbar />

      <main className="flex-1 py-8">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 space-y-6">
          <Link
            href="/directory"
            className="inline-flex items-center gap-1 text-xs font-semibold text-[#71717A] hover:text-zinc-900"
          >
            <ChevronLeft className="h-4 w-4" /> Back to Directory
          </Link>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            {/* Main Profile Info Column */}
            <div className="lg:col-span-2 space-y-6">
              <Card className="p-6 md:p-8 space-y-6 bg-white shadow-md border-[#E4E4E7]">
                <div className="flex flex-col sm:flex-row items-start sm:items-center gap-5">
                  <img
                    src={
                      profile.user?.avatarUrl ||
                      'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=200'
                    }
                    alt=""
                    className="h-20 w-20 rounded-2xl object-cover border-2 border-orange-100 shadow-sm"
                  />
                  <div className="space-y-1">
                    <div className="flex items-center gap-2">
                      <h1 className="text-2xl font-black text-zinc-900">{profile.fullName}</h1>
                      <span className="inline-flex items-center gap-1 rounded-full bg-green-100 px-2.5 py-0.5 text-xs font-bold text-[#16A34A]">
                        <CheckCircle2 className="h-3.5 w-3.5" /> Verified
                      </span>
                    </div>

                    <p className="text-sm font-semibold text-zinc-800">{profile.headline || 'Software Engineer'}</p>

                    <div className="flex flex-wrap items-center gap-4 text-xs text-[#71717A] pt-1">
                      {profile.currentCompany && (
                        <div className="flex items-center gap-1 font-bold text-zinc-900">
                          <Building className="h-4 w-4 text-[#C2410C]" /> {profile.currentCompany}
                        </div>
                      )}
                      <div className="flex items-center gap-1">
                        <Briefcase className="h-4 w-4 text-zinc-400" /> {profile.yearsOfExperience} Years Experience
                      </div>
                    </div>
                  </div>
                </div>

                <div className="space-y-2 border-t border-[#E4E4E7] pt-5">
                  <h3 className="text-xs font-bold uppercase tracking-wider text-[#71717A]">About & Interview Approach</h3>
                  <p className="text-xs text-zinc-700 leading-relaxed whitespace-pre-line">
                    {profile.bio || 'No bio provided.'}
                  </p>
                </div>

                {/* Verified Skills */}
                {profile.skills && profile.skills.length > 0 && (
                  <div className="space-y-2 border-t border-[#E4E4E7] pt-5">
                    <h3 className="text-xs font-bold uppercase tracking-wider text-[#71717A]">Verified Technical Expertise</h3>
                    <div className="flex flex-wrap gap-2 pt-1">
                      {profile.skills.map((s: any) => (
                        <span
                          key={s.skill?.id || s.id}
                          className="rounded-lg bg-slate-100 border border-[#E4E4E7] px-3 py-1 text-xs font-semibold text-zinc-800"
                        >
                          {s.skill?.name || s.name}
                        </span>
                      ))}
                    </div>
                  </div>
                )}
              </Card>
            </div>

            {/* Booking Slot Picker Sidebar Column */}
            <div className="space-y-6">
              <Card className="p-6 space-y-5 bg-white border-2 border-orange-200 shadow-xl relative overflow-hidden">
                <div className="absolute top-0 right-0 bg-[#C2410C] text-white px-3 py-1 rounded-bl-xl text-[10px] font-extrabold uppercase tracking-wider">
                  Live Slot Generator
                </div>

                <div className="border-b border-[#E4E4E7] pb-3 space-y-1">
                  <h3 className="text-base font-black text-zinc-900 flex items-center gap-2">
                    <CalendarIcon className="h-5 w-5 text-[#C2410C]" /> Select Date & Slot
                  </h3>
                  <p className="text-xs text-[#71717A]">
                    Available real-time time slots for 1-on-1 mock technical interviews.
                  </p>
                </div>

                {/* Date & Duration Controls */}
                <div className="space-y-3">
                  <div>
                    <label className="block text-[11px] font-bold text-zinc-700 uppercase mb-1">
                      Target Date
                    </label>
                    <input
                      type="date"
                      min={new Date().toISOString().split('T')[0]}
                      value={selectedDate}
                      onChange={(e) => setSelectedDate(e.target.value)}
                      className="w-full rounded-lg border border-[#E4E4E7] px-3 py-2 text-xs text-zinc-900 font-bold focus:ring-2 focus:ring-orange-500"
                    />
                  </div>

                  <div>
                    <label className="block text-[11px] font-bold text-zinc-700 uppercase mb-1">
                      Session Duration
                    </label>
                    <select
                      value={selectedDuration}
                      onChange={(e) => setSelectedDuration(Number(e.target.value))}
                      className="w-full rounded-lg border border-[#E4E4E7] px-3 py-2 text-xs text-zinc-900 font-bold bg-white"
                    >
                      <option value={15}>15 Minutes</option>
                      <option value={30}>30 Minutes</option>
                      <option value={45}>45 Minutes</option>
                      <option value={60}>60 Minutes (1 Hour)</option>
                      <option value={90}>90 Minutes</option>
                    </select>
                  </div>
                </div>

                {/* Generated Slots List */}
                <div className="space-y-2 pt-2">
                  <span className="text-[11px] font-bold text-zinc-700 uppercase">
                    Available Time Slots ({selectedDate})
                  </span>

                  {isLoadingSlots ? (
                    <div className="py-6 text-center text-xs text-zinc-400 animate-pulse">
                      Checking available slots...
                    </div>
                  ) : availableSlots.length === 0 ? (
                    <div className="rounded-lg bg-amber-50 p-4 text-center text-xs text-amber-800 border border-amber-200">
                      No open slots on this date. Try selecting another date or duration.
                    </div>
                  ) : (
                    <div className="grid grid-cols-2 gap-2 max-h-56 overflow-y-auto pr-1">
                      {availableSlots.map((slot, idx) => (
                        <button
                          key={idx}
                          onClick={() => handleSlotSelect(slot)}
                          className="rounded-lg border border-[#E4E4E7] bg-slate-50 p-2.5 text-center transition-all hover:bg-orange-50 hover:border-[#C2410C] hover:shadow-sm"
                        >
                          <span className="block font-black text-xs text-zinc-900">
                            {slot.formattedStart}
                          </span>
                          <span className="block text-[10px] text-[#71717A] font-semibold">
                            to {slot.formattedEnd}
                          </span>
                        </button>
                      ))}
                    </div>
                  )}
                </div>
              </Card>
            </div>
          </div>
        </div>
      </main>

      {/* Booking Request Modal */}
      {isBookingModalOpen && selectedSlot && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4">
          <Card className="w-full max-w-lg p-6 space-y-5 bg-white relative shadow-2xl">
            <button
              onClick={() => setIsBookingModalOpen(false)}
              className="absolute right-4 top-4 text-zinc-400 hover:text-zinc-700"
            >
              <X className="h-5 w-5" />
            </button>

            <div className="border-b border-[#E4E4E7] pb-3">
              <h3 className="text-lg font-black text-zinc-900 flex items-center gap-2">
                <Sparkles className="h-5 w-5 text-[#C2410C]" /> Confirm Session Request
              </h3>
              <p className="text-xs text-[#71717A] mt-0.5">
                Request a 1-on-1 mock interview session with <strong>{profile.fullName}</strong>.
              </p>
            </div>

            {bookingSuccessMsg && (
              <div className="rounded-lg bg-green-50 p-3 text-xs font-bold text-[#16A34A] border border-green-200">
                {bookingSuccessMsg}
              </div>
            )}

            {bookingError && (
              <div className="rounded-lg bg-red-50 p-3 text-xs font-medium text-[#DC2626] border border-red-200">
                {bookingError}
              </div>
            )}

            <div className="rounded-xl bg-slate-50 p-4 border border-[#E4E4E7] space-y-2 text-xs">
              <div className="flex justify-between">
                <span className="font-semibold text-[#71717A]">Interviewer:</span>
                <span className="font-bold text-zinc-900">{profile.fullName} ({profile.currentCompany})</span>
              </div>
              <div className="flex justify-between">
                <span className="font-semibold text-[#71717A]">Selected Slot:</span>
                <span className="font-bold text-[#C2410C]">{selectedSlot.formattedStart} - {selectedSlot.formattedEnd}</span>
              </div>
              <div className="flex justify-between">
                <span className="font-semibold text-[#71717A]">Duration:</span>
                <span className="font-bold text-zinc-900">{selectedSlot.durationMinutes} Minutes</span>
              </div>
            </div>

            <form onSubmit={handleRequestBooking} className="space-y-4 text-xs">
              <div>
                <label className="block font-semibold text-zinc-800 mb-1">
                  Preparation Notes / Specific Topics (Optional)
                </label>
                <textarea
                  rows={3}
                  placeholder="e.g. Focus on Binary Trees, System Design for URL Shortener, or Mock HR Behavior..."
                  value={studentNotes}
                  onChange={(e) => setStudentNotes(e.target.value)}
                  className="w-full rounded-lg border border-[#E4E4E7] p-2.5 text-xs text-zinc-900 focus:ring-2 focus:ring-orange-500"
                />
              </div>

              <div>
                <label className="block font-semibold text-zinc-800 mb-1">
                  Resume / Portfolio Link (Optional)
                </label>
                <input
                  type="url"
                  placeholder="https://drive.google.com/your-resume.pdf"
                  value={studentResumeUrl}
                  onChange={(e) => setStudentResumeUrl(e.target.value)}
                  className="w-full rounded-lg border border-[#E4E4E7] p-2.5 text-xs text-zinc-900 focus:ring-2 focus:ring-orange-500"
                />
              </div>

              <div className="pt-2 flex gap-3">
                <Button
                  type="button"
                  variant="outline"
                  className="w-full"
                  onClick={() => setIsBookingModalOpen(false)}
                >
                  Cancel
                </Button>
                <Button
                  type="submit"
                  className="w-full bg-[#C2410C] hover:bg-[#9A3412]"
                  isLoading={isSubmitting}
                >
                  Submit Booking Request
                </Button>
              </div>
            </form>
          </Card>
        </div>
      )}

      <Footer />
    </div>
  );
}
