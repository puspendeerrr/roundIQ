'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import { useAuth } from '../../context/AuthContext';
import { Button } from '../ui/Button';
import {
  ShieldCheck,
  User,
  LogOut,
  LayoutDashboard,
  Search,
  CheckCircle,
  Menu,
  X,
  Shield,
  Briefcase,
  Bell,
} from 'lucide-react';

export const Navbar: React.FC = () => {
  const { user, logout } = useAuth();
  const pathname = usePathname();
  const router = useRouter();
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  const handleLogout = async () => {
    await logout();
    router.push('/login');
  };

  const getDashboardPath = () => {
    if (!user) return '/login';
    if (user.role === 'ADMIN') return '/admin/dashboard';
    if (user.role === 'INTERVIEWER') return '/interviewer/dashboard';
    if (user.role === 'RECRUITER') return '/recruiter/discovery';
    return '/student/dashboard';
  };

  return (
    <>
      <div className="bg-gradient-to-r from-orange-600 to-amber-600 text-white text-[11px] font-bold py-1.5 px-4 text-center tracking-wide">
        ⚡ ROUNDIQ PLATFORM: Use coupon code <span className="underline font-black font-mono">ROUNDIQ10</span> for 10% instant discount on all mock sessions!
      </div>
      <header className="sticky top-0 z-40 w-full border-b border-[#E4E4E7] bg-white/95 backdrop-blur">
        <div className="mx-auto flex h-16 max-w-7xl items-center justify-between px-4 sm:px-6 lg:px-8">
        {/* Brand Logo */}
        <Link href="/" className="flex items-center gap-2.5 text-xl font-black tracking-tight text-zinc-900">
          <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-[#C2410C] text-white shadow-sm">
            <ShieldCheck className="h-5 w-5" />
          </div>
          <span>
            Round<span className="text-[#C2410C]">IQ</span>
          </span>
        </Link>

        {/* Desktop Nav Links */}
        <nav className="hidden md:flex items-center gap-6 text-sm font-medium">
          <Link
            href="/directory"
            className={`flex items-center gap-1.5 transition-colors ${
              pathname.startsWith('/directory') ? 'text-[#C2410C] font-bold' : 'text-zinc-600 hover:text-zinc-900'
            }`}
          >
            <Search className="h-4 w-4" />
            <span>Marketplace Directory</span>
          </Link>

          <Link
            href="/how-it-works"
            className={`transition-colors ${
              pathname === '/how-it-works' ? 'text-[#C2410C] font-bold' : 'text-zinc-600 hover:text-zinc-900'
            }`}
          >
            How It Works
          </Link>
        </nav>

        {/* User Auth Controls */}
        <div className="hidden md:flex items-center gap-4">
          {user ? (
            <div className="flex items-center gap-3">
              {/* In-App Notification Bell */}
              <Link href={user.role === 'STUDENT' ? '/student/dashboard' : user.role === 'INTERVIEWER' ? '/interviewer/dashboard' : '/admin/dashboard'}>
                <button
                  className="relative p-2 rounded-lg text-zinc-600 hover:text-zinc-900 hover:bg-slate-100 transition-all"
                  title="View Notifications"
                >
                  <Bell className="h-5 w-5 text-zinc-700" />
                  <span className="absolute top-1.5 right-1.5 flex h-2 w-2">
                    <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-orange-400 opacity-75"></span>
                    <span className="relative inline-flex rounded-full h-2 w-2 bg-[#C2410C]"></span>
                  </span>
                </button>
              </Link>

              <Link href={getDashboardPath()}>
                <Button variant="outline" size="sm" leftIcon={<LayoutDashboard className="h-4 w-4 text-[#C2410C]" />}>
                  Dashboard
                </Button>
              </Link>

              {user.role === 'STUDENT' && (
                <Link href="/student/profile">
                  <Button variant="ghost" size="sm" leftIcon={<User className="h-4 w-4" />}>
                    Profile
                  </Button>
                </Link>
              )}

              {user.role === 'INTERVIEWER' && (
                <Link href="/interviewer/profile">
                  <Button variant="ghost" size="sm" leftIcon={<Briefcase className="h-4 w-4" />}>
                    Profile
                  </Button>
                </Link>
              )}

              {user.role === 'ADMIN' && (
                <Link href="/admin/verifications">
                  <Button variant="ghost" size="sm" leftIcon={<Shield className="h-4 w-4 text-purple-600" />}>
                    Admin Queue
                  </Button>
                </Link>
              )}

              <Button
                variant="ghost"
                size="sm"
                onClick={handleLogout}
                className="text-red-600 hover:bg-red-50 hover:text-red-700"
                leftIcon={<LogOut className="h-4 w-4" />}
              >
                Logout
              </Button>
            </div>
          ) : (
            <div className="flex items-center gap-3">
              <Link href="/login">
                <Button variant="ghost" size="sm">
                  Sign In
                </Button>
              </Link>
              <Link href="/register">
                <Button size="sm">Get Started</Button>
              </Link>
            </div>
          )}
        </div>

        {/* Mobile menu button */}
        <div className="md:hidden">
          <button
            onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
            className="p-2 text-zinc-600 hover:text-zinc-900"
          >
            {isMobileMenuOpen ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
          </button>
        </div>
      </div>

      {/* Mobile Drawer */}
      {isMobileMenuOpen && (
        <div className="border-b border-[#E4E4E7] bg-white px-4 pt-2 pb-6 space-y-3 md:hidden">
          <Link
            href="/directory"
            onClick={() => setIsMobileMenuOpen(false)}
            className="block px-3 py-2 rounded-md text-base font-medium text-zinc-700 hover:bg-slate-50"
          >
            Marketplace Directory
          </Link>
          <Link
            href="/how-it-works"
            onClick={() => setIsMobileMenuOpen(false)}
            className="block px-3 py-2 rounded-md text-base font-medium text-zinc-700 hover:bg-slate-50"
          >
            How It Works
          </Link>
          {user ? (
            <div className="pt-2 border-t border-[#E4E4E7] space-y-2">
              <Link
                href={getDashboardPath()}
                onClick={() => setIsMobileMenuOpen(false)}
                className="block px-3 py-2 rounded-md text-base font-medium text-[#C2410C]"
              >
                Dashboard ({user.role})
              </Link>
              <button
                onClick={() => {
                  setIsMobileMenuOpen(false);
                  handleLogout();
                }}
                className="w-full text-left px-3 py-2 rounded-md text-base font-medium text-red-600 hover:bg-red-50"
              >
                Logout
              </button>
            </div>
          ) : (
            <div className="pt-2 border-t border-[#E4E4E7] space-y-2">
              <Link href="/login" onClick={() => setIsMobileMenuOpen(false)} className="block w-full">
                <Button variant="outline" className="w-full">
                  Sign In
                </Button>
              </Link>
              <Link href="/register" onClick={() => setIsMobileMenuOpen(false)} className="block w-full">
                <Button className="w-full">Get Started</Button>
              </Link>
            </div>
          )}
        </div>
      )}
    </header>
  </>
  );
};
