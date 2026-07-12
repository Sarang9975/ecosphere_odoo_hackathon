"use client";

import { useState, useEffect } from "react";
import { getDashboardData } from "@/actions/dashboard";
import { PlanetVisualizer } from "@/components/dashboard/PlanetVisualizer";
import { CarbonPulseTicker } from "@/components/dashboard/CarbonPulseTicker";
import { KPICard } from "@/components/dashboard/KPICard";
import { ESGScoreRing } from "@/components/dashboard/ESGScoreRing";
import { motion } from "framer-motion";
import dynamic from "next/dynamic";
import Link from "next/link";
import {
  Leaf,
  Users,
  Shield,
  Trophy,
  AlertTriangle,
  Activity,
  TrendingUp,
  Zap,
  Globe,
  ExternalLink,
} from "lucide-react";

// Lazy-load 3D Earth for dashboard preview (no SSR)
const EarthPreview = dynamic(
  () => import("@/components/earth/EarthVisualizer").then((m) => m.EarthVisualizer),
  {
    ssr: false,
    loading: () => (
      <div className="w-full h-full flex items-center justify-center" style={{ background: "#030a14" }}>
        <div className="text-center">
          <div className="text-4xl mb-2 animate-pulse">🌍</div>
          <p className="font-orbitron text-xs text-emerald-400">Loading 3D Earth...</p>
        </div>
      </div>
    ),
  }
);
import {
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  BarChart,
  Bar,
  Cell,
} from "recharts";

const emissionsTrend = [
  { month: "Jan", co2: 420, target: 400 },
  { month: "Feb", co2: 390, target: 390 },
  { month: "Mar", co2: 360, target: 380 },
  { month: "Apr", co2: 345, target: 370 },
  { month: "May", co2: 310, target: 360 },
  { month: "Jun", co2: 295, target: 350 },
  { month: "Jul", co2: 280, target: 340 },
];

const deptScores = [
  { name: "Engineering", score: 88 },
  { name: "Marketing", score: 82 },
  { name: "HR", score: 79 },
  { name: "Finance", score: 74 },
  { name: "Operations", score: 61 },
];

const DEPT_COLORS = ["#10b981", "#06b6d4", "#8b5cf6", "#f59e0b", "#f43f5e"];

const CustomTooltip = ({ active, payload, label }: any) => {
  if (active && payload?.length) {
    return (
      <div className="glass-card px-3 py-2 text-xs">
        <p className="text-slate-400 mb-1">{label}</p>
        {payload.map((p: any, i: number) => (
          <p key={i} style={{ color: p.color }}>
            {p.name}: {p.value} tCO₂e
          </p>
        ))}
      </div>
    );
  }
  return null;
};

export default function DashboardPage() {
  const [data, setData] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    getDashboardData().then((res) => {
      setData(res);
      setLoading(false);
    });
  }, []);

  const kpis = data?.kpis || {
    totalCo2: "2,340",
    csrParticipants: 487,
    complianceRate: 94,
    activeChallenges: 12
  };

  const overall = data?.overallScore || {
    total: 76,
    env: 74,
    soc: 82,
    gov: 71
  };

  const currentDeptScores = data?.departmentScores || [
    { name: "Engineering", score: 88 },
    { name: "Marketing", score: 82 },
    { name: "HR", score: 79 },
    { name: "Finance", score: 74 },
    { name: "Operations", score: 61 },
  ];

  const currentAlerts = data?.alerts || [
    { title: "Emissions Disclosure Overdue", dept: "Operations", severity: "critical", days: 7 },
    { title: "5 Policies Unacknowledged", dept: "Engineering", severity: "warning", days: 3 },
    { title: "Carbon Audit Pending Review", dept: "Finance", severity: "info", days: 0 },
  ];

  if (loading) {
    return (
      <div className="w-full h-screen flex items-center justify-center" style={{ background: "#030a14" }}>
        <div className="text-center">
          <div className="text-5xl mb-4 animate-spin">🌍</div>
          <p className="font-orbitron text-sm text-emerald-400">Loading ESG intelligence twin...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6 max-w-[1600px] mx-auto">
      {/* ── Header ── */}
      <motion.div
        initial={{ opacity: 0, y: -10 }}
        animate={{ opacity: 1, y: 0 }}
        className="flex items-center justify-between"
      >
        <div>
          <h1 className="font-orbitron text-2xl font-bold gradient-text-emerald">
            ESG Command Center
          </h1>
          <p className="text-sm text-muted mt-1">Real-time sustainability intelligence · July 2026</p>
        </div>
        <div className="flex items-center gap-2">
          <motion.div
            animate={{ opacity: [1, 0.4, 1] }}
            transition={{ duration: 2, repeat: Infinity }}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-full"
            style={{ background: "rgba(16,185,129,0.08)", border: "1px solid rgba(16,185,129,0.2)" }}
          >
            <Activity size={11} className="text-emerald-400" />
            <span className="text-xs text-emerald-400 font-medium">Live</span>
          </motion.div>
        </div>
      </motion.div>

      {/* ── KPI Row ── */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <KPICard
          title="Total CO₂ Emissions"
          value={kpis.totalCo2}
          unit="tCO₂e"
          change={-12}
          changeLabel="vs last quarter"
          icon={<Leaf size={18} className="text-emerald-400" />}
          color="emerald"
          delay={0}
        />
        <KPICard
          title="CSR Participants"
          value={String(kpis.csrParticipants)}
          unit="employees"
          change={8}
          changeLabel="this month"
          icon={<Users size={18} className="text-cyan-400" />}
          color="cyan"
          delay={0.05}
        />
        <KPICard
          title="Compliance Rate"
          value={String(kpis.complianceRate)}
          unit="%"
          change={2}
          changeLabel="vs last month"
          icon={<Shield size={18} className="text-purple-400" />}
          color="purple"
          delay={0.1}
        />
        <KPICard
          title="Active Challenges"
          value={String(kpis.activeChallenges)}
          unit="challenges"
          change={3}
          changeLabel="new this week"
          icon={<Trophy size={18} className="text-amber-400" />}
          color="amber"
          delay={0.15}
        />
      </div>

      {/* ── Main Grid ── */}
      <div className="grid grid-cols-1 xl:grid-cols-12 gap-6">
        {/* 3D Earth Digital Twin */}
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ delay: 0.2 }}
          className="xl:col-span-5 glass-card-emerald overflow-hidden"
          style={{ minHeight: 420 }}
        >
          <div className="flex items-center justify-between p-4 border-b border-emerald-500/10">
            <div className="flex items-center gap-2">
              <Globe size={14} className="text-emerald-400" />
              <h2 className="font-orbitron text-sm font-semibold text-slate-200">3D ESG Digital Twin</h2>
              <motion.span animate={{ opacity: [1, 0.4, 1] }} transition={{ duration: 1.5, repeat: Infinity }}
                className="text-xs text-emerald-400 flex items-center gap-1">
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 inline-block" /> Live
              </motion.span>
            </div>
            <Link href="/earth">
              <motion.div whileHover={{ scale: 1.05 }}
                className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs text-cyan-400 border border-cyan-500/20 hover:bg-cyan-500/10 transition-colors cursor-pointer">
                <ExternalLink size={11} /> Full Screen
              </motion.div>
            </Link>
          </div>
          <div style={{ height: 370 }}>
            <EarthPreview initialESG={78} initialCarbon={40} initialCSR={65} isFullPage={false} />
          </div>
        </motion.div>


        {/* ESG Scores */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.25 }}
          className="xl:col-span-3 glass-card p-6"
        >
          <h2 className="font-orbitron text-sm font-semibold text-slate-200 mb-1">
            ESG Score Breakdown
          </h2>
          <p className="text-xs text-muted mb-6">Weighted average · July 2026</p>

          <div className="flex justify-around mb-6">
            <ESGScoreRing label="Environmental" score={overall.env} color="#10b981" size={90} />
            <ESGScoreRing label="Social" score={overall.soc} color="#06b6d4" size={90} />
            <ESGScoreRing label="Governance" score={overall.gov} color="#8b5cf6" size={90} />
          </div>

          {/* Overall score */}
          <div
            className="rounded-xl p-4 text-center"
            style={{ background: "rgba(16,185,129,0.06)", border: "1px solid rgba(16,185,129,0.12)" }}
          >
            <p className="text-xs text-muted mb-1">Overall ESG Score</p>
            <p className="font-orbitron text-3xl font-bold text-emerald-400">{overall.total}</p>
            <p className="text-xs text-muted mt-1">40% E · 30% S · 30% G</p>
          </div>

          {/* Trend */}
          <div className="flex items-center gap-2 mt-3 p-3 rounded-lg" style={{ background: "rgba(16,185,129,0.04)" }}>
            <TrendingUp size={14} className="text-emerald-400" />
            <span className="text-xs text-emerald-400">+4 points from last quarter</span>
          </div>
        </motion.div>

        {/* Carbon Pulse Ticker */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
          className="xl:col-span-5 glass-card-amber p-6"
        >
          <div className="flex items-center justify-between mb-4">
            <div>
              <h2 className="font-orbitron text-sm font-semibold text-slate-200">
                ⚡ Carbon Pulse
              </h2>
              <p className="text-xs text-muted mt-0.5">Live ESG event stream</p>
            </div>
          </div>
          <div style={{ height: 340 }}>
            <CarbonPulseTicker />
          </div>
        </motion.div>
      </div>

      {/* ── Charts Row ── */}
      <div className="grid grid-cols-1 xl:grid-cols-2 gap-6">
        {/* Emissions Trend */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.35 }}
          className="glass-card p-6"
        >
          <h2 className="font-orbitron text-sm font-semibold text-slate-200 mb-1">
            Carbon Emission Trend
          </h2>
          <p className="text-xs text-muted mb-5">Monthly tCO₂e vs target</p>
          <ResponsiveContainer width="100%" height={220}>
            <AreaChart data={emissionsTrend} margin={{ left: -20, right: 0 }}>
              <defs>
                <linearGradient id="gradCo2" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#f43f5e" stopOpacity={0.3} />
                  <stop offset="95%" stopColor="#f43f5e" stopOpacity={0} />
                </linearGradient>
                <linearGradient id="gradTarget" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#10b981" stopOpacity={0.15} />
                  <stop offset="95%" stopColor="#10b981" stopOpacity={0} />
                </linearGradient>
              </defs>
              <CartesianGrid stroke="rgba(255,255,255,0.04)" vertical={false} />
              <XAxis dataKey="month" tick={{ fill: "#475569", fontSize: 11 }} axisLine={false} tickLine={false} />
              <YAxis tick={{ fill: "#475569", fontSize: 11 }} axisLine={false} tickLine={false} />
              <Tooltip content={<CustomTooltip />} />
              <Area type="monotone" dataKey="co2" name="Actual" stroke="#f43f5e" fill="url(#gradCo2)" strokeWidth={2} dot={{ fill: "#f43f5e", r: 3 }} />
              <Area type="monotone" dataKey="target" name="Target" stroke="#10b981" fill="url(#gradTarget)" strokeWidth={2} strokeDasharray="4 4" dot={false} />
            </AreaChart>
          </ResponsiveContainer>
        </motion.div>

        {/* Department Rankings */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.4 }}
          className="glass-card p-6"
        >
          <h2 className="font-orbitron text-sm font-semibold text-slate-200 mb-1">
            Department ESG Rankings
          </h2>
          <p className="text-xs text-muted mb-5">Overall ESG score by department</p>
          <ResponsiveContainer width="100%" height={220}>
            <BarChart data={currentDeptScores} layout="vertical" margin={{ left: 10, right: 20 }}>
              <CartesianGrid stroke="rgba(255,255,255,0.04)" horizontal={false} />
              <XAxis type="number" domain={[0, 100]} tick={{ fill: "#475569", fontSize: 11 }} axisLine={false} tickLine={false} />
              <YAxis type="category" dataKey="name" tick={{ fill: "#94a3b8", fontSize: 11 }} axisLine={false} tickLine={false} width={75} />
              <Tooltip
                cursor={{ fill: "rgba(255,255,255,0.03)" }}
                content={({ active, payload }) =>
                  active && payload?.length ? (
                    <div className="glass-card px-3 py-2 text-xs">
                      <p style={{ color: payload[0].color }}>{payload[0].value}/100</p>
                    </div>
                  ) : null
                }
              />
              <Bar dataKey="score" radius={[0, 6, 6, 0]} maxBarSize={20}>
                {currentDeptScores.map((_, i) => (
                  <Cell key={i} fill={DEPT_COLORS[i % DEPT_COLORS.length]} />
                ))}
              </Bar>
            </BarChart>
          </ResponsiveContainer>
        </motion.div>
      </div>

      {/* ── Alerts Row ── */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.45 }}
        className="glass-card p-6"
      >
        <div className="flex items-center gap-2 mb-4">
          <AlertTriangle size={14} className="text-amber-400" />
          <h2 className="font-orbitron text-sm font-semibold text-slate-200">Action Required</h2>
          <span className="text-xs badge-rose px-2 py-0.5 rounded-full ml-1">{currentAlerts.length} urgent</span>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
          {currentAlerts.map((alert: any, i: number) => (
            <motion.div
              key={i}
              whileHover={{ x: 2 }}
              className="rounded-xl p-4 cursor-pointer"
              style={{
                background:
                  alert.severity === "critical"
                    ? "rgba(244,63,94,0.06)"
                    : alert.severity === "warning"
                      ? "rgba(245,158,11,0.06)"
                      : "rgba(6,182,212,0.06)",
                border: `1px solid ${
                  alert.severity === "critical"
                    ? "rgba(244,63,94,0.2)"
                    : alert.severity === "warning"
                      ? "rgba(245,158,11,0.2)"
                      : "rgba(6,182,212,0.2)"
                }`,
              }}
            >
              <p className="text-xs font-medium text-slate-200">{alert.title}</p>
              <p className="text-xs text-muted mt-1">{alert.dept}</p>
              {alert.days > 0 && (
                <p
                  className="text-xs mt-2 font-medium"
                  style={{ color: alert.severity === "critical" ? "#f43f5e" : "#f59e0b" }}
                >
                  Overdue by {alert.days} days
                </p>
              )}
            </motion.div>
          ))}
        </div>
      </motion.div>
    </div>
  );
}
