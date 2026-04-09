"use client";

import { useEffect } from 'react';
import Link from 'next/link';
import { ThemeToggle } from '@/components/theme-toggle';
import { Button } from '@/components/ui/button';
import { SidebarHeader } from '@/components/ui/sidebar';

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  // In development, pre-fill a dev user so admin pages that read localStorage
  // (user_name / user_collegeId) won't show login/signup prompts. This is a
  // convenience for local dev only and will be skipped in production.
  useEffect(() => {
    try {
      if (process.env.NODE_ENV !== 'production' && typeof window !== 'undefined') {
        if (!localStorage.getItem('user_collegeId')) {
          localStorage.setItem('user_name', 'Dev Admin');
          localStorage.setItem('user_collegeId', 'A-ADMIN');
        }
      }
    } catch (e) {
      // ignore localStorage errors
    }
  }, []);
  return (
    <div className="min-h-screen bg-background">
      <header className="flex items-center justify-between p-4 border-b">
        <Link href="/">Home</Link>
        <div className="flex items-center gap-2">
          <Link href="/admin">Admin</Link>
          <Link href="/admin/alt"><Button size="sm">Moderation</Button></Link>
          <ThemeToggle />
        </div>
      </header>
      <main className="p-6">{children}</main>
    </div>
  );
}
