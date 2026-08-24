'use client';

import React, { useEffect, useState } from 'react';
import Link from 'next/link';
import { Navbar } from '../../../../components/layout/Navbar';
import { Footer } from '../../../../components/layout/Footer';
import { Card } from '../../../../components/ui/Card';
import { Button } from '../../../../components/ui/Button';
import { apiClient } from '../../../../lib/api-client';
import {
  FileText,
  Edit,
  Globe,
  CheckCircle2,
  ChevronLeft,
} from 'lucide-react';

export default function AdminCmsPage() {
  const [pages, setPages] = useState<any[]>([]);
  const [selectedPage, setSelectedPage] = useState<any | null>(null);
  const [title, setTitle] = useState('');
  const [category, setCategory] = useState('LEGAL');
  const [content, setContent] = useState('');
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [msg, setMsg] = useState<string | null>(null);

  const fetchPages = async () => {
    try {
      setIsLoading(true);
      const res: any = await apiClient.get('/cms');
      if (res?.data) {
        setPages(res.data);
        if (res.data.length > 0) {
          setSelectedPage(res.data[0]);
          setTitle(res.data[0].title);
          setCategory(res.data[0].category);
          setContent(res.data[0].content);
        }
      }
    } catch (e) {
      setPages([]);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchPages();
  }, []);

  const handleSelectPage = (page: any) => {
    setSelectedPage(page);
    setTitle(page.title);
    setCategory(page.category);
    setContent(page.content);
  };

  const handleSavePage = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedPage) return;

    try {
      setIsSaving(true);
      setMsg(null);
      await apiClient.post('/cms', {
        slug: selectedPage.slug,
        title,
        category,
        content,
        published: true,
      });
      setMsg(`CMS Page ${selectedPage.slug} updated successfully!`);
      fetchPages();
    } catch (err: any) {
      setMsg(err?.error?.message || 'Failed to save CMS page content.');
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
                <FileText className="h-6 w-6 text-[#C2410C]" /> Dynamic Content Management System (CMS)
              </h1>
              <p className="text-xs text-[#71717A] mt-0.5">
                Manage Privacy Policy, Terms of Service, Refund Policy, and Help Center documentation.
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
            {/* Sidebar Pages List */}
            <div className="md:col-span-4 space-y-3">
              <h3 className="text-xs font-bold text-zinc-900 uppercase tracking-wider">Managed Content Pages</h3>
              {isLoading ? (
                <Card className="p-4 text-center text-xs text-zinc-400 animate-pulse">Loading pages...</Card>
              ) : (
                pages.map((p) => (
                  <Card
                    key={p.id}
                    className={`p-4 cursor-pointer transition-all ${
                      selectedPage?.id === p.id
                        ? 'border-2 border-[#C2410C] bg-orange-50/50 shadow-md'
                        : 'bg-white hover:bg-slate-50 border-[#E4E4E7]'
                    }`}
                    onClick={() => handleSelectPage(p)}
                  >
                    <span className="font-mono text-xs font-bold text-[#C2410C] block">/{p.slug}</span>
                    <p className="text-xs font-bold text-zinc-900 mt-1">{p.title}</p>
                  </Card>
                ))
              )}
            </div>

            {/* Page Editor Form */}
            <div className="md:col-span-8">
              {selectedPage ? (
                <Card className="p-6 space-y-4 bg-white shadow-md border-[#E4E4E7]">
                  <h3 className="text-sm font-bold text-zinc-900 uppercase border-b border-[#E4E4E7] pb-2">
                    Editing Page: <span className="font-mono text-[#C2410C]">/{selectedPage.slug}</span>
                  </h3>

                  <form onSubmit={handleSavePage} className="space-y-4 text-xs">
                    <div>
                      <label className="block text-[11px] font-bold text-zinc-700 uppercase mb-1">Page Title</label>
                      <input
                        type="text"
                        required
                        value={title}
                        onChange={(e) => setTitle(e.target.value)}
                        className="w-full rounded-lg border border-[#E4E4E7] p-2.5 font-bold text-zinc-900 focus:ring-1 focus:ring-orange-500"
                      />
                    </div>

                    <div>
                      <label className="block text-[11px] font-bold text-zinc-700 uppercase mb-1">HTML Content Markup</label>
                      <textarea
                        rows={12}
                        required
                        value={content}
                        onChange={(e) => setContent(e.target.value)}
                        className="w-full rounded-lg border border-[#E4E4E7] p-3 font-mono text-xs text-zinc-900 focus:ring-1 focus:ring-orange-500"
                      />
                    </div>

                    <div className="flex items-center justify-between border-t border-[#E4E4E7] pt-4">
                      <Link href={`/${selectedPage.slug}`} target="_blank">
                        <Button variant="outline" size="sm" leftIcon={<Globe className="h-4 w-4" />}>
                          Preview Live Page
                        </Button>
                      </Link>

                      <Button type="submit" className="bg-[#C2410C] text-white font-bold" isLoading={isSaving}>
                        Publish Page Content
                      </Button>
                    </div>
                  </form>
                </Card>
              ) : (
                <Card className="p-8 text-center text-xs text-zinc-500 italic">Select a page to edit.</Card>
              )}
            </div>
          </div>
        </div>
      </main>

      <Footer />
    </div>
  );
}
