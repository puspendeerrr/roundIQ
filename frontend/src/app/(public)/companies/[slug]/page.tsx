'use client';

import React, { useEffect, useState } from 'react';
import Link from 'next/link';
import { useParams } from 'next/navigation';
import { Navbar } from '../../../../components/layout/Navbar';
import { Footer } from '../../../../components/layout/Footer';
import { Card } from '../../../../components/ui/Card';
import { Button } from '../../../../components/ui/Button';
import { apiClient } from '../../../../lib/api-client';
import { Company, Job } from '../../../../types';
import {
  Building,
  Globe,
  MapPin,
  CheckCircle2,
  Briefcase,
  ChevronLeft,
  DollarSign,
  Users,
} from 'lucide-react';

export default function PublicCompanyProfilePage() {
  const params = useParams();
  const slug = (params?.slug as string) || '';
  const [company, setCompany] = useState<any | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const fetchCompany = async () => {
      try {
        setIsLoading(true);
        const res: any = await apiClient.get(`/companies/${slug}`);
        if (res?.data) setCompany(res.data);
      } catch (e) {
        setCompany(null);
      } finally {
        setIsLoading(false);
      }
    };

    if (slug) fetchCompany();
  }, [slug]);

  if (isLoading) {
    return (
      <div className="flex min-h-screen flex-col bg-[#F8FAFC]">
        <Navbar />
        <main className="flex-1 py-16 text-center text-xs text-zinc-500 animate-pulse">
          Loading company profile & open positions...
        </main>
        <Footer />
      </div>
    );
  }

  if (!company) {
    return (
      <div className="flex min-h-screen flex-col bg-[#F8FAFC]">
        <Navbar />
        <main className="flex-1 py-16 text-center text-xs text-zinc-500">
          Company profile not found.
        </main>
        <Footer />
      </div>
    );
  }

  return (
    <div className="flex min-h-screen flex-col bg-[#F8FAFC]">
      <Navbar />

      <main className="flex-1 py-8">
        <div className="mx-auto max-w-5xl px-4 sm:px-6 lg:px-8 space-y-6">
          <Link
            href="/directory"
            className="inline-flex items-center gap-1 text-xs font-semibold text-[#71717A] hover:text-zinc-900"
          >
            <ChevronLeft className="h-4 w-4" /> Back to Directory
          </Link>

          {/* Company Header Banner */}
          <Card className="p-8 bg-gradient-to-br from-zinc-900 to-zinc-950 text-white shadow-xl space-y-4 border border-zinc-800">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
              <div className="flex items-center gap-4">
                <div className="flex h-16 w-16 items-center justify-center rounded-2xl bg-white/10 text-white font-black text-2xl border border-white/20">
                  <Building className="h-8 w-8 text-orange-400" />
                </div>
                <div>
                  <div className="flex items-center gap-2">
                    <h1 className="text-2xl font-black text-white">{company.name}</h1>
                    {company.verified && (
                      <span className="inline-flex items-center gap-1 text-xs font-bold text-green-400 bg-green-950/80 px-2.5 py-0.5 rounded-full border border-green-700">
                        <CheckCircle2 className="h-3.5 w-3.5" /> Verified Enterprise
                      </span>
                    )}
                  </div>
                  <p className="text-xs text-zinc-400 mt-1">{company.industry || 'Technology Solutions'}</p>
                </div>
              </div>

              {company.website && (
                <a href={company.website} target="_blank" rel="noreferrer">
                  <Button variant="outline" size="sm" leftIcon={<Globe className="h-4 w-4 text-orange-400" />}>
                    Visit Website
                  </Button>
                </a>
              )}
            </div>

            <p className="text-xs text-zinc-300 leading-relaxed border-t border-zinc-800 pt-3">
              {company.description || 'Enterprise tech company hiring top software engineering candidates on RoundIQ.'}
            </p>
          </Card>

          {/* Open Positions List */}
          <div className="space-y-4">
            <h2 className="text-base font-bold text-zinc-900 flex items-center gap-2">
              <Briefcase className="h-5 w-5 text-[#C2410C]" /> Open Engineering Positions ({company.jobs?.length || 0})
            </h2>

            <div className="grid grid-cols-1 gap-4">
              {company.jobs?.length === 0 ? (
                <Card className="p-6 text-center text-xs text-zinc-500 italic">
                  No open job positions listed currently. Check back soon.
                </Card>
              ) : (
                company.jobs?.map((job: any) => (
                  <Card key={job.id} className="p-5 flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white shadow-md">
                    <div>
                      <span className="text-[10px] font-bold uppercase tracking-wider text-blue-700 bg-blue-50 px-2 py-0.5 rounded border border-blue-200">
                        {job.workMode}
                      </span>
                      <h3 className="text-base font-bold text-zinc-900 mt-1">{job.title}</h3>
                      <p className="text-xs text-[#71717A]">{job.location || 'Remote'} &bull; ₹{(job.salaryMin / 100000).toFixed(1)}L - ₹{(job.salaryMax / 100000).toFixed(1)}L PA</p>
                    </div>

                    <Link href="/register">
                      <Button size="sm" className="bg-[#C2410C] text-white font-bold">
                        Apply via RoundIQ Profile
                      </Button>
                    </Link>
                  </Card>
                ))
              )}
            </div>
          </div>
        </div>
      </main>

      <Footer />
    </div>
  );
}
