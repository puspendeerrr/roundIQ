'use client';

import React, { useEffect, useState } from 'react';
import Link from 'next/link';
import { Navbar } from '../../../../components/layout/Navbar';
import { Footer } from '../../../../components/layout/Footer';
import { Card } from '../../../../components/ui/Card';
import { Button } from '../../../../components/ui/Button';
import { apiClient } from '../../../../lib/api-client';
import {
  Heart,
  Star,
  ShieldCheck,
  Building,
  Calendar,
  ChevronLeft,
  Trash2,
} from 'lucide-react';

export default function StudentFavoritesPage() {
  const [favorites, setFavorites] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  const fetchFavorites = async () => {
    try {
      setIsLoading(true);
      const res: any = await apiClient.get('/favorites/me');
      if (res?.data) {
        setFavorites(res.data);
      }
    } catch (e) {
      setFavorites([]);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchFavorites();
  }, []);

  const handleRemoveFavorite = async (interviewerId: string) => {
    try {
      await apiClient.post('/favorites/toggle', { interviewerId });
      fetchFavorites();
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
                <Heart className="h-6 w-6 text-[#C2410C] fill-[#C2410C]" /> Saved Mentors & Wishlist
              </h1>
              <p className="text-xs text-[#71717A] mt-0.5">
                Quickly re-book top interviewers or compare senior mentors for your target company preparation.
              </p>
            </div>

            <div className="flex items-center gap-2">
              <Link href="/directory">
                <Button size="sm" variant="outline">
                  Browse Marketplace &rarr;
                </Button>
              </Link>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {isLoading ? (
              <Card className="col-span-full p-8 text-center text-xs text-zinc-500 animate-pulse">
                Loading saved mentors...
              </Card>
            ) : favorites.length === 0 ? (
              <Card className="col-span-full p-8 text-center text-xs text-zinc-500 italic">
                No saved interviewers in your wishlist. Click the heart icon on any mentor profile to save them.
              </Card>
            ) : (
              favorites.map((interviewer) => (
                <Card key={interviewer.id} className="p-6 space-y-4 bg-white shadow-md border-[#E4E4E7]">
                  <div className="flex items-start justify-between">
                    <div>
                      <h3 className="text-base font-black text-zinc-900">{interviewer.fullName}</h3>
                      <p className="text-xs font-semibold text-[#71717A]">{interviewer.headline || 'Senior SDE'}</p>
                      <p className="text-xs text-zinc-600 mt-1">{interviewer.currentCompany || 'Tech Company'}</p>
                    </div>

                    <button
                      onClick={() => handleRemoveFavorite(interviewer.id)}
                      className="text-red-500 hover:text-red-700 p-1"
                      title="Remove from favorites"
                    >
                      <Trash2 className="h-4 w-4" />
                    </button>
                  </div>

                  <div className="pt-2 flex items-center justify-between border-t border-[#E4E4E7]">
                    <span className="text-xs font-bold text-green-700">
                      {interviewer.yearsOfExperience} Yrs Exp
                    </span>

                    <Link href={`/interviewers/${interviewer.id}`}>
                      <Button size="sm" className="bg-[#C2410C] text-white font-bold" leftIcon={<Calendar className="h-3.5 w-3.5" />}>
                        Book Session
                      </Button>
                    </Link>
                  </div>
                </Card>
              ))
            )}
          </div>
        </div>
      </main>

      <Footer />
    </div>
  );
}
