"use client";

import React, { useEffect, useState } from 'react';
import { useParams } from 'next/navigation';

type ClaimInfo = {
  valid: boolean;
  status?: string;
  item?: number;
  claimant?: string | null;
};

export default function VerifyPage() {
  const params = useParams();
  const token = (params as { token?: string })?.token || '';
  const [claim, setClaim] = useState<ClaimInfo | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [responderName, setResponderName] = useState('');
  const [answers, setAnswers] = useState({ question1: '', question2: '', question3: '' });
  const [submitted, setSubmitted] = useState(false);

  const apiBase = (process.env.NEXT_PUBLIC_API_URL as string) || window.location.origin.replace(/:\d+$/, ':8000');

  useEffect(() => {
    let mounted = true;
    async function fetchClaim() {
      if (!token) {
        if (mounted) setLoading(false);
        return;
      }
      setLoading(true);
      try {
        const res = await fetch(`${apiBase.replace(/\/$/, '')}/api/claims/verify/${encodeURIComponent(token)}/`);
        const data = await res.json();
        if (!res.ok) {
          if (!mounted) return;
          setError(data.detail || 'Not found');
          setClaim(null);
        } else {
          if (!mounted) return;
          setClaim(data);
        }
      } catch (e) {
        if (mounted) setError('Network error');
      } finally {
        if (mounted) setLoading(false);
      }
    }
    fetchClaim();
    return () => { mounted = false; };
  }, [token]);

  const handleChange = (k: string, v: string) => setAnswers((a) => ({ ...a, [k]: v }));

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    try {
      const res = await fetch(`${apiBase.replace(/\/$/, '')}/api/claims/verify/${encodeURIComponent(token)}/`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ responder_name: responderName, answers }),
      });
      const data = await res.json();
      if (res.status === 201) {
        setSubmitted(true);
      } else {
        setError(data.detail || 'Could not submit');
      }
    } catch (e) {
      setError('Network error');
    }
  };

  return (
    <div className="min-h-screen flex items-start justify-center py-12 px-4 bg-white dark:bg-slate-900">
      <div className="max-w-xl w-full bg-white dark:bg-slate-800 p-6 rounded-lg shadow">
        <h2 className="text-xl font-semibold mb-2 text-slate-900 dark:text-slate-100">Verify Claim</h2>
  {loading && <div className="text-slate-700 dark:text-slate-200">Loading...</div>}
  {error && <div className="text-red-600">{error}</div>}
        {!loading && claim && (
          <div>
            <div className="mb-4">
              <div className="text-sm text-muted-foreground dark:text-slate-300">Claim status</div>
              <div className="font-medium text-slate-900 dark:text-slate-100">{claim.status}</div>
              <div className="text-xs text-muted-foreground dark:text-slate-300">Item ID: {claim.item}</div>
              <div className="text-xs text-muted-foreground dark:text-slate-300">Claimant: {claim.claimant}</div>
            </div>

            {submitted ? (
              <div className="p-4 border rounded bg-green-50 dark:bg-green-900 border-green-200 dark:border-green-700 text-green-900 dark:text-green-50">Thank you — your answers have been submitted.</div>
            ) : (
              <form onSubmit={handleSubmit} className="space-y-4">
                <div>
                  <label className="block text-sm text-slate-700 dark:text-slate-200">Your name (optional)</label>
                  <input className="w-full border rounded px-2 py-1 bg-white dark:bg-slate-700 text-slate-900 dark:text-slate-100" value={responderName} onChange={(e) => setResponderName(e.target.value)} />
                </div>
                <div>
                  <label className="block text-sm text-slate-700 dark:text-slate-200">Question 1: Describe any markings, engravings, or unique identifiers on the item</label>
                  <textarea className="w-full border rounded px-2 py-1 bg-white dark:bg-slate-700 text-slate-900 dark:text-slate-100" rows={2} value={answers.question1} onChange={(e) => handleChange('question1', e.target.value)} />
                </div>
                <div>
                  <label className="block text-sm text-slate-700 dark:text-slate-200">Question 2: When and where did you lose this item?</label>
                  <input className="w-full border rounded px-2 py-1 bg-white dark:bg-slate-700 text-slate-900 dark:text-slate-100" value={answers.question2} onChange={(e) => handleChange('question2', e.target.value)} />
                </div>
                <div>
                  <label className="block text-sm text-slate-700 dark:text-slate-200">Question 3: Any supporting evidence (e.g., photo link)</label>
                  <input className="w-full border rounded px-2 py-1 bg-white dark:bg-slate-700 text-slate-900 dark:text-slate-100" value={answers.question3} onChange={(e) => handleChange('question3', e.target.value)} />
                </div>
                <div className="flex items-center justify-between">
                  <button type="submit" className="px-4 py-2 bg-indigo-600 text-white rounded">Submit answers</button>
                  <div className="text-xs text-muted-foreground">Your answers will be recorded for staff review.</div>
                </div>
                {error && <div className="text-red-600">{error}</div>}
              </form>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
