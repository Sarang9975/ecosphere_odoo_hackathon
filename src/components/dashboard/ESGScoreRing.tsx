"use client";

import { motion } from "framer-motion";

interface ESGScoreRingProps {
  label: string;
  score: number;
  color: string;
  trackColor?: string;
  size?: number;
  strokeWidth?: number;
}

export function ESGScoreRing({
  label,
  score,
  color,
  trackColor = "rgba(255,255,255,0.05)",
  size = 100,
  strokeWidth = 8,
}: ESGScoreRingProps) {
  const r = (size - strokeWidth) / 2;
  const circumference = 2 * Math.PI * r;
  const dash = (score / 100) * circumference;

  return (
    <div className="flex flex-col items-center gap-2">
      <div className="relative" style={{ width: size, height: size }}>
        <svg width={size} height={size} viewBox={`0 0 ${size} ${size}`} className="-rotate-90">
          {/* Track */}
          <circle
            cx={size / 2}
            cy={size / 2}
            r={r}
            fill="none"
            stroke={trackColor}
            strokeWidth={strokeWidth}
          />
          {/* Progress */}
          <motion.circle
            cx={size / 2}
            cy={size / 2}
            r={r}
            fill="none"
            stroke={color}
            strokeWidth={strokeWidth}
            strokeLinecap="round"
            strokeDasharray={circumference}
            initial={{ strokeDashoffset: circumference }}
            animate={{ strokeDashoffset: circumference - dash }}
            transition={{ duration: 1.5, ease: "easeOut", delay: 0.2 }}
            style={{ filter: `drop-shadow(0 0 6px ${color}80)` }}
          />
        </svg>

        {/* Center value */}
        <div className="absolute inset-0 flex flex-col items-center justify-center">
          <motion.span
            className="font-orbitron font-bold text-slate-100"
            style={{ fontSize: size * 0.22 }}
            initial={{ opacity: 0, scale: 0.5 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.5, delay: 0.8 }}
          >
            {score}
          </motion.span>
        </div>
      </div>
      <p className="text-xs text-muted text-center font-medium leading-tight">{label}</p>
    </div>
  );
}
