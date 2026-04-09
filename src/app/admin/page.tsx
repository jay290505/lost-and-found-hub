'use client';

import AdminPanel from '@/components/dashboard/admin-panel';

export default function AdminIndex() {
  return (
    <div className="flex flex-col gap-6">
      <div>
        <h1 className="text-3xl font-bold">Admin Dashboard</h1>
        <p className="text-muted-foreground">Overview and management.</p>
      </div>
      <AdminPanel />
    </div>
  );
}
