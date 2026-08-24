'use client';

import React, { useEffect, useState } from 'react';
import Link from 'next/link';
import { Navbar } from '../../../../components/layout/Navbar';
import { Footer } from '../../../../components/layout/Footer';
import { Card } from '../../../../components/ui/Card';
import { Button } from '../../../../components/ui/Button';
import { Input } from '../../../../components/ui/Input';
import { apiClient } from '../../../../lib/api-client';
import { Category } from '../../../../types';
import { FolderTree, Plus, Edit, Trash2, CheckCircle2 } from 'lucide-react';

export default function AdminCategoriesPage() {
  const [categories, setCategories] = useState<Category[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  const [name, setName] = useState('');
  const [description, setDescription] = useState('');
  const [editingId, setEditingId] = useState<string | null>(null);

  const [msg, setMsg] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  const fetchCategories = async () => {
    try {
      setIsLoading(true);
      const res: any = await apiClient.get('/categories/all');
      if (res?.data) {
        setCategories(res.data);
      }
    } catch (e) {
      // Fallback
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchCategories();
  }, []);

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) return;

    try {
      setError(null);
      setMsg(null);
      if (editingId) {
        await apiClient.put(`/categories/${editingId}`, { name, description });
        setMsg('Category updated successfully');
      } else {
        await apiClient.post('/categories', { name, description });
        setMsg('Category created successfully');
      }
      setName('');
      setDescription('');
      setEditingId(null);
      fetchCategories();
    } catch (err: any) {
      setError(err?.error?.message || 'Failed to save category');
    }
  };

  const handleEdit = (cat: Category) => {
    setEditingId(cat.id);
    setName(cat.name);
    setDescription(cat.description || '');
  };

  const handleToggleActive = async (cat: Category) => {
    try {
      await apiClient.put(`/categories/${cat.id}`, { isActive: !cat.isActive });
      fetchCategories();
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
                <FolderTree className="h-6 w-6 text-purple-600" /> Category Management
              </h1>
              <p className="text-xs text-[#71717A] mt-0.5">
                Create and configure interview categories (DSA, Frontend, Backend, System Design, HR, etc.).
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
                {editingId ? 'Edit Category' : 'Create New Category'}
              </h3>

              {msg && <p className="text-xs text-[#16A34A] font-semibold">{msg}</p>}
              {error && <p className="text-xs text-[#DC2626] font-semibold">{error}</p>}

              <form onSubmit={handleSave} className="space-y-4">
                <Input
                  label="Category Name"
                  placeholder="e.g. System Design"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  required
                />

                <div className="space-y-1">
                  <label className="block text-xs font-semibold uppercase tracking-wider text-zinc-700">Description</label>
                  <textarea
                    rows={3}
                    placeholder="Short description of skills evaluated in this category..."
                    value={description}
                    onChange={(e) => setDescription(e.target.value)}
                    className="w-full rounded-lg border border-[#E4E4E7] px-3 py-2 text-xs text-zinc-900 focus:outline-none focus:ring-1 focus:ring-orange-500"
                  />
                </div>

                <div className="flex gap-2">
                  <Button type="submit" size="sm" className="w-full">
                    {editingId ? 'Update Category' : 'Create Category'}
                  </Button>
                  {editingId && (
                    <Button
                      type="button"
                      variant="outline"
                      size="sm"
                      onClick={() => {
                        setEditingId(null);
                        setName('');
                        setDescription('');
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
                    <th className="px-4 py-3">Category Name</th>
                    <th className="px-4 py-3">Slug</th>
                    <th className="px-4 py-3">Status</th>
                    <th className="px-4 py-3 text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-[#E4E4E7] bg-white">
                  {isLoading ? (
                    <tr>
                      <td colSpan={4} className="px-4 py-6 text-center text-zinc-500">
                        Loading categories...
                      </td>
                    </tr>
                  ) : categories.length === 0 ? (
                    <tr>
                      <td colSpan={4} className="px-4 py-6 text-center text-zinc-500">
                        No categories found.
                      </td>
                    </tr>
                  ) : (
                    categories.map((cat) => (
                      <tr key={cat.id} className="hover:bg-slate-50">
                        <td className="px-4 py-3">
                          <p className="font-bold text-zinc-900">{cat.name}</p>
                          <p className="text-[11px] text-[#71717A] truncate max-w-xs">{cat.description}</p>
                        </td>
                        <td className="px-4 py-3 font-mono text-[#71717A]">{cat.slug}</td>
                        <td className="px-4 py-3">
                          <span
                            className={`inline-flex rounded-full px-2 py-0.5 text-[10px] font-bold ${
                              cat.isActive ? 'bg-green-100 text-green-800' : 'bg-zinc-100 text-zinc-600'
                            }`}
                          >
                            {cat.isActive ? 'Active' : 'Inactive'}
                          </span>
                        </td>
                        <td className="px-4 py-3 text-right space-x-2">
                          <button onClick={() => handleEdit(cat)} className="text-blue-600 hover:underline font-semibold">
                            Edit
                          </button>
                          <button
                            onClick={() => handleToggleActive(cat)}
                            className="text-[#C2410C] hover:underline font-semibold"
                          >
                            {cat.isActive ? 'Deactivate' : 'Activate'}
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
