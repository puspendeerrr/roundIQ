'use client';

import React, { useState, useEffect, useRef } from 'react';
import { useRouter } from 'next/navigation';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Navbar } from '../../../../components/layout/Navbar';
import { Footer } from '../../../../components/layout/Footer';
import { Card } from '../../../../components/ui/Card';
import { Input } from '../../../../components/ui/Input';
import { Button } from '../../../../components/ui/Button';
import { useAuth } from '../../../../context/AuthContext';
import { apiClient } from '../../../../lib/api-client';
import { Category, Skill } from '../../../../types';
import {
  CheckCircle2,
  ArrowLeft,
  Briefcase,
  AlertCircle,
  Clock,
  Check,
  X,
  WifiOff,
} from 'lucide-react';

const interviewerProfileSchema = z.object({
  fullName: z.string().min(2, 'Full name must be at least 2 characters'),
  headline: z.string().max(150, 'Headline max 150 chars').optional(),
  currentCompany: z.string().min(1, 'Current company is required'),
  previousCompaniesStr: z.string().optional(),
  yearsOfExperience: z.coerce.number().min(0, 'Min 0 years'),
  languagesStr: z.string().optional(),
  linkedinUrl: z.string().url('Invalid LinkedIn URL').optional().or(z.literal('')),
  githubUrl: z.string().url('Invalid GitHub URL').optional().or(z.literal('')),
  portfolioUrl: z.string().url('Invalid Portfolio URL').optional().or(z.literal('')),
  resumeUrl: z.string().url('Invalid Resume URL').optional().or(z.literal('')),
  avatarUrl: z.string().url('Invalid Avatar URL').optional().or(z.literal('')),
  bio: z.string().max(2000, 'Bio max 2000 characters').optional(),
});

type ProfileForm = z.infer<typeof interviewerProfileSchema>;

type SaveButtonState = 'IDLE' | 'SAVING' | 'SAVED' | 'ERROR';

export default function InterviewerProfilePage() {
  const router = useRouter();
  const { user, refetchUser } = useAuth();

  const [availableCategories, setAvailableCategories] = useState<Category[]>([]);
  const [availableSkills, setAvailableSkills] = useState<Skill[]>([]);
  const [selectedCategoryIds, setSelectedCategoryIds] = useState<string[]>([]);
  const [selectedSkillIds, setSelectedSkillIds] = useState<string[]>([]);

  // Initial tag IDs for dirty checking
  const initialCategoryIdsRef = useRef<string[]>([]);
  const initialSkillIdsRef = useRef<string[]>([]);

  // Toast & Save States
  const [saveState, setSaveState] = useState<SaveButtonState>('IDLE');
  const [lastSavedTime, setLastSavedTime] = useState<string | null>(null);
  const [toastMessage, setToastMessage] = useState<{ type: 'SUCCESS' | 'ERROR' | 'OFFLINE'; text: string } | null>(null);

  // Unsaved Changes Modal State
  const [showUnsavedModal, setShowUnsavedModal] = useState(false);

  const {
    register,
    handleSubmit,
    setValue,
    reset,
    formState: { errors, isSubmitting, isDirty: isFormDirty },
  } = useForm<ProfileForm>({
    resolver: zodResolver(interviewerProfileSchema),
  });

  // Calculate overall dirty status (form inputs OR tag selections)
  const isCategoriesDirty =
    JSON.stringify([...selectedCategoryIds].sort()) !==
    JSON.stringify([...initialCategoryIdsRef.current].sort());
  const isSkillsDirty =
    JSON.stringify([...selectedSkillIds].sort()) !==
    JSON.stringify([...initialSkillIdsRef.current].sort());

  const hasUnsavedChanges = isFormDirty || isCategoriesDirty || isSkillsDirty;

  // Unsaved changes browser prompt on tab close / refresh
  useEffect(() => {
    const handleBeforeUnload = (e: BeforeUnloadEvent) => {
      if (hasUnsavedChanges) {
        e.preventDefault();
        e.returnValue = 'You have unsaved changes. Are you sure you want to leave?';
        return e.returnValue;
      }
    };
    window.addEventListener('beforeunload', handleBeforeUnload);
    return () => window.removeEventListener('beforeunload', handleBeforeUnload);
  }, [hasUnsavedChanges]);

  useEffect(() => {
    const fetchMetadata = async () => {
      try {
        const [catRes, skillRes]: any = await Promise.all([
          apiClient.get('/categories'),
          apiClient.get('/skills'),
        ]);
        if (catRes?.data) setAvailableCategories(catRes.data);
        if (skillRes?.data) setAvailableSkills(skillRes.data);
      } catch (e) {
        // Fallback
      }
    };
    fetchMetadata();
  }, []);

  useEffect(() => {
    if (user?.interviewerProfile) {
      const p = user.interviewerProfile;
      const initialValues: ProfileForm = {
        fullName: p.fullName || '',
        headline: p.headline || '',
        currentCompany: p.currentCompany || '',
        previousCompaniesStr: p.previousCompanies ? p.previousCompanies.join(', ') : '',
        yearsOfExperience: p.yearsOfExperience || 0,
        languagesStr: p.languages ? p.languages.join(', ') : 'English, Hindi',
        linkedinUrl: p.linkedinUrl || '',
        githubUrl: p.githubUrl || '',
        portfolioUrl: p.portfolioUrl || '',
        resumeUrl: p.resumeUrl || '',
        avatarUrl: user.avatarUrl || '',
        bio: p.bio || '',
      };

      reset(initialValues);

      const catIds = p.categories ? p.categories.map((c: any) => c.category?.id || c.categoryId) : [];
      const skIds = p.skills ? p.skills.map((s: any) => s.skill?.id || s.skillId) : [];

      setSelectedCategoryIds(catIds);
      setSelectedSkillIds(skIds);
      initialCategoryIdsRef.current = catIds;
      initialSkillIdsRef.current = skIds;
    }
  }, [user, reset]);

  const toggleCategory = (id: string) => {
    setSelectedCategoryIds((prev) =>
      prev.includes(id) ? prev.filter((i) => i !== id) : [...prev, id]
    );
  };

  const toggleSkill = (id: string) => {
    setSelectedSkillIds((prev) =>
      prev.includes(id) ? prev.filter((i) => i !== id) : [...prev, id]
    );
  };

  const showToast = (type: 'SUCCESS' | 'ERROR' | 'OFFLINE', text: string) => {
    setToastMessage({ type, text });
    setTimeout(() => {
      setToastMessage(null);
    }, 4000);
  };

  // Form submission handler
  const onSubmit = async (data: ProfileForm) => {
    if (saveState === 'SAVING') return; // Prevent rapid double click

    // Check Network status
    if (typeof window !== 'undefined' && !navigator.onLine) {
      showToast(
        'OFFLINE',
        'Unable to connect to the server. Please check your internet connection.'
      );
      setSaveState('ERROR');
      return;
    }

    try {
      setSaveState('SAVING');
      setToastMessage(null);

      const payload = {
        fullName: data.fullName,
        headline: data.headline,
        currentCompany: data.currentCompany,
        previousCompanies: data.previousCompaniesStr
          ? data.previousCompaniesStr.split(',').map((s) => s.trim()).filter(Boolean)
          : [],
        yearsOfExperience: Number(data.yearsOfExperience),
        languages: data.languagesStr
          ? data.languagesStr.split(',').map((s) => s.trim()).filter(Boolean)
          : ['English'],
        linkedinUrl: data.linkedinUrl || null,
        githubUrl: data.githubUrl || null,
        portfolioUrl: data.portfolioUrl || null,
        resumeUrl: data.resumeUrl || null,
        avatarUrl: data.avatarUrl || null,
        bio: data.bio || null,
        categoryIds: selectedCategoryIds,
        skillIds: selectedSkillIds,
      };

      await apiClient.put('/interviewers/me/profile', payload);
      await refetchUser();

      // Update refs to reset dirty tracking
      initialCategoryIdsRef.current = selectedCategoryIds;
      initialSkillIdsRef.current = selectedSkillIds;
      reset(data);

      const nowFormatted = new Date().toLocaleTimeString([], {
        hour: '2-digit',
        minute: '2-digit',
      });
      setLastSavedTime(nowFormatted);

      // Button state micro-interaction: SAVING -> SAVED -> IDLE
      setSaveState('SAVED');
      showToast('SUCCESS', '✅ Profile saved successfully.');

      setTimeout(() => {
        setSaveState('IDLE');
      }, 1500);
    } catch (err: any) {
      console.error('[InterviewerProfile] Save error:', err);
      setSaveState('ERROR');

      if (err?.code === 'ERR_NETWORK' || !navigator.onLine) {
        showToast(
          'OFFLINE',
          'Unable to connect to the server. Please check your internet connection.'
        );
      } else {
        const errorMsg =
          err?.error?.message || err?.message || '❌ Failed to save profile. Please try again.';
        showToast('ERROR', errorMsg);
      }

      setTimeout(() => {
        setSaveState('IDLE');
      }, 2500);
    }
  };

  // Scroll to first invalid input on validation failure
  const onError = (formErrors: typeof errors) => {
    showToast('ERROR', 'Please correct highlighted form errors before saving.');
    const errorKeys = Object.keys(formErrors);
    if (errorKeys.length > 0) {
      const firstKey = errorKeys[0];
      const element = document.querySelector(`[name="${firstKey}"]`);
      if (element) {
        element.scrollIntoView({ behavior: 'smooth', block: 'center' });
        (element as HTMLElement).focus();
      }
    }
  };

  const handleBackClick = () => {
    if (hasUnsavedChanges) {
      setShowUnsavedModal(true);
    } else {
      router.push('/interviewer/dashboard');
    }
  };

  return (
    <div className="flex min-h-screen flex-col bg-[#F8FAFC]">
      <Navbar />

      {/* Floating Accessible Toast Container */}
      <div
        aria-live="polite"
        className="fixed top-20 right-4 z-50 flex flex-col gap-2 max-w-sm w-full pointer-events-none"
      >
        {toastMessage && (
          <div
            className={`pointer-events-auto transform transition-all duration-300 ease-out flex items-center justify-between gap-3 p-4 rounded-xl shadow-xl border text-xs font-bold ${
              toastMessage.type === 'SUCCESS'
                ? 'bg-green-600 text-white border-green-500 animate-in slide-in-from-top-2'
                : toastMessage.type === 'OFFLINE'
                ? 'bg-amber-600 text-white border-amber-500 animate-in slide-in-from-top-2'
                : 'bg-red-600 text-white border-red-500 animate-in slide-in-from-top-2'
            }`}
          >
            <div className="flex items-center gap-2">
              {toastMessage.type === 'SUCCESS' && <CheckCircle2 className="h-5 w-5 flex-shrink-0" />}
              {toastMessage.type === 'OFFLINE' && <WifiOff className="h-5 w-5 flex-shrink-0" />}
              {toastMessage.type === 'ERROR' && <AlertCircle className="h-5 w-5 flex-shrink-0" />}
              <span>{toastMessage.text}</span>
            </div>
            <button
              onClick={() => setToastMessage(null)}
              className="text-white/80 hover:text-white"
            >
              <X className="h-4 w-4" />
            </button>
          </div>
        )}
      </div>

      <main className="flex-1 py-8">
        <div className="mx-auto max-w-3xl px-4 sm:px-6 lg:px-8 space-y-6">
          <div className="flex items-center justify-between">
            <button
              onClick={handleBackClick}
              className="inline-flex items-center gap-1.5 text-xs font-bold text-[#71717A] hover:text-zinc-900 transition-colors"
            >
              <ArrowLeft className="h-4 w-4" /> Back to Dashboard
            </button>

            <div className="flex items-center gap-2">
              <h1 className="text-xl font-black text-zinc-900">Interviewer Profile Setup</h1>
              {hasUnsavedChanges && (
                <span className="rounded-full bg-amber-100 px-2.5 py-0.5 text-[10px] font-bold text-amber-800 border border-amber-300">
                  Unsaved Changes
                </span>
              )}
            </div>
          </div>

          <Card className="p-6 md:p-8 shadow-md border-[#E4E4E7] bg-white">
            <form onSubmit={handleSubmit(onSubmit, onError)} className="space-y-6">
              {/* Basic Credentials */}
              <div className="space-y-4">
                <h3 className="text-sm font-bold text-zinc-900 uppercase tracking-wider border-b border-[#E4E4E7] pb-2">
                  Basic Info & Credentials
                </h3>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <Input
                    label="Full Name *"
                    placeholder="e.g. Priya Verma"
                    error={errors.fullName?.message}
                    {...register('fullName')}
                  />
                  <Input
                    label="Avatar Photo URL"
                    placeholder="https://images.unsplash.com/..."
                    error={errors.avatarUrl?.message}
                    {...register('avatarUrl')}
                  />
                </div>

                <Input
                  label="Headline *"
                  placeholder="e.g. Senior Frontend Engineer @ Flipkart | Ex-Amazon"
                  error={errors.headline?.message}
                  {...register('headline')}
                />

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <Input
                    label="Current Company *"
                    placeholder="e.g. Flipkart"
                    error={errors.currentCompany?.message}
                    {...register('currentCompany')}
                  />
                  <Input
                    label="Years of Experience *"
                    type="number"
                    placeholder="8"
                    error={errors.yearsOfExperience?.message}
                    {...register('yearsOfExperience')}
                  />
                </div>

                <Input
                  label="Previous Companies (comma-separated)"
                  placeholder="Amazon, Swiggy, Uber"
                  error={errors.previousCompaniesStr?.message}
                  {...register('previousCompaniesStr')}
                />

                <Input
                  label="Languages Spoken (comma-separated)"
                  placeholder="English, Hindi"
                  error={errors.languagesStr?.message}
                  {...register('languagesStr')}
                />
              </div>

              {/* Categories selection */}
              {availableCategories.length > 0 && (
                <div className="space-y-2">
                  <label className="block text-xs font-bold uppercase tracking-wider text-zinc-700">
                    Interview Categories Covered
                  </label>
                  <div className="flex flex-wrap gap-2 pt-1">
                    {availableCategories.map((cat) => {
                      const isSelected = selectedCategoryIds.includes(cat.id);
                      return (
                        <button
                          type="button"
                          key={cat.id}
                          onClick={() => toggleCategory(cat.id)}
                          className={`rounded-lg px-3 py-1.5 text-xs font-semibold border transition-all ${
                            isSelected
                              ? 'border-[#C2410C] bg-orange-50 text-[#C2410C]'
                              : 'border-[#E4E4E7] bg-white text-zinc-600 hover:border-zinc-300'
                          }`}
                        >
                          {cat.name}
                        </button>
                      );
                    })}
                  </div>
                </div>
              )}

              {/* Skills selection */}
              {availableSkills.length > 0 && (
                <div className="space-y-2">
                  <label className="block text-xs font-bold uppercase tracking-wider text-zinc-700">
                    Technical Skills & Tags
                  </label>
                  <div className="flex flex-wrap gap-2 pt-1">
                    {availableSkills.map((sk) => {
                      const isSelected = selectedSkillIds.includes(sk.id);
                      return (
                        <button
                          type="button"
                          key={sk.id}
                          onClick={() => toggleSkill(sk.id)}
                          className={`rounded-full px-3 py-1 text-xs font-medium border transition-all ${
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

              {/* Professional Links */}
              <div className="space-y-4 pt-2">
                <h3 className="text-sm font-bold text-zinc-900 uppercase tracking-wider border-b border-[#E4E4E7] pb-2">
                  Verification & Social Links
                </h3>
                <Input
                  label="LinkedIn Profile URL"
                  placeholder="https://linkedin.com/in/username"
                  error={errors.linkedinUrl?.message}
                  {...register('linkedinUrl')}
                />
                <Input
                  label="GitHub Profile URL"
                  placeholder="https://github.com/username"
                  error={errors.githubUrl?.message}
                  {...register('githubUrl')}
                />
                <Input
                  label="Portfolio / Personal Website"
                  placeholder="https://yourname.dev"
                  error={errors.portfolioUrl?.message}
                  {...register('portfolioUrl')}
                />
                <Input
                  label="Resume / Offer Letter URL"
                  placeholder="https://drive.google.com/your-document"
                  error={errors.resumeUrl?.message}
                  {...register('resumeUrl')}
                />
              </div>

              {/* Bio */}
              <div className="space-y-1.5">
                <label className="block text-xs font-bold uppercase tracking-wider text-zinc-700">
                  About / Bio / Interviewing Philosophy
                </label>
                <textarea
                  rows={4}
                  className={`w-full rounded-lg border bg-white px-3.5 py-2 text-sm text-zinc-900 placeholder-zinc-400 focus:outline-none focus:ring-2 ${
                    errors.bio ? 'border-red-500 focus:ring-red-500' : 'border-[#E4E4E7] focus:ring-orange-500'
                  }`}
                  placeholder="Describe your background, interviewing style, and key areas of evaluation."
                  {...register('bio')}
                />
                {errors.bio?.message && (
                  <p className="text-xs text-[#DC2626] font-medium">{errors.bio.message}</p>
                )}
              </div>

              {/* Sticky Action Footer */}
              <div className="pt-5 border-t border-[#E4E4E7] flex flex-col sm:flex-row items-center justify-between gap-4">
                <div className="text-xs text-[#71717A] font-semibold flex items-center gap-1.5">
                  {lastSavedTime ? (
                    <>
                      <Clock className="h-3.5 w-3.5 text-green-600" />
                      <span>Last saved: <strong>{lastSavedTime}</strong></span>
                    </>
                  ) : (
                    <span>All changes saved to cloud</span>
                  )}
                </div>

                <div className="flex items-center gap-3 w-full sm:w-auto">
                  <Button
                    type="button"
                    variant="outline"
                    onClick={handleBackClick}
                    disabled={saveState === 'SAVING'}
                  >
                    Cancel
                  </Button>

                  <Button
                    type="submit"
                    disabled={saveState === 'SAVING'}
                    isLoading={saveState === 'SAVING'}
                    className={`transition-all duration-300 ${
                      saveState === 'SAVED'
                        ? 'bg-green-600 hover:bg-green-700 text-white'
                        : 'bg-[#C2410C] hover:bg-[#9A3412] text-white'
                    }`}
                  >
                    {saveState === 'SAVING' && 'Saving Profile...'}
                    {saveState === 'SAVED' && (
                      <span className="flex items-center gap-1">
                        <Check className="h-4 w-4" /> Saved ✓
                      </span>
                    )}
                    {saveState === 'IDLE' && 'Save Profile Details'}
                    {saveState === 'ERROR' && 'Try Saving Again'}
                  </Button>
                </div>
              </div>
            </form>
          </Card>
        </div>
      </main>

      {/* Unsaved Changes Confirmation Modal */}
      {showUnsavedModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
          <Card className="w-full max-w-md p-6 space-y-4 bg-white shadow-2xl relative">
            <h3 className="text-base font-bold text-zinc-900 flex items-center gap-2">
              <AlertCircle className="h-5 w-5 text-amber-600" /> You have unsaved changes
            </h3>
            <p className="text-xs text-[#71717A]">
              Are you sure you want to leave without saving your profile changes? Any unsaved edits will be lost.
            </p>
            <div className="flex gap-3 justify-end pt-2">
              <Button
                variant="outline"
                size="sm"
                onClick={() => setShowUnsavedModal(false)}
              >
                Stay & Continue Editing
              </Button>
              <Button
                variant="danger"
                size="sm"
                onClick={() => router.push('/interviewer/dashboard')}
              >
                Leave Without Saving
              </Button>
            </div>
          </Card>
        </div>
      )}

      <Footer />
    </div>
  );
}
