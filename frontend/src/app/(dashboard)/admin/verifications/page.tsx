'use client';

import React, { useEffect, useState } from 'react';
import Link from 'next/link';
import { Navbar } from '../../../../components/layout/Navbar';
import { Footer } from '../../../../components/layout/Footer';
import { Card } from '../../../../components/ui/Card';
import { Button } from '../../../../components/ui/Button';
import { Input } from '../../../../components/ui/Input';
import { apiClient } from '../../../../lib/api-client';
import { InterviewerProfile } from '../../../../types';
import {
  Clock,
  CheckCircle2,
  XCircle,
  AlertCircle,
  ExternalLink,
  Shield,
  Building,
  Briefcase,
  Linkedin,
  Github,
  FileText,
  X,
  ChevronLeft,
  ChevronRight,
} from 'lucide-react';

export default function AdminVerificationsPage() {
  const [items, setItems] = useState<InterviewerProfile[]>([]);
  const [selectedStatus, setSelectedStatus] = useState<string>('PENDING');
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [isLoading, setIsLoading] = useState(true);

  const [selectedProfile, setSelectedProfile] = useState<InterviewerProfile | null>(null);
  const [rejectReason, setRejectReason] = useState('');
  const [actionError, setActionError] = useState<string | null>(null);
  const [actionSuccess, setActionSuccess] = useState<string | null>(null);
  const [isProcessing, setIsProcessing] = useState(false);

  const fetchQueue = async () => {
    try {
      setIsLoading(true);
      const res: any = await apiClient.get(
        `/admin/verifications?status=${selectedStatus}&page=${page}&limit=10`
      );
      if (res?.data) {
        setItems(res.data);
        setTotalPages(res.meta?.totalPages || 1);
      }
    } catch (e) {
      setItems([]);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchQueue();
  }, [selectedStatus, page]);

  const handleApprove = async (profileId: string) => {
    try {
      setIsProcessing(true);
      setActionError(null);
      await apiClient.post(`/admin/verifications/${profileId}/approve`);
      setActionSuccess('Interviewer approved successfully!');
      setSelectedProfile(null);
      fetchQueue();
    } catch (err: any) {
      setActionError(err?.error?.message || 'Failed to approve interviewer.');
    } finally {
      setIsProcessing(false);
    }
  };

  const handleReject = async (profileId: string) => {
    if (!rejectReason.trim()) {
      setActionError('Please provide a rejection reason');
      return;
    }
    try {
      setIsProcessing(true);
      setActionError(null);
      await apiClient.post(`/admin/verifications/${profileId}/reject`, { reason: rejectReason });
      setActionSuccess('Interviewer rejected successfully');
      setSelectedProfile(null);
      setRejectReason('');
      fetchQueue();
    } catch (err: any) {
      setActionError(err?.error?.message || 'Failed to reject interviewer.');
    } finally {
      setIsProcessing(false);
    }
  };

  const handleSuspend = async (profileId: string) => {
    try {
      setIsProcessing(true);
      setActionError(null);
      await apiClient.post(`/admin/verifications/${profileId}/suspend`, { reason: 'Suspended by Admin' });
      setActionSuccess('Interviewer suspended');
      setSelectedProfile(null);
      fetchQueue();
    } catch (err: any) {
      setActionError(err?.error?.message || 'Failed to suspend interviewer.');
    } finally {
      setIsProcessing(false);
    }
  };

  return (
    <div className="flex min-h-screen flex-col bg-[#F8FAFC]">
      <Navbar />

      <main className="flex-1 py-8">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 space-y-6">
          {/* Header & Submenu */}
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-[#E4E4E7] pb-4">
            <div>
              <h1 className="text-2xl font-black text-zinc-900 flex items-center gap-2">
                <Clock className="h-6 w-6 text-[#C2410C]" /> Interviewer Verification Queue
              </h1>
              <p className="text-xs text-[#71717A] mt-0.5">
                Audit credentials, LinkedIn/GitHub profiles, and manage approval status.
              </p>
            </div>

            <div className="flex items-center gap-2">
              {['PENDING', 'APPROVED', 'REJECTED', 'DRAFT', 'SUSPENDED'].map((st) => (
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
            <div className="rounded-lg bg-green-50 p-3 text-xs font-medium text-[#16A34A] border border-green-200">
              {actionSuccess}
            </div>
          )}

          {/* Verification Table */}
          <Card className="p-0 overflow-hidden shadow-md">
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs">
                <thead className="bg-slate-50 text-[#71717A] font-bold uppercase border-b border-[#E4E4E7]">
                  <tr>
                    <th className="px-4 py-3">Interviewer</th>
                    <th className="px-4 py-3">Current Company</th>
                    <th className="px-4 py-3">Experience</th>
                    <th className="px-4 py-3">Verification Status</th>
                    <th className="px-4 py-3 text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-[#E4E4E7] bg-white">
                  {isLoading ? (
                    <tr>
                      <td colSpan={5} className="px-4 py-8 text-center text-zinc-500">
                        Loading verification queue...
                      </td>
                    </tr>
                  ) : items.length === 0 ? (
                    <tr>
                      <td colSpan={5} className="px-4 py-8 text-center text-zinc-500">
                        No interviewers found with status <strong>{selectedStatus}</strong>
                      </td>
                    </tr>
                  ) : (
                    items.map((item) => (
                      <tr key={item.id} className="hover:bg-slate-50 transition-colors">
                        <td className="px-4 py-3">
                          <div className="flex items-center gap-3">
                            <img
                              src={
                                item.user?.avatarUrl ||
                                'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=100'
                              }
                              alt=""
                              className="h-9 w-9 rounded-lg object-cover border border-[#E4E4E7]"
                            />
                            <div>
                              <p className="font-bold text-zinc-900">{item.fullName}</p>
                              <p className="text-[11px] text-[#71717A]">{item.user?.email}</p>
                            </div>
                          </div>
                        </td>
                        <td className="px-4 py-3 font-semibold text-zinc-800">
                          {item.currentCompany || 'Not set'}
                        </td>
                        <td className="px-4 py-3 text-zinc-700">
                          {item.yearsOfExperience} Years
                        </td>
                        <td className="px-4 py-3">
                          <span
                            className={`inline-flex items-center gap-1 rounded-full px-2.5 py-0.5 text-[10px] font-bold ${
                              item.verificationStatus === 'APPROVED'
                                ? 'bg-green-100 text-green-800'
                                : item.verificationStatus === 'PENDING'
                                ? 'bg-blue-100 text-blue-800'
                                : item.verificationStatus === 'REJECTED'
                                ? 'bg-red-100 text-red-800'
                                : 'bg-zinc-100 text-zinc-700'
                            }`}
                          >
                            {item.verificationStatus}
                          </span>
                        </td>
                        <td className="px-4 py-3 text-right">
                          <Button
                            size="sm"
                            variant="outline"
                            onClick={() => {
                              setSelectedProfile(item);
                              setActionError(null);
                              setRejectReason('');
                            }}
                          >
                            Review Request
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

      {/* Review Modal Dialog */}
      {selectedProfile && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
          <Card className="w-full max-w-2xl p-6 space-y-5 bg-white max-h-[90vh] overflow-y-auto relative shadow-2xl">
            <button
              onClick={() => setSelectedProfile(null)}
              className="absolute right-4 top-4 text-zinc-400 hover:text-zinc-700"
            >
              <X className="h-5 w-5" />
            </button>

            <div className="flex items-center gap-3 border-b border-[#E4E4E7] pb-3">
              <img
                src={
                  selectedProfile.user?.avatarUrl ||
                  'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=100'
                }
                alt=""
                className="h-12 w-12 rounded-xl object-cover border"
              />
              <div>
                <h3 className="text-lg font-bold text-zinc-900">{selectedProfile.fullName}</h3>
                <p className="text-xs text-[#71717A]">{selectedProfile.user?.email}</p>
              </div>
            </div>

            {actionError && (
              <div className="rounded-lg bg-red-50 p-3 text-xs font-medium text-[#DC2626] border border-red-200">
                {actionError}
              </div>
            )}

            <div className="space-y-3 text-xs">
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <span className="font-semibold text-[#71717A] uppercase">Headline</span>
                  <p className="font-bold text-zinc-900">{selectedProfile.headline || 'Not set'}</p>
                </div>
                <div>
                  <span className="font-semibold text-[#71717A] uppercase">Current Company</span>
                  <p className="font-bold text-zinc-900">{selectedProfile.currentCompany || 'Not set'}</p>
                </div>
                <div>
                  <span className="font-semibold text-[#71717A] uppercase">Years of Experience</span>
                  <p className="font-bold text-zinc-900">{selectedProfile.yearsOfExperience} Years</p>
                </div>
                <div>
                  <span className="font-semibold text-[#71717A] uppercase">Previous Companies</span>
                  <p className="font-bold text-zinc-900">
                    {selectedProfile.previousCompanies?.length
                      ? selectedProfile.previousCompanies.join(', ')
                      : 'None'}
                  </p>
                </div>
              </div>

              <div>
                <span className="font-semibold text-[#71717A] uppercase">About / Bio</span>
                <p className="text-zinc-700 bg-slate-50 p-3 rounded-lg border border-[#E4E4E7] mt-1">
                  {selectedProfile.bio || 'No bio submitted.'}
                </p>
              </div>

              {/* Links */}
              <div className="space-y-1.5 pt-2">
                <span className="font-semibold text-[#71717A] uppercase">Professional Verification Links</span>
                <div className="flex flex-wrap gap-3 pt-1">
                  {selectedProfile.linkedinUrl && (
                    <a
                      href={selectedProfile.linkedinUrl}
                      target="_blank"
                      rel="noreferrer"
                      className="inline-flex items-center gap-1.5 text-blue-600 font-bold underline"
                    >
                      <Linkedin className="h-4 w-4" /> LinkedIn Profile
                    </a>
                  )}
                  {selectedProfile.githubUrl && (
                    <a
                      href={selectedProfile.githubUrl}
                      target="_blank"
                      rel="noreferrer"
                      className="inline-flex items-center gap-1.5 text-zinc-900 font-bold underline"
                    >
                      <Github className="h-4 w-4" /> GitHub Profile
                    </a>
                  )}
                  {selectedProfile.resumeUrl && (
                    <a
                      href={selectedProfile.resumeUrl}
                      target="_blank"
                      rel="noreferrer"
                      className="inline-flex items-center gap-1.5 text-green-700 font-bold underline"
                    >
                      <FileText className="h-4 w-4" /> Resume / Offer Letter
                    </a>
                  )}
                </div>
              </div>

              {/* Rejection reason input */}
              <div className="pt-3">
                <label className="block font-semibold text-zinc-800 mb-1">
                  Rejection Reason (Required if Rejecting)
                </label>
                <input
                  type="text"
                  placeholder="e.g. Please provide a valid LinkedIn profile or company offer letter"
                  value={rejectReason}
                  onChange={(e) => setRejectReason(e.target.value)}
                  className="w-full rounded-lg border border-[#E4E4E7] px-3 py-2 text-xs text-zinc-900 focus:outline-none focus:ring-2 focus:ring-orange-500"
                />
              </div>
            </div>

            {/* Modal Actions */}
            <div className="pt-4 border-t border-[#E4E4E7] flex flex-wrap gap-2 justify-end">
              <Button
                variant="outline"
                onClick={() => handleSuspend(selectedProfile.id)}
                isLoading={isProcessing}
                className="text-amber-700 hover:bg-amber-50"
              >
                Suspend Profile
              </Button>
              <Button
                variant="danger"
                onClick={() => handleReject(selectedProfile.id)}
                isLoading={isProcessing}
              >
                Reject Request
              </Button>
              <Button
                onClick={() => handleApprove(selectedProfile.id)}
                isLoading={isProcessing}
                className="bg-[#16A34A] hover:bg-green-700 text-white"
              >
                Approve Interviewer
              </Button>
            </div>
          </Card>
        </div>
      )}

      <Footer />
    </div>
  );
}
