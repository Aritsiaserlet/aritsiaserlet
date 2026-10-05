import React, { useEffect, useRef } from 'react';
import { useReducedMotion, useIsMobile } from '../../hooks/useDevice';

interface Particle {
  x: number;
  y: number;
  size: number;
  speedY: number;
  speedX: number;
  baseOpacity: number;
  glowing: boolean;
  pulsePhase: number;
  pulseSpeed: number;
  swayFactor: number;
}

export const FireflyCanvas: React.FC = () => {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const reducedMotion = useReducedMotion();
  const isMobile = useIsMobile();

  useEffect(() => {
    if (reducedMotion) return;
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    let W = (canvas.width = window.innerWidth);
    let H = (canvas.height = window.innerHeight);

    function resize() {
      if (!canvas) return;
      W = canvas.width = window.innerWidth;
      H = canvas.height = window.innerHeight;
    }
    window.addEventListener('resize', resize);

    function rb(a: number, b: number) {
      return a + Math.random() * (b - a);
    }

    function createParticle(yStart?: number): Particle {
      const size = Math.floor(rb(2, 6)) * 2;
      return {
        x: Math.random() * W,
        y: yStart ?? H + size,
        size,
        speedY: rb(0.5, 2.5),
        speedX: rb(-0.5, 0.5),
        baseOpacity: rb(0.1, 0.8),
        glowing: Math.random() < 0.25,
        pulsePhase: Math.random() * Math.PI * 2,
        pulseSpeed: rb(0.02, 0.06),
        swayFactor: rb(0.2, 0.8),
      };
    }

    const particleCount = isMobile ? 15 : 35;
    const particles: Particle[] = [];
    for (let i = 0; i < particleCount; i++) {
      particles.push(createParticle(Math.random() * H));
    }

    const FPS_INTERVAL = 1000 / 30;
    let lastFrame = 0;
    let animId: number | null = null;

    function animateParticles(ts: number) {
      if (document.hidden) {
        animId = null;
        return;
      }
      if (ts - lastFrame < FPS_INTERVAL) {
        animId = requestAnimationFrame(animateParticles);
        return;
      }
      lastFrame = ts;
      if (!ctx) return;
      ctx.clearRect(0, 0, W, H);

      const isDark = document.documentElement.classList.contains('dark');
      const colorPrefix = isDark ? '255,255,255' : '56,107,64';
      const fireflyPrefix = isDark ? '210,255,150' : '100,180,60';

      particles.forEach((p, i) => {
        p.y -= p.speedY;
        p.x += p.speedX + (p.glowing ? Math.sin(p.pulsePhase) * p.swayFactor : 0);
        p.pulsePhase += p.pulseSpeed;
        ctx.beginPath();
        if (p.glowing) {
          const pulseOpacity = p.baseOpacity + Math.sin(p.pulsePhase) * 0.5;
          const finalOpacity = Math.max(0.1, Math.min(1, pulseOpacity));
          ctx.save();
          ctx.shadowBlur = p.size * 5;
          ctx.shadowColor = `rgba(${fireflyPrefix},${finalOpacity})`;
          ctx.fillStyle = `rgba(${fireflyPrefix},${finalOpacity})`;
          ctx.arc(Math.floor(p.x), Math.floor(p.y), p.size / 2, 0, Math.PI * 2);
          ctx.fill();
          ctx.restore();
        } else {
          ctx.fillStyle = `rgba(${colorPrefix},${p.baseOpacity})`;
          ctx.arc(Math.floor(p.x), Math.floor(p.y), p.size / 2, 0, Math.PI * 2);
          ctx.fill();
        }
        if (p.y + p.size < 0) particles[i] = createParticle();
      });

      animId = requestAnimationFrame(animateParticles);
    }

    animId = requestAnimationFrame(animateParticles);

    const onVisibilityChange = () => {
      if (!document.hidden && !animId) {
        resize();
        lastFrame = performance.now();
        animId = requestAnimationFrame(animateParticles);
      }
    };
    document.addEventListener('visibilitychange', onVisibilityChange);

    return () => {
      if (animId) cancelAnimationFrame(animId);
      window.removeEventListener('resize', resize);
      document.removeEventListener('visibilitychange', onVisibilityChange);
    };
  }, [reducedMotion, isMobile]);

  if (reducedMotion) return null;

  return <canvas id="windCanvas" ref={canvasRef} className="wind-canvas" aria-hidden="true" />;
};
