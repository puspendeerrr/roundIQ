'use client';

import React, { useState, useEffect, useCallback, Suspense } from 'react';
import Link from 'next/link';
import { useSearchParams, useRouter } from 'next/navigation';
import { Navbar } from '../../../components/layout/Navbar';
import { Footer } from '../../../components/layout/Footer';
import { Card } from '../../../components/ui/Card';
import { Input } from '../../../components/ui/Input';
import { Button } from '../../../components/ui/Button';
import { apiClient } from '../../../lib/api-client';
import { Category, Skill, InterviewerProfile } from '../../../types';
import {
  Search,
  Filter,
  CheckCircle2,
  Award,
  Building,
  Briefcase,
  ChevronLeft,
  ChevronRight,
  SlidersHorizontal,
  X,
  ExternalLink,
} from 'lucide-react';

function DirectoryContent() {
  const router = useRouter();
  const searchParams = useSearchParams();

  const initialCategory = searchParams.get('category') || '';
  const initialSearch = searchParams.get('search') || '';

  const [search, setSearch] = useState(initialSearch);
  const [selectedCategory, setSelectedCategory] = useState(initialCategory);
  const [selectedSkills, setSelectedSkills] = useState<string[]>([]);
  const [company, setCompany] = useState('');
  const [minExp, setMinExp] = useState<number | ''>('');
  const [maxExp, setMaxExp] = useState<number | ''>('');
  const [sortBy, setSortBy] = useState<'newest' | 'experience_desc' | 'experience_asc'>('newest');

  const [categories, setCategories] = useState<Category[]>([]);
  const [skills, setSkills] = useState<Skill[]>([]);
  const [interviewers, setInterviewers] = useState<InterviewerProfile[]>([]);

  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [totalCount, setTotalCount] = useState(0);

  const [isLoading, setIsLoading] = useState(true);
  const [isFilterDrawerOpen, setIsFilterDrawerOpen] = useState(false);

  useEffect(() => {
    const fetchFiltersData = async () => {
      try {
        const [catRes, skillRes]: any = await Promise.all([
          apiClient.get('/categories'),
          apiClient.get('/skills'),
        ]);
        if (catRes?.data) setCategories(catRes.data);
        if (skillRes?.data) setSkills(skillRes.data);
      } catch (e) {
        // Fallback gracefully
      }
    };
    fetchFiltersData();
  }, []);

  const fetchDirectory = useCallback(async () => {
    try {
      setIsLoading(true);
      const params = new URLSearchParams();
      if (search) params.set('search', search);
      if (selectedCategory) params.set('category', selectedCategory);
      if (selectedSkills.length > 0) params.set('skills', selectedSkills.join(','));
      if (company) params.set('company', company);
      if (minExp !== '') params.set('minExperience', String(minExp));
      if (maxExp !== '') params.set('maxExperience', String(maxExp));
      if (sortBy) params.set('sortBy', sortBy);
      params.set('page', String(page));
      params.set('limit', '12');

      const res: any = await apiClient.get(`/interviewers/directory?${params.toString()}`);
      if (res?.data) {
        setInterviewers(res.data);
        setTotalPages(res.meta?.totalPages || 1);
        setTotalCount(res.meta?.total || 0);
      }
    } catch (e) {
      setInterviewers([]);
    } finally {
      setIsLoading(false);
    }
  }, [search, selectedCategory, selectedSkills, company, minExp, maxExp, sortBy, page]);

  useEffect(() => {
    fetchDirectory();
  }, [fetchDirectory]);

  const toggleSkill = (slug: string) => {
    setSelectedSkills((prev) =>
      prev.includes(slug) ? prev.filter((s) => s !== slug) : [...prev, slug]
    );
    setPage(1);
  };

  const handleClearFilters = () => {
    setSearch('');
    setSelectedCategory('');
    setSelectedSkills([]);
    setCompany('');
    setMinExp('');
    setMaxExp('');
    setSortBy('newest');
    setPage(1);
  };

  return (
    <div className="flex min-h-screen flex-col bg-[#F8FAFC]">
      <Navbar />

      {/* Hero Search Section */}
      <section className="border-b border-[#E4E4E7] bg-white py-10 shadow-sm">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 space-y-4">
          <div className="max-w-2xl">
            <h1 className="text-3xl font-black tracking-tight text-zinc-900 sm:text-4xl">
              Verified Interviewer Marketplace
            </h1>
            <p className="mt-2 text-sm text-[#71717A]">
              Connect with experienced software engineers from FAANG & top tech companies for real mock technical interviews.
            </p>
          </div>

          <div className="flex flex-col sm:flex-row gap-3 pt-2">
            <div className="relative flex-1">
              <Search className="absolute left-3.5 top-3 h-4 w-4 text-[#71717A]" />
              <input
                type="text"
                placeholder="Search by name, company (e.g. Flipkart, Amazon), or keyword..."
                value={search}
                onChange={(e) => {
                  setSearch(e.target.value);
                  setPage(1);
                }}
                className="w-full rounded-xl border border-[#E4E4E7] bg-[#F8FAFC] pl-10 pr-4 py-2.5 text-sm text-zinc-900 placeholder-zinc-400 focus:outline-none focus:ring-2 focus:ring-orange-500 focus:bg-white transition-all shadow-sm"
              />
            </div>
            <select
              value={sortBy}
              onChange={(e: any) => setSortBy(e.target.value)}
              className="rounded-xl border border-[#E4E4E7] bg-white px-4 py-2.5 text-sm font-medium text-zinc-800 shadow-sm focus:outline-none focus:ring-2 focus:ring-orange-500"
            >
              <option value="newest">Sort by: Newest</option>
              <option value="experience_desc">Sort by: Experience (High to Low)</option>
              <option value="experience_asc">Sort by: Experience (Low to High)</option>
            </select>
          </div>

          {/* Quick Category Chips */}
          {categories.length > 0 && (
            <div className="flex items-center gap-2 overflow-x-auto pt-2 scrollbar-none">
              <button
                onClick={() => {
                  setSelectedCategory('');
                  setPage(1);
                }}
                className={`rounded-full px-3.5 py-1 text-xs font-bold transition-all whitespace-nowrap ${
                  selectedCategory === ''
                    ? 'bg-[#C2410C] text-white shadow-sm'
                    : 'bg-slate-100 text-zinc-700 hover:bg-slate-200'
                }`}
              >
                All Categories
              </button>
              {categories.map((cat) => (
                <button
                  key={cat.id}
                  onClick={() => {
                    setSelectedCategory(selectedCategory === cat.slug ? '' : cat.slug);
                    setPage(1);
                  }}
                  className={`rounded-full px-3.5 py-1 text-xs font-semibold transition-all whitespace-nowrap ${
                    selectedCategory === cat.slug
                      ? 'bg-[#C2410C] text-white shadow-sm'
                      : 'bg-slate-100 text-zinc-700 hover:bg-slate-200'
                  }`}
                >
                  {cat.name}
                </button>
              ))}
            </div>
          )}
        </div>
      </section>

      {/* Main Directory Body */}
      <main className="flex-1 py-8">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
            {/* Desktop Filter Sidebar */}
            <aside className="hidden lg:block space-y-6">
              <Card className="p-5 space-y-5 sticky top-24">
                <div className="flex items-center justify-between border-b border-[#E4E4E7] pb-3">
                  <h3 className="text-sm font-bold text-zinc-900 uppercase tracking-wider flex items-center gap-2">
                    <Filter className="h-4 w-4 text-[#C2410C]" /> Filters
                  </h3>
                  <button onClick={handleClearFilters} className="text-xs font-semibold text-[#C2410C] hover:underline">
                    Reset
                  </button>
                </div>

                {/* Company Filter */}
                <div className="space-y-1.5">
                  <label className="block text-xs font-semibold text-zinc-700">Company</label>
                  <input
                    type="text"
                    placeholder="e.g. Amazon, Google"
                    value={company}
                    onChange={(e) => {
                      setCompany(e.target.value);
                      setPage(1);
                    }}
                    className="w-full rounded-lg border border-[#E4E4E7] px-3 py-1.5 text-xs text-zinc-900 focus:outline-none focus:ring-1 focus:ring-orange-500"
                  />
                </div>

                {/* Experience Range */}
                <div className="space-y-1.5">
                  <label className="block text-xs font-semibold text-zinc-700">Min Experience (Years)</label>
                  <div className="grid grid-cols-2 gap-2">
                    <input
                      type="number"
                      placeholder="Min"
                      value={minExp}
                      onChange={(e) => {
                        setMinExp(e.target.value ? Number(e.target.value) : '');
                        setPage(1);
                      }}
                      className="w-full rounded-lg border border-[#E4E4E7] px-3 py-1.5 text-xs text-zinc-900 focus:outline-none focus:ring-1 focus:ring-orange-500"
                    />
                    <input
                      type="number"
                      placeholder="Max"
                      value={maxExp}
                      onChange={(e) => {
                        setMaxExp(e.target.value ? Number(e.target.value) : '');
                        setPage(1);
                      }}
                      className="w-full rounded-lg border border-[#E4E4E7] px-3 py-1.5 text-xs text-zinc-900 focus:outline-none focus:ring-1 focus:ring-orange-500"
                    />
                  </div>
                </div>

                {/* Skill Filter Tags */}
                {skills.length > 0 && (
                  <div className="space-y-2 pt-2 border-t border-[#E4E4E7]">
                    <label className="block text-xs font-semibold text-zinc-700">Skills</label>
                    <div className="flex flex-wrap gap-1.5 max-h-48 overflow-y-auto pr-1">
                      {skills.map((sk) => {
                        const isSelected = selectedSkills.includes(sk.slug);
                        return (
                          <button
                            key={sk.id}
                            onClick={() => toggleSkill(sk.slug)}
                            className={`rounded-full px-2.5 py-0.5 text-[11px] font-medium border transition-all ${
                              isSelected
                                ? 'border-[#C2410C] bg-[#C2410C] text-white'
                                : 'border-[#E4E4E7] bg-white text-zinc-600 hover:border-zinc-300'
                            }`}
                          >
                            {sk.name}
                          </button>
                        );
                      })}
                    </div>
                  </div>
                )}
              </Card>
            </aside>

            {/* Main Content Area */}
            <div className="lg:col-span-3 space-y-6">
              {/* Header stats & Mobile Filter Toggle */}
              <div className="flex items-center justify-between text-xs text-[#71717A]">
                <p>
                  Showing <strong className="text-zinc-900">{interviewers.length}</strong> of{' '}
                  <strong className="text-zinc-900">{totalCount}</strong> verified interviewers
                </p>
                <button
                  onClick={() => setIsFilterDrawerOpen(!isFilterDrawerOpen)}
                  className="lg:hidden flex items-center gap-1 font-bold text-[#C2410C]"
                >
                  <SlidersHorizontal className="h-4 w-4" /> Filters
                </button>
              </div>

              {/* Grid of Interviewer Cards */}
              {isLoading ? (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  {[1, 2, 3, 4, 5, 6].map((n) => (
                    <Card key={n} className="h-64 animate-pulse bg-slate-100 p-6" />
                  ))}
                </div>
              ) : interviewers.length === 0 ? (
                <Card className="p-12 text-center space-y-4">
                  <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-full bg-orange-100 text-[#C2410C]">
                    <Search className="h-6 w-6" />
                  </div>
                  <h3 className="text-lg font-bold text-zinc-900">No interviewers found</h3>
                  <p className="text-xs text-[#71717A] max-w-sm mx-auto">
                    Try loosening your search terms or resetting filters to view all available verified engineers.
                  </p>
                  <Button variant="outline" size="sm" onClick={handleClearFilters}>
                    Clear All Filters
                  </Button>
                </Card>
              ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  {interviewers.map((interviewer) => (
                    <Card key={interviewer.id} hoverEffect className="flex flex-col justify-between p-6">
                      <div className="space-y-4">
                        {/* Header info */}
                        <div className="flex items-start gap-3.5">
                          <img
                            src={
                              interviewer.user?.avatarUrl ||
                              'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150'
                            }
                            alt={interviewer.fullName}
                            className="h-14 w-14 rounded-xl object-cover border border-[#E4E4E7] shadow-sm flex-shrink-0"
                          />
                          <div className="min-w-0 flex-1">
                            <div className="flex items-center gap-1.5">
                              <h3 className="text-base font-bold text-zinc-900 truncate">
                                {interviewer.fullName}
                              </h3>
                              <span
                                title="Verified Interviewer"
                                className="inline-flex items-center rounded-full bg-green-100 p-0.5 text-[#16A34A]"
                              >
                                <CheckCircle2 className="h-4 w-4" />
                              </span>
                            </div>
                            <p className="text-xs font-medium text-zinc-600 line-clamp-1 mt-0.5">
                              {interviewer.headline || 'Senior Software Engineer'}
                            </p>
                            <div className="flex items-center gap-3 text-[11px] text-[#71717A] mt-1.5">
                              {interviewer.currentCompany && (
                                <span className="flex items-center gap-1 font-semibold text-zinc-800">
                                  <Building className="h-3 w-3 text-[#C2410C]" />
                                  {interviewer.currentCompany}
                                </span>
                              )}
                              <span className="flex items-center gap-1">
                                <Briefcase className="h-3 w-3" />
                                {interviewer.yearsOfExperience} Yrs Exp
                              </span>
                            </div>
                          </div>
                        </div>

                        {/* Bio summary */}
                        {interviewer.bio && (
                          <p className="text-xs text-zinc-600 line-clamp-2 leading-relaxed">
                            {interviewer.bio}
                          </p>
                        )}

                        {/* Skill Pills */}
                        {interviewer.skills && interviewer.skills.length > 0 && (
                          <div className="flex flex-wrap gap-1 pt-1">
                            {interviewer.skills.slice(0, 4).map((s: any) => (
                              <span
                                key={s.skill?.id || s.skillId}
                                className="rounded-full bg-slate-100 px-2.5 py-0.5 text-[10px] font-semibold text-zinc-700"
                              >
                                {s.skill?.name}
                              </span>
                            ))}
                            {interviewer.skills.length > 4 && (
                              <span className="text-[10px] text-[#71717A] font-semibold self-center">
                                +{interviewer.skills.length - 4} more
                              </span>
                            )}
                          </div>
                        )}
                      </div>

                      {/* Footer Actions */}
                      <div className="mt-5 pt-4 border-t border-[#E4E4E7] flex items-center justify-between">
                        <span className="inline-flex items-center gap-1 text-[11px] font-bold text-green-700 bg-green-50 px-2.5 py-1 rounded-lg">
                          <Award className="h-3.5 w-3.5" /> Verified Engineer
                        </span>
                        <Link href={`/interviewers/${interviewer.id}`}>
                          <Button size="sm" variant="outline" rightIcon={<ExternalLink className="h-3.5 w-3.5" />}>
                            View Profile
                          </Button>
                        </Link>
                      </div>
                    </Card>
                  ))}
                </div>
              )}

              {/* Pagination Controls */}
              {totalPages > 1 && (
                <div className="flex items-center justify-center gap-2 pt-6">
                  <Button
                    variant="outline"
                    size="sm"
                    disabled={page === 1}
                    onClick={() => setPage(page - 1)}
                    leftIcon={<ChevronLeft className="h-4 w-4" />}
                  >
                    Previous
                  </Button>
                  <span className="text-xs font-semibold text-zinc-700 px-3">
                    Page {page} of {totalPages}
                  </span>
                  <Button
                    variant="outline"
                    size="sm"
                    disabled={page === totalPages}
                    onClick={() => setPage(page + 1)}
                    rightIcon={<ChevronRight className="h-4 w-4" />}
                  >
                    Next
                  </Button>
                </div>
              )}
            </div>
          </div>
        </div>
      </main>

      <Footer />
    </div>
  );
}

export default function DirectoryPage() {
  return (
    <Suspense fallback={<div className="text-center py-20 text-sm">Loading Directory...</div>}>
      <DirectoryContent />
    </Suspense>
  );
}
