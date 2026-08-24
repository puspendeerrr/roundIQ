'use client';

import React from 'react';
import Link from 'next/link';
import { Navbar } from '../../../../components/layout/Navbar';
import { Footer } from '../../../../components/layout/Footer';
import { Card } from '../../../../components/ui/Card';
import { Button } from '../../../../components/ui/Button';
import { useAuth } from '../../../../context/AuthContext';
import {
  User,
  Search,
  FileText,
  CheckCircle2,
  Clock,
  Sparkles,
  ArrowRight,
  UserCheck,
  Calendar as CalendarIcon,
  ShieldCheck,
  Edit3,
} from 'lucide-react';

export default function StudentDashboardPage() {
  const { user } = useAuth();
  const studentProfile = user?.studentProfile;

  // Calculate dynamic profile completion percentage
  const fields = [
    { name: 'Full Name', isFilled: Boolean(studentProfile?.fullName?.trim()), weight: 20 },
    { name: 'College / University', isFilled: Boolean(studentProfile?.college?.trim()), weight: 15 },
    { name: 'Degree', isFilled: Boolean(studentProfile?.degree?.trim()), weight: 15 },
    { name: 'Experience Level', isFilled: Boolean(studentProfile?.experience?.trim()), weight: 15 },
    { name: 'Resume URL', isFilled: Boolean(studentProfile?.resumeUrl?.trim()), weight: 20 },
    { name: 'Bio / Goals', isFilled: Boolean(studentProfile?.bio?.trim()), weight: 15 },
  ];

  const completionPercentage = fields.reduce(
    (acc, f) => (f.isFilled ? acc + f.weight : acc),
    0
  );

  const isComplete = completionPercentage === 100;
  const missingField = fields.find((f) => !f.isFilled);

  return (
    <div className="flex min-h-screen flex-col bg-[#F8FAFC]">
      <Navbar />

      <main className="flex-1 py-8">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 space-y-6">
          {/* Welcome Hero Banner */}
          <div className="relative overflow-hidden rounded-2xl bg-gradient-to-r from-zinc-950 via-zinc-900 to-zinc-950 p-6 md:p-8 text-white shadow-xl border border-zinc-800">
            <div className="absolute top-0 right-0 -mr-12 -mt-12 h-64 w-64 rounded-full bg-orange-600/10 blur-3xl"></div>

            <div className="relative z-10 flex flex-col lg:flex-row lg:items-center lg:justify-between gap-6">
              <div className="space-y-3 max-w-2xl">
                <div className="inline-flex items-center gap-2 rounded-full border border-orange-500/30 bg-orange-500/10 px-3 py-1 text-xs font-bold text-orange-400 uppercase tracking-wider">
                  <Sparkles className="h-3.5 w-3.5" /> Student Portal & Onboarding
                </div>

                <h1 className="text-2xl sm:text-3xl font-black text-white tracking-tight">
                  Welcome back, {studentProfile?.fullName || user?.email?.split('@')[0]}!
                </h1>

                <p className="text-sm text-zinc-400 leading-relaxed">
                  Discover verified software engineers from FAANG and top tech companies for 1-on-1 live mock technical interviews.
                </p>

                {/* Profile Completion Bar in Hero */}
                <div className="pt-2 max-w-md space-y-2">
                  <div className="flex items-center justify-between text-xs font-bold">
                    <span className="text-zinc-300 flex items-center gap-1.5">
                      {isComplete ? (
                        <CheckCircle2 className="h-4 w-4 text-green-400" />
                      ) : (
                        <UserCheck className="h-4 w-4 text-orange-400" />
                      )}
                      Profile Completion: {completionPercentage}%
                    </span>
                    <span className="text-orange-400 font-extrabold">
                      {isComplete ? '100% Ready' : `Missing: ${missingField?.name}`}
                    </span>
                  </div>

                  <div className="h-2.5 w-full rounded-full bg-zinc-800 overflow-hidden border border-zinc-700">
                    <div
                      className={`h-full transition-all duration-500 ease-out rounded-full ${
                        isComplete
                          ? 'bg-gradient-to-r from-green-500 to-emerald-400'
                          : 'bg-gradient-to-r from-orange-500 to-amber-400'
                      }`}
                      style={{ width: `${completionPercentage}%` }}
                    />
                  </div>
                </div>
              </div>

              {/* Dynamic CTAs */}
              <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3 pt-2 lg:pt-0">
                <Link href="/directory">
                  <Button
                    size="lg"
                    className="w-full sm:w-auto bg-[#C2410C] hover:bg-[#9A3412] text-white shadow-lg font-bold"
                    rightIcon={<Search className="h-4 w-4" />}
                  >
                    Browse Interviewers
                  </Button>
                </Link>

                <Link href="/student/profile">
                  {isComplete ? (
                    <Button
                      size="lg"
                      variant="outline"
                      className="w-full sm:w-auto bg-white/10 text-white hover:bg-white/20 border-white/20 font-bold"
                      leftIcon={<Edit3 className="h-4 w-4" />}
                    >
                      Edit Profile
                    </Button>
                  ) : (
                    <Button
                      size="lg"
                      className="w-full sm:w-auto bg-gradient-to-r from-amber-500 to-orange-600 hover:from-amber-600 hover:to-orange-700 text-zinc-950 font-black shadow-lg animate-pulse"
                      leftIcon={<UserCheck className="h-4 w-4" />}
                    >
                      Complete Profile ({completionPercentage}%)
                    </Button>
                  )}
                </Link>
              </div>
            </div>
          </div>

          {/* Quick Action Grid */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <Card hoverEffect className="p-6 space-y-3 bg-white">
              <div className="flex items-center justify-between">
                <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-orange-100 text-[#C2410C]">
                  <Search className="h-5 w-5" />
                </div>
                <span className="text-[11px] font-bold text-[#16A34A] bg-green-50 px-2.5 py-0.5 rounded-full border border-green-200">
                  Verified Engineers
                </span>
              </div>
              <h3 className="text-base font-bold text-zinc-900">Explore Marketplace</h3>
              <p className="text-xs text-[#71717A] leading-relaxed">
                Filter software engineers by category (DSA, System Design, Frontend), company, and experience level.
              </p>
              <Link
                href="/directory"
                className="inline-flex items-center gap-1 text-xs font-bold text-[#C2410C] hover:underline pt-1"
              >
                Find Your Interviewer <ArrowRight className="h-3.5 w-3.5" />
              </Link>
            </Card>

            <Card hoverEffect className="p-6 space-y-3 bg-white">
              <div className="flex items-center justify-between">
                <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-blue-100 text-blue-600">
                  <CalendarIcon className="h-5 w-5" />
                </div>
                <span className="text-[11px] font-bold text-blue-700 bg-blue-50 px-2.5 py-0.5 rounded-full border border-blue-200">
                  Session Portal
                </span>
              </div>
              <h3 className="text-base font-bold text-zinc-900">My Interview Bookings</h3>
              <p className="text-xs text-[#71717A] leading-relaxed">
                View your upcoming mock sessions, requested bookings, and past session history.
              </p>
              <Link
                href="/student/bookings"
                className="inline-flex items-center gap-1 text-xs font-bold text-blue-600 hover:underline pt-1"
              >
                Manage Bookings <ArrowRight className="h-3.5 w-3.5" />
              </Link>
            </Card>

            <Card hoverEffect className="p-6 space-y-3 bg-white">
              <div className="flex items-center justify-between">
                <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-purple-100 text-purple-600">
                  <FileText className="h-5 w-5" />
                </div>
                <span
                  className={`text-[11px] font-bold px-2.5 py-0.5 rounded-full border ${
                    studentProfile?.resumeUrl
                      ? 'bg-green-50 text-green-700 border-green-200'
                      : 'bg-amber-50 text-amber-800 border-amber-200'
                  }`}
                >
                  {studentProfile?.resumeUrl ? 'Resume Uploaded' : 'Missing Resume'}
                </span>
              </div>
              <h3 className="text-base font-bold text-zinc-900">Resume & Credentials</h3>
              <p className="text-xs text-[#71717A] leading-relaxed">
                Keep your target resume updated so interviewers can prepare tailored mock questions.
              </p>
              <Link
                href="/student/profile"
                className="inline-flex items-center gap-1 text-xs font-bold text-purple-600 hover:underline pt-1"
              >
                {studentProfile?.resumeUrl ? 'Update Resume Link' : 'Add Resume Link'}{' '}
                <ArrowRight className="h-3.5 w-3.5" />
              </Link>
            </Card>
          </div>

          {/* Profile Details & Readiness Overview */}
          <Card className="p-6 md:p-8 space-y-6 bg-white shadow-md border-[#E4E4E7]">
            <div className="flex items-center justify-between border-b border-[#E4E4E7] pb-3">
              <div>
                <h3 className="text-base font-bold text-zinc-900">Student Profile Information</h3>
                <p className="text-xs text-[#71717A] mt-0.5">
                  Your academic background and preparation goals visible to interviewers.
                </p>
              </div>
              <Link href="/student/profile">
                <Button size="sm" variant="outline">
                  Edit Profile Details
                </Button>
              </Link>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 text-xs">
              <div className="p-3.5 rounded-xl bg-slate-50 border border-[#E4E4E7]">
                <span className="text-[#71717A] uppercase font-bold tracking-wider">Full Name</span>
                <p className="font-bold text-zinc-900 text-sm mt-1">
                  {studentProfile?.fullName || 'Not specified'}
                </p>
              </div>
              <div className="p-3.5 rounded-xl bg-slate-50 border border-[#E4E4E7]">
                <span className="text-[#71717A] uppercase font-bold tracking-wider">
                  College / University
                </span>
                <p className="font-bold text-zinc-900 text-sm mt-1">
                  {studentProfile?.college || 'Not specified'}
                </p>
              </div>
              <div className="p-3.5 rounded-xl bg-slate-50 border border-[#E4E4E7]">
                <span className="text-[#71717A] uppercase font-bold tracking-wider">Degree / Major</span>
                <p className="font-bold text-zinc-900 text-sm mt-1">
                  {studentProfile?.degree || 'Not specified'}
                </p>
              </div>
              <div className="p-3.5 rounded-xl bg-slate-50 border border-[#E4E4E7]">
                <span className="text-[#71717A] uppercase font-bold tracking-wider">
                  Experience Level
                </span>
                <p className="font-bold text-zinc-900 text-sm mt-1">
                  {studentProfile?.experience || 'Not specified'}
                </p>
              </div>
            </div>

            <div className="space-y-1.5 pt-2">
              <span className="text-xs text-[#71717A] uppercase font-bold tracking-wider">
                Interview Goals & Bio
              </span>
              <p className="text-xs text-zinc-700 bg-slate-50 p-4 rounded-xl border border-[#E4E4E7] leading-relaxed">
                {studentProfile?.bio ||
                  'No bio added yet. Click "Complete Profile" to share your interview targets, dream companies, or specific technical topics with your interviewer.'}
              </p>
            </div>
          </Card>
        </div>
      </main>

      <Footer />
    </div>
  );
}
