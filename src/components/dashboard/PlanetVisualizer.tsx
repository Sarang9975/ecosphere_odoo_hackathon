"use client";

import { useEffect, useRef, useState } from "react";

interface Particle {
  x: number;
  y: number;
  vx: number;
  vy: number;
  r: number;
  alpha: number;
  color: string;
  life: number;
  maxLife: number;
}

interface PlanetVisualizerProps {
  health: number; // 0-100, lower = more red/depleted
  carbonLoad: number; // 0-100
  csrBoost: number; // 0-100
}

export function PlanetVisualizer({ health = 72, carbonLoad = 45, csrBoost = 60 }: PlanetVisualizerProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const particles = useRef<Particle[]>([]);
  const animFrame = useRef<number>(0);
  const time = useRef(0);

  const getHealthColor = (h: number) => {
    if (h > 70) return { r: 16, g: 185, b: 129 };
    if (h > 40) return { r: 245, g: 158, b: 11 };
    return { r: 244, g: 63, b: 94 };
  };

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d")!;
    const W = canvas.width;
    const H = canvas.height;
    const cx = W / 2;
    const cy = H / 2;
    const R = Math.min(W, H) * 0.32;

    const spawnParticle = (type: "carbon" | "csr") => {
      const angle = Math.random() * Math.PI * 2;
      const dist = R + 10 + Math.random() * 20;
      particles.current.push({
        x: cx + Math.cos(angle) * dist,
        y: cy + Math.sin(angle) * dist,
        vx: type === "csr" ? Math.cos(angle) * -0.4 : Math.cos(angle + Math.PI) * 0.3,
        vy: type === "csr" ? Math.sin(angle) * -0.4 : Math.sin(angle + Math.PI) * 0.3,
        r: type === "carbon" ? 2.5 : 2,
        alpha: 0.8,
        color: type === "carbon" ? `rgba(244,63,94,` : `rgba(16,185,129,`,
        life: 0,
        maxLife: 80 + Math.random() * 60,
      });
    };

    const draw = () => {
      ctx.clearRect(0, 0, W, H);
      time.current += 0.012;
      const t = time.current;
      const hc = getHealthColor(health);

      // ── Orbit rings ──
      for (let ring = 1; ring <= 2; ring++) {
        ctx.beginPath();
        ctx.ellipse(cx, cy, R + ring * 28, (R + ring * 28) * 0.28, -0.3, 0, Math.PI * 2);
        ctx.strokeStyle = `rgba(56,189,248,${0.05 - ring * 0.015})`;
        ctx.lineWidth = 0.8;
        ctx.stroke();
      }

      // ── Planet glow halo ──
      const gradient = ctx.createRadialGradient(cx, cy, R * 0.6, cx, cy, R * 1.6);
      gradient.addColorStop(0, `rgba(${hc.r},${hc.g},${hc.b},0.08)`);
      gradient.addColorStop(1, "transparent");
      ctx.fillStyle = gradient;
      ctx.beginPath();
      ctx.arc(cx, cy, R * 1.6, 0, Math.PI * 2);
      ctx.fill();

      // ── Planet body ──
      const bodyGrad = ctx.createRadialGradient(cx - R * 0.3, cy - R * 0.3, R * 0.1, cx, cy, R);
      bodyGrad.addColorStop(0, `rgba(${hc.r + 40},${hc.g + 40},${hc.b + 40},0.9)`);
      bodyGrad.addColorStop(0.5, `rgba(${hc.r},${hc.g},${hc.b},0.7)`);
      bodyGrad.addColorStop(1, `rgba(${Math.max(0, hc.r - 40)},${Math.max(0, hc.g - 40)},${Math.max(0, hc.b - 40)},0.6)`);
      ctx.beginPath();
      ctx.arc(cx, cy, R, 0, Math.PI * 2);
      ctx.fillStyle = bodyGrad;
      ctx.fill();

      // ── Surface texture (animated continents) ──
      ctx.save();
      ctx.beginPath();
      ctx.arc(cx, cy, R, 0, Math.PI * 2);
      ctx.clip();

      for (let i = 0; i < 5; i++) {
        const bx = cx + Math.cos(t * 0.1 + i * 1.3) * R * 0.35;
        const by = cy + Math.sin(t * 0.08 + i * 1.1) * R * 0.3;
        const br = R * (0.15 + i * 0.04);
        const contGrad = ctx.createRadialGradient(bx, by, 0, bx, by, br);
        contGrad.addColorStop(0, `rgba(${hc.r},${hc.g + 20},${hc.b},0.3)`);
        contGrad.addColorStop(1, "transparent");
        ctx.beginPath();
        ctx.arc(bx, by, br, 0, Math.PI * 2);
        ctx.fillStyle = contGrad;
        ctx.fill();
      }
      ctx.restore();

      // ── Atmosphere edge ──
      const atmGrad = ctx.createRadialGradient(cx, cy, R - 4, cx, cy, R + 14);
      atmGrad.addColorStop(0, "transparent");
      atmGrad.addColorStop(0.5, `rgba(${hc.r},${hc.g},${hc.b},0.15)`);
      atmGrad.addColorStop(1, "transparent");
      ctx.beginPath();
      ctx.arc(cx, cy, R + 9, 0, Math.PI * 2);
      ctx.fillStyle = atmGrad;
      ctx.fill();

      // ── Goal ring (arc around planet) ──
      const goalAngle = ((csrBoost / 100) * 360 * Math.PI) / 180;
      ctx.beginPath();
      ctx.arc(cx, cy, R + 20, -Math.PI / 2, -Math.PI / 2 + goalAngle);
      ctx.strokeStyle = `rgba(16,185,129,0.7)`;
      ctx.lineWidth = 3;
      ctx.lineCap = "round";
      ctx.stroke();

      // ── Satellite dot on orbit ──
      const satAngle = t * 0.4;
      const satX = cx + Math.cos(satAngle) * (R + 45);
      const satY = cy + Math.sin(satAngle) * (R + 45) * 0.28;
      ctx.beginPath();
      ctx.arc(satX, satY, 3, 0, Math.PI * 2);
      ctx.fillStyle = "#06b6d4";
      ctx.shadowColor = "#06b6d4";
      ctx.shadowBlur = 8;
      ctx.fill();
      ctx.shadowBlur = 0;

      // ── Spawn & draw particles ──
      if (Math.random() < carbonLoad / 300) spawnParticle("carbon");
      if (Math.random() < csrBoost / 400) spawnParticle("csr");

      particles.current = particles.current.filter((p) => p.life < p.maxLife);
      for (const p of particles.current) {
        p.x += p.vx;
        p.y += p.vy;
        p.life++;
        const a = p.alpha * (1 - p.life / p.maxLife);
        ctx.beginPath();
        ctx.arc(p.x, p.y, p.r, 0, Math.PI * 2);
        ctx.fillStyle = p.color + a + ")";
        ctx.fill();
      }

      // ── Health indicator text ──
      ctx.font = "bold 20px Orbitron, monospace";
      ctx.fillStyle = `rgba(${hc.r},${hc.g},${hc.b},0.9)`;
      ctx.textAlign = "center";
      ctx.textBaseline = "middle";
      ctx.shadowColor = `rgba(${hc.r},${hc.g},${hc.b},0.5)`;
      ctx.shadowBlur = 10;
      ctx.fillText(`${health}`, cx, cy);
      ctx.font = "10px Inter, sans-serif";
      ctx.fillStyle = "rgba(255,255,255,0.4)";
      ctx.shadowBlur = 0;
      ctx.fillText("ESG SCORE", cx, cy + 18);

      animFrame.current = requestAnimationFrame(draw);
    };

    draw();
    return () => cancelAnimationFrame(animFrame.current);
  }, [health, carbonLoad, csrBoost]);

  return (
    <div className="planet-container w-full h-full flex flex-col items-center justify-center">
      <canvas
        ref={canvasRef}
        width={280}
        height={280}
        className="max-w-full"
        style={{ imageRendering: "pixelated" }}
      />
      {/* Legend */}
      <div className="flex items-center gap-4 mt-3">
        <div className="flex items-center gap-1.5">
          <span className="w-2 h-2 rounded-full bg-rose-400" />
          <span className="text-xs text-muted">CO₂ emissions</span>
        </div>
        <div className="flex items-center gap-1.5">
          <span className="w-2 h-2 rounded-full bg-emerald-400" />
          <span className="text-xs text-muted">CSR activity</span>
        </div>
        <div className="flex items-center gap-1.5">
          <span className="w-2 h-2 rounded-full bg-cyan-400" />
          <span className="text-xs text-muted">Goal ring</span>
        </div>
      </div>
    </div>
  );
}
