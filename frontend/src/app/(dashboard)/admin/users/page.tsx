'use client';

import React, { useEffect, useState } from 'react';
import Link from 'next/link';
import { Navbar } from '../../../../components/layout/Navbar';
import { Footer } from '../../../../components/layout/Footer';
import { Card } from '../../../../components/ui/Card';
import { Button } from '../../../../components/ui/Button';
import { apiClient } from '../../../../lib/api-client';
import { User, Role, UserStatus } from '../../../../types';
import { Users, Search, ChevronLeft, ChevronRight, ShieldAlert, CheckCircle, Ban } from 'lucide-react';

export default function AdminUsersPage() {
  const [users, setUsers] = useState<User[]>([]);
  const [search, setSearch] = useState('');
  const [roleFilter, setRoleFilter] = useState<string>('');
  const [statusFilter, setStatusFilter] = useState<string>('');
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [isLoading, setIsLoading] = useState(true);
  const [actionMsg, setActionMsg] = useState<string | null>(null);

  const fetchUsers = async () => {
    try {
      setIsLoading(true);
      const params = new URLSearchParams();
      if (search) params.set('search', search);
      if (roleFilter) params.set('role', roleFilter);
      if (statusFilter) params.set('status', statusFilter);
      params.set('page', String(page));
      params.set('limit', '10');

      const res: any = await apiClient.get(`/admin/users?${params.toString()}`);
      if (res?.data) {
        setUsers(res.data);
        setTotalPages(res.meta?.totalPages || 1);
      }
    } catch (e) {
      setUsers([]);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchUsers();
  }, [search, roleFilter, statusFilter, page]);

  const handleStatusToggle = async (userId: string, newStatus: UserStatus) => {
    try {
      setActionMsg(null);
      await apiClient.patch(`/admin/users/${userId}/status`, { status: newStatus });
      setActionMsg(`User status updated to ${newStatus}`);
      fetchUsers();
      setTimeout(() => setActionMsg(null), 3000);
    } catch (err: any) {
      setActionMsg(err?.error?.message || 'Failed to update user status');
    }
  };

  return (
    <div className="flex min-h-screen flex-col bg-[#F8FAFC]">
      <Navbar />

      <main className="flex-1 py-8">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 space-y-6">
          {/* Header */}
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-[#E4E4E7] pb-4">
            <div>
              <h1 className="text-2xl font-black text-zinc-900 flex items-center gap-2">
                <Users className="h-6 w-6 text-blue-600" /> User Account Moderation
              </h1>
              <p className="text-xs text-[#71717A] mt-0.5">
                Manage user statuses, search accounts, and enforce platform security policies.
              </p>
            </div>

            <div className="flex gap-2">
              <Link href="/admin/dashboard">
                <Button size="sm" variant="outline">
                  &larr; Admin Dashboard
                </Button>
              </Link>
            </div>
          </div>

          {/* Search & Filters bar */}
          <Card className="p-4 flex flex-col md:flex-row gap-3">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-2.5 h-4 w-4 text-[#71717A]" />
              <input
                type="text"
                placeholder="Search user by email address..."
                value={search}
                onChange={(e) => {
                  setSearch(e.target.value);
                  setPage(1);
                }}
                className="w-full rounded-lg border border-[#E4E4E7] pl-9 pr-3 py-1.5 text-xs text-zinc-900 focus:outline-none focus:ring-1 focus:ring-orange-500"
              />
            </div>
            <select
              value={roleFilter}
              onChange={(e) => {
                setRoleFilter(e.target.value);
                setPage(1);
              }}
              className="rounded-lg border border-[#E4E4E7] px-3 py-1.5 text-xs text-zinc-800 bg-white"
            >
              <option value="">All Roles</option>
              <option value="STUDENT">Student</option>
              <option value="INTERVIEWER">Interviewer</option>
              <option value="ADMIN">Admin</option>
            </select>
            <select
              value={statusFilter}
              onChange={(e) => {
                setStatusFilter(e.target.value);
                setPage(1);
              }}
              className="rounded-lg border border-[#E4E4E7] px-3 py-1.5 text-xs text-zinc-800 bg-white"
            >
              <option value="">All Statuses</option>
              <option value="ACTIVE">Active</option>
              <option value="SUSPENDED">Suspended</option>
              <option value="BANNED">Banned</option>
            </select>
          </Card>

          {actionMsg && (
            <div className="rounded-lg bg-green-50 p-3 text-xs font-medium text-[#16A34A] border border-green-200">
              {actionMsg}
            </div>
          )}

          {/* User List Table */}
          <Card className="p-0 overflow-hidden shadow-md">
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs">
                <thead className="bg-slate-50 text-[#71717A] font-bold uppercase border-b border-[#E4E4E7]">
                  <tr>
                    <th className="px-4 py-3">User Email</th>
                    <th className="px-4 py-3">Role</th>
                    <th className="px-4 py-3">Profile Name</th>
                    <th className="px-4 py-3">Status</th>
                    <th className="px-4 py-3 text-right">Moderation Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-[#E4E4E7] bg-white">
                  {isLoading ? (
                    <tr>
                      <td colSpan={5} className="px-4 py-8 text-center text-zinc-500">
                        Loading users...
                      </td>
                    </tr>
                  ) : users.length === 0 ? (
                    <tr>
                      <td colSpan={5} className="px-4 py-8 text-center text-zinc-500">
                        No users found matching query filters.
                      </td>
                    </tr>
                  ) : (
                    users.map((u) => {
                      const profileName = u.studentProfile?.fullName || u.interviewerProfile?.fullName || 'N/A';
                      return (
                        <tr key={u.id} className="hover:bg-slate-50 transition-colors">
                          <td className="px-4 py-3 font-semibold text-zinc-900">{u.email}</td>
                          <td className="px-4 py-3">
                            <span
                              className={`inline-flex rounded-full px-2 py-0.5 text-[10px] font-bold ${
                                u.role === 'ADMIN'
                                  ? 'bg-purple-100 text-purple-800'
                                  : u.role === 'INTERVIEWER'
                                  ? 'bg-orange-100 text-orange-800'
                                  : 'bg-blue-100 text-blue-800'
                              }`}
                            >
                              {u.role}
                            </span>
                          </td>
                          <td className="px-4 py-3 text-zinc-700">{profileName}</td>
                          <td className="px-4 py-3">
                            <span
                              className={`inline-flex rounded-full px-2 py-0.5 text-[10px] font-bold ${
                                u.status === 'ACTIVE'
                                  ? 'bg-green-100 text-green-800'
                                  : u.status === 'SUSPENDED'
                                  ? 'bg-amber-100 text-amber-800'
                                  : 'bg-red-100 text-red-800'
                              }`}
                            >
                              {u.status}
                            </span>
                          </td>
                          <td className="px-4 py-3 text-right">
                            {u.role !== 'ADMIN' && (
                              <div className="flex justify-end gap-1.5">
                                {u.status === 'ACTIVE' ? (
                                  <button
                                    onClick={() => handleStatusToggle(u.id, 'SUSPENDED')}
                                    className="rounded bg-amber-50 px-2 py-1 text-[11px] font-bold text-amber-700 hover:bg-amber-100"
                                  >
                                    Suspend
                                  </button>
                                ) : (
                                  <button
                                    onClick={() => handleStatusToggle(u.id, 'ACTIVE')}
                                    className="rounded bg-green-50 px-2 py-1 text-[11px] font-bold text-green-700 hover:bg-green-100"
                                  >
                                    Activate
                                  </button>
                                )}

                                {u.status !== 'BANNED' && (
                                  <button
                                    onClick={() => handleStatusToggle(u.id, 'BANNED')}
                                    className="rounded bg-red-50 px-2 py-1 text-[11px] font-bold text-red-700 hover:bg-red-100"
                                  >
                                    Ban
                                  </button>
                                )}
                              </div>
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

      <Footer />
    </div>
  );
}
