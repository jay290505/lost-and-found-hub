'use client';

export default function AdminAltPageDisabled() {
  return (
    <div>
      <h1 className="text-2xl font-bold">Page removed</h1>
      <p className="text-muted-foreground">This dashboard admin moderation page has been removed. Use the separate <a href="/admin/alt">Admin site</a>.</p>
    </div>
  );
}
