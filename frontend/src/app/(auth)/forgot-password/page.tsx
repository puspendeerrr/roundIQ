'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Input } from '../../../components/ui/Input';
import { Button } from '../../../components/ui/Button';
import { Card } from '../../../components/ui/Card';
import { apiClient } from '../../../lib/api-client';
import { ShieldCheck, Mail, ArrowLeft, CheckCircle2 } from 'lucide-react';

const forgotPasswordSchema = z.object({
  email: z.string().email('Please enter a valid email address'),
});

type ForgotFormData = z.infer<typeof forgotPasswordSchema>;

export default function ForgotPasswordPage() {
  const [successMsg, setSuccessMsg] = useState<string | null>(null);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [demoToken, setDemoToken] = useState<string | null>(null);

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<ForgotFormData>({
    resolver: zodResolver(forgotPasswordSchema),
  });

  const onSubmit = async (data: ForgotFormData) => {
    try {
      setErrorMsg(null);
      setSuccessMsg(null);
      const res: any = await apiClient.post('/auth/forgot-password', data);
      setSuccessMsg(res?.message || 'Instructions sent to your email.');
      if (res?.data?.resetToken) {
        setDemoToken(res.data.resetToken);
      }
    } catch (err: any) {
      setErrorMsg(err?.error?.message || 'Failed to request password reset.');
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
        <h2 className="mt-6 text-2xl font-bold tracking-tight text-zinc-900">Reset your password</h2>
        <p className="mt-2 text-sm text-[#71717A]">
          Enter your account email and we'll send you a password reset link
        </p>
      </div>

      <div className="mt-8 sm:mx-auto sm:w-full sm:max-w-md">
        <Card className="px-6 py-8 shadow-md sm:px-10">
          {successMsg ? (
            <div className="text-center space-y-4">
              <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-full bg-green-100 text-[#16A34A]">
                <CheckCircle2 className="h-6 w-6" />
              </div>
              <p className="text-sm text-zinc-800 font-medium">{successMsg}</p>

              {demoToken && (
                <div className="rounded-lg bg-orange-50 border border-orange-200 p-3 text-left">
                  <p className="text-xs font-bold text-[#C2410C] mb-1">Development Demo Token:</p>
                  <p className="text-xs font-mono text-zinc-700 break-all">{demoToken}</p>
                  <Link
                    href={`/reset-password?token=${demoToken}`}
                    className="inline-block mt-2 text-xs font-bold text-[#C2410C] underline"
                  >
                    Click here to reset password directly &rarr;
                  </Link>
                </div>
              )}

              <Link href="/login" className="inline-flex items-center gap-1.5 text-xs font-semibold text-[#C2410C]">
                <ArrowLeft className="h-3.5 w-3.5" /> Back to Sign In
              </Link>
            </div>
          ) : (
            <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
              {errorMsg && (
                <div className="rounded-lg bg-red-50 p-3 text-xs font-medium text-[#DC2626] border border-red-200">
                  {errorMsg}
                </div>
              )}

              <Input
                label="Email address"
                type="email"
                placeholder="you@example.com"
                leftIcon={<Mail className="h-4 w-4" />}
                error={errors.email?.message}
                {...register('email')}
              />

              <Button type="submit" isLoading={isSubmitting} className="w-full">
                Send Reset Link
              </Button>

              <div className="text-center pt-2">
                <Link href="/login" className="inline-flex items-center gap-1.5 text-xs font-semibold text-[#71717A] hover:text-zinc-900">
                  <ArrowLeft className="h-3.5 w-3.5" /> Back to Sign In
                </Link>
              </div>
            </form>
          )}
        </Card>
      </div>
    </div>
  );
}
