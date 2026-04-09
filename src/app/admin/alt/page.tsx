'use client';

import AdminAltPanel from '@/components/dashboard/admin-alt-panel';

export default function AdminAltIndex() {
  return (
    <div className="flex flex-col gap-6">
      <div>
        <h1 className="text-3xl font-bold">Admin Moderation</h1>
        <p className="text-muted-foreground">Moderation tools.</p>
      </div>
      <AdminAltPanel />
    </div>
  );
}
