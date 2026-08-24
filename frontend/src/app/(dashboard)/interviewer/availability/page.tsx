'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { Navbar } from '../../../../components/layout/Navbar';
import { Footer } from '../../../../components/layout/Footer';
import { Card } from '../../../../components/ui/Card';
import { Button } from '../../../../components/ui/Button';
import { Input } from '../../../../components/ui/Input';
import { Select } from '../../../../components/ui/Select';
import { apiClient } from '../../../../lib/api-client';
import { AvailabilityRule, AvailabilityException } from '../../../../types';
import {
  Clock,
  Calendar as CalendarIcon,
  Plus,
  Trash2,
  CheckCircle2,
  AlertCircle,
  ArrowLeft,
  Sliders,
} from 'lucide-react';

const DAYS_OF_WEEK = [
  'Sunday',
  'Monday',
  'Tuesday',
  'Wednesday',
  'Thursday',
  'Friday',
  'Saturday',
];

export default function InterviewerAvailabilityPage() {
  const [rules, setRules] = useState<
    {
      dayOfWeek: number;
      startTime: string;
      endTime: string;
      slotDurationMins: number;
      bufferMins: number;
      timezone: string;
      enabled: boolean;
    }[]
  >(
    DAYS_OF_WEEK.map((_, dayOfWeek) => ({
      dayOfWeek,
      startTime: '09:00',
      endTime: '17:00',
      slotDurationMins: 60,
      bufferMins: 15,
      timezone: 'Asia/Kolkata',
      enabled: dayOfWeek >= 1 && dayOfWeek <= 5, // Default Mon-Fri
    }))
  );

  const [exceptions, setExceptions] = useState<AvailabilityException[]>([]);
  const [blockDate, setBlockDate] = useState('');
  const [blockReason, setBlockReason] = useState('');

  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [successMsg, setSuccessMsg] = useState<string | null>(null);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  const fetchAvailability = async () => {
    try {
      setIsLoading(true);
      const res: any = await apiClient.get('/availability/me');
      if (res?.data) {
        const fetchedRules: AvailabilityRule[] = res.data.rules || [];
        const fetchedExceptions: AvailabilityException[] = res.data.exceptions || [];

        setExceptions(fetchedExceptions);

        if (fetchedRules.length > 0) {
          setRules((prev) =>
            prev.map((r) => {
              const matched = fetchedRules.find((fr) => fr.dayOfWeek === r.dayOfWeek);
              if (matched) {
                return {
                  dayOfWeek: r.dayOfWeek,
                  startTime: matched.startTime,
                  endTime: matched.endTime,
                  slotDurationMins: matched.slotDurationMins,
                  bufferMins: matched.bufferMins,
                  timezone: matched.timezone,
                  enabled: true,
                };
              }
              return { ...r, enabled: false };
            })
          );
        }
      }
    } catch (e) {
      // Fallback
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchAvailability();
  }, []);

  const handleRuleToggle = (dayOfWeek: number) => {
    setRules((prev) =>
      prev.map((r) => (r.dayOfWeek === dayOfWeek ? { ...r, enabled: !r.enabled } : r))
    );
  };

  const handleRuleChange = (dayOfWeek: number, field: string, value: any) => {
    setRules((prev) =>
      prev.map((r) => (r.dayOfWeek === dayOfWeek ? { ...r, [field]: value } : r))
    );
  };

  const handleSaveRules = async () => {
    try {
      setIsSaving(true);
      setErrorMsg(null);
      setSuccessMsg(null);

      const activeRules = rules
        .filter((r) => r.enabled)
        .map((r) => ({
          dayOfWeek: r.dayOfWeek,
          startTime: r.startTime,
          endTime: r.endTime,
          slotDurationMins: Number(r.slotDurationMins),
          bufferMins: Number(r.bufferMins),
          timezone: r.timezone,
        }));

      await apiClient.put('/availability/me', { rules: activeRules });
      setSuccessMsg('Weekly availability schedule saved successfully!');
      fetchAvailability();
      setTimeout(() => setSuccessMsg(null), 3000);
    } catch (err: any) {
      setErrorMsg(err?.error?.message || err?.message || 'Failed to save availability rules');
    } finally {
      setIsSaving(false);
    }
  };

  const handleAddException = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!blockDate) return;

    try {
      setErrorMsg(null);
      await apiClient.post('/availability/exceptions', {
        date: blockDate,
        isUnavailable: true,
        reason: blockReason || 'Manual Block Date',
      });
      setBlockDate('');
      setBlockReason('');
      fetchAvailability();
    } catch (err: any) {
      setErrorMsg(err?.error?.message || 'Failed to block date');
    }
  };

  const handleDeleteException = async (id: string) => {
    try {
      await apiClient.delete(`/availability/exceptions/${id}`);
      fetchAvailability();
    } catch (e) {
      // Ignore
    }
  };

  return (
    <div className="flex min-h-screen flex-col bg-[#F8FAFC]">
      <Navbar />

      <main className="flex-1 py-8">
        <div className="mx-auto max-w-5xl px-4 sm:px-6 lg:px-8 space-y-6">
          <div className="flex items-center justify-between">
            <Link
              href="/interviewer/dashboard"
              className="inline-flex items-center gap-1 text-xs font-semibold text-[#71717A] hover:text-zinc-900"
            >
              <ArrowLeft className="h-4 w-4" /> Back to Dashboard
            </Link>
            <h1 className="text-xl font-bold text-zinc-900">Availability & Schedule Setup</h1>
          </div>

          {successMsg && (
            <div className="rounded-lg bg-green-50 p-3 text-xs font-medium text-[#16A34A] border border-green-200 flex items-center gap-2">
              <CheckCircle2 className="h-4 w-4" />
              <span>{successMsg}</span>
            </div>
          )}

          {errorMsg && (
            <div className="rounded-lg bg-red-50 p-3 text-xs font-medium text-[#DC2626] border border-red-200 flex items-center gap-2">
              <AlertCircle className="h-4 w-4" />
              <span>{errorMsg}</span>
            </div>
          )}

          {/* Weekly Schedule Manager */}
          <Card className="p-6 md:p-8 space-y-6 shadow-md">
            <div className="flex items-center justify-between border-b border-[#E4E4E7] pb-4">
              <div>
                <h2 className="text-base font-bold text-zinc-900 flex items-center gap-2">
                  <Clock className="h-5 w-5 text-[#C2410C]" /> Recurring Weekly Hours
                </h2>
                <p className="text-xs text-[#71717A] mt-0.5">
                  Set the hours you are free to conduct interviews each day of the week.
                </p>
              </div>
              <Button onClick={handleSaveRules} isLoading={isSaving}>
                Save Weekly Schedule
              </Button>
            </div>

            {isLoading ? (
              <div className="py-12 text-center text-xs text-zinc-500 animate-pulse">
                Loading availability rules...
              </div>
            ) : (
              <div className="space-y-4">
                {rules.map((rule) => (
                  <div
                    key={rule.dayOfWeek}
                    className={`flex flex-col sm:flex-row sm:items-center justify-between gap-4 p-4 rounded-xl border transition-all ${
                      rule.enabled
                        ? 'border-[#E4E4E7] bg-white shadow-sm'
                        : 'border-dashed border-zinc-200 bg-slate-50 opacity-60'
                    }`}
                  >
                    <div className="flex items-center gap-3 w-40">
                      <input
                        type="checkbox"
                        checked={rule.enabled}
                        onChange={() => handleRuleToggle(rule.dayOfWeek)}
                        className="h-4 w-4 rounded border-zinc-300 text-[#C2410C] focus:ring-[#C2410C]"
                      />
                      <span className="text-sm font-bold text-zinc-900">
                        {DAYS_OF_WEEK[rule.dayOfWeek]}
                      </span>
                    </div>

                    {rule.enabled ? (
                      <div className="flex flex-wrap items-center gap-3 text-xs flex-1">
                        <div className="flex items-center gap-1.5">
                          <span className="text-[#71717A]">From:</span>
                          <input
                            type="time"
                            value={rule.startTime}
                            onChange={(e) => handleRuleChange(rule.dayOfWeek, 'startTime', e.target.value)}
                            className="rounded-lg border border-[#E4E4E7] bg-white px-2.5 py-1 text-xs text-zinc-900 font-semibold focus:outline-none focus:ring-1 focus:ring-orange-500"
                          />
                        </div>

                        <div className="flex items-center gap-1.5">
                          <span className="text-[#71717A]">To:</span>
                          <input
                            type="time"
                            value={rule.endTime}
                            onChange={(e) => handleRuleChange(rule.dayOfWeek, 'endTime', e.target.value)}
                            className="rounded-lg border border-[#E4E4E7] bg-white px-2.5 py-1 text-xs text-zinc-900 font-semibold focus:outline-none focus:ring-1 focus:ring-orange-500"
                          />
                        </div>

                        <div className="flex items-center gap-1.5">
                          <span className="text-[#71717A]">Duration:</span>
                          <select
                            value={rule.slotDurationMins}
                            onChange={(e) => handleRuleChange(rule.dayOfWeek, 'slotDurationMins', Number(e.target.value))}
                            className="rounded-lg border border-[#E4E4E7] bg-white px-2 py-1 text-xs font-semibold text-zinc-900"
                          >
                            <option value={15}>15 Mins</option>
                            <option value={30}>30 Mins</option>
                            <option value={45}>45 Mins</option>
                            <option value={60}>60 Mins (1 Hr)</option>
                            <option value={90}>90 Mins</option>
                          </select>
                        </div>

                        <div className="flex items-center gap-1.5">
                          <span className="text-[#71717A]">Buffer:</span>
                          <select
                            value={rule.bufferMins}
                            onChange={(e) => handleRuleChange(rule.dayOfWeek, 'bufferMins', Number(e.target.value))}
                            className="rounded-lg border border-[#E4E4E7] bg-white px-2 py-1 text-xs font-semibold text-zinc-900"
                          >
                            <option value={0}>0 Mins</option>
                            <option value={15}>15 Mins</option>
                            <option value={30}>30 Mins</option>
                          </select>
                        </div>
                      </div>
                    ) : (
                      <span className="text-xs text-[#71717A] italic">Unavailable on this day</span>
                    )}
                  </div>
                ))}
              </div>
            )}
          </Card>

          {/* Block Dates & Exceptions Section */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <Card className="p-6 space-y-4">
              <h3 className="text-sm font-bold text-zinc-900 border-b border-[#E4E4E7] pb-2 flex items-center gap-2">
                <CalendarIcon className="h-4 w-4 text-[#C2410C]" /> Block Specific Date
              </h3>

              <form onSubmit={handleAddException} className="space-y-3">
                <Input
                  label="Select Date to Block"
                  type="date"
                  value={blockDate}
                  onChange={(e) => setBlockDate(e.target.value)}
                  required
                />

                <Input
                  label="Reason (Optional)"
                  placeholder="e.g. Personal Vacation, Holiday"
                  value={blockReason}
                  onChange={(e) => setBlockReason(e.target.value)}
                />

                <Button type="submit" size="sm" className="w-full" leftIcon={<Plus className="h-4 w-4" />}>
                  Add Block Date Exception
                </Button>
              </form>
            </Card>

            <Card className="md:col-span-2 p-6 space-y-4">
              <h3 className="text-sm font-bold text-zinc-900 border-b border-[#E4E4E7] pb-2">
                Blocked Dates & Custom Exceptions
              </h3>

              {exceptions.length === 0 ? (
                <p className="text-xs text-[#71717A] py-4 italic text-center">
                  No block date exceptions configured. Your recurring weekly schedule applies to all upcoming dates.
                </p>
              ) : (
                <div className="space-y-2">
                  {exceptions.map((ex) => (
                    <div
                      key={ex.id}
                      className="flex items-center justify-between p-3 rounded-lg border border-[#E4E4E7] bg-white text-xs"
                    >
                      <div>
                        <p className="font-bold text-zinc-900">
                          {new Date(ex.date).toLocaleDateString('en-US', {
                            weekday: 'short',
                            year: 'numeric',
                            month: 'short',
                            day: 'numeric',
                          })}
                        </p>
                        <p className="text-[#71717A] text-[11px]">{ex.reason || 'Blocked Date'}</p>
                      </div>

                      <button
                        onClick={() => handleDeleteException(ex.id)}
                        className="text-red-600 hover:text-red-800 p-1.5 rounded-lg hover:bg-red-50"
                      >
                        <Trash2 className="h-4 w-4" />
                      </button>
                    </div>
                  ))}
                </div>
              )}
            </Card>
          </div>
        </div>
      </main>

      <Footer />
    </div>
  );
}
