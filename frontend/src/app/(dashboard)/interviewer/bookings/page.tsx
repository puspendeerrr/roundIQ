'use client';

import React, { useEffect, useState } from 'react';
import Link from 'next/link';
import { Navbar } from '../../../../components/layout/Navbar';
import { Footer } from '../../../../components/layout/Footer';
import { Card } from '../../../../components/ui/Card';
import { Button } from '../../../../components/ui/Button';
import { apiClient } from '../../../../lib/api-client';
import { Booking, BookingStatus } from '../../../../types';
import {
  Calendar as CalendarIcon,
  Clock,
  CheckCircle2,
  XCircle,
  AlertCircle,
  ExternalLink,
  ChevronLeft,
  ChevronRight,
  FileText,
  X,
  User,
  MessageSquare,
} from 'lucide-react';

export default function InterviewerBookingsPage() {
  const [bookings, setBookings] = useState<Booking[]>([]);
  const [selectedStatus, setSelectedStatus] = useState<string>('REQUESTED');
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [isLoading, setIsLoading] = useState(true);

  // Detail / Decline Modal State
  const [selectedBooking, setSelectedBooking] = useState<Booking | null>(null);
  const [declineReason, setDeclineReason] = useState('');
  const [isProcessing, setIsProcessing] = useState(false);
  const [actionError, setActionError] = useState<string | null>(null);
  const [actionSuccess, setActionSuccess] = useState<string | null>(null);

  const fetchBookings = async () => {
    try {
      setIsLoading(true);
      const params = new URLSearchParams();
      if (selectedStatus) params.set('status', selectedStatus);
      params.set('page', String(page));
      params.set('limit', '10');

      const res: any = await apiClient.get(`/bookings/interviewer?${params.toString()}`);
      if (res?.data) {
        setBookings(res.data);
        setTotalPages(res.meta?.totalPages || 1);
      }
    } catch (e) {
      setBookings([]);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchBookings();
  }, [selectedStatus, page]);

  const handleConfirm = async (bookingId: string) => {
    try {
      setIsProcessing(true);
      setActionError(null);
      await apiClient.post(`/bookings/${bookingId}/confirm`);
      setActionSuccess('Booking confirmed successfully!');
      setSelectedBooking(null);
      fetchBookings();
    } catch (err: any) {
      setActionError(err?.error?.message || 'Failed to confirm booking');
    } finally {
      setIsProcessing(false);
    }
  };

  const handleDecline = async (bookingId: string) => {
    try {
      setIsProcessing(true);
      setActionError(null);
      await apiClient.post(`/bookings/${bookingId}/decline`, { reason: declineReason });
      setActionSuccess('Booking declined');
      setSelectedBooking(null);
      setDeclineReason('');
      fetchBookings();
    } catch (err: any) {
      setActionError(err?.error?.message || 'Failed to decline booking');
    } finally {
      setIsProcessing(false);
    }
  };

  const handleComplete = async (bookingId: string) => {
    try {
      setIsProcessing(true);
      setActionError(null);
      await apiClient.post(`/bookings/${bookingId}/complete`);
      setActionSuccess('Session marked as completed!');
      setSelectedBooking(null);
      fetchBookings();
    } catch (err: any) {
      setActionError(err?.error?.message || 'Failed to complete booking');
    } finally {
      setIsProcessing(false);
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
                <CalendarIcon className="h-6 w-6 text-[#C2410C]" /> Session Requests & Bookings
              </h1>
              <p className="text-xs text-[#71717A] mt-0.5">
                Review incoming student session requests, confirm slots, and mark sessions complete.
              </p>
            </div>

            <div className="flex items-center gap-2">
              <Link href="/interviewer/calendar">
                <Button size="sm" variant="outline">
                  View Booking Calendar
                </Button>
              </Link>

              {['REQUESTED', 'CONFIRMED', 'COMPLETED', 'CANCELLED', 'DECLINED'].map((st) => (
                <button
                  key={st}
                  onClick={() => {
                    setSelectedStatus(st);
                    setPage(1);
                  }}
                  className={`rounded-lg px-3 py-1.5 text-xs font-bold transition-all ${
                    selectedStatus === st
                      ? 'bg-zinc-900 text-white shadow-sm'
                      : 'bg-white text-zinc-600 hover:bg-slate-100 border border-[#E4E4E7]'
                  }`}
                >
                  {st}
                </button>
              ))}
            </div>
          </div>

          {actionSuccess && (
            <div className="rounded-lg bg-green-50 p-3 text-xs font-bold text-[#16A34A] border border-green-200">
              {actionSuccess}
            </div>
          )}

          {/* Bookings Table */}
          <Card className="p-0 overflow-hidden shadow-md">
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs">
                <thead className="bg-slate-50 text-[#71717A] font-bold uppercase border-b border-[#E4E4E7]">
                  <tr>
                    <th className="px-4 py-3">Reference Code</th>
                    <th className="px-4 py-3">Student</th>
                    <th className="px-4 py-3">Date & Time</th>
                    <th className="px-4 py-3">Duration</th>
                    <th className="px-4 py-3">Status</th>
                    <th className="px-4 py-3 text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-[#E4E4E7] bg-white">
                  {isLoading ? (
                    <tr>
                      <td colSpan={6} className="px-4 py-8 text-center text-zinc-500 animate-pulse">
                        Loading session requests...
                      </td>
                    </tr>
                  ) : bookings.length === 0 ? (
                    <tr>
                      <td colSpan={6} className="px-4 py-8 text-center text-zinc-500">
                        No bookings found with status <strong>{selectedStatus}</strong>
                      </td>
                    </tr>
                  ) : (
                    bookings.map((b) => {
                      const start = new Date(b.scheduledStart);
                      const formattedDate = start.toLocaleDateString('en-US', {
                        weekday: 'short',
                        month: 'short',
                        day: 'numeric',
                        year: 'numeric',
                      });
                      const formattedTime = start.toLocaleTimeString('en-US', {
                        hour: '2-digit',
                        minute: '2-digit',
                      });

                      const studentName = b.student?.studentProfile?.fullName || b.student?.email || 'Student';

                      return (
                        <tr key={b.id} className="hover:bg-slate-50 transition-colors">
                          <td className="px-4 py-3 font-mono font-bold text-zinc-900">
                            {b.referenceCode}
                          </td>
                          <td className="px-4 py-3">
                            <p className="font-bold text-zinc-900">{studentName}</p>
                            <p className="text-[11px] text-[#71717A]">
                              {b.student?.studentProfile?.college || b.student?.email}
                            </p>
                          </td>
                          <td className="px-4 py-3">
                            <p className="font-bold text-zinc-900">{formattedDate}</p>
                            <p className="text-[11px] text-[#71717A]">{formattedTime} ({b.timezone})</p>
                          </td>
                          <td className="px-4 py-3 text-zinc-700 font-semibold">
                            {b.durationMinutes} Mins
                          </td>
                          <td className="px-4 py-3">
                            <span
                              className={`inline-flex rounded-full px-2.5 py-0.5 text-[10px] font-bold ${
                                b.status === 'CONFIRMED'
                                  ? 'bg-green-100 text-green-800'
                                  : b.status === 'REQUESTED'
                                  ? 'bg-blue-100 text-blue-800'
                                  : b.status === 'COMPLETED'
                                  ? 'bg-purple-100 text-purple-800'
                                  : 'bg-red-100 text-red-800'
                              }`}
                            >
                              {b.status}
                            </span>
                          </td>
                          <td className="px-4 py-3 text-right">
                            <Button
                              size="sm"
                              variant="outline"
                              onClick={() => {
                                setSelectedBooking(b);
                                setActionError(null);
                                setDeclineReason('');
                              }}
                            >
                              View & Actions
                            </Button>
                          </td>
                        </tr>
                      );
                    })
                  )}
                </tbody>
              </table>
            </div>
          </Card>

          {/* Pagination */}
          {totalPages > 1 && (
            <div className="flex items-center justify-center gap-2 pt-2">
              <Button
                variant="outline"
                size="sm"
                disabled={page === 1}
                onClick={() => setPage(page - 1)}
                leftIcon={<ChevronLeft className="h-4 w-4" />}
              >
                Previous
              </Button>
              <span className="text-xs font-semibold text-zinc-700 px-3">
                Page {page} of {totalPages}
              </span>
              <Button
                variant="outline"
                size="sm"
                disabled={page === totalPages}
                onClick={() => setPage(page + 1)}
                rightIcon={<ChevronRight className="h-4 w-4" />}
              >
                Next
              </Button>
            </div>
          )}
        </div>
      </main>

      {/* Booking Review Modal */}
      {selectedBooking && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
          <Card className="w-full max-w-xl p-6 space-y-5 bg-white relative shadow-2xl max-h-[90vh] overflow-y-auto">
            <button
              onClick={() => setSelectedBooking(null)}
              className="absolute right-4 top-4 text-zinc-400 hover:text-zinc-700"
            >
              <X className="h-5 w-5" />
            </button>

            <div className="border-b border-[#E4E4E7] pb-3">
              <div className="flex items-center gap-2">
                <h3 className="text-lg font-black text-zinc-900">
                  Booking Request {selectedBooking.referenceCode}
                </h3>
                <span className="rounded-full bg-blue-100 px-2.5 py-0.5 text-xs font-bold text-blue-800">
                  {selectedBooking.status}
                </span>
              </div>
              <p className="text-xs text-[#71717A] mt-0.5">
                Submitted on {new Date(selectedBooking.createdAt).toLocaleString()}
              </p>
            </div>

            {actionError && (
              <div className="rounded-lg bg-red-50 p-3 text-xs font-medium text-red-700 border border-red-200">
                {actionError}
              </div>
            )}

            <div className="space-y-3 text-xs">
              <div className="grid grid-cols-2 gap-3 bg-slate-50 p-3 rounded-lg border border-[#E4E4E7]">
                <div>
                  <span className="font-semibold text-[#71717A]">Student Name:</span>
                  <p className="font-bold text-zinc-900">
                    {selectedBooking.student?.studentProfile?.fullName || 'Student'}
                  </p>
                </div>
                <div>
                  <span className="font-semibold text-[#71717A]">Student Email:</span>
                  <p className="font-bold text-zinc-900">{selectedBooking.student?.email}</p>
                </div>
                <div>
                  <span className="font-semibold text-[#71717A]">Scheduled Start:</span>
                  <p className="font-bold text-zinc-900">
                    {new Date(selectedBooking.scheduledStart).toLocaleString()}
                  </p>
                </div>
                <div>
                  <span className="font-semibold text-[#71717A]">Duration:</span>
                  <p className="font-bold text-zinc-900">{selectedBooking.durationMinutes} Minutes</p>
                </div>
              </div>

              <div>
                <span className="font-semibold text-[#71717A] uppercase">Student Notes</span>
                <p className="text-zinc-800 bg-white p-3 rounded-lg border border-[#E4E4E7] mt-1">
                  {selectedBooking.studentNotes || 'No notes provided by student.'}
                </p>
              </div>

              {selectedBooking.studentResumeUrl && (
                <div>
                  <span className="font-semibold text-[#71717A] uppercase">Student Resume</span>
                  <div className="pt-1">
                    <a
                      href={selectedBooking.studentResumeUrl}
                      target="_blank"
                      rel="noreferrer"
                      className="inline-flex items-center gap-1.5 font-bold text-blue-600 underline"
                    >
                      <FileText className="h-4 w-4" /> View Resume Link
                    </a>
                  </div>
                </div>
              )}

              {selectedBooking.status === 'REQUESTED' && (
                <div className="pt-2 space-y-1">
                  <label className="block font-semibold text-zinc-800">
                    Decline Reason (Optional if declining)
                  </label>
                  <input
                    type="text"
                    placeholder="e.g. Schedule conflict or invalid preparation topic"
                    value={declineReason}
                    onChange={(e) => setDeclineReason(e.target.value)}
                    className="w-full rounded-lg border border-[#E4E4E7] p-2 text-xs text-zinc-900 focus:ring-2 focus:ring-orange-500"
                  />
                </div>
              )}
            </div>

            {/* Modal Actions */}
            <div className="pt-3 border-t border-[#E4E4E7] flex gap-2 justify-end">
              {selectedBooking.status === 'REQUESTED' && (
                <>
                  <Button
                    variant="danger"
                    size="sm"
                    onClick={() => handleDecline(selectedBooking.id)}
                    isLoading={isProcessing}
                  >
                    Decline Request
                  </Button>
                  <Button
                    size="sm"
                    className="bg-[#16A34A] hover:bg-green-700 text-white"
                    onClick={() => handleConfirm(selectedBooking.id)}
                    isLoading={isProcessing}
                  >
                    Confirm Booking
                  </Button>
                </>
              )}

              {selectedBooking.status === 'CONFIRMED' && (
                <Button
                  size="sm"
                  className="bg-purple-600 hover:bg-purple-700 text-white"
                  onClick={() => handleComplete(selectedBooking.id)}
                  isLoading={isProcessing}
                >
                  Mark Session Complete
                </Button>
              )}
            </div>
          </Card>
        </div>
      )}

      <Footer />
    </div>
  );
}
