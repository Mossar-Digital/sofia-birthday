'use client';

import { motion } from 'framer-motion';
import { Lock, ShieldAlert } from 'lucide-react';
import { useState } from 'react';

import { Notice, Spinner } from '@/components/studio/ui';

interface StudioLoginProps {
  configured: boolean;
  onAuthenticated: () => void;
}

export default function StudioLogin({ configured, onAuthenticated }: StudioLoginProps) {
  const [key, setKey] = useState('');
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function submit(event: React.FormEvent) {
    event.preventDefault();
    if (busy || !key.trim()) return;

    setBusy(true);
    setError(null);

    try {
      const response = await fetch('/api/admin/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ key }),
      });
      const payload = (await response.json()) as { authenticated?: boolean; error?: string };

      if (response.ok && payload.authenticated) {
        onAuthenticated();
        return;
      }
      setError(payload.error ?? 'Accès refusé');
      setKey('');
    } catch {
      setError('Le serveur ne répond pas.');
    } finally {
      setBusy(false);
    }
  }

  return (
    <div className="flex min-h-dvh items-center justify-center px-6">
      <motion.div
        className="w-full max-w-sm"
        initial={{ opacity: 0, y: 16 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6 }}
      >
        <div className="mb-8 text-center">
          <div className="mx-auto mb-5 flex h-14 w-14 items-center justify-center rounded-2xl border border-dore/30 bg-cacao/60">
            <Lock className="h-5 w-5 text-dore/85" strokeWidth={1.7} />
          </div>
          <h1 className="heading-serif text-2xl text-creme">Studio</h1>
          <p className="mt-2 text-xs uppercase tracking-[0.22em] text-latte/50">Accès réservé</p>
        </div>

        {!configured && (
          <div className="mb-5">
            <Notice tone="warn">
              <span className="mb-1 flex items-center gap-1.5 font-medium">
                <ShieldAlert className="h-3.5 w-3.5" />
                Configuration requise
              </span>
              Ajoutez <code className="text-dore">ADMIN_SECRET_KEY</code> dans votre fichier{' '}
              <code className="text-dore">.env.local</code>, puis relancez{' '}
              <code className="text-dore">npm run dev</code>.
            </Notice>
          </div>
        )}

        <form onSubmit={submit} className="space-y-4">
          <input
            type="password"
            value={key}
            onChange={(event) => {
              setKey(event.target.value);
              setError(null);
            }}
            placeholder="Code administrateur"
            aria-label="Code administrateur"
            autoComplete="current-password"
            disabled={!configured}
            className="field text-center tracking-[0.18em]"
          />

          {error && (
            <p className="text-center text-xs text-carminClair" role="alert">
              {error}
            </p>
          )}

          <button
            type="submit"
            disabled={busy || !key.trim() || !configured}
            className="btn-gold w-full"
          >
            {busy && <Spinner />}
            {busy ? 'Vérification…' : 'Entrer'}
          </button>
        </form>
      </motion.div>
    </div>
  );
}
