'use client';

import React, { useEffect, useState } from 'react';
import Link from 'next/link';
import { Navbar } from '../../../../components/layout/Navbar';
import { Footer } from '../../../../components/layout/Footer';
import { Card } from '../../../../components/ui/Card';
import { Button } from '../../../../components/ui/Button';
import { apiClient } from '../../../../lib/api-client';
import { Booking } from '../../../../types';
import {
  Calendar as CalendarIcon,
  Search,
  ChevronLeft,
  ChevronRight,
  ShieldAlert,
  CheckCircle,
  XCircle,
  X,
} from 'lucide-react';

export default function AdminBookingsPage() {
  const [bookings, setBookings] = useState<Booking[]>([]);
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('');
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [isLoading, setIsLoading] = useState(true);

  // Override Modal
  const [selectedBooking, setSelectedBooking] = useState<Booking | null>(null);
  const [actionReason, setActionReason] = useState('');
  const [isProcessing, setIsProcessing] = useState(false);
  const [msg, setMsg] = useState<string | null>(null);

  const fetchAdminBookings = async () => {
    try {
      setIsLoading(true);
      const params = new URLSearchParams();
      if (search) params.set('search', search);
      if (statusFilter) params.set('status', statusFilter);
      params.set('page', String(page));
      params.set('limit', '10');

      const res: any = await apiClient.get(`/admin/bookings?${params.toString()}`);
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
    fetchAdminBookings();
  }, [search, statusFilter, page]);

  const handleForceCancel = async (bookingId: string) => {
    try {
      setIsProcessing(true);
      await apiClient.post(`/admin/bookings/${bookingId}/cancel`, {
        reason: actionReason || 'Force cancelled by administrator',
      });
      setMsg('Booking force cancelled by admin.');
      setSelectedBooking(null);
      setActionReason('');
      fetchAdminBookings();
    } catch (e: any) {
      setMsg(e?.error?.message || 'Failed to cancel booking');
    } finally {
      setIsProcessing(false);
    }
  };

  const handleForceComplete = async (bookingId: string) => {
    try {
      setIsProcessing(true);
      await apiClient.post(`/admin/bookings/${bookingId}/force-complete`);
      setMsg('Booking force completed by admin.');
      setSelectedBooking(null);
      fetchAdminBookings();
    } catch (e: any) {
      setMsg(e?.error?.message || 'Failed to complete booking');
    } finally {
      setIsProcessing(false);
    }
  };

  const handleForceNoShow = async (bookingId: string) => {
    try {
      setIsProcessing(true);
      await apiClient.post(`/admin/bookings/${bookingId}/force-noshow`, {
        reason: actionReason || 'Marked No Show by administrator',
      });
      setMsg('Booking marked No Show by admin.');
      setSelectedBooking(null);
      setActionReason('');
      fetchAdminBookings();
    } catch (e: any) {
      setMsg(e?.error?.message || 'Failed to mark No Show');
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
                <CalendarIcon className="h-6 w-6 text-purple-600" /> Platform Booking Operations
              </h1>
              <p className="text-xs text-[#71717A] mt-0.5">
                Audit all platform interview bookings, manage disputes, and enforce cancellations.
              </p>
            </div>
            <Link href="/admin/dashboard">
              <Button size="sm" variant="outline">&larr; Admin Dashboard</Button>
            </Link>
          </div>

          <Card className="p-4 flex flex-col md:flex-row gap-3">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-2.5 h-4 w-4 text-[#71717A]" />
              <input
                type="text"
                placeholder="Search reference code, student email, or interviewer name..."
                value={search}
                onChange={(e) => {
                  setSearch(e.target.value);
                  setPage(1);
                }}
                className="w-full rounded-lg border border-[#E4E4E7] pl-9 pr-3 py-1.5 text-xs text-zinc-900 focus:ring-1 focus:ring-orange-500"
              />
            </div>

            <select
              value={statusFilter}
              onChange={(e) => {
                setStatusFilter(e.target.value);
                setPage(1);
              }}
              className="rounded-lg border border-[#E4E4E7] px-3 py-1.5 text-xs text-zinc-800 bg-white"
            >
              <option value="">All Statuses</option>
              <option value="REQUESTED">Requested</option>
              <option value="CONFIRMED">Confirmed</option>
              <option value="COMPLETED">Completed</option>
              <option value="CANCELLED">Cancelled</option>
              <option value="DECLINED">Declined</option>
              <option value="EXPIRED">Expired</option>
              <option value="NO_SHOW">No Show</option>
            </select>
          </Card>

          {msg && (
            <div className="rounded-lg bg-green-50 p-3 text-xs font-bold text-[#16A34A] border border-green-200">
              {msg}
            </div>
          )}

          <Card className="p-0 overflow-hidden shadow-md">
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs">
                <thead className="bg-slate-50 text-[#71717A] font-bold uppercase border-b border-[#E4E4E7]">
                  <tr>
                    <th className="px-4 py-3">Ref Code</th>
                    <th className="px-4 py-3">Student</th>
                    <th className="px-4 py-3">Interviewer</th>
                    <th className="px-4 py-3">Scheduled Time</th>
                    <th className="px-4 py-3">Status</th>
                    <th className="px-4 py-3 text-right">Admin Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-[#E4E4E7] bg-white">
                  {isLoading ? (
                    <tr>
                      <td colSpan={6} className="px-4 py-8 text-center text-zinc-500 animate-pulse">
                        Loading platform bookings...
                      </td>
                    </tr>
                  ) : bookings.length === 0 ? (
                    <tr>
                      <td colSpan={6} className="px-4 py-8 text-center text-zinc-500">
                        No bookings found matching search criteria.
                      </td>
                    </tr>
                  ) : (
                    bookings.map((b) => (
                      <tr key={b.id} className="hover:bg-slate-50">
                        <td className="px-4 py-3 font-mono font-bold text-zinc-900">{b.referenceCode}</td>
                        <td className="px-4 py-3">{b.student?.email}</td>
                        <td className="px-4 py-3 font-bold text-zinc-900">{b.interviewer?.fullName}</td>
                        <td className="px-4 py-3 text-zinc-700">
                          {new Date(b.scheduledStart).toLocaleString()}
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
                            onClick={() => setSelectedBooking(b)}
                          >
                            Manage
                          </Button>
                        </td>
                      </tr>
                    ))
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

      {/* Admin Action Modal */}
      {selectedBooking && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
          <Card className="w-full max-w-md p-6 space-y-4 bg-white relative shadow-2xl">
            <button
              onClick={() => setSelectedBooking(null)}
              className="absolute right-4 top-4 text-zinc-400 hover:text-zinc-700"
            >
              <X className="h-5 w-5" />
            </button>

            <h3 className="text-base font-bold text-zinc-900">
              Admin Override: {selectedBooking.referenceCode}
            </h3>

            <div className="space-y-1 text-xs">
              <label className="block font-semibold text-zinc-800">Admin Action Reason</label>
              <input
                type="text"
                placeholder="Reason for cancellation or no-show declaration..."
                value={actionReason}
                onChange={(e) => setActionReason(e.target.value)}
                className="w-full rounded-lg border border-[#E4E4E7] p-2 text-xs text-zinc-900 focus:ring-2 focus:ring-orange-500"
              />
            </div>

            <div className="flex flex-col gap-2 pt-2">
              <Button
                variant="danger"
                size="sm"
                onClick={() => handleForceCancel(selectedBooking.id)}
                isLoading={isProcessing}
              >
                Force Cancel Booking
              </Button>
              <Button
                size="sm"
                className="bg-purple-600 hover:bg-purple-700 text-white"
                onClick={() => handleForceComplete(selectedBooking.id)}
                isLoading={isProcessing}
              >
                Force Mark Completed
              </Button>
              <Button
                size="sm"
                className="bg-amber-600 hover:bg-amber-700 text-white"
                onClick={() => handleForceNoShow(selectedBooking.id)}
                isLoading={isProcessing}
              >
                Force Mark No Show
              </Button>
            </div>
          </Card>
        </div>
      )}

      <Footer />
    </div>
  );
}
