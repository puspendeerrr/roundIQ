'use client';

import React from 'react';
import { Card } from '../ui/Card';
import { WalletTransactionType } from '../../types';
import { ArrowUpRight, ArrowDownLeft, RotateCcw, ShieldCheck, Zap } from 'lucide-react';

interface TransactionItem {
  id: string;
  referenceCode: string;
  type: WalletTransactionType;
  amount: number;
  balanceBefore: number;
  balanceAfter: number;
  description?: string | null;
  createdAt: string;
}

interface TransactionTableProps {
  transactions: TransactionItem[];
  isLoading?: boolean;
}

export const TransactionTable: React.FC<TransactionTableProps> = ({
  transactions,
  isLoading = false,
}) => {
  const getTypeBadge = (type: WalletTransactionType) => {
    switch (type) {
      case 'CREDIT':
      case 'BONUS':
        return {
          label: type,
          bg: 'bg-green-100 text-green-800 border-green-200',
          icon: <ArrowDownLeft className="h-3.5 w-3.5 text-green-700" />,
        };
      case 'DEBIT':
      case 'COMMISSION':
        return {
          label: type,
          bg: 'bg-red-100 text-red-800 border-red-200',
          icon: <ArrowUpRight className="h-3.5 w-3.5 text-red-700" />,
        };
      case 'REFUND':
      case 'REVERSAL':
        return {
          label: type,
          bg: 'bg-blue-100 text-blue-800 border-blue-200',
          icon: <RotateCcw className="h-3.5 w-3.5 text-blue-700" />,
        };
      case 'SETTLEMENT':
        return {
          label: 'SETTLEMENT',
          bg: 'bg-purple-100 text-purple-800 border-purple-200',
          icon: <ShieldCheck className="h-3.5 w-3.5 text-purple-700" />,
        };
      default:
        return {
          label: type,
          bg: 'bg-zinc-100 text-zinc-800 border-zinc-200',
          icon: <Zap className="h-3.5 w-3.5 text-zinc-700" />,
        };
    }
  };

  return (
    <Card className="p-0 overflow-hidden shadow-md">
      <div className="overflow-x-auto">
        <table className="w-full text-left text-xs">
          <thead className="bg-slate-50 text-[#71717A] font-bold uppercase border-b border-[#E4E4E7]">
            <tr>
              <th className="px-4 py-3">Reference Code</th>
              <th className="px-4 py-3">Type</th>
              <th className="px-4 py-3">Amount</th>
              <th className="px-4 py-3">Balance After</th>
              <th className="px-4 py-3">Description</th>
              <th className="px-4 py-3 text-right">Timestamp</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-[#E4E4E7] bg-white">
            {isLoading ? (
              <tr>
                <td colSpan={6} className="px-4 py-8 text-center text-zinc-500 animate-pulse">
                  Loading ledger transaction history...
                </td>
              </tr>
            ) : transactions.length === 0 ? (
              <tr>
                <td colSpan={6} className="px-4 py-8 text-center text-zinc-500 italic">
                  No transactions recorded in immutable ledger yet.
                </td>
              </tr>
            ) : (
              transactions.map((tx) => {
                const badge = getTypeBadge(tx.type);
                const isPositive = ['CREDIT', 'REFUND', 'SETTLEMENT', 'BONUS'].includes(tx.type);

                return (
                  <tr key={tx.id} className="hover:bg-slate-50 transition-colors">
                    <td className="px-4 py-3 font-mono font-bold text-zinc-900">
                      {tx.referenceCode}
                    </td>
                    <td className="px-4 py-3">
                      <span
                        className={`inline-flex items-center gap-1 rounded-full px-2.5 py-0.5 text-[10px] font-bold border ${badge.bg}`}
                      >
                        {badge.icon}
                        {badge.label}
                      </span>
                    </td>
                    <td
                      className={`px-4 py-3 font-bold text-sm ${
                        isPositive ? 'text-green-700' : 'text-red-700'
                      }`}
                    >
                      {isPositive ? '+' : '-'}₹{tx.amount.toFixed(2)}
                    </td>
                    <td className="px-4 py-3 font-mono text-zinc-800 font-semibold">
                      ₹{tx.balanceAfter.toFixed(2)}
                    </td>
                    <td className="px-4 py-3 text-zinc-700 max-w-xs truncate">
                      {tx.description || 'Ledger Entry'}
                    </td>
                    <td className="px-4 py-3 text-right text-[#71717A]">
                      {new Date(tx.createdAt).toLocaleString('en-US', {
                        month: 'short',
                        day: 'numeric',
                        hour: '2-digit',
                        minute: '2-digit',
                      })}
                    </td>
                  </tr>
                );
              })
            )}
          </tbody>
        </table>
      </div>
    </Card>
  );
};
