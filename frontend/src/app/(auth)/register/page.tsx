'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Input } from '../../../components/ui/Input';
import { Button } from '../../../components/ui/Button';
import { Card } from '../../../components/ui/Card';
import { useAuth } from '../../../context/AuthContext';
import { apiClient } from '../../../lib/api-client';
import { ShieldCheck, User, Mail, Lock, UserCheck, Briefcase } from 'lucide-react';

const registerSchema = z.object({
  fullName: z.string().min(2, 'Full name must be at least 2 characters'),
  email: z.string().email('Please enter a valid email address'),
  password: z.string().min(8, 'Password must be at least 8 characters'),
  role: z.enum(['STUDENT', 'INTERVIEWER']),
});

type RegisterFormData = z.infer<typeof registerSchema>;

export default function RegisterPage() {
  const router = useRouter();
  const { login } = useAuth();
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  const {
    register,
    handleSubmit,
    setValue,
    watch,
    formState: { errors, isSubmitting },
  } = useForm<RegisterFormData>({
    resolver: zodResolver(registerSchema),
    defaultValues: {
      role: 'STUDENT',
    },
  });

  const currentRole = watch('role');

  const onSubmit = async (data: RegisterFormData) => {
    try {
      setErrorMsg(null);
      const res: any = await apiClient.post('/auth/register', data);
      if (res?.data?.accessToken && res?.data?.user) {
        login(res.data.accessToken, res.data.user);
        if (data.role === 'INTERVIEWER') {
          router.push('/interviewer/apply');
        } else {
          router.push('/student/dashboard');
        }
      }
    } catch (err: any) {
      setErrorMsg(err?.error?.message || err?.message || 'Registration failed. Please try again.');
    }
  };

  return (
    <div className="flex min-h-screen flex-col justify-center bg-[#F8FAFC] py-12 sm:px-6 lg:px-8">
      <div className="sm:mx-auto sm:w-full sm:max-w-md text-center">
        <Link href="/" className="inline-flex items-center gap-2 text-2xl font-black text-zinc-900">
          <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-[#C2410C] text-white shadow-md">
            <ShieldCheck className="h-6 w-6" />
          </div>
          <span>Round<span className="text-[#C2410C]">IQ</span></span>
        </Link>
        <h2 className="mt-6 text-2xl font-bold tracking-tight text-zinc-900">Create your account</h2>
        <p className="mt-2 text-sm text-[#71717A]">
          Join as a Student looking to practice or an Interviewer offering mock sessions
        </p>
      </div>

      <div className="mt-8 sm:mx-auto sm:w-full sm:max-w-md">
        <Card className="px-6 py-8 shadow-md sm:px-10">
          {errorMsg && (
            <div className="mb-4 rounded-lg bg-red-50 p-3 text-xs font-medium text-[#DC2626] border border-red-200">
              {errorMsg}
            </div>
          )}

          {/* Role Selection Toggle */}
          <div className="mb-6">
            <label className="block text-xs font-semibold uppercase tracking-wider text-zinc-700 mb-2">
              Select Your Role
            </label>
            <div className="grid grid-cols-2 gap-3">
              <button
                type="button"
                onClick={() => setValue('role', 'STUDENT')}
                className={`flex flex-col items-center justify-center rounded-lg border p-3 text-center transition-all ${
                  currentRole === 'STUDENT'
                    ? 'border-[#C2410C] bg-orange-50/50 text-[#C2410C] ring-1 ring-[#C2410C]'
                    : 'border-[#E4E4E7] bg-white text-zinc-600 hover:border-zinc-300'
                }`}
              >
                <UserCheck className="h-5 w-5 mb-1" />
                <span className="text-xs font-bold">Student</span>
                <span className="text-[10px] text-[#71717A]">Prepare for interviews</span>
              </button>

              <button
                type="button"
                onClick={() => setValue('role', 'INTERVIEWER')}
                className={`flex flex-col items-center justify-center rounded-lg border p-3 text-center transition-all ${
                  currentRole === 'INTERVIEWER'
                    ? 'border-[#C2410C] bg-orange-50/50 text-[#C2410C] ring-1 ring-[#C2410C]'
                    : 'border-[#E4E4E7] bg-white text-zinc-600 hover:border-zinc-300'
                }`}
              >
                <Briefcase className="h-5 w-5 mb-1" />
                <span className="text-xs font-bold">Interviewer</span>
                <span className="text-[10px] text-[#71717A]">Conduct mock interviews</span>
              </button>
            </div>
          </div>

          <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
            <Input
              label="Full Name"
              placeholder="e.g. Ananya Sharma"
              leftIcon={<User className="h-4 w-4" />}
              error={errors.fullName?.message}
              {...register('fullName')}
            />

            <Input
              label="Email address"
              type="email"
              placeholder="you@example.com"
              leftIcon={<Mail className="h-4 w-4" />}
              error={errors.email?.message}
              {...register('email')}
            />

            <Input
              label="Password"
              type="password"
              placeholder="Minimum 8 characters"
              leftIcon={<Lock className="h-4 w-4" />}
              error={errors.password?.message}
              {...register('password')}
            />

            <Button type="submit" isLoading={isSubmitting} className="w-full mt-2">
              Create Account
            </Button>
          </form>

          <p className="mt-6 text-center text-xs text-[#71717A]">
            Already have an account?{' '}
            <Link href="/login" className="font-bold text-[#C2410C] hover:underline">
              Log in
            </Link>
          </p>
        </Card>
      </div>
    </div>
  );
}
