'use client';

import React from 'react';
import Link from 'next/link';
import { Navbar } from '../../../../components/layout/Navbar';
import { Footer } from '../../../../components/layout/Footer';
import { Card } from '../../../../components/ui/Card';
import { Button } from '../../../../components/ui/Button';
import { useAuth } from '../../../../context/AuthContext';
import {
  CheckCircle2,
  Clock,
  AlertCircle,
  XCircle,
  ShieldCheck,
  Briefcase,
  ExternalLink,
  Award,
  Edit,
} from 'lucide-react';

export default function InterviewerDashboardPage() {
  const { user } = useAuth();
  const profile = user?.interviewerProfile;
  const status = profile?.verificationStatus || 'DRAFT';

  return (
    <div className="flex min-h-screen flex-col bg-[#F8FAFC]">
      <Navbar />

      <main className="flex-1 py-8">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 space-y-6">
          {/* Welcome Header */}
          <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4 rounded-2xl bg-zinc-900 p-6 text-white shadow-lg">
            <div>
              <div className="inline-flex items-center gap-2 text-xs font-semibold text-orange-400 uppercase tracking-wider mb-1">
                <Briefcase className="h-4 w-4" /> Interviewer Portal
              </div>
              <h1 className="text-2xl font-black">Welcome, {profile?.fullName || user?.email}!</h1>
              <p className="text-sm text-zinc-400 mt-1">
                Turn your engineering experience into high-impact mock interviews.
              </p>
            </div>
            <div className="flex gap-3">
              <Link href="/interviewer/profile">
                <Button leftIcon={<Edit className="h-4 w-4" />}>Edit Profile</Button>
              </Link>
            </div>
          </div>

          {/* Verification Status Banner */}
          <div>
            {status === 'DRAFT' && (
              <div className="rounded-xl border border-amber-300 bg-amber-50 p-5 text-amber-900 shadow-sm flex flex-col md:flex-row md:items-center justify-between gap-4">
                <div className="flex items-start gap-3">
                  <AlertCircle className="h-6 w-6 text-amber-600 flex-shrink-0 mt-0.5" />
                  <div>
                    <h3 className="font-bold text-sm text-amber-950">Verification Application Pending Submission</h3>
                    <p className="text-xs text-amber-800 mt-0.5">
                      Your profile is currently in <span className="font-bold">Draft</span> mode. Complete your details and submit for Admin verification to become visible on the public directory.
                    </p>
                  </div>
                </div>
                <Link href="/interviewer/apply">
                  <Button size="sm" className="bg-amber-600 hover:bg-amber-700 text-white whitespace-nowrap">
                    Submit for Verification &rarr;
                  </Button>
                </Link>
              </div>
            )}

            {status === 'PENDING' && (
              <div className="rounded-xl border border-blue-200 bg-blue-50 p-5 text-blue-900 shadow-sm flex items-start gap-3">
                <Clock className="h-6 w-6 text-blue-600 flex-shrink-0 mt-0.5 animate-pulse" />
                <div>
                  <h3 className="font-bold text-sm text-blue-950">Under Review by RoundIQ Admins</h3>
                  <p className="text-xs text-blue-800 mt-0.5">
                    Your verification application has been submitted and is currently being audited by our operations team. You will receive an update shortly.
                  </p>
                </div>
              </div>
            )}

            {status === 'APPROVED' && (
              <div className="rounded-xl border border-green-300 bg-green-50 p-5 text-green-900 shadow-sm flex flex-col md:flex-row md:items-center justify-between gap-4">
                <div className="flex items-start gap-3">
                  <CheckCircle2 className="h-6 w-6 text-[#16A34A] flex-shrink-0 mt-0.5" />
                  <div>
                    <h3 className="font-bold text-sm text-green-950 flex items-center gap-2">
                      <span>Verified Interviewer</span>
                      <span className="inline-flex items-center gap-1 text-[10px] bg-green-200 text-green-800 px-2 py-0.5 rounded-full font-bold">
                        <Award className="h-3 w-3" /> LIVE ON MARKETPLACE
                      </span>
                    </h3>
                    <p className="text-xs text-green-800 mt-0.5">
                      Congratulations! Your profile is active and publicly visible in the Marketplace Directory.
                    </p>
                  </div>
                </div>
                <Link href={`/interviewers/${profile?.id}`}>
                  <Button size="sm" variant="outline" className="bg-white border-green-300 text-green-900 hover:bg-green-100 whitespace-nowrap" leftIcon={<ExternalLink className="h-4 w-4" />}>
                    View Public Profile
                  </Button>
                </Link>
              </div>
            )}

            {status === 'REJECTED' && (
              <div className="rounded-xl border border-red-300 bg-red-50 p-5 text-red-900 shadow-sm flex flex-col md:flex-row md:items-center justify-between gap-4">
                <div className="flex items-start gap-3">
                  <XCircle className="h-6 w-6 text-[#DC2626] flex-shrink-0 mt-0.5" />
                  <div>
                    <h3 className="font-bold text-sm text-red-950">Verification Request Needs Attention</h3>
                    <p className="text-xs text-red-800 mt-0.5">
                      {profile?.verificationReason || 'Your application was rejected. Please update your profile information and professional links before re-applying.'}
                    </p>
                  </div>
                </div>
                <Link href="/interviewer/apply">
                  <Button size="sm" className="bg-[#DC2626] hover:bg-red-700 text-white whitespace-nowrap">
                    Update & Re-apply
                  </Button>
                </Link>
              </div>
            )}
          </div>

          {/* Profile Overview */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <Card className="md:col-span-2 space-y-4">
              <div className="flex items-center justify-between border-b border-[#E4E4E7] pb-3">
                <h3 className="text-base font-bold text-zinc-900">Interviewer Details</h3>
                <Link href="/interviewer/profile" className="text-xs font-bold text-[#C2410C] hover:underline">
                  Edit Profile
                </Link>
              </div>

              <div className="grid grid-cols-2 gap-4 text-sm">
                <div>
                  <span className="text-xs text-[#71717A] uppercase font-semibold">Headline</span>
                  <p className="font-semibold text-zinc-900">{profile?.headline || 'Not set'}</p>
                </div>
                <div>
                  <span className="text-xs text-[#71717A] uppercase font-semibold">Current Company</span>
                  <p className="font-semibold text-zinc-900">{profile?.currentCompany || 'Not set'}</p>
                </div>
                <div>
                  <span className="text-xs text-[#71717A] uppercase font-semibold">Years of Experience</span>
                  <p className="font-semibold text-zinc-900">{profile?.yearsOfExperience || 0} Years</p>
                </div>
                <div>
                  <span className="text-xs text-[#71717A] uppercase font-semibold">Previous Companies</span>
                  <p className="font-semibold text-zinc-900">
                    {profile?.previousCompanies?.length ? profile.previousCompanies.join(', ') : 'None listed'}
                  </p>
                </div>
              </div>

              <div>
                <span className="text-xs text-[#71717A] uppercase font-semibold">About / Bio</span>
                <p className="text-sm text-zinc-700 mt-1">
                  {profile?.bio || 'No bio added yet.'}
                </p>
              </div>
            </Card>

            <Card className="space-y-4">
              <h3 className="text-base font-bold text-zinc-900 border-b border-[#E4E4E7] pb-3">Professional Links</h3>
              <div className="space-y-2 text-xs">
                <div>
                  <span className="font-semibold text-[#71717A]">LinkedIn:</span>{' '}
                  {profile?.linkedinUrl ? (
                    <a href={profile.linkedinUrl} target="_blank" rel="noreferrer" className="text-[#C2410C] underline truncate block">
                      {profile.linkedinUrl}
                    </a>
                  ) : (
                    <span className="text-zinc-400">Not provided</span>
                  )}
                </div>
                <div>
                  <span className="font-semibold text-[#71717A]">GitHub:</span>{' '}
                  {profile?.githubUrl ? (
                    <a href={profile.githubUrl} target="_blank" rel="noreferrer" className="text-[#C2410C] underline truncate block">
                      {profile.githubUrl}
                    </a>
                  ) : (
                    <span className="text-zinc-400">Not provided</span>
                  )}
                </div>
                <div>
                  <span className="font-semibold text-[#71717A]">Portfolio:</span>{' '}
                  {profile?.portfolioUrl ? (
                    <a href={profile.portfolioUrl} target="_blank" rel="noreferrer" className="text-[#C2410C] underline truncate block">
                      {profile.portfolioUrl}
                    </a>
                  ) : (
                    <span className="text-zinc-400">Not provided</span>
                  )}
                </div>
              </div>
            </Card>
          </div>
        </div>
      </main>

      <Footer />
    </div>
  );
}
