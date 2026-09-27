'use client';

import { useCallback, useEffect, useState } from 'react';

import Editor from '@/components/studio/Editor';
import StudioLogin from '@/components/studio/StudioLogin';
import { Spinner } from '@/components/studio/ui';
import { mergeConfig } from '@/lib/defaults';
import type { StoreBackend } from '@/lib/store';
import type { SiteConfig } from '@/lib/types';

interface Session {
  authenticated: boolean;
  configured: boolean;
}

export default function Studio() {
  const [session, setSession] = useState<Session | null>(null);
  const [config, setConfig] = useState<SiteConfig | null>(null);
  const [backend, setBackend] = useState<StoreBackend>('file');

  /** La config complète (mot de passe inclus) n'est servie qu'aux sessions admin. */
  const loadConfig = useCallback(async () => {
    const response = await fetch('/api/config', { cache: 'no-store' });
    const payload = (await response.json()) as { config?: unknown; backend?: StoreBackend };
    setConfig(mergeConfig(payload.config));
    if (payload.backend) setBackend(payload.backend);
  }, []);

  useEffect(() => {
    void (async () => {
      try {
        const response = await fetch('/api/admin/login', { cache: 'no-store' });
        const state = (await response.json()) as Session;
        setSession(state);
        if (state.authenticated) await loadConfig();
      } catch {
        setSession({ authenticated: false, configured: true });
      }
    })();
  }, [loadConfig]);

  const onAuthenticated = useCallback(async () => {
    setSession((current) => ({ configured: true, ...current, authenticated: true }));
    await loadConfig();
  }, [loadConfig]);

  const signOut = useCallback(async () => {
    await fetch('/api/admin/logout', { method: 'POST' });
    setConfig(null);
    setSession({ authenticated: false, configured: true });
  }, []);

  if (!session) {
    return (
      <div className="flex min-h-dvh items-center justify-center">
        <Spinner className="h-6 w-6 text-dore/70" />
      </div>
    );
  }

  if (!session.authenticated) {
    return (
      <StudioLogin configured={session.configured} onAuthenticated={() => void onAuthenticated()} />
    );
  }

  if (!config) {
    return (
      <div className="flex min-h-dvh items-center justify-center">
        <Spinner className="h-6 w-6 text-dore/70" />
      </div>
    );
  }

  return (
    <Editor
      initialConfig={config}
      initialBackend={backend}
      onSignOut={() => void signOut()}
    />
  );
}
