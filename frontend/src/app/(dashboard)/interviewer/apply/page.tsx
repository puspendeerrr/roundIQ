'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { Navbar } from '../../../../components/layout/Navbar';
import { Footer } from '../../../../components/layout/Footer';
import { Card } from '../../../../components/ui/Card';
import { Button } from '../../../../components/ui/Button';
import { useAuth } from '../../../../context/AuthContext';
import { apiClient } from '../../../../lib/api-client';
import { ShieldCheck, CheckCircle2, AlertCircle, ArrowLeft, Loader2 } from 'lucide-react';

export default function InterviewerApplyPage() {
  const router = useRouter();
  const { user, refetchUser } = useAuth();
  const profile = user?.interviewerProfile;

  const [isSubmitting, setIsSubmitting] = useState(false);
  const [successMsg, setSuccessMsg] = useState<string | null>(null);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  const isProfileComplete =
    !!profile?.fullName &&
    !!profile?.currentCompany &&
    (profile?.yearsOfExperience ?? 0) > 0 &&
    !!(profile?.linkedinUrl || profile?.githubUrl || profile?.resumeUrl);

  const handleApply = async () => {
    try {
      setIsSubmitting(true);
      setErrorMsg(null);
      setSuccessMsg(null);
      await apiClient.post('/interviewers/me/apply');
      await refetchUser();
      setSuccessMsg('Your application has been submitted to RoundIQ Admins!');
      setTimeout(() => {
        router.push('/interviewer/dashboard');
      }, 2000);
    } catch (err: any) {
      setErrorMsg(err?.error?.message || err?.message || 'Failed to submit verification application.');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="flex min-h-screen flex-col bg-[#F8FAFC]">
      <Navbar />

      <main className="flex-1 py-8">
        <div className="mx-auto max-w-3xl px-4 sm:px-6 lg:px-8 space-y-6">
          <div className="flex items-center justify-between">
            <button
              onClick={() => router.push('/interviewer/dashboard')}
              className="inline-flex items-center gap-1 text-xs font-semibold text-[#71717A] hover:text-zinc-900"
            >
              <ArrowLeft className="h-4 w-4" /> Back to Dashboard
            </button>
            <h1 className="text-xl font-bold text-zinc-900">Verification Application</h1>
          </div>

          <Card className="p-6 md:p-8 shadow-md space-y-6">
            <div className="flex items-center gap-3 border-b border-[#E4E4E7] pb-4">
              <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-orange-100 text-[#C2410C]">
                <ShieldCheck className="h-6 w-6" />
              </div>
              <div>
                <h2 className="text-lg font-bold text-zinc-900">Submit Profile for Vetting</h2>
                <p className="text-xs text-[#71717A]">
                  RoundIQ ensures 100% human-verified interviewers. Admins manually review your company and experience.
                </p>
              </div>
            </div>

            {successMsg && (
              <div className="rounded-lg bg-green-50 p-4 text-xs font-medium text-[#16A34A] border border-green-200 flex items-center gap-2">
                <CheckCircle2 className="h-5 w-5" />
                <span>{successMsg}</span>
              </div>
            )}

            {errorMsg && (
              <div className="rounded-lg bg-red-50 p-4 text-xs font-medium text-[#DC2626] border border-red-200 flex items-center gap-2">
                <AlertCircle className="h-5 w-5 flex-shrink-0" />
                <span>{errorMsg}</span>
              </div>
            )}

            {/* Checklist */}
            <div className="space-y-3 bg-slate-50 p-4 rounded-xl border border-[#E4E4E7]">
              <h3 className="text-xs font-bold uppercase tracking-wider text-zinc-700">Verification Checklist</h3>
              <ul className="space-y-2 text-xs">
                <li className="flex items-center gap-2">
                  {profile?.fullName ? (
                    <CheckCircle2 className="h-4 w-4 text-green-600" />
                  ) : (
                    <AlertCircle className="h-4 w-4 text-amber-500" />
                  )}
                  <span>Full Name: <strong>{profile?.fullName || 'Missing'}</strong></span>
                </li>
                <li className="flex items-center gap-2">
                  {profile?.currentCompany ? (
                    <CheckCircle2 className="h-4 w-4 text-green-600" />
                  ) : (
                    <AlertCircle className="h-4 w-4 text-amber-500" />
                  )}
                  <span>Current Company: <strong>{profile?.currentCompany || 'Missing'}</strong></span>
                </li>
                <li className="flex items-center gap-2">
                  {(profile?.yearsOfExperience ?? 0) > 0 ? (
                    <CheckCircle2 className="h-4 w-4 text-green-600" />
                  ) : (
                    <AlertCircle className="h-4 w-4 text-amber-500" />
                  )}
                  <span>Years of Experience: <strong>{profile?.yearsOfExperience || 0} Years</strong></span>
                </li>
                <li className="flex items-center gap-2">
                  {profile?.linkedinUrl || profile?.githubUrl || profile?.resumeUrl ? (
                    <CheckCircle2 className="h-4 w-4 text-green-600" />
                  ) : (
                    <AlertCircle className="h-4 w-4 text-amber-500" />
                  )}
                  <span>Professional Verification Link (LinkedIn/GitHub/Resume): <strong>{profile?.linkedinUrl ? 'Linked' : 'Missing'}</strong></span>
                </li>
              </ul>
            </div>

            {!isProfileComplete && (
              <div className="rounded-lg bg-amber-50 p-3 text-xs text-amber-900 border border-amber-200">
                Some required information is missing. Please edit your profile details before submitting.
              </div>
            )}

            <div className="flex justify-between items-center pt-4 border-t border-[#E4E4E7]">
              <Link href="/interviewer/profile">
                <Button variant="outline">Edit Profile First</Button>
              </Link>

              <Button
                onClick={handleApply}
                disabled={!isProfileComplete || isSubmitting || profile?.verificationStatus === 'PENDING'}
                isLoading={isSubmitting}
              >
                Submit Application Now &rarr;
              </Button>
            </div>
          </Card>
        </div>
      </main>

      <Footer />
    </div>
  );
}
