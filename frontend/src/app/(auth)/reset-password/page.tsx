'use client';

import React, { useState, useEffect, Suspense } from 'react';
import Link from 'next/link';
import { useRouter, useSearchParams } from 'next/navigation';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Input } from '../../../components/ui/Input';
import { Button } from '../../../components/ui/Button';
import { Card } from '../../../components/ui/Card';
import { apiClient } from '../../../lib/api-client';
import { ShieldCheck, Lock, CheckCircle2 } from 'lucide-react';

const resetPasswordSchema = z
  .object({
    token: z.string().min(1, 'Reset token is missing'),
    newPassword: z.string().min(8, 'Password must be at least 8 characters'),
    confirmPassword: z.string().min(1, 'Confirm your password'),
  })
  .refine((data) => data.newPassword === data.confirmPassword, {
    message: 'Passwords do not match',
    path: ['confirmPassword'],
  });

type ResetFormData = z.infer<typeof resetPasswordSchema>;

function ResetPasswordForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const tokenFromUrl = searchParams.get('token') || '';

  const [successMsg, setSuccessMsg] = useState<string | null>(null);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  const {
    register,
    handleSubmit,
    setValue,
    formState: { errors, isSubmitting },
  } = useForm<ResetFormData>({
    resolver: zodResolver(resetPasswordSchema),
    defaultValues: {
      token: tokenFromUrl,
    },
  });

  useEffect(() => {
    if (tokenFromUrl) {
      setValue('token', tokenFromUrl);
    }
  }, [tokenFromUrl, setValue]);

  const onSubmit = async (data: ResetFormData) => {
    try {
      setErrorMsg(null);
      await apiClient.post('/auth/reset-password', {
        token: data.token,
        newPassword: data.newPassword,
      });
      setSuccessMsg('Password has been reset successfully! Redirecting to login...');
      setTimeout(() => {
        router.push('/login');
      }, 2000);
    } catch (err: any) {
      setErrorMsg(err?.error?.message || 'Failed to reset password. The link may be expired.');
    }
  };

  return (
    <Card className="px-6 py-8 shadow-md sm:px-10">
      {successMsg ? (
        <div className="text-center space-y-4">
          <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-full bg-green-100 text-[#16A34A]">
            <CheckCircle2 className="h-6 w-6" />
          </div>
          <p className="text-sm font-semibold text-zinc-900">{successMsg}</p>
        </div>
      ) : (
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
          {errorMsg && (
            <div className="rounded-lg bg-red-50 p-3 text-xs font-medium text-[#DC2626] border border-red-200">
              {errorMsg}
            </div>
          )}

          {!tokenFromUrl && (
            <Input
              label="Reset Token"
              placeholder="Paste token from reset email"
              error={errors.token?.message}
              {...register('token')}
            />
          )}

          <Input
            label="New Password"
            type="password"
            placeholder="Minimum 8 characters"
            leftIcon={<Lock className="h-4 w-4" />}
            error={errors.newPassword?.message}
            {...register('newPassword')}
          />

          <Input
            label="Confirm New Password"
            type="password"
            placeholder="Re-enter new password"
            leftIcon={<Lock className="h-4 w-4" />}
            error={errors.confirmPassword?.message}
            {...register('confirmPassword')}
          />

          <Button type="submit" isLoading={isSubmitting} className="w-full">
            Update Password
          </Button>
        </form>
      )}
    </Card>
  );
}

export default function ResetPasswordPage() {
  return (
    <div className="flex min-h-screen flex-col justify-center bg-[#F8FAFC] py-12 sm:px-6 lg:px-8">
      <div className="sm:mx-auto sm:w-full sm:max-w-md text-center">
        <Link href="/" className="inline-flex items-center gap-2 text-2xl font-black text-zinc-900">
          <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-[#C2410C] text-white shadow-md">
            <ShieldCheck className="h-6 w-6" />
          </div>
          <span>Round<span className="text-[#C2410C]">IQ</span></span>
        </Link>
        <h2 className="mt-6 text-2xl font-bold tracking-tight text-zinc-900">Set new password</h2>
      </div>

      <div className="mt-8 sm:mx-auto sm:w-full sm:max-w-md">
        <Suspense fallback={<div className="text-center text-sm">Loading...</div>}>
          <ResetPasswordForm />
        </Suspense>
      </div>
    </div>
  );
}
