'use client';

import React, { useEffect, useState, Suspense } from 'react';
import Link from 'next/link';
import { useSearchParams } from 'next/navigation';
import { apiClient } from '../../../lib/api-client';
import { Card } from '../../../components/ui/Card';
import { Button } from '../../../components/ui/Button';
import { ShieldCheck, CheckCircle2, XCircle, Loader2 } from 'lucide-react';

function VerifyEmailContent() {
  const searchParams = useSearchParams();
  const token = searchParams.get('token');

  const [status, setStatus] = useState<'loading' | 'success' | 'error'>('loading');
  const [message, setMessage] = useState<string>('Verifying your email address...');

  useEffect(() => {
    if (!token) {
      setStatus('error');
      setMessage('Verification token is missing from URL.');
      return;
    }

    const verify = async () => {
      try {
        await apiClient.post('/auth/verify-email', { token });
        setStatus('success');
        setMessage('Your email has been verified successfully!');
      } catch (err: any) {
        setStatus('error');
        setMessage(err?.error?.message || 'Verification token is invalid or expired.');
      }
    };

    verify();
  }, [token]);

  return (
    <Card className="px-6 py-8 shadow-md sm:px-10 text-center space-y-4">
      {status === 'loading' && (
        <div className="py-6 space-y-3">
          <Loader2 className="mx-auto h-10 w-10 text-[#C2410C] animate-spin" />
          <p className="text-sm font-medium text-zinc-700">{message}</p>
        </div>
      )}

      {status === 'success' && (
        <div className="py-4 space-y-4">
          <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-full bg-green-100 text-[#16A34A]">
            <CheckCircle2 className="h-8 w-8" />
          </div>
          <h3 className="text-lg font-bold text-zinc-900">Email Verified</h3>
          <p className="text-sm text-[#71717A]">{message}</p>
          <Link href="/login" className="inline-block w-full">
            <Button className="w-full">Continue to Sign In</Button>
          </Link>
        </div>
      )}

      {status === 'error' && (
        <div className="py-4 space-y-4">
          <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-full bg-red-100 text-[#DC2626]">
            <XCircle className="h-8 w-8" />
          </div>
          <h3 className="text-lg font-bold text-zinc-900">Verification Failed</h3>
          <p className="text-sm text-[#71717A]">{message}</p>
          <Link href="/login" className="inline-block w-full">
            <Button variant="outline" className="w-full">
              Back to Sign In
            </Button>
          </Link>
        </div>
      )}
    </Card>
  );
}

export default function VerifyEmailPage() {
  return (
    <div className="flex min-h-screen flex-col justify-center bg-[#F8FAFC] py-12 sm:px-6 lg:px-8">
      <div className="sm:mx-auto sm:w-full sm:max-w-md text-center">
        <Link href="/" className="inline-flex items-center gap-2 text-2xl font-black text-zinc-900">
          <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-[#C2410C] text-white shadow-md">
            <ShieldCheck className="h-6 w-6" />
          </div>
          <span>Round<span className="text-[#C2410C]">IQ</span></span>
        </Link>
      </div>

      <div className="mt-8 sm:mx-auto sm:w-full sm:max-w-md">
        <Suspense fallback={<div className="text-center text-sm">Verifying...</div>}>
          <VerifyEmailContent />
        </Suspense>
      </div>
    </div>
  );
}
