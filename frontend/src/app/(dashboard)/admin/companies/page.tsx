'use client';

import React, { useEffect, useState } from 'react';
import Link from 'next/link';
import { Navbar } from '../../../../components/layout/Navbar';
import { Footer } from '../../../../components/layout/Footer';
import { Card } from '../../../../components/ui/Card';
import { Button } from '../../../../components/ui/Button';
import { apiClient } from '../../../../lib/api-client';
import {
  Building,
  CheckCircle2,
  XCircle,
  ChevronLeft,
  Globe,
} from 'lucide-react';

export default function AdminCompaniesPage() {
  const [companies, setCompanies] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [msg, setMsg] = useState<string | null>(null);

  const fetchCompanies = async () => {
    try {
      setIsLoading(true);
      const res: any = await apiClient.get('/companies/verified');
      if (res?.data) {
        setCompanies(res.data);
      }
    } catch (e) {
      setCompanies([]);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchCompanies();
  }, []);

  const handleVerifyToggle = async (companyId: string, currentStatus: boolean) => {
    try {
      setMsg(null);
      await apiClient.patch(`/admin/companies/${companyId}/verify`, { verified: !currentStatus });
      setMsg(`Company verification updated to ${!currentStatus}`);
      fetchCompanies();
    } catch (e: any) {
      setMsg(e?.error?.message || 'Failed to update company verification.');
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
                <Building className="h-6 w-6 text-[#C2410C]" /> Enterprise Company Verification Panel
              </h1>
              <p className="text-xs text-[#71717A] mt-0.5">
                Audit company profiles and approve enterprise recruiter verification requests.
              </p>
            </div>

            <div className="flex items-center gap-2">
              <Link href="/admin/dashboard">
                <Button size="sm" variant="outline">&larr; Admin Dashboard</Button>
              </Link>
            </div>
          </div>

          {msg && (
            <div className="rounded-lg bg-green-50 p-3 text-xs font-bold text-[#16A34A] border border-green-200">
              {msg}
            </div>
          )}

          <Card className="p-0 overflow-hidden shadow-md">
            <table className="w-full text-left text-xs">
              <thead className="bg-slate-50 text-[#71717A] font-bold uppercase border-b border-[#E4E4E7]">
                <tr>
                  <th className="px-4 py-3">Company Name</th>
                  <th className="px-4 py-3">Slug</th>
                  <th className="px-4 py-3">Industry</th>
                  <th className="px-4 py-3">Website</th>
                  <th className="px-4 py-3">Status</th>
                  <th className="px-4 py-3 text-right">Verification Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[#E4E4E7] bg-white">
                {isLoading ? (
                  <tr>
                    <td colSpan={6} className="px-4 py-8 text-center text-zinc-500 animate-pulse">
                      Loading companies...
                    </td>
                  </tr>
                ) : companies.length === 0 ? (
                  <tr>
                    <td colSpan={6} className="px-4 py-8 text-center text-zinc-500 italic">
                      No corporate profiles listed.
                    </td>
                  </tr>
                ) : (
                  companies.map((comp) => (
                    <tr key={comp.id} className="hover:bg-slate-50">
                      <td className="px-4 py-3 font-bold text-zinc-900">{comp.name}</td>
                      <td className="px-4 py-3 font-mono text-zinc-700">{comp.slug}</td>
                      <td className="px-4 py-3 text-zinc-800">{comp.industry || 'Technology'}</td>
                      <td className="px-4 py-3 font-mono text-blue-600 truncate max-w-[150px]">
                        {comp.website || 'N/A'}
                      </td>
                      <td className="px-4 py-3">
                        <span
                          className={`inline-flex rounded-full px-2.5 py-0.5 text-[10px] font-bold ${
                            comp.verified
                              ? 'bg-green-100 text-green-800'
                              : 'bg-amber-100 text-amber-800'
                          }`}
                        >
                          {comp.verified ? 'VERIFIED' : 'UNVERIFIED'}
                        </span>
                      </td>
                      <td className="px-4 py-3 text-right">
                        <Button
                          size="sm"
                          variant={comp.verified ? 'outline' : 'primary'}
                          className={!comp.verified ? 'bg-green-700 text-white font-bold' : ''}
                          onClick={() => handleVerifyToggle(comp.id, comp.verified)}
                        >
                          {comp.verified ? 'Revoke Verification' : 'Approve Company'}
                        </Button>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </Card>
        </div>
      </main>

      <Footer />
    </div>
  );
}
