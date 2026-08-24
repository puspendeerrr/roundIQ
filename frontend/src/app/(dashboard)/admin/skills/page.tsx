'use client';

import React, { useEffect, useState } from 'react';
import Link from 'next/link';
import { Navbar } from '../../../../components/layout/Navbar';
import { Footer } from '../../../../components/layout/Footer';
import { Card } from '../../../../components/ui/Card';
import { Button } from '../../../../components/ui/Button';
import { Input } from '../../../../components/ui/Input';
import { apiClient } from '../../../../lib/api-client';
import { Skill } from '../../../../types';
import { Tag, Plus, Edit, Trash2 } from 'lucide-react';

export default function AdminSkillsPage() {
  const [skills, setSkills] = useState<Skill[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  const [name, setName] = useState('');
  const [editingId, setEditingId] = useState<string | null>(null);

  const [msg, setMsg] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  const fetchSkills = async () => {
    try {
      setIsLoading(true);
      const res: any = await apiClient.get('/skills/all');
      if (res?.data) {
        setSkills(res.data);
      }
    } catch (e) {
      // Fallback
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchSkills();
  }, []);

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) return;

    try {
      setError(null);
      setMsg(null);
      if (editingId) {
        await apiClient.put(`/skills/${editingId}`, { name });
        setMsg('Skill updated successfully');
      } else {
        await apiClient.post('/skills', { name });
        setMsg('Skill created successfully');
      }
      setName('');
      setEditingId(null);
      fetchSkills();
    } catch (err: any) {
      setError(err?.error?.message || 'Failed to save skill');
    }
  };

  const handleEdit = (sk: Skill) => {
    setEditingId(sk.id);
    setName(sk.name);
  };

  const handleToggleActive = async (sk: Skill) => {
    try {
      await apiClient.put(`/skills/${sk.id}`, { isActive: !sk.isActive });
      fetchSkills();
    } catch (e) {
      // Ignore
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
                <Tag className="h-6 w-6 text-[#C2410C]" /> Skill Management
              </h1>
              <p className="text-xs text-[#71717A] mt-0.5">
                Manage technical skill tags (React, Node.js, Python, PostgreSQL, System Architecture, etc.).
              </p>
            </div>
            <Link href="/admin/dashboard">
              <Button size="sm" variant="outline">&larr; Admin Dashboard</Button>
            </Link>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {/* Create/Edit Form */}
            <Card className="p-5 space-y-4">
              <h3 className="text-sm font-bold text-zinc-900 border-b border-[#E4E4E7] pb-2">
                {editingId ? 'Edit Skill' : 'Create New Skill'}
              </h3>

              {msg && <p className="text-xs text-[#16A34A] font-semibold">{msg}</p>}
              {error && <p className="text-xs text-[#DC2626] font-semibold">{error}</p>}

              <form onSubmit={handleSave} className="space-y-4">
                <Input
                  label="Skill Name"
                  placeholder="e.g. React.js"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  required
                />

                <div className="flex gap-2">
                  <Button type="submit" size="sm" className="w-full">
                    {editingId ? 'Update Skill' : 'Create Skill'}
                  </Button>
                  {editingId && (
                    <Button
                      type="button"
                      variant="outline"
                      size="sm"
                      onClick={() => {
                        setEditingId(null);
                        setName('');
                      }}
                    >
                      Cancel
                    </Button>
                  )}
                </div>
              </form>
            </Card>

            {/* List Table */}
            <Card className="md:col-span-2 p-0 overflow-hidden shadow-md">
              <table className="w-full text-left text-xs">
                <thead className="bg-slate-50 text-[#71717A] font-bold uppercase border-b border-[#E4E4E7]">
                  <tr>
                    <th className="px-4 py-3">Skill Name</th>
                    <th className="px-4 py-3">Slug</th>
                    <th className="px-4 py-3">Status</th>
                    <th className="px-4 py-3 text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-[#E4E4E7] bg-white">
                  {isLoading ? (
                    <tr>
                      <td colSpan={4} className="px-4 py-6 text-center text-zinc-500">
                        Loading skills...
                      </td>
                    </tr>
                  ) : skills.length === 0 ? (
                    <tr>
                      <td colSpan={4} className="px-4 py-6 text-center text-zinc-500">
                        No skills found.
                      </td>
                    </tr>
                  ) : (
                    skills.map((sk) => (
                      <tr key={sk.id} className="hover:bg-slate-50">
                        <td className="px-4 py-3 font-bold text-zinc-900">{sk.name}</td>
                        <td className="px-4 py-3 font-mono text-[#71717A]">{sk.slug}</td>
                        <td className="px-4 py-3">
                          <span
                            className={`inline-flex rounded-full px-2 py-0.5 text-[10px] font-bold ${
                              sk.isActive ? 'bg-green-100 text-green-800' : 'bg-zinc-100 text-zinc-600'
                            }`}
                          >
                            {sk.isActive ? 'Active' : 'Inactive'}
                          </span>
                        </td>
                        <td className="px-4 py-3 text-right space-x-2">
                          <button onClick={() => handleEdit(sk)} className="text-blue-600 hover:underline font-semibold">
                            Edit
                          </button>
                          <button
                            onClick={() => handleToggleActive(sk)}
                            className="text-[#C2410C] hover:underline font-semibold"
                          >
                            {sk.isActive ? 'Deactivate' : 'Activate'}
                          </button>
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </Card>
          </div>
        </div>
      </main>

      <Footer />
    </div>
  );
}
