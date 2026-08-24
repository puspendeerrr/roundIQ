'use client';

import React, { useEffect, useState } from 'react';
import Link from 'next/link';
import { Navbar } from '../../../../components/layout/Navbar';
import { Footer } from '../../../../components/layout/Footer';
import { Card } from '../../../../components/ui/Card';
import { Button } from '../../../../components/ui/Button';
import { apiClient } from '../../../../lib/api-client';
import {
  Mail,
  Edit,
  CheckCircle2,
  ChevronLeft,
} from 'lucide-react';

export default function AdminEmailTemplatesPage() {
  const [templates, setTemplates] = useState<any[]>([]);
  const [selectedTemplate, setSelectedTemplate] = useState<any | null>(null);
  const [subject, setSubject] = useState('');
  const [htmlBody, setHtmlBody] = useState('');
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [msg, setMsg] = useState<string | null>(null);

  const fetchTemplates = async () => {
    try {
      setIsLoading(true);
      const res: any = await apiClient.get('/admin/email-templates');
      if (res?.data) {
        setTemplates(res.data);
        if (res.data.length > 0) {
          setSelectedTemplate(res.data[0]);
          setSubject(res.data[0].subject);
          setHtmlBody(res.data[0].htmlBody);
        }
      }
    } catch (e) {
      setTemplates([]);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchTemplates();
  }, []);

  const handleSelectTemplate = (tpl: any) => {
    setSelectedTemplate(tpl);
    setSubject(tpl.subject);
    setHtmlBody(tpl.htmlBody);
  };

  const handleSaveTemplate = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedTemplate) return;

    try {
      setIsSaving(true);
      setMsg(null);
      await apiClient.patch(`/admin/email-templates/${selectedTemplate.templateKey}`, {
        subject,
        htmlBody,
      });
      setMsg(`Template ${selectedTemplate.templateKey} updated successfully!`);
      fetchTemplates();
    } catch (err: any) {
      setMsg(err?.error?.message || 'Failed to update email template.');
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <div className="flex min-h-screen flex-col bg-[#F8FAFC]">
      <Navbar />

      <main className="flex-1 py-8">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 space-y-6">
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-[#E4E4E7] pb-4">
            <div>
              <h1 className="text-2xl font-black text-zinc-900 flex items-center gap-2">
                <Mail className="h-6 w-6 text-[#C2410C]" /> Transactional Email Template Center
              </h1>
              <p className="text-xs text-[#71717A] mt-0.5">
                Customize HTML transactional email templates, subject lines, and dynamic placeholder variables.
              </p>
            </div>

            <div className="flex items-center gap-2">
              <Link href="/admin/dashboard">
                <Button size="sm" variant="outline">&larr; Admin Dashboard</Button>
              </Link>
            </div>
          </div>

          {msg && (
            <div className="rounded-lg bg-green-50 p-3 text-xs font-bold text-[#16A34A] border border-green-200">
              {msg}
            </div>
          )}

          <div className="grid grid-cols-1 md:grid-cols-12 gap-6">
            {/* Sidebar Template List */}
            <div className="md:col-span-4 space-y-3">
              <h3 className="text-xs font-bold text-zinc-900 uppercase tracking-wider">Email Templates</h3>
              {isLoading ? (
                <Card className="p-4 text-center text-xs text-zinc-400 animate-pulse">Loading templates...</Card>
              ) : (
                templates.map((tpl) => (
                  <Card
                    key={tpl.id}
                    className={`p-4 cursor-pointer transition-all ${
                      selectedTemplate?.id === tpl.id
                        ? 'border-2 border-[#C2410C] bg-orange-50/50 shadow-md'
                        : 'bg-white hover:bg-slate-50 border-[#E4E4E7]'
                    }`}
                    onClick={() => handleSelectTemplate(tpl)}
                  >
                    <span className="font-mono text-xs font-bold text-zinc-900 block">{tpl.templateKey}</span>
                    <p className="text-xs text-[#71717A] truncate mt-1">{tpl.subject}</p>
                  </Card>
                ))
              )}
            </div>

            {/* Template Editor Form */}
            <div className="md:col-span-8">
              {selectedTemplate ? (
                <Card className="p-6 space-y-4 bg-white shadow-md border-[#E4E4E7]">
                  <h3 className="text-sm font-bold text-zinc-900 uppercase border-b border-[#E4E4E7] pb-2">
                    Editing Template: <span className="font-mono text-[#C2410C]">{selectedTemplate.templateKey}</span>
                  </h3>

                  <form onSubmit={handleSaveTemplate} className="space-y-4 text-xs">
                    <div>
                      <label className="block text-[11px] font-bold text-zinc-700 uppercase mb-1">
                        Email Subject Line
                      </label>
                      <input
                        type="text"
                        required
                        value={subject}
                        onChange={(e) => setSubject(e.target.value)}
                        className="w-full rounded-lg border border-[#E4E4E7] p-2.5 font-semibold text-zinc-900 focus:ring-1 focus:ring-orange-500"
                      />
                    </div>

                    <div>
                      <label className="block text-[11px] font-bold text-zinc-700 uppercase mb-1">
                        HTML Body Markup
                      </label>
                      <textarea
                        rows={10}
                        required
                        value={htmlBody}
                        onChange={(e) => setHtmlBody(e.target.value)}
                        className="w-full rounded-lg border border-[#E4E4E7] p-3 font-mono text-xs text-zinc-900 focus:ring-1 focus:ring-orange-500"
                      />
                    </div>

                    <div className="flex items-center justify-between border-t border-[#E4E4E7] pt-4">
                      <span className="text-[11px] text-[#71717A]">
                        Variables: <strong className="font-mono">{selectedTemplate.variables?.join(', ')}</strong>
                      </span>

                      <Button type="submit" className="bg-[#C2410C] text-white font-bold" isLoading={isSaving}>
                        Save Template
                      </Button>
                    </div>
                  </form>
                </Card>
              ) : (
                <Card className="p-8 text-center text-xs text-zinc-500 italic">Select a template to edit.</Card>
              )}
            </div>
          </div>
        </div>
      </main>

      <Footer />
    </div>
  );
}
