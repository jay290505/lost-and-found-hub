'use client';

import { useEffect, useState } from 'react';
import {
  Table,
  TableHeader,
  TableBody,
  TableRow,
  TableHead,
  TableCell,
} from '@/components/ui/table';
import { Button } from '@/components/ui/button';
import { Trash, Check, X } from 'lucide-react';

type ItemRow = {
  id: string;
  title: string;
  department?: string;
  found?: boolean;
  owner_username?: string | null;
};

export default function AdminPanel() {
  const [items, setItems] = useState<ItemRow[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const base = (process.env.NEXT_PUBLIC_API_URL as string) || 'http://127.0.0.1:8000';

  function getCookie(name: string) {
    if (typeof document === 'undefined') return undefined;
    const v = document.cookie.match('(^|;)\\s*' + name + '\\s*=\\s*([^;]+)');
    return v ? v.pop() : undefined;
  }

  async function fetchItems() {
    setLoading(true);
    setError(null);
    try {
  const res = await fetch(`${base.replace(/\/$/, '')}/api/items/`, { credentials: 'include' });
      if (!res.ok) throw new Error(`Failed to fetch: ${res.status}`);
      const data = await res.json();
      const mapped: ItemRow[] = (data || []).map((d: any) => ({
        id: String(d.id),
        title: d.title || d.name || 'Untitled',
        department: d.department || 'General',
        found: Boolean(d.found || (d.status && d.status.toLowerCase() === 'found')),
        owner_username: d.owner_username || d.owner || null,
      }));
      setItems(mapped);
    } catch (e: any) {
      console.error('Admin fetch error', e);
      setError(String(e?.message || e));
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => { fetchItems(); }, []);

  async function toggleFound(id: string, current: boolean) {
    // optimistic
    setItems((prev) => prev.map(it => it.id === id ? { ...it, found: !current } : it));
    try {
      const csrf = getCookie('csrftoken');
      const res = await fetch(`${base.replace(/\/$/, '')}/api/items/${id}/`, {
        method: 'PATCH',
        credentials: 'include',
        headers: {
          'Content-Type': 'application/json',
          'Accept': 'application/json',
          ...(csrf ? { 'X-CSRFToken': csrf } : {}),
        },
        body: JSON.stringify({ found: !current }),
      });
      if (!res.ok) {
        let errBody = '';
        try { errBody = await res.text(); } catch(_) { errBody = ''; }
        throw new Error(`Failed to update: ${res.status} ${errBody}`);
      }
      // notify other windows/components that an item changed
      try {
        const newFound = !current;
        window.dispatchEvent(new CustomEvent('items:changed', { detail: { type: 'update', id, found: newFound } }));
      } catch (e) { /* ignore */ }
    } catch (e) {
      // revert
      setItems((prev) => prev.map(it => it.id === id ? { ...it, found: current } : it));
      console.error('toggle error', e);
      setError('Failed to update item status. See console.');
    }
  }

  async function deleteItem(id: string) {
    const confirm = window.confirm('Delete this item permanently?');
    if (!confirm) return;
    // optimistic remove
    const snapshot = items.slice();
    setItems((prev) => prev.filter(it => it.id !== id));
    try {
      const csrf = getCookie('csrftoken');
      const res = await fetch(`${base.replace(/\/$/, '')}/api/items/${id}/`, {
        method: 'DELETE',
        credentials: 'include',
        headers: { ...(csrf ? { 'X-CSRFToken': csrf } : {}) },
      });
      if (!res.ok) {
        let body = '';
        try { body = await res.text(); } catch (_) { body = ''; }
        throw new Error(`Failed to delete: ${res.status} ${body}`);
      }
      // notify other components
      try { window.dispatchEvent(new CustomEvent('items:changed', { detail: { type: 'delete', id } })); } catch (e) {}
    } catch (e) {
      setItems(snapshot);
      console.error('delete error', e);
      setError('Failed to delete item. See console.');
    }
  }

  return (
    <div>
      {error && <div className="mb-2 rounded bg-red-100 p-3 text-red-800">{error}</div>}
      <div className="mb-4 flex items-center justify-between">
        <div className="text-sm text-muted-foreground">Total items: {items.length}</div>
        <div className="flex gap-2">
          <Button onClick={() => fetchItems()}>{loading ? 'Refreshing...' : 'Refresh'}</Button>
        </div>
      </div>
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>ID</TableHead>
            <TableHead>Title</TableHead>
            <TableHead>Department</TableHead>
            <TableHead>Owner</TableHead>
            <TableHead>Found</TableHead>
            <TableHead>Actions</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {items.map((it) => (
            <TableRow key={it.id}>
              <TableCell>{it.id}</TableCell>
              <TableCell>{it.title}</TableCell>
              <TableCell>{it.department}</TableCell>
              <TableCell>{it.owner_username || '-'}</TableCell>
              <TableCell>{it.found ? 'Yes' : 'No'}</TableCell>
              <TableCell>
                <div className="flex gap-2">
                  <Button size="sm" variant={it.found ? 'ghost' : 'default'} onClick={() => toggleFound(it.id, Boolean(it.found))}>
                    {it.found ? <X className="h-4 w-4"/> : <Check className="h-4 w-4"/>}
                    <span className="sr-only">Toggle found</span>
                  </Button>
                  <Button size="sm" variant="destructive" onClick={() => deleteItem(it.id)}>
                    <Trash className="h-4 w-4" />
                    <span className="sr-only">Delete</span>
                  </Button>
                </div>
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </div>
  );
}
