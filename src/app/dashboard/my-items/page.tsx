"use client";

import { ItemCard } from '@/components/dashboard/item-card';
import { MOCK_USER } from '@/lib/mock-data';
import { useEffect, useState } from 'react';
import { PackageOpen } from 'lucide-react';
import Link from 'next/link';
import { Button } from '@/components/ui/button';

export default function MyItemsPage() {
  const [userItems, setUserItems] = useState<any[]>([]);
  const [infoMessage, setInfoMessage] = useState<string | null>(null);
  const [loading, setLoading] = useState<boolean>(false);

  

  async function fetchMyItems() {
    setLoading(true);
    setInfoMessage(null);
    try {
      const base = (process.env.NEXT_PUBLIC_API_URL as string) || 'http://127.0.0.1:8000';
      const res = await fetch(`${base.replace(/\/$/, '')}/api/my-items/`, { credentials: 'include' });
      if (!res.ok) {
        console.warn('Could not fetch my items', res.status);
        // fallback: fetch all items and filter by localStorage user id (dev helper)
        const allRes = await fetch(`${base.replace(/\/$/, '')}/api/items/`);
        if (!allRes.ok) return;
        const allData = await allRes.json();
        const localCollegeId = typeof window !== 'undefined' ? localStorage.getItem('user_collegeId') : null;
        const filtered = (allData || []).filter((it: any) => {
          if (!localCollegeId) return false;
          return (it.owner_username && it.owner_username === localCollegeId) || (it.owner && it.owner === localCollegeId);
        });
        processData(filtered);
        setInfoMessage('Showing posts matched to your saved College ID. Login to see server-side My Items.');
        return;
      }
      const data = await res.json();
      processData(data);
    } catch (e) {
      console.error('Error fetching my items', e);
      setInfoMessage('Error fetching items. Try again.');
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    fetchMyItems();
  }, []);

  // helper to map API data shape to frontend item shape and update state
  function processData(data: any[]) {
    const mapped = (data || []).map((d: any) => ({
      id: d.id?.toString(),
      name: d.title || d.name || 'Untitled',
      category: d.category || 'Other',
      department: d.department || 'General',
      status: (d.found === true || (d.status && d.status.toLowerCase() === 'found')) ? 'Found' : 'Lost',
      location: d.location || d.place || 'Unknown',
      date: d.date ? new Date(d.date) : new Date(),
      description: d.description || '',
      imageUrl: d.imageUrl || d.image_url || 'https://picsum.photos/seed/default/400/300',
      imageHint: d.imageHint || d.image_hint || 'image',
      userId: d.owner_username || d.owner || d.userId || d.user_id || null,
    }));
    setUserItems(mapped);
  }

  return (
    <div className="flex flex-col gap-8">
      <div>
        <h1 className="text-3xl font-bold tracking-tight font-headline">
          My Items
        </h1>
        <p className="text-muted-foreground">
          A list of all the items you've posted.
        </p>
      </div>
      
      {userItems.length > 0 ? (
        <>
        {infoMessage ? (
          <div className="p-3 mb-4 rounded-lg bg-yellow-50 border border-yellow-200 text-sm text-yellow-800 flex items-center justify-between">
            <div>{infoMessage}</div>
            <div className="ml-4">
              <Button onClick={() => fetchMyItems()} size="sm">Resync</Button>
            </div>
          </div>
        ) : null}
        <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
          {userItems.map((item) => (
            <ItemCard key={item.id} item={item} />
          ))}
        </div>
        </>
      ) : (
        <div className="flex flex-col items-center justify-center text-center py-16 border-2 border-dashed rounded-lg">
            <PackageOpen className="w-16 h-16 text-muted-foreground mb-4"/>
            <h2 className="text-xl font-semibold font-headline">No Items Posted Yet</h2>
            <p className="text-muted-foreground mt-2 mb-4">You haven't reported any lost or found items.</p>
            <Button asChild>
                <Link href="/dashboard/add-item">Post Your First Item</Link>
            </Button>
        </div>
      )}
    </div>
  );
}
