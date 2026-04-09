'use client';

export default function AdminPageDisabled() {
  return (
    <div>
      <h1 className="text-2xl font-bold">Page removed</h1>
      <p className="text-muted-foreground">This dashboard admin page has been removed. Use the separate <a href="/admin">Admin site</a>.</p>
    </div>
  );
}
