import React from 'react';
import Link from 'next/link';
import { ShieldCheck, Heart } from 'lucide-react';

export const Footer: React.FC = () => {
  return (
    <footer className="border-t border-[#E4E4E7] bg-[#F8FAFC] py-12 text-xs text-[#71717A]">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 gap-8 md:grid-cols-4">
          <div className="space-y-3">
            <Link href="/" className="flex items-center gap-2 text-lg font-black text-zinc-900">
              <div className="flex h-7 w-7 items-center justify-center rounded-lg bg-[#C2410C] text-white">
                <ShieldCheck className="h-4 w-4" />
              </div>
              <span>Round<span className="text-[#C2410C]">IQ</span></span>
            </Link>
            <p className="leading-relaxed">
              Human technical interview marketplace connecting students with verified working engineers.
            </p>
          </div>

          <div>
            <h4 className="font-bold uppercase tracking-wider text-zinc-900 mb-3">Marketplace</h4>
            <ul className="space-y-2">
              <li><Link href="/directory" className="hover:text-zinc-900">Browse Interviewers</Link></li>
              <li><Link href="/register?role=INTERVIEWER" className="hover:text-zinc-900">Become an Interviewer</Link></li>
              <li><Link href="/how-it-works" className="hover:text-zinc-900">Verification Process</Link></li>
            </ul>
          </div>

          <div>
            <h4 className="font-bold uppercase tracking-wider text-zinc-900 mb-3">Categories</h4>
            <ul className="space-y-2">
              <li><Link href="/directory?category=dsa" className="hover:text-zinc-900">DSA & Algorithms</Link></li>
              <li><Link href="/directory?category=frontend" className="hover:text-zinc-900">Frontend Engineering</Link></li>
              <li><Link href="/directory?category=backend" className="hover:text-zinc-900">Backend Engineering</Link></li>
              <li><Link href="/directory?category=system-design" className="hover:text-zinc-900">System Design</Link></li>
            </ul>
          </div>

          <div>
            <h4 className="font-bold uppercase tracking-wider text-zinc-900 mb-3">Trust & Legal</h4>
            <ul className="space-y-2">
              <li><span className="cursor-not-allowed">Terms of Service</span></li>
              <li><span className="cursor-not-allowed">Privacy Policy</span></li>
              <li><span className="cursor-not-allowed">Security Standard</span></li>
            </ul>
          </div>
        </div>

        <div className="mt-8 border-t border-[#E4E4E7] pt-6 flex flex-col md:flex-row items-center justify-between gap-4">
          <p>© {new Date().getFullYear()} RoundIQ. All rights reserved.</p>
          <p className="flex items-center gap-1">
            Built with <Heart className="h-3.5 w-3.5 text-[#C2410C] fill-[#C2410C]" /> for engineers everywhere.
          </p>
        </div>
      </div>
    </footer>
  );
};
