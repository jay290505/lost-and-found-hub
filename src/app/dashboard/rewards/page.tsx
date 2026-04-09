"use client";
import { useState, useEffect, useRef } from 'react';
import { motion } from 'framer-motion';
import { Download } from 'lucide-react';

import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';
import { Button } from '@/components/ui/button';
import { MOCK_USER, MOCK_BADGES } from '@/lib/mock-data';
import { useToast } from '@/hooks/use-toast';
import Confetti from '@/components/confetti';
import ClientOnly from '@/components/client-only';
// CertificatePreview and BadgeShelf removed during rollback
import CertificatePreview from '@/components/certificate-preview';

const BadgeCard = ({ badge, achieved }: { badge: (typeof MOCK_BADGES)[0], achieved: boolean }) => {
  const cardVariants = {
    initial: { scale: 0.9, opacity: 0 },
    animate: { scale: 1, opacity: 1 },
    hover: {
      scale: 1.05,
      boxShadow: `0px 0px 30px ${achieved ? 'hsl(var(--accent))' : 'hsl(var(--muted))'}`,
      transition: { type: 'spring', stiffness: 300 }
    }
  };

  return (
    <motion.div variants={cardVariants} initial="initial" animate="animate" whileHover="hover">
      <Card className={`overflow-hidden transition-all duration-300 ${achieved ? 'border-accent/50 bg-accent/10' : 'bg-muted/50'}`}>
        <CardHeader className="flex flex-row items-center gap-4">
          <badge.icon className={`h-12 w-12 ${achieved ? 'text-accent' : 'text-muted-foreground'}`} />
          <div>
            <CardTitle className="font-headline">{badge.name}</CardTitle>
            <CardDescription>{badge.description}</CardDescription>
          </div>
        </CardHeader>
        <CardContent>
          <p className="text-sm font-semibold">Requires: {badge.itemsRequired} items found</p>
        </CardContent>
      </Card>
    </motion.div>
  );
};

export default function RewardsPage() {
  const [progress, setProgress] = useState(0);
  const [showConfetti, setShowConfetti] = useState(false);

  const { toast } = useToast();

  const [clientUser, setClientUser] = useState(MOCK_USER);
  useEffect(() => {
    try {
      const name = localStorage.getItem('user_name');
      const collegeId = localStorage.getItem('user_collegeId');
      if (name || collegeId) setClientUser({ ...MOCK_USER, name: name || MOCK_USER.name, collegeId: collegeId || MOCK_USER.collegeId });
    } catch (e) {}
  }, []);

  // Fetch authoritative stats for rewards (items found by user)
  useEffect(() => {
    let mounted = true;
    async function fetchStats() {
      try {
        const base = (process.env.NEXT_PUBLIC_API_URL as string) || 'http://127.0.0.1:8000';
        const res = await fetch(`${base.replace(/\/$/, '')}/api/items/stats/`, { credentials: 'include' });
        if (!res.ok) return;
        const data = await res.json();
        if (!mounted) return;
        if (data && data.user) {
          const next = { ...clientUser, itemsFound: data.user.found || 0, itemsPosted: data.user.total || 0 };
          if (JSON.stringify(next) !== JSON.stringify(clientUser)) setClientUser(next);
        } else if (data) {
          // fallback to global counts
          const next = { ...clientUser, itemsFound: data.found || 0, itemsPosted: data.total || 0 };
          if (JSON.stringify(next) !== JSON.stringify(clientUser)) setClientUser(next);
        }
      } catch (e) {
        // ignore
      }
    }
    fetchStats();
    const onItemsChanged = () => { fetchStats().catch(()=>{}); };
    window.addEventListener('items:changed', onItemsChanged as EventListener);
    return () => { mounted = false; window.removeEventListener('items:changed', onItemsChanged as EventListener); };
  }, []);

  const itemsFound = clientUser.itemsFound;
  const nextBadge = MOCK_BADGES.find(b => itemsFound < b.itemsRequired);
  const progressValue = nextBadge ? (itemsFound / nextBadge.itemsRequired) * 100 : 100;
  
  const achievedBadges = MOCK_BADGES.filter(b => itemsFound >= b.itemsRequired);

  useEffect(() => {
    const timer = setTimeout(() => setProgress(progressValue), 500);
    return () => clearTimeout(timer);
  }, [progressValue]);
  
  // track previous itemsFound value to detect when a new badge is achieved
  const prevItemsFoundRef = useRef<number>(0);

  useEffect(() => {
    const prev = prevItemsFoundRef.current || 0;
    const newlyAchieved = MOCK_BADGES.find((b) => b.itemsRequired > prev && b.itemsRequired <= itemsFound);
    if (!newlyAchieved) {
      prevItemsFoundRef.current = itemsFound;
      return;
    }

    setShowConfetti(true);
    const t = setTimeout(() => setShowConfetti(false), 5000);
    try {
      toast({ title: 'Congratulations!', description: `You achieved the "${newlyAchieved.name}" medal.` });
    } catch (e) {}

    prevItemsFoundRef.current = itemsFound;
    return () => clearTimeout(t);
  }, [itemsFound, toast]);

  // Certificate generation
  const [generating, setGenerating] = useState(false);
  const latestBadge = achievedBadges.length > 0 ? achievedBadges[achievedBadges.length - 1] : null;
  // Fields to make the certificate formattable
  const [certTitle, setCertTitle] = useState('Certificate of Appreciation');
  const [certSubtitle, setCertSubtitle] = useState('Presented to');
  const [certMessage, setCertMessage] = useState('for outstanding contributions to the campus community');
  const [certSignature, setCertSignature] = useState('Authorized Signature');
  const [certId, setCertId] = useState<string | undefined>(undefined);
  const [claimTokenInput, setClaimTokenInput] = useState<string | undefined>(undefined);

  const isCertified = achievedBadges.length > 0;
  const badgeLabel = isCertified ? 'Certified' : (latestBadge ? latestBadge.name : 'Helper');

  async function handleDownloadCertificate() {
    setGenerating(true);
    try {
      // Prefer client-side capture so the PDF matches the on-page UI exactly
      try {
        const html2canvas = (await import('html2canvas')).default;
        const { jsPDF } = await import('jspdf');
        const node = document.getElementById('certificate-preview');
        if (!node) throw new Error('Certificate preview not rendered');
        // Wait for web fonts to be ready so text is rendered correctly in the canvas
        try {
          if ((document as any).fonts && (document as any).fonts.ready) {
            await (document as any).fonts.ready;
          }
        } catch (fontErr) {
          // ignore font waiting errors
          console.warn('Font load wait failed', fontErr);
        }
        // small visual delay to allow overlay to show and fonts to apply
        await new Promise((r) => setTimeout(r, 120));
        const canvas = await html2canvas(node as HTMLElement, { scale: 2, useCORS: true, backgroundColor: '#ffffff' });
        const imgData = canvas.toDataURL('image/png');
        // Fit the canvas into an A4 page at 96 DPI equivalent (approx px)
        const A4_PX = { width: 842, height: 595 }; // landscape px approx for 96dpi
        const canvasRatio = canvas.width / canvas.height;
        const pageRatio = A4_PX.width / A4_PX.height;
        let drawW = A4_PX.width;
        let drawH = A4_PX.height;
        if (canvasRatio > pageRatio) {
          drawW = A4_PX.width;
          drawH = Math.round(drawW / canvasRatio);
        } else {
          drawH = A4_PX.height;
          drawW = Math.round(drawH * canvasRatio);
        }
        const pdf = new jsPDF({ orientation: 'landscape' as any, unit: 'px', format: [A4_PX.width, A4_PX.height] });
        const offsetX = Math.round((A4_PX.width - drawW) / 2);
        const offsetY = Math.round((A4_PX.height - drawH) / 2);
        pdf.addImage(imgData, 'PNG', offsetX, offsetY, drawW, drawH);
        const filename = `certificate-${(clientUser.name || 'user').replace(/\s+/g,'_')}.pdf`;
        pdf.save(filename);
        setGenerating(false);
        return;
      } catch (clientErr) {
        console.warn('Client-side capture failed, falling back to server:', clientErr);
  // show an explicit alert with stack to help debugging
  const msg = clientErr instanceof Error ? clientErr.message : String(clientErr ?? 'unknown error');
  // keep the alert concise but log full error to console
  alert('Client-side PDF generation failed: ' + msg + '\nFalling back to server. See console for details.');
      }

      // Fallback: server-side generation (session or collegeId)
      const base = (process.env.NEXT_PUBLIC_API_URL as string) || 'http://127.0.0.1:8000';
  // include name in query to help server produce the same recipient text
  let url = `${base.replace(/\/$/, '')}/api/rewards/certificate/`;
  const safeName = encodeURIComponent((clientUser.name || '').trim());
  if (safeName) url += `?name=${safeName}`;

      // Try an authenticated request first (session cookie)
      const res = await fetch(url, { credentials: 'include' });
      if (!res.ok) {
        // If unauthorized and we don't have a collegeId locally, prompt the user (dev fallback)
        if ((res.status === 401 || res.status === 403)) {
          const localCollege = typeof window !== 'undefined' ? localStorage.getItem('user_collegeId') : null;
          let collegeToUse = localCollege || clientUser.collegeId || '';
          if (!collegeToUse && typeof window !== 'undefined') {
            collegeToUse = window.prompt('Not logged in — enter your College ID to generate a dev certificate (only in DEBUG):', '') || '';
            if (collegeToUse) {
              try { localStorage.setItem('user_collegeId', collegeToUse); } catch(e){}
            }
          }
          if (!collegeToUse) throw new Error('Unauthorized and no collegeId provided');
          // retry using collegeId fallback (no credentials)
          // preserve name param if it exists and add collegeId fallback
          const retryUrl = url + (url.includes('?') ? `&collegeId=${encodeURIComponent(collegeToUse)}` : `?collegeId=${encodeURIComponent(collegeToUse)}`);
          const retryRes = await fetch(retryUrl);
          if (!retryRes.ok) {
            const txt = await retryRes.text().catch(() => '');
            throw new Error(`Server returned ${retryRes.status}: ${txt}`);
          }
          const blob = await retryRes.blob();
          const cd = retryRes.headers.get('content-disposition') || '';
          const m = cd.match(/filename="?([^\";]+)"?/);
          const filename = (m && m[1]) ? m[1] : `certificate-${(clientUser.name || 'user').replace(/\s+/g,'_')}.pdf`;
          const blobUrl = URL.createObjectURL(blob);
          const a = document.createElement('a');
          a.href = blobUrl;
          a.download = filename;
          document.body.appendChild(a);
          a.click();
          a.remove();
          URL.revokeObjectURL(blobUrl);
          setGenerating(false);
          return;
        }
        const txt = await res.text().catch(() => '');
        throw new Error(`Server returned ${res.status}: ${txt}`);
      }
      const blob = await res.blob();
      const cd = res.headers.get('content-disposition') || '';
      const m = cd.match(/filename="?([^\";]+)"?/);
      const filename = (m && m[1]) ? m[1] : `certificate-${(clientUser.name || 'user').replace(/\s+/g,'_')}.pdf`;
      const blobUrl = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = blobUrl;
      a.download = filename;
      document.body.appendChild(a);
      a.click();
      a.remove();
      URL.revokeObjectURL(blobUrl);
    } catch (e) {
      console.error('Certificate download failed', e);
      console.error(e);
      alert('Failed to generate certificate. See console for details.');
    } finally {
      setGenerating(false);
    }
  }

  return (
    <ClientOnly>
    <div className="flex flex-col gap-8">
      {showConfetti && <Confetti />}
      <div>
        <h1 className="text-3xl font-bold tracking-tight font-headline">
          Helper Rewards
        </h1>
        <p className="text-muted-foreground">
          Your progress in making our campus a better place.
        </p>
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="font-headline">Your Progress</CardTitle>
          <CardDescription>You've found {itemsFound} items so far. Keep it up!</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <Progress value={progress} className="w-full h-4" />
          <div className="text-sm text-muted-foreground flex justify-between">
              <span>Current Level: {achievedBadges.length > 0 ? achievedBadges[achievedBadges.length - 1].name : 'Newbie'}</span>
              {nextBadge && <span>Next Badge: {nextBadge.name} ({itemsFound}/{nextBadge.itemsRequired})</span>}
          </div>
        </CardContent>
      </Card>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {MOCK_BADGES.map(badge => (
          <BadgeCard key={badge.name} badge={badge} achieved={itemsFound >= badge.itemsRequired} />
        ))}
      </div>
      
      <div className="flex flex-col items-center gap-6">
        <div className="flex justify-center mt-4">
          <Button variant="outline" onClick={handleDownloadCertificate} disabled={generating}>
            <Download className="mr-2 h-4 w-4" />
            {generating ? 'Generating...' : 'Download Certificate'}
          </Button>
        </div>
      </div>

      <div className="mt-8">
        <h2 className="text-lg font-semibold">Certificate Preview</h2>
        <p className="text-sm text-muted-foreground">This preview shows what will be printed on the certificate.</p>
          {/* Overlay lives outside the captured preview so it is not printed into the PDF */}
          {generating && (
            <div className="fixed left-1/2 top-24 -translate-x-1/2 z-50 pointer-events-none">
              <div className="bg-white/90 px-4 py-2 rounded-lg shadow-lg flex items-center gap-3">
                <div className="animate-spin rounded-full h-6 w-6 border-4 border-blue-500 border-t-transparent"></div>
                <div className="text-sm font-medium">Generating PDF…</div>
              </div>
            </div>
          )}
            <div className="mt-4 relative">
              {/* Overlay shown to the user while generating; placed outside the captured node so it won't appear in the PDF */}
              {generating && (
                <div className="absolute -top-2 -right-2 z-40 p-2 bg-white rounded shadow-md flex items-center gap-2">
                  <div className="animate-spin rounded-full h-4 w-4 border-2 border-blue-500 border-t-transparent"></div>
                  <div className="text-sm">Generating PDF…</div>
                </div>
              )}
              <CertificatePreview
                name={clientUser.name || 'Recipient'}
                badge={badgeLabel}
                certified={isCertified}
                itemsFound={itemsFound}
                title={certTitle}
                subtitle={certSubtitle}
                message={certMessage}
                signatureText={certSignature}
                certificateId={certId}
                claimToken={claimTokenInput}
              />
            </div>
      </div>

          <div className="mt-4 grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="text-sm font-medium">Certificate Title</label>
              <input value={certTitle} onChange={(e)=>setCertTitle(e.target.value)} className="mt-1 block w-full rounded border px-2 py-1" />
            </div>
            <div>
              <label className="text-sm font-medium">Subtitle</label>
              <input value={certSubtitle} onChange={(e)=>setCertSubtitle(e.target.value)} className="mt-1 block w-full rounded border px-2 py-1" />
            </div>
            <div className="md:col-span-2">
              <label className="text-sm font-medium">Message</label>
              <input value={certMessage} onChange={(e)=>setCertMessage(e.target.value)} className="mt-1 block w-full rounded border px-2 py-1" />
            </div>
            <div>
              <label className="text-sm font-medium">Signature Text</label>
              <input value={certSignature} onChange={(e)=>setCertSignature(e.target.value)} className="mt-1 block w-full rounded border px-2 py-1" />
            </div>
            <div>
              <label className="text-sm font-medium">Certificate ID (optional)</label>
              <input value={certId ?? ''} onChange={(e)=>setCertId(e.target.value || undefined)} className="mt-1 block w-full rounded border px-2 py-1" />
            </div>
            <div>
              <label className="text-sm font-medium">Claim Token (optional)</label>
              <input value={claimTokenInput ?? ''} onChange={(e)=>setClaimTokenInput(e.target.value || undefined)} placeholder="paste claim token to include" className="mt-1 block w-full rounded border px-2 py-1" />
            </div>
          </div>

      {/* certificate template removed during rollback */}
    </div>
    </ClientOnly>
  );
}
