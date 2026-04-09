"use client";

import { useState, type ChangeEvent } from 'react';
import { ItemCard } from '@/components/dashboard/item-card';
import { MOCK_USER } from '@/lib/mock-data';
import { useEffect } from 'react';
import { ALL_DEPARTMENTS } from '@/lib/departments';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
  SelectGroup
} from '@/components/ui/select';
import { Input } from '@/components/ui/input';
import { Search, X } from 'lucide-react';
import { Button } from '@/components/ui/button';
import StatsPanel from '@/components/dashboard/stats-panel';
import ClientOnly from '@/components/client-only';

export default function DashboardPage() {
  const [searchQuery, setSearchQuery] = useState('');
  const [departmentFilter, setDepartmentFilter] = useState('all-departments');
  const [statusFilter, setStatusFilter] = useState('all-status');
  const [items, setItems] = useState<any[]>([]);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [stats, setStats] = useState<{ total: number; found: number; lost: number; available: number; user?: any } | null>(null);

  useEffect(() => {
    async function fetchItems() {
      try {
        setErrorMessage(null);
        const base = (process.env.NEXT_PUBLIC_API_URL as string) || 'http://127.0.0.1:8000';
  const res = await fetch(`${base.replace(/\/$/, '')}/api/items/`, { credentials: 'include' });
        if (!res.ok) {
          // try to read text/json body for a better error message
          let bodyText = '';
          try { bodyText = await res.text(); } catch (ee) { bodyText = String(ee); }
          console.error('Fetch /api/items/ returned non-OK', res.status, bodyText);
          setErrorMessage(`Failed to fetch items: ${res.status} - ${bodyText}`);
          setItems([]);
          return;
        }
        const data = await res.json();
        // Defensive: ensure we received an array. If not, log and bail to avoid runtime errors.
        if (!Array.isArray(data)) {
          console.error('Unexpected /api/items/ response (expected array):', data);
          setErrorMessage('Unexpected response from server when fetching items. See console for details.');
          setItems([]);
          return;
        }
        // Map backend shape to frontend Item type used by ItemCard
          const mapped = data.map((d: any) => ({
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
        // Only update items state if changed to avoid unnecessary re-renders
        try {
          const prev = JSON.stringify(items || []);
          const next = JSON.stringify(mapped || []);
          if (prev !== next) setItems(mapped);
        } catch (e) {
          setItems(mapped);
        }
        // Try to fetch stats as well (best-effort)
        try {
          const sres = await fetch(`${base.replace(/\/$/, '')}/api/items/stats/`, { credentials: 'include' });
            if (sres.ok) {
            const sd = await sres.json();
            setStats(sd);
          }
        } catch (e) {
          // ignore
        }
      } catch (e) {
        console.error('Error fetching items', e);
      }
    }
  fetchItems();
    // refetch when window gains focus (helps after redirects)
    const onFocus = () => { fetchItems(); };
    window.addEventListener('focus', onFocus);
    // Listen for admin-driven changes and apply them locally
  const onItemsChanged = (e: Event) => {
      try {
        const detail = (e as CustomEvent)?.detail;
        if (!detail) return;
        if (detail.type === 'update') {
          setItems(prev => prev.map(it => it.id === String(detail.id) ? { ...it, status: detail.found ? 'Found' : 'Lost' } : it));
        } else if (detail.type === 'delete') {
          setItems(prev => prev.filter(it => it.id !== String(detail.id)));
        } else if (detail.type === 'bulk-delete') {
          const ids: string[] = detail.ids || [];
          setItems(prev => prev.filter(it => !ids.includes(String(it.id))));
        } else if (detail.type === 'bulk-assign') {
          // refresh to get authoritative owner_username
          fetchItems();
        }
      } catch (err) {
        console.error('items changed handler error', err);
      }
    };
    // also re-fetch stats when items change
    const onItemsChangedStats = (e: Event) => {
      try {
        const base = (process.env.NEXT_PUBLIC_API_URL as string) || 'http://127.0.0.1:8000';
        fetch(`${base.replace(/\/$/, '')}/api/items/stats/`, { credentials: 'include' }).then(r => r.ok ? r.json() : null).then(d => { if (d) setStats(d); }).catch(()=>{});
      } catch(e){}
    };
    window.addEventListener('items:changed', onItemsChanged as EventListener);
    window.addEventListener('items:changed', onItemsChangedStats as EventListener);
    return () => { window.removeEventListener('focus', onFocus); window.removeEventListener('items:changed', onItemsChanged as EventListener); };
  }, []);

  // Smart matching: show items from the user's department first
  const [clientUser, setClientUser] = useState(MOCK_USER);
  useEffect(() => {
    try {
      const name = localStorage.getItem('user_name');
      const collegeId = localStorage.getItem('user_collegeId');
      if (name || collegeId) {
        setClientUser({ ...MOCK_USER, name: name || MOCK_USER.name, collegeId: collegeId || MOCK_USER.collegeId });
      }
    } catch (e) {}
  }, []);

  const sortedItems = [...items].sort((a, b) => {
    if (a.department === clientUser.department && b.department !== clientUser.department) return -1;
    if (a.department !== clientUser.department && b.department === clientUser.department) return 1;
    return b.date.getTime() - a.date.getTime(); // Then sort by most recent
  });

  const filteredItems = sortedItems.filter(item => {
    const searchMatch = searchQuery.toLowerCase() 
      ? item.name.toLowerCase().includes(searchQuery.toLowerCase()) || 
        item.description.toLowerCase().includes(searchQuery.toLowerCase())
      : true;
    const departmentMatch = departmentFilter === 'all-departments' || item.department === departmentFilter;
    const statusMatch = statusFilter === 'all-status' || item.status.toLowerCase() === statusFilter;
    
    return searchMatch && departmentMatch && statusMatch;
  });

  return (
    <div className="flex flex-col gap-8">
      <StatsPanel
        total={stats ? stats.total : items.length}
        found={stats ? stats.found : items.filter(i => i.status === 'Found').length}
        lost={stats ? stats.lost : items.filter(i => i.status === 'Lost').length}
      />
      <div>
        <h1 className="text-3xl font-bold tracking-tight font-headline">
          Dashboard
        </h1>
        <ClientOnly>
          <p className="text-muted-foreground">
            Welcome back, {clientUser?.name || 'there'}! Items from your department are shown first.
          </p>
        </ClientOnly>
      </div>

       <div className="flex flex-col gap-4">
        {errorMessage && (
          <div className="p-3 rounded-md bg-red-100 text-red-800">{errorMessage}</div>
        )}
        <div className="flex flex-col md:flex-row gap-4 justify-between items-center">
            <h2 className="text-2xl font-bold tracking-tight font-headline">
            Recent Items
            </h2>
             <div className="flex gap-2 w-full md:w-auto flex-col sm:flex-row">
                 <div className="relative w-full md:w-auto md:grow">
                    <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
                    <Input
                    type="search"
                    placeholder="Search by name or description..."
                    className="w-full rounded-lg bg-background pl-8"
                    value={searchQuery}
                    onChange={(e: ChangeEvent<HTMLInputElement>) => setSearchQuery(e.target.value)}
                    />
                    {searchQuery && (
                        <Button variant="ghost" size="icon" className="absolute right-1 top-1/2 -translate-y-1/2 h-7 w-7" onClick={() => setSearchQuery('')}>
                            <X className="h-4 w-4"/>
                        </Button>
                    )}
                </div>
                <Select value={departmentFilter} onValueChange={setDepartmentFilter}>
                    <SelectTrigger className="w-full sm:w-[180px]">
                        <SelectValue placeholder="Filter by Department" />
                    </SelectTrigger>
                    <SelectContent>
                        <SelectItem value="all-departments">All Departments</SelectItem>
                        {ALL_DEPARTMENTS.map(dep => (
                            <SelectItem key={dep} value={dep}>{dep}</SelectItem>
                        ))}
                    </SelectContent>
                </Select>
                 <Select value={statusFilter} onValueChange={setStatusFilter}>
                    <SelectTrigger className="w-full sm:w-[120px]">
                        <SelectValue placeholder="Status" />
                    </SelectTrigger>
                    <SelectContent>
                        <SelectItem value="all-status">All</SelectItem>
                        <SelectItem value="lost">Lost</SelectItem>
                        <SelectItem value="found">Found</SelectItem>
                    </SelectContent>
                </Select>
            </div>
        </div>
        <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
          {filteredItems.map((item) => (
            <ItemCard key={item.id} item={item} />
          ))}
        </div>
      </div>
    </div>
  );
}
