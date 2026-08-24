'use client';

import React from 'react';
import { Card } from '../ui/Card';
import { Wallet, TrendingUp, Clock, ShieldCheck } from 'lucide-react';

interface BalanceCardProps {
  title: string;
  amount: number;
  currency?: string;
  type?: 'PRIMARY' | 'PENDING' | 'WITHDRAWABLE' | 'LIFETIME';
  description?: string;
}

export const BalanceCard: React.FC<BalanceCardProps> = ({
  title,
  amount,
  currency = '₹',
  type = 'PRIMARY',
  description,
}) => {
  const getColors = () => {
    switch (type) {
      case 'PRIMARY':
        return {
          bg: 'bg-gradient-to-br from-zinc-900 to-zinc-950 text-white border-zinc-800',
          iconBg: 'bg-orange-500/20 text-orange-400',
          badgeBg: 'bg-orange-500/10 text-orange-400 border-orange-500/30',
        };
      case 'PENDING':
        return {
          bg: 'bg-white border-[#E4E4E7]',
          iconBg: 'bg-blue-100 text-blue-600',
          badgeBg: 'bg-blue-50 text-blue-700 border-blue-200',
        };
      case 'WITHDRAWABLE':
        return {
          bg: 'bg-white border-green-200 bg-green-50/20',
          iconBg: 'bg-green-100 text-green-700',
          badgeBg: 'bg-green-50 text-green-700 border-green-200',
        };
      case 'LIFETIME':
        return {
          bg: 'bg-white border-[#E4E4E7]',
          iconBg: 'bg-purple-100 text-purple-600',
          badgeBg: 'bg-purple-50 text-purple-700 border-purple-200',
        };
    }
  };

  const style = getColors();

  return (
    <Card className={`p-6 space-y-4 shadow-md border ${style.bg}`}>
      <div className="flex items-center justify-between">
        <span className="text-xs font-bold uppercase tracking-wider text-[#71717A] opacity-90">
          {title}
        </span>
        <div className={`flex h-10 w-10 items-center justify-center rounded-xl font-bold ${style.iconBg}`}>
          {type === 'PRIMARY' && <Wallet className="h-5 w-5" />}
          {type === 'PENDING' && <Clock className="h-5 w-5" />}
          {type === 'WITHDRAWABLE' && <ShieldCheck className="h-5 w-5" />}
          {type === 'LIFETIME' && <TrendingUp className="h-5 w-5" />}
        </div>
      </div>

      <div>
        <div className="text-3xl font-black tracking-tight">
          {currency}
          {amount.toLocaleString('en-IN', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
        </div>
        {description && <p className="text-xs text-[#71717A] mt-1 font-medium">{description}</p>}
      </div>
    </Card>
  );
};
