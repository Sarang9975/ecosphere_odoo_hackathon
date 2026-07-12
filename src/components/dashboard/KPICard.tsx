"use client";

import { motion } from "framer-motion";
import { TrendingUp, TrendingDown, Minus } from "lucide-react";

interface KPICardProps {
  title: string;
  value: string | number;
  unit?: string;
  change?: number;
  changeLabel?: string;
  icon: React.ReactNode;
  color: "emerald" | "cyan" | "amber" | "purple" | "rose";
  delay?: number;
}

const COLOR_MAP = {
  emerald: {
    card: "glass-card-emerald",
    value: "text-emerald-400",
    glow: "rgba(16,185,129,0.2)",
    bg: "rgba(16,185,129,0.08)",
  },
  cyan: {
    card: "glass-card-cyan",
    value: "text-cyan-400",
    glow: "rgba(6,182,212,0.2)",
    bg: "rgba(6,182,212,0.08)",
  },
  amber: {
    card: "glass-card-amber",
    value: "text-amber-400",
    glow: "rgba(245,158,11,0.2)",
    bg: "rgba(245,158,11,0.08)",
  },
  purple: {
    card: "glass-card-purple",
    value: "text-purple-400",
    glow: "rgba(139,92,246,0.2)",
    bg: "rgba(139,92,246,0.08)",
  },
  rose: {
    card: "glass-card",
    value: "text-rose-400",
    glow: "rgba(244,63,94,0.2)",
    bg: "rgba(244,63,94,0.08)",
  },
};

export function KPICard({ title, value, unit, change, changeLabel, icon, color, delay = 0 }: KPICardProps) {
  const c = COLOR_MAP[color];
  const trendPositive = change !== undefined && change > 0;
  const trendNeutral = change === 0;

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4, delay, ease: "easeOut" }}
      className={`${c.card} p-5 relative overflow-hidden group cursor-default`}
      whileHover={{ y: -2 }}
    >
      {/* Background icon */}
      <div
        className="absolute right-4 top-4 opacity-10 group-hover:opacity-20 transition-opacity"
        style={{ transform: "scale(2.5)", transformOrigin: "right top" }}
      >
        {icon}
      </div>

      {/* Icon */}
      <div
        className="w-10 h-10 rounded-xl flex items-center justify-center mb-4"
        style={{ background: c.bg, boxShadow: `0 0 15px ${c.glow}` }}
      >
        <span style={{ filter: `drop-shadow(0 0 4px ${c.glow})` }}>{icon}</span>
      </div>

      {/* Value */}
      <div className="flex items-end gap-1.5 mb-1">
        <motion.span
          className={`font-orbitron text-2xl font-bold ${c.value} stat-number`}
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: delay + 0.2 }}
        >
          {value}
        </motion.span>
        {unit && <span className="text-xs text-muted mb-0.5">{unit}</span>}
      </div>

      <p className="text-xs text-slate-400 font-medium">{title}</p>

      {/* Trend */}
      {change !== undefined && (
        <div className="flex items-center gap-1 mt-2">
          {trendNeutral ? (
            <Minus size={10} className="text-slate-500" />
          ) : trendPositive ? (
            <TrendingUp size={10} className="text-emerald-400" />
          ) : (
            <TrendingDown size={10} className="text-rose-400" />
          )}
          <span
            className={`text-xs font-medium ${
              trendNeutral ? "text-slate-500" : trendPositive ? "text-emerald-400" : "text-rose-400"
            }`}
          >
            {change > 0 ? "+" : ""}
            {change}%
          </span>
          {changeLabel && <span className="text-xs text-muted">{changeLabel}</span>}
        </div>
      )}

      {/* Bottom glow line */}
      <motion.div
        className="absolute bottom-0 left-0 right-0 h-px"
        style={{ background: `linear-gradient(90deg, transparent, ${c.glow}, transparent)` }}
        initial={{ scaleX: 0 }}
        animate={{ scaleX: 1 }}
        transition={{ delay: delay + 0.3, duration: 0.8 }}
      />
    </motion.div>
  );
}
