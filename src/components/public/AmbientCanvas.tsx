'use client';

import { useEffect, useRef } from 'react';

type Shape = 'petal' | 'heart';

interface Particle {
  x: number;
  y: number;
  size: number;
  speedY: number;
  drift: number;
  angle: number;
  spin: number;
  sway: number;
  swaySpeed: number;
  opacity: number;
  color: string;
  shape: Shape;
}

const PETAL_COLORS = ['#BE4550', '#9B2B34', '#C8A34C', '#E6C879', '#C9A47C', '#A87C4F'];
const HEART_COLORS = ['#BE4550', '#9B2B34', '#C8A34C'];

function drawPetal(ctx: CanvasRenderingContext2D, size: number) {
  // Two mirrored curves: an almond petal, more organic than an ellipse.
  ctx.beginPath();
  ctx.moveTo(0, -size);
  ctx.bezierCurveTo(size * 0.75, -size * 0.45, size * 0.55, size * 0.6, 0, size);
  ctx.bezierCurveTo(-size * 0.55, size * 0.6, -size * 0.75, -size * 0.45, 0, -size);
  ctx.closePath();
  ctx.fill();
}

function drawHeart(ctx: CanvasRenderingContext2D, size: number) {
  const s = size * 0.92;
  ctx.beginPath();
  ctx.moveTo(0, s * 0.72);
  ctx.bezierCurveTo(-s * 1.5, -s * 0.28, -s * 0.52, -s * 1.28, 0, -s * 0.44);
  ctx.bezierCurveTo(s * 0.52, -s * 1.28, s * 1.5, -s * 0.28, 0, s * 0.72);
  ctx.closePath();
  ctx.fill();
}

/**
 * Petals and hearts drifting slowly down behind the page. Purely decorative:
 * hidden from screen readers, and switched off when the visitor has asked
 * for reduced motion.
 */
export default function AmbientCanvas({ density = 26 }: { density?: number }) {
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) return;

    let width = 0;
    let height = 0;
    let particles: Particle[] = [];
    let frame = 0;
    let lastTime = performance.now();

    const make = (randomY: boolean): Particle => {
      const shape: Shape = Math.random() < 0.28 ? 'heart' : 'petal';
      const palette = shape === 'heart' ? HEART_COLORS : PETAL_COLORS;
      return {
        x: Math.random() * width,
        y: randomY ? Math.random() * height : -40,
        size: shape === 'heart' ? 4 + Math.random() * 5 : 5 + Math.random() * 8,
        speedY: 12 + Math.random() * 26,
        drift: (Math.random() - 0.5) * 16,
        angle: Math.random() * Math.PI * 2,
        spin: (Math.random() - 0.5) * 1.1,
        sway: Math.random() * Math.PI * 2,
        swaySpeed: 0.5 + Math.random() * 0.9,
        opacity: 0.16 + Math.random() * 0.32,
        color: palette[Math.floor(Math.random() * palette.length)],
        shape,
      };
    };

    const resize = () => {
      const dpr = Math.min(window.devicePixelRatio || 1, 2);
      width = window.innerWidth;
      height = window.innerHeight;
      canvas.width = Math.floor(width * dpr);
      canvas.height = Math.floor(height * dpr);
      canvas.style.width = `${width}px`;
      canvas.style.height = `${height}px`;
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);

      // Fewer particles on a small screen: mobile first.
      const count = Math.round(density * Math.min(1, Math.max(0.55, width / 900)));
      particles = Array.from({ length: count }, () => make(true));
    };

    const render = (now: number) => {
      // Delta in seconds, capped to avoid a jump after a backgrounded tab.
      const dt = Math.min((now - lastTime) / 1000, 0.05);
      lastTime = now;

      ctx.clearRect(0, 0, width, height);

      for (const p of particles) {
        p.y += p.speedY * dt;
        p.sway += p.swaySpeed * dt;
        p.x += (p.drift + Math.sin(p.sway) * 14) * dt;
        p.angle += p.spin * dt;

        if (p.y - p.size > height) Object.assign(p, make(false));
        if (p.x < -40) p.x = width + 40;
        else if (p.x > width + 40) p.x = -40;

        ctx.save();
        ctx.translate(p.x, p.y);
        ctx.rotate(p.angle);
        ctx.globalAlpha = p.opacity;
        ctx.fillStyle = p.color;
        if (p.shape === 'heart') drawHeart(ctx, p.size);
        else drawPetal(ctx, p.size);
        ctx.restore();
      }

      frame = requestAnimationFrame(render);
    };

    resize();
    frame = requestAnimationFrame(render);
    window.addEventListener('resize', resize);

    return () => {
      cancelAnimationFrame(frame);
      window.removeEventListener('resize', resize);
    };
  }, [density]);

  return (
    <canvas
      ref={canvasRef}
      aria-hidden
      className="pointer-events-none fixed inset-0 z-0 h-full w-full"
    />
  );
}
