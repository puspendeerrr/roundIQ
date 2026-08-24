'use client';

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Navbar } from '../../../../components/layout/Navbar';
import { Footer } from '../../../../components/layout/Footer';
import { Card } from '../../../../components/ui/Card';
import { Input } from '../../../../components/ui/Input';
import { Button } from '../../../../components/ui/Button';
import { useAuth } from '../../../../context/AuthContext';
import { apiClient } from '../../../../lib/api-client';
import { User, CheckCircle2, ArrowLeft } from 'lucide-react';

const studentProfileSchema = z.object({
  fullName: z.string().min(2, 'Full name must be at least 2 characters'),
  college: z.string().optional(),
  degree: z.string().optional(),
  experience: z.string().optional(),
  bio: z.string().max(1000, 'Bio cannot exceed 1000 characters').optional(),
  resumeUrl: z.string().url('Must be a valid URL').optional().or(z.literal('')),
});

type StudentProfileForm = z.infer<typeof studentProfileSchema>;

export default function StudentProfilePage() {
  const router = useRouter();
  const { user, refetchUser } = useAuth();
  const [successMsg, setSuccessMsg] = useState<string | null>(null);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  const {
    register,
    handleSubmit,
    setValue,
    formState: { errors, isSubmitting },
  } = useForm<StudentProfileForm>({
    resolver: zodResolver(studentProfileSchema),
  });

  useEffect(() => {
    if (user?.studentProfile) {
      setValue('fullName', user.studentProfile.fullName || '');
      setValue('college', user.studentProfile.college || '');
      setValue('degree', user.studentProfile.degree || '');
      setValue('experience', user.studentProfile.experience || '');
      setValue('bio', user.studentProfile.bio || '');
      setValue('resumeUrl', user.studentProfile.resumeUrl || '');
    }
  }, [user, setValue]);

  const onSubmit = async (data: StudentProfileForm) => {
    try {
      setErrorMsg(null);
      setSuccessMsg(null);
      await apiClient.put('/students/me/profile', data);
      await refetchUser();
      setSuccessMsg('Profile updated successfully!');
      setTimeout(() => setSuccessMsg(null), 3000);
    } catch (err: any) {
      setErrorMsg(err?.error?.message || 'Failed to update profile.');
    }
  };

  return (
    <div className="flex min-h-screen flex-col bg-[#F8FAFC]">
      <Navbar />

      <main className="flex-1 py-8">
        <div className="mx-auto max-w-3xl px-4 sm:px-6 lg:px-8 space-y-6">
          <div className="flex items-center justify-between">
            <button
              onClick={() => router.back()}
              className="inline-flex items-center gap-1 text-xs font-semibold text-[#71717A] hover:text-zinc-900"
            >
              <ArrowLeft className="h-4 w-4" /> Back to Dashboard
            </button>
            <h1 className="text-xl font-bold text-zinc-900">Student Profile Setup</h1>
          </div>

          <Card className="p-6 md:p-8 shadow-md">
            {successMsg && (
              <div className="mb-4 rounded-lg bg-green-50 p-3 text-xs font-medium text-[#16A34A] border border-green-200 flex items-center gap-2">
                <CheckCircle2 className="h-4 w-4" />
                <span>{successMsg}</span>
              </div>
            )}

            {errorMsg && (
              <div className="mb-4 rounded-lg bg-red-50 p-3 text-xs font-medium text-[#DC2626] border border-red-200">
                {errorMsg}
              </div>
            )}

            <form onSubmit={handleSubmit(onSubmit)} className="space-y-5">
              <Input
                label="Full Name"
                placeholder="e.g. Ananya Sharma"
                error={errors.fullName?.message}
                {...register('fullName')}
              />

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <Input
                  label="College / University"
                  placeholder="e.g. PEC Chandigarh"
                  error={errors.college?.message}
                  {...register('college')}
                />
                <Input
                  label="Degree / Major"
                  placeholder="e.g. B.Tech Computer Science"
                  error={errors.degree?.message}
                  {...register('degree')}
                />
              </div>

              <Input
                label="Current Stage / Experience"
                placeholder="e.g. Final Year / Fresh Graduate / 1 Year Exp"
                error={errors.experience?.message}
                {...register('experience')}
              />

              <Input
                label="Resume URL (Google Drive / Cloudflare R2 / Portfolio)"
                placeholder="https://drive.google.com/your-resume"
                helperText="Link your resume so interviewers can review your background before sessions."
                error={errors.resumeUrl?.message}
                {...register('resumeUrl')}
              />

              <div className="space-y-1.5">
                <label className="block text-xs font-semibold uppercase tracking-wider text-zinc-700">
                  Bio / Target Roles
                </label>
                <textarea
                  rows={4}
                  className="w-full rounded-lg border border-[#E4E4E7] bg-white px-3.5 py-2 text-sm text-zinc-900 placeholder-zinc-400 focus:outline-none focus:ring-2 focus:ring-orange-500"
                  placeholder="Describe your target companies, technical domains (DSA, System Design, React), and what you want to practice."
                  {...register('bio')}
                />
                {errors.bio?.message && <p className="text-xs text-[#DC2626] font-medium">{errors.bio.message}</p>}
              </div>

              <div className="pt-4 border-t border-[#E4E4E7] flex justify-end gap-3">
                <Button type="button" variant="outline" onClick={() => router.push('/student/dashboard')}>
                  Cancel
                </Button>
                <Button type="submit" isLoading={isSubmitting}>
                  Save Profile Changes
                </Button>
              </div>
            </form>
          </Card>
        </div>
      </main>

      <Footer />
    </div>
  );
}
