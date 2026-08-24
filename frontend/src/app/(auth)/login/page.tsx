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
import { ShieldCheck, Mail, Lock, Sparkles } from 'lucide-react';

const loginSchema = z.object({
  email: z.string().email('Please enter a valid email address'),
  password: z.string().min(1, 'Password is required'),
});

type LoginFormData = z.infer<typeof loginSchema>;

export default function LoginPage() {
  const router = useRouter();
  const { login } = useAuth();
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [isGoogleLoading, setIsGoogleLoading] = useState(false);

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<LoginFormData>({
    resolver: zodResolver(loginSchema),
  });

  const onSubmit = async (data: LoginFormData) => {
    try {
      setErrorMsg(null);
      const res: any = await apiClient.post('/auth/login', data);
      if (res?.data?.accessToken && res?.data?.user) {
        login(res.data.accessToken, res.data.user);
        const role = res.data.user.role;
        if (role === 'ADMIN') router.push('/admin/dashboard');
        else if (role === 'INTERVIEWER') router.push('/interviewer/dashboard');
        else router.push('/student/dashboard');
      }
    } catch (err: any) {
      setErrorMsg(err?.error?.message || err?.message || 'Login failed. Please check your credentials.');
    }
  };

  const handleGoogleLogin = async () => {
    try {
      setIsGoogleLoading(true);
      setErrorMsg(null);
      // Simulate Google OAuth popup response
      const googlePayload = {
        googleId: 'google-oauth-' + Date.now(),
        email: 'google.user@example.com',
        fullName: 'Google User',
        role: 'STUDENT',
      };
      const res: any = await apiClient.post('/auth/google', googlePayload);
      if (res?.data?.accessToken && res?.data?.user) {
        login(res.data.accessToken, res.data.user);
        router.push('/student/dashboard');
      }
    } catch (err: any) {
      setErrorMsg(err?.error?.message || 'Google login failed');
    } finally {
      setIsGoogleLoading(false);
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
        <h2 className="mt-6 text-2xl font-bold tracking-tight text-zinc-900">Welcome back</h2>
        <p className="mt-2 text-sm text-[#71717A]">
          Log in to discover verified interviewers & track your performance
        </p>
      </div>

      <div className="mt-8 sm:mx-auto sm:w-full sm:max-w-md">
        <Card className="px-6 py-8 shadow-md sm:px-10">
          {errorMsg && (
            <div className="mb-4 rounded-lg bg-red-50 p-3 text-xs font-medium text-[#DC2626] border border-red-200">
              {errorMsg}
            </div>
          )}

          <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
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
              placeholder="••••••••"
              leftIcon={<Lock className="h-4 w-4" />}
              error={errors.password?.message}
              {...register('password')}
            />

            <div className="flex items-center justify-between text-xs">
              <label className="flex items-center gap-2 text-[#71717A]">
                <input type="checkbox" className="rounded border-zinc-300 text-[#C2410C] focus:ring-[#C2410C]" />
                Remember me
              </label>
              <Link href="/forgot-password" className="font-semibold text-[#C2410C] hover:underline">
                Forgot password?
              </Link>
            </div>

            <Button type="submit" isLoading={isSubmitting} className="w-full">
              Sign In
            </Button>
          </form>

          <div className="relative my-6">
            <div className="absolute inset-0 flex items-center">
              <div className="w-full border-t border-[#E4E4E7]" />
            </div>
            <div className="relative flex justify-center text-xs uppercase">
              <span className="bg-white px-2 text-[#71717A] font-medium">Or continue with</span>
            </div>
          </div>

          <Button
            type="button"
            variant="outline"
            onClick={handleGoogleLogin}
            isLoading={isGoogleLoading}
            leftIcon={<Sparkles className="h-4 w-4 text-orange-500" />}
            className="w-full"
          >
            Google Login
          </Button>

          <p className="mt-6 text-center text-xs text-[#71717A]">
            Don't have an account?{' '}
            <Link href="/register" className="font-bold text-[#C2410C] hover:underline">
              Create an account
            </Link>
          </p>
        </Card>
      </div>
    </div>
  );
}
