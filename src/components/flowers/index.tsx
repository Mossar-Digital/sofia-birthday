import type React from 'react';

import type { FlowerKind } from '@/lib/types';

interface FlowerProps {
  className?: string;
}

const STEM = '#4E6B3A';
const STEM_DARK = '#3C5430';
const LEAF = '#5C7C42';

/** Shared stem, drawn before the petals so it sits behind them. */
function Stem({ leftLeaf = true, rightLeaf = true }: { leftLeaf?: boolean; rightLeaf?: boolean }) {
  return (
    <g>
      <path d="M50 62 Q52 90 50 124" stroke={STEM} strokeWidth="3.4" fill="none" strokeLinecap="round" />
      {leftLeaf && (
        <path d="M50 88 Q33 80 26 92 Q38 100 50 94 Z" fill={LEAF} />
      )}
      {rightLeaf && (
        <path d="M50 104 Q67 96 74 108 Q62 116 50 110 Z" fill={STEM_DARK} />
      )}
    </g>
  );
}

function Rose({ className }: FlowerProps) {
  return (
    <svg viewBox="0 0 100 130" className={className} role="presentation">
      <Stem />
      {/* Outer petals first, then the spiral at the heart */}
      <g>
        <ellipse cx="50" cy="38" rx="26" ry="24" fill="#8E2029" />
        <path d="M24 38 Q30 16 50 14 Q46 30 42 40 Z" fill="#A82B35" />
        <path d="M76 38 Q70 16 50 14 Q54 30 58 40 Z" fill="#A82B35" />
        <path d="M26 46 Q38 62 50 62 Q42 52 38 44 Z" fill="#7A1A23" />
        <path d="M74 46 Q62 62 50 62 Q58 52 62 44 Z" fill="#7A1A23" />
        <ellipse cx="50" cy="37" rx="17" ry="16" fill="#BE3F49" />
        <path
          d="M50 25 Q62 30 60 40 Q58 50 48 49 Q39 48 40 40 Q41 33 50 33 Q56 34 55 39 Q54 44 49 43"
          fill="none"
          stroke="#6E141C"
          strokeWidth="2.1"
          strokeLinecap="round"
        />
        <ellipse cx="50" cy="35" rx="5.5" ry="5" fill="#D8636C" opacity="0.65" />
      </g>
    </svg>
  );
}

function Sunflower({ className }: FlowerProps) {
  // 18 petals laid out in a circle — drawing them by hand would look uneven.
  const petals = Array.from({ length: 18 }, (_, i) => (i * 360) / 18);
  return (
    <svg viewBox="0 0 100 130" className={className} role="presentation">
      <Stem />
      <g>
        {petals.map((angle, i) => (
          <ellipse
            key={angle}
            cx="50"
            cy="14"
            rx="5.2"
            ry="16"
            fill={i % 2 === 0 ? '#E0A62F' : '#C88A22'}
            transform={`rotate(${angle} 50 38)`}
          />
        ))}
        <circle cx="50" cy="38" r="15" fill="#5A3317" />
        <circle cx="50" cy="38" r="11" fill="#40230F" />
        {/* Seeds on a Fermat spiral, the way a real seed head grows */}
        {Array.from({ length: 26 }, (_, i) => {
          const t = i * 2.39996;
          const r = 1.9 * Math.sqrt(i);
          return (
            <circle
              key={i}
              cx={50 + r * Math.cos(t)}
              cy={38 + r * Math.sin(t)}
              r="1.15"
              fill="#7A4A1F"
            />
          );
        })}
      </g>
    </svg>
  );
}

function Tulip({ className }: FlowerProps) {
  return (
    <svg viewBox="0 0 100 130" className={className} role="presentation">
      <path d="M50 54 Q52 90 50 124" stroke={STEM} strokeWidth="3.4" fill="none" strokeLinecap="round" />
      <path d="M50 84 Q30 74 22 92 Q36 104 50 92 Z" fill={LEAF} />
      <path d="M50 100 Q70 92 77 110 Q62 120 50 108 Z" fill={STEM_DARK} />
      <g>
        {/* Closed cup. The three lobes overlap generously — without that,
            the dark background would show through as two hard slits. */}
        <path d="M30 26 Q28 54 50 64 Q72 54 70 26 Q60 38 50 36 Q40 38 30 26 Z" fill="#B5333F" />
        <path d="M30 26 Q31 12 41 7 Q40 24 48 36 Q37 37 30 26 Z" fill="#C34350" />
        <path d="M70 26 Q69 12 59 7 Q60 24 52 36 Q63 37 70 26 Z" fill="#C34350" />
        <path d="M41 7 Q50 2 59 7 Q57 26 50 38 Q43 26 41 7 Z" fill="#D45A64" />
        <ellipse cx="50" cy="50" rx="13" ry="10" fill="#8E2029" opacity="0.26" />
      </g>
    </svg>
  );
}

export const FLOWER_ART: Record<FlowerKind, (props: FlowerProps) => React.ReactElement> = {
  rose: Rose,
  sunflower: Sunflower,
  tulip: Tulip,
};

/** Accent colour per flower, used by the modal. */
export const FLOWER_ACCENT: Record<FlowerKind, string> = {
  rose: '#BE3F49',
  sunflower: '#E0A62F',
  tulip: '#C9424E',
};
