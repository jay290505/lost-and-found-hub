'use client';

import { useEffect, useState } from 'react';
import { Card, CardHeader, CardTitle, CardDescription, CardContent, CardFooter } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Checkbox } from '@/components/ui/checkbox';

type Item = {
  id: string;
  title: string;
  description?: string;
  department?: string;
  found?: boolean;
  owner_username?: string | null;
};

export default function AdminAltPanel() {
  const [items, setItems] = useState<Item[]>([]);
  const [selected, setSelected] = useState<Record<string, boolean>>({});
  const [loading, setLoading] = useState(false);
  const [assignTo, setAssignTo] = useState('');
  const base = (process.env.NEXT_PUBLIC_API_URL as string) || 'http://127.0.0.1:8000';

  function getCookie(name: string) {
    if (typeof document === 'undefined') return undefined;
    const v = document.cookie.match('(^|;)\\s*' + name + '\\s*=\\s*([^;]+)');
    return v ? v.pop() : undefined;
  }

  async function fetchItems() {
    setLoading(true);
    try {
  const res = await fetch(`${base.replace(/\/$/, '')}/api/items/`, { credentials: 'include' });
      if (!res.ok) throw new Error('Failed to fetch');
      const data = await res.json();
      const mapped: Item[] = (data || []).map((d: any) => ({
        id: String(d.id),
        title: d.title || d.name || 'Untitled',
        description: d.description || '',
        department: d.department || 'General',
        found: Boolean(d.found || (d.status && d.status.toLowerCase() === 'found')),
        owner_username: d.owner_username || d.owner || null,
      }));
      setItems(mapped);
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => { fetchItems(); }, []);

  function toggleSelect(id: string) {
    setSelected(prev => ({ ...prev, [id]: !prev[id] }));
  }

  function selectAll() {
    const map: Record<string, boolean> = {};
    items.forEach(i => map[i.id] = true);
    setSelected(map);
  }

  function clearSelection() { setSelected({}); }

  async function bulkDelete() {
    const ids = Object.keys(selected).filter(k => selected[k]);
    if (!ids.length) return;
    if (!confirm(`Delete ${ids.length} items?`)) return;
    const snapshot = items.slice();
    setItems(prev => prev.filter(i => !ids.includes(i.id)));
    try {
  const csrf = getCookie('csrftoken');
  await Promise.all(ids.map(id => fetch(`${base.replace(/\/$/, '')}/api/items/${id}/`, { method: 'DELETE', credentials: 'include', headers: { ...(csrf ? { 'X-CSRFToken': csrf } : {}) } })));
      // notify other components about deletions
      try { window.dispatchEvent(new CustomEvent('items:changed', { detail: { type: 'bulk-delete', ids } })); } catch (e) {}
    } catch (e) {
      console.error('bulk delete failed', e);
      setItems(snapshot);
    } finally {
      clearSelection();
    }
  }

  async function bulkAssign() {
    const ids = Object.keys(selected).filter(k => selected[k]);
    if (!ids.length || !assignTo) return;
    try {
      const csrf = getCookie('csrftoken');
      await Promise.all(ids.map(id => fetch(`${base.replace(/\/$/, '')}/api/items/${id}/`, {
        method: 'PATCH', credentials: 'include', headers: { 'Content-Type': 'application/json', ...(csrf ? { 'X-CSRFToken': csrf } : {}) }, body: JSON.stringify({ owner_username: assignTo })
      })));
      // refresh
      await fetchItems();
      clearSelection();
      setAssignTo('');
      try { window.dispatchEvent(new CustomEvent('items:changed', { detail: { type: 'bulk-assign', ids, owner_username: assignTo } })); } catch (e) {}
    } catch (e) {
      console.error('bulk assign failed', e);
    }
  }

  async function toggleFound(id: string, current: boolean) {
    try {
      const csrf = getCookie('csrftoken');
      await fetch(`${base.replace(/\/$/, '')}/api/items/${id}/`, {
        method: 'PATCH', credentials: 'include', headers: { 'Content-Type': 'application/json', ...(csrf ? { 'X-CSRFToken': csrf } : {}) }, body: JSON.stringify({ found: !current })
      });
      setItems(prev => prev.map(it => it.id === id ? { ...it, found: !current } : it));
      try { window.dispatchEvent(new CustomEvent('items:changed', { detail: { type: 'update', id, found: !current } })); } catch (e) {}
    } catch (e) {
      console.error('toggle failed', e);
    }
  }

  return (
    <div>
      <div className="mb-4 flex items-center justify-between gap-4">
        <div className="flex items-center gap-2">
          <Button onClick={() => fetchItems()}>{loading ? 'Refreshing...' : 'Refresh'}</Button>
          <Button variant="ghost" onClick={selectAll}>Select all</Button>
          <Button variant="ghost" onClick={clearSelection}>Clear</Button>
        </div>
        <div className="flex items-center gap-2">
          <Input placeholder="Assign owner (username)" value={assignTo} onChange={(e) => setAssignTo((e as any).target.value)} />
          <Button onClick={bulkAssign}>Assign</Button>
          <Button variant="destructive" onClick={bulkDelete}>Delete selected</Button>
        </div>
      </div>

      <div className="grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-3">
        {items.map(it => (
          <Card key={it.id}>
            <CardHeader>
              <div className="flex items-center justify-between">
                <CardTitle>{it.title}</CardTitle>
                <div className="flex items-center gap-2">
                  <Checkbox checked={!!selected[it.id]} onCheckedChange={() => toggleSelect(it.id)} />
                </div>
              </div>
              <CardDescription className="text-sm">{it.department} • Owner: {it.owner_username || '—'}</CardDescription>
            </CardHeader>
            <CardContent>
              <p className="text-sm text-muted-foreground">{it.description}</p>
            </CardContent>
            <CardFooter>
              <div className="flex gap-2">
                <Button size="sm" variant={it.found ? 'ghost' : 'default'} onClick={() => toggleFound(it.id, !!it.found)}>{it.found ? 'Mark Unfound' : 'Mark Found'}</Button>
                <Button size="sm" variant="outline" onClick={() => navigator.clipboard.writeText(window.location.origin + `/items/${it.id}`)}>Copy Link</Button>
              </div>
            </CardFooter>
          </Card>
        ))}
      </div>
    </div>
  );
}
