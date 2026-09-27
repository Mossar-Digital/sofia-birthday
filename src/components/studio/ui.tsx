'use client';

import { Loader2 } from 'lucide-react';

interface FieldProps {
  label: string;
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
  hint?: string;
  type?: 'text' | 'password';
}

export function TextField({ label, value, onChange, placeholder, hint, type = 'text' }: FieldProps) {
  return (
    <label className="block">
      <span className="label">{label}</span>
      <input
        type={type}
        value={value}
        onChange={(event) => onChange(event.target.value)}
        placeholder={placeholder}
        autoComplete="off"
        spellCheck={false}
        className="field"
      />
      {hint && <span className="mt-1.5 block text-[11px] leading-snug text-latte/50">{hint}</span>}
    </label>
  );
}

interface AreaProps extends Omit<FieldProps, 'type'> {
  rows?: number;
}

export function TextArea({ label, value, onChange, placeholder, hint, rows = 5 }: AreaProps) {
  return (
    <label className="block">
      <span className="label">{label}</span>
      <textarea
        value={value}
        onChange={(event) => onChange(event.target.value)}
        placeholder={placeholder}
        rows={rows}
        className="field resize-y leading-relaxed"
      />
      {hint && <span className="mt-1.5 block text-[11px] leading-snug text-latte/50">{hint}</span>}
    </label>
  );
}

export function Card({
  title,
  description,
  children,
  aside,
}: {
  title?: string;
  description?: string;
  children: React.ReactNode;
  aside?: React.ReactNode;
}) {
  return (
    <section className="rounded-2xl border border-dore/18 bg-cacao/40 p-5 sm:p-6">
      {(title || aside) && (
        <header className="mb-5 flex items-start justify-between gap-4">
          <div>
            {title && <h3 className="font-serif text-lg text-creme">{title}</h3>}
            {description && (
              <p className="mt-1 text-xs leading-relaxed text-latte/60">{description}</p>
            )}
          </div>
          {aside}
        </header>
      )}
      {children}
    </section>
  );
}

export function Toggle({
  label,
  description,
  checked,
  onChange,
}: {
  label: string;
  description?: string;
  checked: boolean;
  onChange: (checked: boolean) => void;
}) {
  return (
    <button
      type="button"
      role="switch"
      aria-checked={checked}
      onClick={() => onChange(!checked)}
      className="flex w-full items-center justify-between gap-4 rounded-xl border border-dore/20 bg-espresso/35 px-4 py-3.5 text-left transition hover:border-dore/40"
    >
      <span>
        <span className="block text-sm text-creme/90">{label}</span>
        {description && <span className="mt-0.5 block text-[11px] text-latte/55">{description}</span>}
      </span>
      <span
        className={`relative h-6 w-11 shrink-0 rounded-full transition ${
          checked ? 'bg-dore' : 'bg-moka'
        }`}
      >
        <span
          className={`absolute top-0.5 h-5 w-5 rounded-full bg-parchemin shadow transition-all ${
            checked ? 'left-[1.4rem]' : 'left-0.5'
          }`}
        />
      </span>
    </button>
  );
}

export function Spinner({ className = 'h-4 w-4' }: { className?: string }) {
  return <Loader2 className={`${className} animate-spin`} />;
}

export function Notice({ tone, children }: { tone: 'info' | 'warn'; children: React.ReactNode }) {
  const styles =
    tone === 'warn'
      ? 'border-carminClair/35 bg-carmin/12 text-creme/85'
      : 'border-dore/25 bg-dore/8 text-latte/80';
  return (
    <p className={`rounded-xl border px-4 py-3 text-xs leading-relaxed ${styles}`}>{children}</p>
  );
}
