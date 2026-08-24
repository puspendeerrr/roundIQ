'use client';

import React, { useEffect, useState } from 'react';
import Link from 'next/link';
import { Navbar } from '../../../../components/layout/Navbar';
import { Footer } from '../../../../components/layout/Footer';
import { Card } from '../../../../components/ui/Card';
import { Button } from '../../../../components/ui/Button';
import { apiClient } from '../../../../lib/api-client';
import {
  Briefcase,
  Plus,
  Building,
  MapPin,
  DollarSign,
  Clock,
  CheckCircle2,
} from 'lucide-react';

export default function RecruiterJobsPage() {
  const [jobs, setJobs] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [msg, setMsg] = useState<string | null>(null);

  // Form State
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [experience, setExperience] = useState('0-2 Years');
  const [salaryMin, setSalaryMin] = useState('1200000');
  const [salaryMax, setSalaryMax] = useState('1800000');
  const [location, setLocation] = useState('Bengaluru');
  const [workMode, setWorkMode] = useState('REMOTE');

  const fetchJobs = async () => {
    try {
      setIsLoading(true);
      const res: any = await apiClient.get('/jobs/my-jobs');
      if (res?.data) {
        setJobs(res.data);
      }
    } catch (e) {
      setJobs([]);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchJobs();
  }, []);

  const handleCreateJob = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      setIsSubmitting(true);
      setMsg(null);
      await apiClient.post('/jobs', {
        title,
        description,
        experience,
        salaryMin: Number(salaryMin),
        salaryMax: Number(salaryMax),
        location,
        workMode,
      });
      setMsg('Job posting created successfully!');
      setIsModalOpen(false);
      fetchJobs();
    } catch (err: any) {
      setMsg(err?.error?.message || 'Failed to create job posting. Ensure company profile is registered.');
    } finally {
      setIsSubmitting(false);
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
                <Briefcase className="h-6 w-6 text-[#C2410C]" /> Corporate Job Postings Manager
              </h1>
              <p className="text-xs text-[#71717A] mt-0.5">
                Manage active software engineering openings and candidate hiring pipelines.
              </p>
            </div>

            <Button
              size="sm"
              className="bg-[#C2410C] hover:bg-[#9A3412] text-white font-bold"
              onClick={() => setIsModalOpen(true)}
              leftIcon={<Plus className="h-4 w-4" />}
            >
              Post New Job Opening
            </Button>
          </div>

          {msg && (
            <div className="rounded-lg bg-green-50 p-3 text-xs font-bold text-[#16A34A] border border-green-200">
              {msg}
            </div>
          )}

          {/* Job Openings Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {isLoading ? (
              <Card className="col-span-full p-8 text-center text-xs text-zinc-500 animate-pulse">
                Loading job postings...
              </Card>
            ) : jobs.length === 0 ? (
              <Card className="col-span-full p-8 text-center text-xs text-zinc-500 italic">
                No active job postings created yet. Click "Post New Job Opening" to get started.
              </Card>
            ) : (
              jobs.map((job) => (
                <Card key={job.id} className="p-6 space-y-4 bg-white shadow-md border-[#E4E4E7]">
                  <div className="flex justify-between items-start">
                    <div>
                      <span className="text-[10px] font-bold uppercase tracking-wider text-blue-700 bg-blue-50 px-2 py-0.5 rounded border border-blue-200">
                        {job.workMode}
                      </span>
                      <h3 className="text-base font-black text-zinc-900 mt-1">{job.title}</h3>
                      <p className="text-xs font-semibold text-[#71717A]">{job.company?.name || 'Flipkart'}</p>
                    </div>

                    <span className="inline-flex rounded-full bg-green-100 text-green-800 px-2.5 py-0.5 text-[10px] font-bold">
                      {job.status}
                    </span>
                  </div>

                  <div className="space-y-2 text-xs text-zinc-700 border-t border-[#E4E4E7] pt-3">
                    <div className="flex items-center gap-2">
                      <MapPin className="h-3.5 w-3.5 text-[#71717A]" />
                      <span>{job.location || 'Remote'}</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <DollarSign className="h-3.5 w-3.5 text-[#71717A]" />
                      <span>₹{(job.salaryMin / 100000).toFixed(1)}L - ₹{(job.salaryMax / 100000).toFixed(1)}L PA</span>
                    </div>
                  </div>

                  <div className="pt-2 flex items-center justify-between border-t border-[#E4E4E7]">
                    <span className="text-xs text-[#71717A]">
                      Pipeline Applicants: <strong className="text-zinc-900">{job._count?.pipelines || 0}</strong>
                    </span>
                    <Link href={`/recruiter/pipeline?jobId=${job.id}`}>
                      <Button size="sm" variant="outline">
                        Kanban Board &rarr;
                      </Button>
                    </Link>
                  </div>
                </Card>
              ))
            )}
          </div>
        </div>
      </main>

      {/* Post New Job Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4">
          <Card className="w-full max-w-lg p-6 space-y-4 bg-white shadow-2xl">
            <h2 className="text-lg font-black text-zinc-900">Post New Software Engineering Opening</h2>

            <form onSubmit={handleCreateJob} className="space-y-3 text-xs">
              <div>
                <label className="block text-[11px] font-bold text-zinc-700 uppercase mb-1">Job Title</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. SDE-1 (Backend / Node.js)"
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  className="w-full rounded-lg border border-[#E4E4E7] p-2 focus:ring-1 focus:ring-orange-500"
                />
              </div>

              <div>
                <label className="block text-[11px] font-bold text-zinc-700 uppercase mb-1">Description</label>
                <textarea
                  rows={4}
                  required
                  placeholder="Responsibilities, required technical skills, and stack..."
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  className="w-full rounded-lg border border-[#E4E4E7] p-2 focus:ring-1 focus:ring-orange-500"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-[11px] font-bold text-zinc-700 uppercase mb-1">Min Salary (INR)</label>
                  <input
                    type="number"
                    value={salaryMin}
                    onChange={(e) => setSalaryMin(e.target.value)}
                    className="w-full rounded-lg border border-[#E4E4E7] p-2"
                  />
                </div>
                <div>
                  <label className="block text-[11px] font-bold text-zinc-700 uppercase mb-1">Max Salary (INR)</label>
                  <input
                    type="number"
                    value={salaryMax}
                    onChange={(e) => setSalaryMax(e.target.value)}
                    className="w-full rounded-lg border border-[#E4E4E7] p-2"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-[11px] font-bold text-zinc-700 uppercase mb-1">Location</label>
                  <input
                    type="text"
                    value={location}
                    onChange={(e) => setLocation(e.target.value)}
                    className="w-full rounded-lg border border-[#E4E4E7] p-2"
                  />
                </div>
                <div>
                  <label className="block text-[11px] font-bold text-zinc-700 uppercase mb-1">Work Mode</label>
                  <select
                    value={workMode}
                    onChange={(e) => setWorkMode(e.target.value)}
                    className="w-full rounded-lg border border-[#E4E4E7] p-2 bg-white"
                  >
                    <option value="REMOTE">Remote</option>
                    <option value="HYBRID">Hybrid</option>
                    <option value="ON_SITE">On-Site</option>
                  </select>
                </div>
              </div>

              <div className="pt-4 flex items-center justify-end gap-2">
                <Button variant="ghost" onClick={() => setIsModalOpen(false)}>Cancel</Button>
                <Button type="submit" className="bg-[#C2410C] text-white font-bold" isLoading={isSubmitting}>
                  Publish Job
                </Button>
              </div>
            </form>
          </Card>
        </div>
      )}

      <Footer />
    </div>
  );
}
