"use client";

import React, { useEffect, useState } from 'react';
import Logo from './logo';

type Props = {
  name?: string;
  badge?: string | null;
  certified?: boolean;
  date?: string;
  itemsFound?: number;
  title?: string;
  subtitle?: string;
  message?: string;
  signatureText?: string;
  certificateId?: string;
  claimToken?: string | null;
  logoPosition?: 'left' | 'center' | 'right';
};

export default function CertificatePreview({
  name,
  badge,
  certified = false,
  date,
  itemsFound,
  title = 'Certificate of Appreciation',
  subtitle = 'Presented to',
  message = 'for outstanding contributions to the campus community',
  signatureText = 'Authorized Signature',
  certificateId,
  claimToken,
  logoPosition = 'left',
}: Props) {
  const [mounted, setMounted] = useState(false);
  const [clientDate, setClientDate] = useState<string | null>(null);
  const [clientId, setClientId] = useState<string | null>(null);

  useEffect(() => {
    setMounted(true);
    setClientDate(date || new Date().toLocaleDateString());
    setClientId(certificateId ?? `CERT-${Math.floor(Math.random() * 900000 + 100000)}`);
  }, [date, certificateId]);

  return (
    <div id="certificate-preview" className="w-full max-w-3xl mx-auto p-6 bg-white shadow-lg rounded-2xl border border-gray-200">
      <div className="flex items-center justify-between mb-6">
        <div className={`flex items-center gap-3 ${logoPosition === 'center' ? 'justify-center w-full' : ''}`}>
          <div className="flex items-center gap-2 text-black">
            <div className="font-headline text-lg font-bold">Lost & Found</div>
          </div>
        </div>
        {/* Date intentionally removed to match requested layout */}
      </div>

      <div className="border-t border-b border-dashed border-gray-200 py-8">
        <h2 className="text-center text-2xl font-semibold text-slate-900">{title}</h2>
        <p className="text-center text-sm text-muted-foreground mt-2">{subtitle}</p>
  <h3 className="text-center text-3xl font-extrabold mt-4 text-indigo-700">{name || 'Jay Jobanputra'}</h3>
        <p className="text-center text-sm text-muted-foreground mt-2">{message}</p>

        <div className="mt-4 flex items-center justify-center gap-6">
          <div className="text-center">
            <div className="text-xs text-muted-foreground">Badge</div>
            {certified ? (
              <div className="inline-flex items-center gap-2 mt-0 px-3 py-0.5 rounded-full bg-green-100 text-green-800 font-semibold leading-5">
                <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" viewBox="0 0 20 20" fill="currentColor"><path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.707a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd"/></svg>
                <span>Certified</span>
              </div>
            ) : (
              <div className="inline-block mt-0 px-3 py-0.5 rounded-full bg-amber-100 text-amber-800 font-semibold leading-5">{badge || 'Helper'}</div>
            )}
          </div>
          <div className="text-center">
            <div className="text-xs text-muted-foreground">Items Found</div>
            <div className="mt-1 font-semibold">{itemsFound ?? 0}</div>
          </div>
        </div>
      </div>

      <div className="mt-6 flex items-center justify-between">
        <div className="flex-1">
          <div className="w-48 border-t border-gray-300"></div>
          <div className="text-xs text-muted-foreground mt-1">{signatureText}</div>
        </div>
        <div className="flex-1 text-right">
          <div className="text-xs text-muted-foreground">Certificate ID</div>
          <div className="mt-1 text-sm text-muted-foreground">#{mounted ? clientId : '—'}</div>
          {claimToken && (
            <div className="mt-3 text-right">
              <div className="text-xs text-muted-foreground">Claim token</div>
              <div className="flex items-center justify-end gap-2">
                <code className="text-xs bg-gray-100 px-2 py-1 rounded">{claimToken}</code>
                {/* small QR using Google Charts (dev) */}
                <img alt="qr" width={64} height={64} src={`https://chart.googleapis.com/chart?cht=qr&chs=150x150&chl=${encodeURIComponent(((process.env.NEXT_PUBLIC_FRONTEND_URL as string) || location.origin).replace(/\/$/, '') + '/verify/' + claimToken)}`} />
              </div>
              <div className="text-xs text-muted-foreground mt-1">Scan to verify</div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
