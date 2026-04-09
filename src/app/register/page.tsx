"use client";

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';


export default function RegisterPage(){
  const router = useRouter();
  const [name, setName] = useState('');
  const [collegeId, setCollegeId] = useState('');
  const [password, setPassword] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try{
      const base = (process.env.NEXT_PUBLIC_API_URL as string) || 'http://127.0.0.1:8000';
      const res = await fetch(`${base.replace(/\/$/, '')}/api/register/`, {
        method: 'POST', headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name, collegeId, password }),
      });
      const data = await res.json().catch(() => null);
      if (!res.ok) {
        alert((data && data.detail) || 'Register failed');
        return;
      }
      try { localStorage.setItem('user_name', data?.name || name); localStorage.setItem('user_collegeId', data?.collegeId || collegeId); } catch (e) {}
      router.push('/dashboard');
    }catch(err){
      console.error(err); alert('Request failed');
    }
  };

  return (
    <div className="flex min-h-screen items-center justify-center p-4">
      <Card className="w-full max-w-md">
        <CardHeader>
          <CardTitle>Create account</CardTitle>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="grid gap-4">
            <Input placeholder="Full name" value={name} onChange={(e)=>setName(e.target.value)} />
            <Input placeholder="Student ID" value={collegeId} onChange={(e)=>setCollegeId(e.target.value)} />
            <Input placeholder="Password" type="password" value={password} onChange={(e)=>setPassword(e.target.value)} />
            <Button type="submit">Create account</Button>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}
