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
  RotateCw,
} from 'lucide-react';

export default function StudentBookingsPage() {
  const [bookings, setBookings] = useState<Booking[]>([]);
  const [selectedStatus, setSelectedStatus] = useState<string>('');
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [isLoading, setIsLoading] = useState(true);

  // Cancellation Modal State
  const [cancellingBooking, setCancellingBooking] = useState<Booking | null>(null);
  const [cancelReason, setCancelReason] = useState('');
  const [isCancelling, setIsCancelling] = useState(false);
  const [actionError, setActionError] = useState<string | null>(null);
  const [actionSuccess, setActionSuccess] = useState<string | null>(null);

  const fetchBookings = async () => {
    try {
      setIsLoading(true);
      const params = new URLSearchParams();
      if (selectedStatus) params.set('status', selectedStatus);
      params.set('page', String(page));
      params.set('limit', '10');

      const res: any = await apiClient.get(`/bookings/student?${params.toString()}`);
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

  const handleCancelBooking = async () => {
    if (!cancellingBooking) return;
    if (!cancelReason.trim()) {
      setActionError('Please enter a reason for cancellation');
      return;
    }

    try {
      setIsCancelling(true);
      setActionError(null);
      await apiClient.post(`/bookings/${cancellingBooking.id}/cancel`, {
        reason: cancelReason,
      });
      setActionSuccess(`Booking ${cancellingBooking.referenceCode} cancelled successfully`);
      setCancellingBooking(null);
      setCancelReason('');
      fetchBookings();
    } catch (err: any) {
      setActionError(err?.error?.message || 'Failed to cancel booking');
    } finally {
      setIsCancelling(false);
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
                <CalendarIcon className="h-6 w-6 text-[#C2410C]" /> My Interview Sessions
              </h1>
              <p className="text-xs text-[#71717A] mt-0.5">
                Track your requested, confirmed, and past 1-on-1 mock interview sessions.
              </p>
            </div>

            <div className="flex flex-wrap gap-2">
              {['', 'REQUESTED', 'CONFIRMED', 'COMPLETED', 'CANCELLED', 'DECLINED'].map((st) => (
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
                  {st === '' ? 'All Statuses' : st}
                </button>
              ))}
            </div>
          </div>

          {actionSuccess && (
            <div className="rounded-lg bg-green-50 p-3 text-xs font-bold text-[#16A34A] border border-green-200">
              {actionSuccess}
            </div>
          )}

          {/* Bookings List */}
          <Card className="p-0 overflow-hidden shadow-md">
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs">
                <thead className="bg-slate-50 text-[#71717A] font-bold uppercase border-b border-[#E4E4E7]">
                  <tr>
                    <th className="px-4 py-3">Reference Code</th>
                    <th className="px-4 py-3">Interviewer</th>
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
                        Loading interview bookings...
                      </td>
                    </tr>
                  ) : bookings.length === 0 ? (
                    <tr>
                      <td colSpan={6} className="px-4 py-8 text-center text-zinc-500">
                        No bookings found.{' '}
                        <Link href="/directory" className="text-[#C2410C] font-bold hover:underline">
                          Explore Directory & Book Now
                        </Link>
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

                      return (
                        <tr key={b.id} className="hover:bg-slate-50 transition-colors">
                          <td className="px-4 py-3 font-mono font-bold text-zinc-900">
                            {b.referenceCode}
                          </td>
                          <td className="px-4 py-3">
                            <p className="font-bold text-zinc-900">{b.interviewer?.fullName}</p>
                            <p className="text-[11px] text-[#71717A]">
                              {b.interviewer?.currentCompany || 'Software Engineer'}
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
                            {['REQUESTED', 'CONFIRMED'].includes(b.status) && (
                              <button
                                onClick={() => {
                                  setCancellingBooking(b);
                                  setActionError(null);
                                }}
                                className="rounded bg-red-50 px-2.5 py-1 text-[11px] font-bold text-red-700 hover:bg-red-100"
                              >
                                Cancel Request
                              </button>
                            )}
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

      {/* Cancellation Modal */}
      {cancellingBooking && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
          <Card className="w-full max-w-md p-6 space-y-4 bg-white relative shadow-2xl">
            <button
              onClick={() => setCancellingBooking(null)}
              className="absolute right-4 top-4 text-zinc-400 hover:text-zinc-700"
            >
              <X className="h-5 w-5" />
            </button>

            <h3 className="text-base font-bold text-zinc-900">
              Cancel Booking Request ({cancellingBooking.referenceCode})
            </h3>

            {actionError && (
              <div className="rounded-lg bg-red-50 p-3 text-xs font-medium text-red-700">
                {actionError}
              </div>
            )}

            <div className="space-y-1">
              <label className="block text-xs font-semibold text-zinc-800">
                Reason for Cancellation (Required)
              </label>
              <input
                type="text"
                placeholder="e.g. Schedule conflict or booked by mistake"
                value={cancelReason}
                onChange={(e) => setCancelReason(e.target.value)}
                className="w-full rounded-lg border border-[#E4E4E7] p-2.5 text-xs text-zinc-900 focus:ring-2 focus:ring-orange-500"
              />
            </div>

            <div className="flex gap-2 justify-end pt-2">
              <Button
                variant="outline"
                size="sm"
                onClick={() => setCancellingBooking(null)}
              >
                Go Back
              </Button>
              <Button
                variant="danger"
                size="sm"
                onClick={handleCancelBooking}
                isLoading={isCancelling}
              >
                Confirm Cancellation
              </Button>
            </div>
          </Card>
        </div>
      )}

      <Footer />
    </div>
  );
}
