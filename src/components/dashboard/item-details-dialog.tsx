"use client";

import Image from "next/image";
import { format } from "date-fns";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { Item } from "@/lib/types";
import { Calendar, MapPin, Tag, User, Building } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { useState } from 'react';
import { useEffect } from 'react';

type ItemDetailsDialogProps = {
  item: Item;
  open: boolean;
  onOpenChange: (open: boolean) => void;
};

export function ItemDetailsDialog({ item, open, onOpenChange }: ItemDetailsDialogProps) {
  const { toast } = useToast();
  const [creating, setCreating] = useState(false);
  const [claimToken, setClaimToken] = useState<string | null>(null);
  const [itemClaims, setItemClaims] = useState<Array<any>>([]);
  const [phone, setPhone] = useState('');
  const [email, setEmail] = useState('');

  const handleClaim = async () => {
    setCreating(true);
    setClaimToken(null);
    try {
      const base = (process.env.NEXT_PUBLIC_API_URL as string) || 'http://127.0.0.1:8000';
      const url = `${base.replace(/\/$/, '')}/api/claims/`;
  const localCollege = typeof window !== 'undefined' ? localStorage.getItem('user_collegeId') : null;
  const body: any = { item: item.id, evidence_text: `Claim submitted via app for ${item.name}` };
  if (localCollege) body.claimant_username = localCollege;
  if (phone) body.claimant_phone = phone;
  if (email) body.claimant_email = email;
      const res = await fetch(url, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(body),
        credentials: 'include',
      });
      const text = await res.text().catch(() => '');
      // try parse JSON if present
      let data: any = null;
      try { data = text ? JSON.parse(text) : null; } catch (e) { data = null; }
      if (res.status === 201 && data) {
        setClaimToken(data.token);
        toast({ title: 'Claim submitted', description: 'A claim was created — see token below.' });
        // refresh item claims
        try { fetchItemClaims(); } catch(e){}
      } else {
        const msg = data?.detail || data?.error || text || `Server returned ${res.status}`;
        toast({ title: 'Claim failed', description: String(msg) });
      }
    } catch (e) {
      console.error('claim error', e);
      toast({ title: 'Claim failed', description: 'Network error' });
    } finally {
      setCreating(false);
    }
  };

  async function fetchItemClaims() {
    try {
      const base = (process.env.NEXT_PUBLIC_API_URL as string) || 'http://127.0.0.1:8000';
      const url = `${base.replace(/\/$/, '')}/api/items/${item.id}/`;
      const res = await fetch(url, { credentials: 'include' });
      if (!res.ok) return;
      const data = await res.json();
      // item serializer returns claims as lightweight array
      setItemClaims(data.claims || []);
    } catch (e) {
      // ignore
    }
  }

  useEffect(() => {
    if (open) fetchItemClaims().catch(() => {});
  }, [open]);

  const handleCopyToken = async () => {
    if (!claimToken) return;
    try {
      await navigator.clipboard.writeText(claimToken);
      toast({ title: 'Copied', description: 'Claim token copied to clipboard' });
    } catch (e) {
      toast({ title: 'Copy failed', description: 'Could not copy token' });
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-2xl">
        <DialogHeader>
          <DialogTitle className="font-headline text-2xl">{item.name}</DialogTitle>
          <DialogDescription>
            Details for the item. If you believe this is your item, please proceed to claim it.
          </DialogDescription>
        </DialogHeader>
        <div className="grid md:grid-cols-2 gap-6 py-4">
          <div className="relative aspect-[4/3] w-full overflow-hidden rounded-md">
            {item.imageUrl && item.imageUrl.startsWith && item.imageUrl.startsWith('data:') ? (
              <img src={item.imageUrl} alt={item.name} data-ai-hint={item.imageHint} className="absolute inset-0 h-full w-full object-cover" />
            ) : (
              <Image src={item.imageUrl} alt={item.name} data-ai-hint={item.imageHint} fill className="object-cover" />
            )}
            <Badge
              variant={item.status === 'Found' ? 'default' : 'destructive'}
              className="absolute right-2 top-2"
            >
              {item.status}
            </Badge>
          </div>
          <div className="flex flex-col space-y-4">
            <div>
              <h3 className="font-semibold text-lg font-headline">Description</h3>
              <p className="text-muted-foreground text-sm">{item.description}</p>
            </div>
            <Separator />
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="text-sm font-medium text-slate-800 dark:text-slate-200">Phone</label>
                <input className="w-full border rounded px-2 py-1 text-sm bg-white dark:bg-slate-700 text-slate-900 dark:text-slate-100" value={phone} onChange={(e) => setPhone(e.target.value)} placeholder="Phone or WhatsApp" />
              </div>
              <div>
                <label className="text-sm font-medium text-slate-800 dark:text-slate-200">Email</label>
                <input className="w-full border rounded px-2 py-1 text-sm bg-white dark:bg-slate-700 text-slate-900 dark:text-slate-100" value={email} onChange={(e) => setEmail(e.target.value)} placeholder="your@email.example" />
              </div>
            </div>
            <div className="grid grid-cols-2 gap-4 text-sm">
                <div className="flex items-center gap-2">
                    <Building className="h-4 w-4 text-muted-foreground" />
                    <div>
                        <p className="font-medium">Department</p>
                        <p className="text-muted-foreground">{item.department}</p>
                    </div>
                </div>
                 <div className="flex items-center gap-2">
                    <MapPin className="h-4 w-4 text-muted-foreground" />
                    <div>
                        <p className="font-medium">Location</p>
                        <p className="text-muted-foreground">{item.location}</p>
                    </div>
                </div>
                 <div className="flex items-center gap-2">
                    <Calendar className="h-4 w-4 text-muted-foreground" />
                    <div>
                        <p className="font-medium">{item.status} on</p>
                        <p className="text-muted-foreground">{format(item.date, "PPP")}</p>
                    </div>
                </div>
                 <div className="flex items-center gap-2">
                    <User className="h-4 w-4 text-muted-foreground" />
                    <div>
                        <p className="font-medium">Posted by</p>
                        <p className="text-muted-foreground">User {item.userId}</p>
                    </div>
                </div>
            </div>
          </div>
        </div>
        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)}>Close</Button>
          <div className="flex items-center gap-2">
            <Button onClick={handleClaim} disabled={creating}>{creating ? 'Submitting…' : 'Claim Item'}</Button>
          </div>
        </DialogFooter>
        {claimToken && (
          <div className="p-4 border-t">
            <h4 className="text-sm font-medium">Claim created</h4>
            <p className="text-xs text-muted-foreground">Token (keep this to verify ownership):</p>
              <div className="mt-2 flex items-center gap-2">
              <code className="rounded px-2 py-1 bg-gray-100 text-sm break-all">{claimToken}</code>
              <Button variant="ghost" size="sm" onClick={handleCopyToken}>Copy</Button>
              {(() => {
                const frontend = (process.env.NEXT_PUBLIC_FRONTEND_URL as string) || (typeof window !== 'undefined' ? window.location.origin : 'http://localhost:3000');
                const verifyUrl = `${frontend.replace(/\/$/, '')}/verify/${claimToken}`;
                return (
                  <a className="text-sm text-blue-600 underline" href={verifyUrl} target="_blank" rel="noreferrer">Verify</a>
                );
              })()}
            </div>
          </div>
        )}
        {itemClaims.length > 0 && (
          <div className="p-4 border-t">
            <h4 className="text-sm font-medium">Recent claims</h4>
            <div className="mt-2 space-y-2">
              {itemClaims.map((c) => (
                <div key={c.id} className="flex items-center justify-between text-sm">
                  <div>
                    <div className="font-medium">{c.claimant_username || 'Unknown'}</div>
                    <div className="text-xs text-muted-foreground">{c.status} • {new Date(c.created_at).toLocaleString()}</div>
                  </div>
                  <div className="text-right">
                    <div className="text-xs">{c.token ? `${c.token.slice(0,8)}…` : ''}</div>
                    {(() => {
                      const frontend = (process.env.NEXT_PUBLIC_FRONTEND_URL as string) || (typeof window !== 'undefined' ? window.location.origin : 'http://localhost:3000');
                      const verifyUrl = `${frontend.replace(/\/$/, '')}/verify/${c.token}`;
                      return <a className="text-xs text-blue-600 underline" href={verifyUrl} target="_blank" rel="noreferrer">Verify</a>;
                    })()}
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
      </DialogContent>
    </Dialog>
  );
}
