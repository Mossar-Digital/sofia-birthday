'use client';

import { AnimatePresence, motion } from 'framer-motion';
import { Heart, KeyRound, Lightbulb, Loader2 } from 'lucide-react';
import { useEffect, useRef, useState } from 'react';

interface PasswordGateProps {
  hint: string;
  onUnlocked: () => void;
}

const HEART_PATH =
  'M12 21s-7.5-4.7-9.6-9.2C.7 8.3 2.6 4.5 6.2 4.5c2 0 3.4 1.1 4 2 .6-.9 2-2 4-2 3.6 0 5.5 3.8 3.8 7.3C19.5 16.3 12 21 12 21z';

/** A quiet little firework: carmine hearts, then gold flecks. */
async function celebrate() {
  const confetti = (await import('canvas-confetti')).default;
  const heart = confetti.shapeFromPath({ path: HEART_PATH });

  confetti({
    particleCount: 26,
    spread: 62,
    startVelocity: 34,
    origin: { y: 0.62 },
    shapes: [heart],
    scalar: 1.5,
    colors: ['#BE4550', '#9B2B34', '#D8636C'],
    ticks: 220,
  });

  setTimeout(() => {
    confetti({
      particleCount: 55,
      spread: 88,
      startVelocity: 28,
      decay: 0.92,
      origin: { y: 0.58 },
      colors: ['#C8A34C', '#E6C879', '#F0DFC6'],
      scalar: 0.85,
      ticks: 260,
    });
  }, 220);
}

export default function PasswordGate({ hint, onUnlocked }: PasswordGateProps) {
  const [value, setValue] = useState('');
  const [checking, setChecking] = useState(false);
  const [error, setError] = useState(false);
  const [showHint, setShowHint] = useState(false);
  const [opening, setOpening] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    // Don't force the keyboard open on a phone — focus on desktop only.
    if (window.matchMedia('(min-width: 768px)').matches) inputRef.current?.focus();
  }, []);

  async function submit(event: React.FormEvent) {
    event.preventDefault();
    if (checking || !value.trim()) return;

    setChecking(true);
    setError(false);

    try {
      const response = await fetch('/api/unlock', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ password: value }),
      });
      const { ok } = (await response.json()) as { ok: boolean };

      if (!ok) {
        setError(true);
        setValue('');
        setChecking(false);
        return;
      }

      setOpening(true);
      void celebrate();
      // Let the opening animation play out before revealing the page.
      setTimeout(onUnlocked, 1150);
    } catch {
      setError(true);
      setChecking(false);
    }
  }

  return (
    <motion.div
      className="fixed inset-0 z-50 flex items-center justify-center px-6"
      initial={{ opacity: 1 }}
      animate={opening ? { opacity: 0 } : { opacity: 1 }}
      transition={{ duration: 0.9, delay: opening ? 0.45 : 0, ease: 'easeInOut' }}
    >
      {/* Solid veil: nothing of the page shows through before it opens. */}
      <motion.div
        className="absolute inset-0 bg-espresso"
        style={{
          backgroundImage:
            'radial-gradient(120% 80% at 50% 12%, rgba(168,124,79,0.26), transparent 60%), linear-gradient(180deg,#231309,#1a0d06)',
        }}
        animate={opening ? { scale: 1.12, opacity: 0 } : {}}
        transition={{ duration: 1.1, ease: [0.22, 1, 0.36, 1] }}
      />

      {/* Gold bloom that widens at the moment of unlocking */}
      <AnimatePresence>
        {opening && (
          <motion.div
            className="pointer-events-none absolute left-1/2 top-1/2 h-40 w-40 -translate-x-1/2 -translate-y-1/2 rounded-full"
            style={{
              background: 'radial-gradient(circle, rgba(230,200,121,0.55), transparent 70%)',
            }}
            initial={{ scale: 0.2, opacity: 0 }}
            animate={{ scale: 9, opacity: [0, 0.9, 0] }}
            transition={{ duration: 1.2, ease: 'easeOut' }}
          />
        )}
      </AnimatePresence>

      <motion.div
        className="relative w-full max-w-sm text-center"
        animate={opening ? { scale: 1.08, opacity: 0, y: -18 } : {}}
        transition={{ duration: 0.75, ease: 'easeOut' }}
      >
        <motion.div
          initial={{ opacity: 0, y: 18 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.9, ease: 'easeOut' }}
        >
          <motion.div
            className="mx-auto mb-7 flex h-16 w-16 items-center justify-center rounded-full border border-dore/35 bg-moka/40"
            animate={{ scale: [1, 1.07, 1] }}
            transition={{ duration: 3.4, repeat: Infinity, ease: 'easeInOut' }}
          >
            <Heart className="h-7 w-7 text-carminClair" strokeWidth={1.6} fill="currentColor" />
          </motion.div>

          <p className="mb-2 text-[11px] uppercase tracking-[0.34em] text-dore/70">For you</p>
          <h1 className="heading-serif mb-3 text-3xl text-creme">Something is waiting</h1>
          <p className="mx-auto mb-9 max-w-[19rem] text-sm leading-relaxed text-latte/75">
            One word opens it. You already know it.
          </p>

          <form onSubmit={submit} className="space-y-4">
            <motion.div
              animate={error ? { x: [0, -9, 9, -6, 6, 0] } : {}}
              transition={{ duration: 0.45 }}
            >
              <div className="relative">
                <KeyRound className="pointer-events-none absolute left-4 top-1/2 h-4 w-4 -translate-y-1/2 text-dore/55" />
                <input
                  ref={inputRef}
                  type="password"
                  inputMode="text"
                  autoComplete="off"
                  autoCapitalize="none"
                  spellCheck={false}
                  value={value}
                  onChange={(event) => {
                    setValue(event.target.value);
                    setError(false);
                  }}
                  placeholder="The password"
                  aria-label="Password"
                  aria-invalid={error}
                  className={`field pl-11 text-center tracking-[0.2em] ${
                    error ? 'border-carminClair/70' : ''
                  }`}
                />
              </div>
            </motion.div>

            <AnimatePresence>
              {error && (
                <motion.p
                  initial={{ opacity: 0, height: 0 }}
                  animate={{ opacity: 1, height: 'auto' }}
                  exit={{ opacity: 0, height: 0 }}
                  className="text-xs text-carminClair"
                  role="alert"
                >
                  That&apos;s not it. Try again, take your time.
                </motion.p>
              )}
            </AnimatePresence>

            <button type="submit" disabled={checking || !value.trim()} className="btn-gold w-full">
              {checking ? <Loader2 className="h-4 w-4 animate-spin" /> : null}
              {checking ? 'One moment…' : 'Open'}
            </button>
          </form>

          <div className="mt-7">
            <button
              type="button"
              onClick={() => setShowHint((current) => !current)}
              className="inline-flex items-center gap-2 text-[11px] uppercase tracking-[0.2em] text-latte/50 transition hover:text-dore/80"
              aria-expanded={showHint}
            >
              <Lightbulb className="h-3.5 w-3.5" />
              {showHint ? 'Hide the hint' : 'Need a hint?'}
            </button>

            <AnimatePresence>
              {showHint && (
                <motion.p
                  initial={{ opacity: 0, y: -6, height: 0 }}
                  animate={{ opacity: 1, y: 0, height: 'auto' }}
                  exit={{ opacity: 0, y: -6, height: 0 }}
                  transition={{ duration: 0.4 }}
                  className="mx-auto mt-4 max-w-[17rem] font-serif text-sm italic leading-relaxed text-creme/80"
                >
                  “{hint}”
                </motion.p>
              )}
            </AnimatePresence>
          </div>
        </motion.div>
      </motion.div>
    </motion.div>
  );
}
