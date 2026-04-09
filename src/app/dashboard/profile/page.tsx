"use client";

import Image from 'next/image';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { MOCK_USER } from '@/lib/mock-data';
import { useEffect, useState } from 'react';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { ThemeToggle } from '@/components/theme-toggle';
import ClientOnly from '@/components/client-only';
import { Separator } from '@/components/ui/separator';
import { Edit } from 'lucide-react';

export default function ProfilePage() {
  const [user, setUser] = useState(MOCK_USER);
  const [editing, setEditing] = useState(false);
  const [nameInput, setNameInput] = useState('');
  const [emailInput, setEmailInput] = useState('');

  useEffect(() => {
    try {
      const name = localStorage.getItem('user_name');
      const collegeId = localStorage.getItem('user_collegeId');
      if (name || collegeId) {
        setUser({
          ...MOCK_USER,
          name: name || MOCK_USER.name,
          collegeId: collegeId || MOCK_USER.collegeId,
        });
        setNameInput(name || MOCK_USER.name);
        setEmailInput(MOCK_USER.avatarUrl || '');
      }
    } catch (e) {}
  }, []);

  useEffect(() => {
    // fetch aggregated stats and merge into user activity if available
    async function fetchStats() {
      try {
        const base = (process.env.NEXT_PUBLIC_API_URL as string) || 'http://127.0.0.1:8000';
        const res = await fetch(`${base.replace(/\/$/, '')}/api/items/stats/`, { credentials: 'include' });
        if (!res.ok) return;
        const data = await res.json();
        if (data && data.user) {
          setUser(prev => ({ ...prev, itemsPosted: data.user.total || 0, itemsFound: data.user.found || 0 }));
        } else if (data) {
          // fall back to global counts for display
          setUser(prev => ({ ...prev, itemsPosted: data.total || 0, itemsFound: data.found || 0 }));
        }
      } catch (e) {
        // ignore
      }
    }
    fetchStats();
    // Listen for items:changed to keep activity in sync
    const onItemsChanged = () => { fetchStats().catch(()=>{}); };
    window.addEventListener('items:changed', onItemsChanged as EventListener);
    return () => { window.removeEventListener('items:changed', onItemsChanged as EventListener); };
  }, []);

  return (
    <ClientOnly>
    <div className="flex flex-col gap-8 max-w-4xl mx-auto">
      <div>
        <h1 className="text-3xl font-bold tracking-tight font-headline">
          My Profile
        </h1>
        <p className="text-muted-foreground">
          Manage your account and preferences.
        </p>
      </div>

      <Card>
        <CardHeader className="flex flex-col md:flex-row items-start md:items-center gap-4">
          <Image
            src={user.avatarUrl}
            alt={user.name}
            data-ai-hint={user.avatarHint}
            width={100}
            height={100}
            className="rounded-full border-4 border-primary/20"
          />
          <div className="flex-1">
            {editing ? (
              <div className="space-y-2">
                <Label>Full name</Label>
                <Input value={nameInput} onChange={(e)=>setNameInput(e.target.value)} />
                <Label className="mt-2">Email</Label>
                <Input value={emailInput} onChange={(e)=>setEmailInput(e.target.value)} />
                <div className="flex gap-2 mt-2">
                  <Button onClick={async ()=>{
                    try{
                      const base = (process.env.NEXT_PUBLIC_API_URL as string) || 'http://127.0.0.1:8000';
                      const res = await fetch(`${base.replace(/\/$/, '')}/api/profile/`, { method: 'PUT', headers: {'Content-Type':'application/json'}, body: JSON.stringify({ name: nameInput, email: emailInput }) });
                      if (res.ok){
                        const d = await res.json();
                        setUser({...user, name: d.name, collegeId: d.collegeId, email: d.email});
                        try{ localStorage.setItem('user_name', d.name); }catch(e){}
                        setEditing(false);
                      } else { alert('Update failed'); }
                    }catch(e){ console.error(e); alert('Request failed'); }
                  }}>Save</Button>
                  <Button variant="outline" onClick={()=>setEditing(false)}>Cancel</Button>
                </div>
              </div>
            ) : (
              <>
                <CardTitle className="font-headline text-3xl">{user.name}</CardTitle>
                <CardDescription className="text-base">{user.department}</CardDescription>
                <p className="text-sm text-muted-foreground">ID: {user.collegeId}</p>
              </>
            )}
          </div>
          <div>
            {!editing && <Button variant="outline" className="group" onClick={()=>setEditing(true)}>
              <Edit className="h-4 w-4 mr-2 transition-transform group-hover:rotate-[-15deg]"/> Edit Profile
            </Button>}
          </div>
        </CardHeader>
        <CardContent>
          <Separator className="my-4"/>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <Card className="bg-background">
                <CardHeader>
                    <CardTitle className="font-headline text-lg">Activity</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                     <div className="flex justify-between items-center">
                        <span className="text-muted-foreground">Items Posted</span>
                        <span className="font-bold text-lg">{user.itemsPosted}</span>
                    </div>
                     <div className="flex justify-between items-center">
                        <span className="text-muted-foreground">Items Found</span>
                        <span className="font-bold text-lg">{user.itemsFound}</span>
                    </div>
                </CardContent>
            </Card>
             <Card className="bg-background">
                <CardHeader>
                    <CardTitle className="font-headline text-lg">Preferences</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                     <div className="flex justify-between items-center">
                        <span className="text-muted-foreground">Theme</span>
                        <ThemeToggle />
                    </div>
                </CardContent>
            </Card>
          </div>
        </CardContent>
      </Card>
    </div>
    </ClientOnly>
  );
}
