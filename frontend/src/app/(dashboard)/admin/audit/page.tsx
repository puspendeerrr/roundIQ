'use client';

import React, { useEffect, useState } from 'react';
import Link from 'next/link';
import { Navbar } from '../../../../components/layout/Navbar';
import { Footer } from '../../../../components/layout/Footer';
import { Card } from '../../../../components/ui/Card';
import { Button } from '../../../../components/ui/Button';
import { apiClient } from '../../../../lib/api-client';
import {
  ShieldCheck,
  Search,
  CheckCircle2,
  ChevronLeft,
  ChevronRight,
  Activity,
} from 'lucide-react';

export default function AdminAuditPage() {
  const [logs, setLogs] = useState<any[]>([]);
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [isLoading, setIsLoading] = useState(true);

  const fetchAuditLogs = async () => {
    try {
      setIsLoading(true);
      const res: any = await apiClient.get(`/audit?page=${page}&limit=20`);
      if (res?.data) {
        setLogs(res.data);
        setTotalPages(res.meta?.totalPages || 1);
      }
    } catch (e) {
      setLogs([]);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchAuditLogs();
  }, [page]);

  return (
    <div className="flex min-h-screen flex-col bg-[#F8FAFC]">
      <Navbar />

      <main className="flex-1 py-8">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 space-y-6">
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-[#E4E4E7] pb-4">
            <div>
              <h1 className="text-2xl font-black text-zinc-900 flex items-center gap-2">
                <Activity className="h-6 w-6 text-[#C2410C]" /> Enterprise Audit Trail & Security Center
              </h1>
              <p className="text-xs text-[#71717A] mt-0.5">
                Inspect immutable system audit logs for administrative actions, financial transactions, and security events.
              </p>
            </div>

            <div className="flex items-center gap-2">
              <Link href="/admin/dashboard">
                <Button size="sm" variant="outline">&larr; Admin Dashboard</Button>
              </Link>
            </div>
          </div>

          <Card className="p-0 overflow-hidden shadow-md">
            <table className="w-full text-left text-xs">
              <thead className="bg-slate-50 text-[#71717A] font-bold uppercase border-b border-[#E4E4E7]">
                <tr>
                  <th className="px-4 py-3">Timestamp</th>
                  <th className="px-4 py-3">Actor / User</th>
                  <th className="px-4 py-3">Action</th>
                  <th className="px-4 py-3">Entity</th>
                  <th className="px-4 py-3">Entity ID</th>
                  <th className="px-4 py-3 text-right">Details</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[#E4E4E7] bg-white font-mono">
                {isLoading ? (
                  <tr>
                    <td colSpan={6} className="px-4 py-8 text-center text-zinc-500 animate-pulse font-sans">
                      Loading audit logs...
                    </td>
                  </tr>
                ) : logs.length === 0 ? (
                  <tr>
                    <td colSpan={6} className="px-4 py-8 text-center text-zinc-500 italic font-sans">
                      No audit logs recorded yet.
                    </td>
                  </tr>
                ) : (
                  logs.map((log) => (
                    <tr key={log.id} className="hover:bg-slate-50">
                      <td className="px-4 py-3 text-zinc-600">{new Date(log.createdAt).toLocaleString()}</td>
                      <td className="px-4 py-3 font-bold text-zinc-900">{log.actor?.email || 'SYSTEM'}</td>
                      <td className="px-4 py-3 text-orange-600 font-bold">{log.action}</td>
                      <td className="px-4 py-3 text-zinc-800">{log.entity}</td>
                      <td className="px-4 py-3 text-zinc-700 truncate max-w-[120px]">{log.entityId}</td>
                      <td className="px-4 py-3 text-right text-zinc-500 font-sans text-[11px] truncate max-w-[180px]">
                        {JSON.stringify(log.details)}
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
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
