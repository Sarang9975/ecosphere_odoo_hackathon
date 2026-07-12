"use client";

import { motion, AnimatePresence } from "framer-motion";
import { useState, useEffect } from "react";
import { Sliders, TrendingUp, Leaf, Users, Shield, BarChart2, Plus, X, Play } from "lucide-react";
import { RadarChart, Radar, PolarGrid, PolarAngleAxis, ResponsiveContainer, AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip } from "recharts";
import { getDashboardData } from "@/actions/dashboard";

interface Scenario {
  id: string;
  name: string;
  color: string;
  levers: {
    fleetReduction: number;
    renewableEnergy: number;
    csrIncrease: number;
    governanceImprovements: number;
    wasteReduction: number;
  };
}

const SCENARIO_COLORS = ["#10b981", "#06b6d4", "#8b5cf6"];
const DEFAULT_LEVERS = { fleetReduction: 0, renewableEnergy: 0, csrIncrease: 0, governanceImprovements: 0, wasteReduction: 0 };

export default function SimulatorPage() {
  const [baseScores, setBaseScores] = useState({ env: 74, soc: 82, gov: 71, total: 76 });
  const [scenarios, setScenarios] = useState<Scenario[]>([
    { id: "s1", name: "Baseline", color: SCENARIO_COLORS[0], levers: { ...DEFAULT_LEVERS } },
  ]);
  const [activeScenario, setActiveScenario] = useState("s1");
  const [running, setRunning] = useState(false);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    getDashboardData().then(res => {
      if (res?.overallScore) {
        setBaseScores({
          env: res.overallScore.env,
          soc: res.overallScore.soc,
          gov: res.overallScore.gov,
          total: res.overallScore.total,
        });
      }
      setLoading(false);
    });
  }, []);

  const active = scenarios.find((s) => s.id === activeScenario)!;

  const computeESG = (s: Scenario["levers"]) => {
    const env = Math.min(100, baseScores.env + s.fleetReduction * 0.15 + s.renewableEnergy * 0.18 + s.wasteReduction * 0.08);
    const soc = Math.min(100, baseScores.soc + s.csrIncrease * 0.12);
    const gov = Math.min(100, baseScores.gov + s.governanceImprovements * 0.2);
    const total = env * 0.4 + soc * 0.3 + gov * 0.3;
    return { env: Math.round(env), soc: Math.round(soc), gov: Math.round(gov), total: Math.round(total * 10) / 10 };
  };

  const scores = computeESG(active.levers);

  const radarData = [
    { subject: "Environmental", A: baseScores.env, B: scores.env },
    { subject: "Social", A: baseScores.soc, B: scores.soc },
    { subject: "Governance", A: baseScores.gov, B: scores.gov },
    { subject: "Carbon Red.", A: 50, B: Math.min(100, 50 + active.levers.fleetReduction + active.levers.renewableEnergy) },
    { subject: "CSR Impact", A: 60, B: Math.min(100, 60 + active.levers.csrIncrease) },
  ];

  const updateLever = (key: keyof Scenario["levers"], value: number) => {
    setScenarios((prev) =>
      prev.map((s) => s.id === activeScenario ? { ...s, levers: { ...s.levers, [key]: value } } : s)
    );
  };

  const addScenario = () => {
    if (scenarios.length >= 3) return;
    const id = `s${Date.now()}`;
    setScenarios((prev) => [...prev, { id, name: `Scenario ${prev.length + 1}`, color: SCENARIO_COLORS[prev.length], levers: { ...DEFAULT_LEVERS } }]);
    setActiveScenario(id);
  };

  const removeScenario = (id: string) => {
    if (scenarios.length === 1) return;
    setScenarios((prev) => prev.filter((s) => s.id !== id));
    setActiveScenario(scenarios[0].id);
  };

  const handleRun = () => {
    setRunning(true);
    setTimeout(() => setRunning(false), 2000);
  };

  const levers = [
    { key: "fleetReduction" as const, label: "Fleet Usage Reduction", icon: <Leaf size={14} />, color: "#10b981", unit: "%" },
    { key: "renewableEnergy" as const, label: "Renewable Energy Switch", icon: <Sliders size={14} />, color: "#06b6d4", unit: "%" },
    { key: "csrIncrease" as const, label: "CSR Participation Boost", icon: <Users size={14} />, color: "#8b5cf6", unit: "%" },
    { key: "governanceImprovements" as const, label: "Governance Improvements", icon: <Shield size={14} />, color: "#f59e0b", unit: "%" },
    { key: "wasteReduction" as const, label: "Waste Reduction Program", icon: <BarChart2 size={14} />, color: "#f43f5e", unit: "%" },
  ];

  const projectionData = Array.from({ length: 6 }, (_, i) => ({
    period: `Q${(i % 4) + 1}'${26 + Math.floor(i / 4)}`,
    baseline: Math.round(baseScores.total + i * 0.5),
    projected: Math.round(scores.total + i * (scores.total > baseScores.total ? 1.2 : 0.3)),
  }));

  if (loading) {
    return (
      <div className="w-full h-96 flex items-center justify-center">
        <div className="text-center">
          <div className="text-4xl mb-2 animate-bounce">🎯</div>
          <p className="font-orbitron text-xs text-rose-400">Loading simulator baseline...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6 max-w-[1600px] mx-auto">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="font-orbitron text-2xl font-bold" style={{ background: "linear-gradient(135deg, #f43f5e, #f59e0b)", WebkitBackgroundClip: "text", WebkitTextFillColor: "transparent" }}>
            🎯 Scenario Simulator
          </h1>
          <p className="text-sm text-muted mt-1">What-if ESG planning · Model future sustainability scenarios</p>
        </div>
        <div className="flex items-center gap-2">
          <motion.button
            onClick={handleRun}
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            className="flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-medium text-white"
            style={{ background: "linear-gradient(135deg, #f43f5e, #f59e0b)", boxShadow: "0 4px 20px rgba(244,63,94,0.3)" }}
          >
            {running ? (
              <motion.div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full" animate={{ rotate: 360 }} transition={{ duration: 0.6, repeat: Infinity, ease: "linear" }} />
            ) : <Play size={14} />}
            {running ? "Simulating..." : "Run Simulation"}
          </motion.button>
        </div>
      </div>

      {/* Scenario Selector */}
      <div className="flex items-center gap-2 flex-wrap">
        {scenarios.map((s) => (
          <div
            key={s.id}
            onClick={() => setActiveScenario(s.id)}
            className={`flex items-center gap-2 px-4 py-2 rounded-xl cursor-pointer transition-all border ${activeScenario === s.id ? "border-opacity-100 text-slate-200" : "border-white/10 text-muted"}`}
            style={activeScenario === s.id ? { borderColor: `${s.color}50`, background: `${s.color}10` } : {}}
          >
            <div className="w-2 h-2 rounded-full" style={{ background: s.color }} />
            <span className="text-xs font-medium">{s.name}</span>
            {s.id !== "s1" && (
              <button onClick={(e) => { e.stopPropagation(); removeScenario(s.id); }} className="text-muted hover:text-rose-400 transition-colors ml-1">
                <X size={11} />
              </button>
            )}
          </div>
        ))}
        {scenarios.length < 3 && (
          <button onClick={addScenario} className="flex items-center gap-1.5 px-4 py-2 rounded-xl text-xs text-muted border border-white/10 hover:border-emerald-500/30 hover:text-emerald-400 transition-all">
            <Plus size={11} /> Add Scenario
          </button>
        )}
      </div>

      {/* Main grid */}
      <div className="grid grid-cols-1 xl:grid-cols-12 gap-6">
        {/* Levers */}
        <motion.div initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }} className="xl:col-span-5 glass-card p-6 space-y-5">
          <h3 className="font-orbitron text-sm font-semibold text-slate-200">Adjust Levers</h3>
          {levers.map((l) => (
            <div key={l.key}>
              <div className="flex items-center justify-between mb-2">
                <div className="flex items-center gap-2">
                  <span style={{ color: l.color }}>{l.icon}</span>
                  <span className="text-xs text-slate-300">{l.label}</span>
                </div>
                <span className="font-orbitron text-sm font-bold" style={{ color: l.color }}>
                  +{active.levers[l.key]}{l.unit}
                </span>
              </div>
              <input
                type="range"
                min={0}
                max={50}
                value={active.levers[l.key]}
                onChange={(e) => updateLever(l.key, Number(e.target.value))}
                className="w-full h-2 rounded-full appearance-none cursor-pointer"
                style={{
                  background: `linear-gradient(90deg, ${l.color} ${(active.levers[l.key] / 50) * 100}%, rgba(255,255,255,0.08) ${(active.levers[l.key] / 50) * 100}%)`,
                  accentColor: l.color,
                }}
              />
              <div className="flex justify-between text-xs text-muted mt-1">
                <span>No change</span>
                <span>+50%</span>
              </div>
            </div>
          ))}
        </motion.div>

        {/* Results */}
        <div className="xl:col-span-7 space-y-4">
          {/* Score delta cards */}
          <div className="grid grid-cols-4 gap-3">
            {[
              { label: "Environmental", val: scores.env, base: baseScores.env, color: "#10b981" },
              { label: "Social", val: scores.soc, base: baseScores.soc, color: "#06b6d4" },
              { label: "Governance", val: scores.gov, base: baseScores.gov, color: "#8b5cf6" },
              { label: "Total ESG", val: scores.total, base: baseScores.total, color: "#f59e0b" },
            ].map((s) => (
              <motion.div key={s.label} className="glass-card p-4 text-center"
                animate={{ boxShadow: s.val > s.base ? `0 0 20px ${s.color}20` : "none" }}>
                <p className="text-xs text-muted mb-1">{s.label}</p>
                <p className="font-orbitron text-xl font-bold" style={{ color: s.color }}>{s.val}</p>
                <p className={`text-xs mt-1 font-medium ${s.val > s.base ? "text-emerald-400" : s.val < s.base ? "text-rose-400" : "text-muted"}`}>
                  {s.val > s.base ? "+" : ""}{(s.val - s.base).toFixed(1)} pts
                </p>
              </motion.div>
            ))}
          </div>

          {/* Radar */}
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="glass-card p-5">
            <h3 className="font-orbitron text-sm font-semibold text-slate-200 mb-3">Impact Radar</h3>
            <ResponsiveContainer width="100%" height={200}>
              <RadarChart data={radarData}>
                <PolarGrid stroke="rgba(255,255,255,0.08)" />
                <PolarAngleAxis dataKey="subject" tick={{ fill: "#475569", fontSize: 10 }} />
                <Radar name="Baseline" dataKey="A" stroke="#475569" fill="#475569" fillOpacity={0.1} strokeDasharray="4 4" />
                <Radar name="Projected" dataKey="B" stroke={active.color} fill={active.color} fillOpacity={0.2} />
                <Tooltip contentStyle={{ background: "#0d1829", border: "1px solid rgba(255,255,255,0.1)", borderRadius: 10 }} />
              </RadarChart>
            </ResponsiveContainer>
          </motion.div>

          {/* Projection line */}
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="glass-card p-5">
            <h3 className="font-orbitron text-sm font-semibold text-slate-200 mb-3">6-Quarter Projection</h3>
            <ResponsiveContainer width="100%" height={150}>
              <AreaChart data={projectionData}>
                <defs>
                  <linearGradient id="gbase" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#475569" stopOpacity={0.2} />
                    <stop offset="95%" stopColor="#475569" stopOpacity={0} />
                  </linearGradient>
                  <linearGradient id="gproj" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor={active.color} stopOpacity={0.3} />
                    <stop offset="95%" stopColor={active.color} stopOpacity={0} />
                  </linearGradient>
                </defs>
                <CartesianGrid stroke="rgba(255,255,255,0.04)" vertical={false} />
                <XAxis dataKey="period" tick={{ fill: "#475569", fontSize: 10 }} axisLine={false} tickLine={false} />
                <YAxis domain={[60, 100]} tick={{ fill: "#475569", fontSize: 10 }} axisLine={false} tickLine={false} />
                <Tooltip contentStyle={{ background: "#0d1829", border: "1px solid rgba(255,255,255,0.1)", borderRadius: 10 }} />
                <Area type="monotone" dataKey="baseline" name="Baseline" stroke="#475569" fill="url(#gbase)" strokeWidth={1.5} strokeDasharray="4 4" />
                <Area type="monotone" dataKey="projected" name="Projected" stroke={active.color} fill="url(#gproj)" strokeWidth={2} />
              </AreaChart>
            </ResponsiveContainer>
          </motion.div>
        </div>
      </div>
    </div>
  );
}
