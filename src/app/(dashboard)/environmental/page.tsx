"use client";

import { motion, AnimatePresence } from "framer-motion";
import { useState, useEffect } from "react";
import {
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
} from "recharts";
import { Leaf, Plus, Target, TrendingDown, Flame, X } from "lucide-react";
import { getEmissionsData, logEmissionTransaction, getEnvironmentalGoals, addEnvironmentalGoal, getEmissionFactors } from "@/actions/environmental";
import { EmissionSource } from "@prisma/client";

export default function EnvironmentalPage() {
  const [activeTab, setActiveTab] = useState<"overview" | "transactions" | "goals" | "factors">("overview");
  
  // States for DB data
  const [loading, setLoading] = useState(true);
  const [emissionsBySource, setEmissionsBySource] = useState<any[]>([]);
  const [monthlyData, setMonthlyData] = useState<any[]>([]);
  const [goals, setGoals] = useState<any[]>([]);
  const [transactions, setTransactions] = useState<any[]>([]);
  const [factors, setFactors] = useState<any[]>([]);
  const [stats, setStats] = useState({ totalEmissions: 2340, reduction: "-12%", goalsCount: "2 of 3", factorsCount: 5 });

  // Modal State
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [newSource, setNewSource] = useState<EmissionSource>(EmissionSource.FLEET);
  const [newQuantity, setNewQuantity] = useState<number>(0);
  const [newUnit, setNewUnit] = useState<string>("L");
  const [newFactorId, setNewFactorId] = useState<string>("");
  const [newDescription, setNewDescription] = useState<string>("");
  const [newCo2, setNewCo2] = useState<number>(0);

  const loadData = async () => {
    try {
      setLoading(true);
      const res = await getEmissionsData();
      const dbGoals = await getEnvironmentalGoals();
      const dbFactors = await getEmissionFactors();

      setTransactions(res.transactions);
      setEmissionsBySource(res.emissionsBySource);
      setMonthlyData(res.monthlyData);
      setFactors(dbFactors);

      setGoals(dbGoals.map(g => ({
        title: g.title,
        current: g.currentValue,
        target: g.targetValue,
        unit: g.unit,
        deadline: g.deadline ? new Date(g.deadline).toLocaleDateString("en-US", { month: "short", year: "numeric" }) : "No deadline",
        status: g.status === "ACHIEVED" ? "on_track" : g.status === "AT_RISK" ? "at_risk" : "on_track",
      })));

      setStats({
        totalEmissions: res.totalEmissions,
        reduction: "-12%",
        goalsCount: `${dbGoals.filter(g => g.status === "ACHIEVED" || g.status === "IN_PROGRESS").length} of ${dbGoals.length}`,
        factorsCount: dbFactors.length,
      });
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  const handleLogEmission = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await logEmissionTransaction({
        source: newSource,
        quantity: Number(newQuantity),
        unit: newUnit,
        emissionFactorId: newFactorId || undefined,
        description: newDescription,
        co2eKg: newFactorId ? undefined : newCo2 * 1000.0, // if no factor selected, use manual co2 in kg
      });
      setIsModalOpen(false);
      // Reset
      setNewQuantity(0);
      setNewDescription("");
      setNewCo2(0);
      loadData();
    } catch (err) {
      console.error(err);
    }
  };

  if (loading && transactions.length === 0) {
    return (
      <div className="w-full h-96 flex items-center justify-center">
        <div className="text-center">
          <div className="text-4xl mb-2 animate-bounce">🌱</div>
          <p className="font-orbitron text-xs text-emerald-400">Loading Environmental details...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6 max-w-[1600px] mx-auto">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="font-orbitron text-2xl font-bold gradient-text-emerald">🌱 Environmental</h1>
          <p className="text-sm text-muted mt-1">Carbon accounting, emission tracking & sustainability goals</p>
        </div>
        <button 
          onClick={() => setIsModalOpen(true)}
          className="btn-emerald px-4 py-2 rounded-xl text-sm font-medium flex items-center gap-2"
        >
          <Plus size={15} />
          Log Emission
        </button>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {[
          { label: "Total Emissions", value: stats.totalEmissions.toLocaleString(), unit: "tCO₂e", icon: <Flame size={16} className="text-rose-400" />, color: "rgba(244,63,94,0.12)", border: "rgba(244,63,94,0.2)" },
          { label: "vs Last Quarter", value: stats.reduction, unit: "reduction", icon: <TrendingDown size={16} className="text-emerald-400" />, color: "rgba(16,185,129,0.08)", border: "rgba(16,185,129,0.15)" },
          { label: "Goals On Track", value: stats.goalsCount, unit: "goals", icon: <Target size={16} className="text-cyan-400" />, color: "rgba(6,182,212,0.08)", border: "rgba(6,182,212,0.15)" },
          { label: "Emission Factors", value: String(stats.factorsCount), unit: "configured", icon: <Leaf size={16} className="text-amber-400" />, color: "rgba(245,158,11,0.08)", border: "rgba(245,158,11,0.15)" },
        ].map((s, i) => (
          <motion.div
            key={i}
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: i * 0.05 }}
            className="glass-card p-4"
            style={{ background: s.color, border: `1px solid ${s.border}` }}
          >
            <div className="flex items-center gap-2 mb-2">{s.icon}<span className="text-xs text-muted">{s.label}</span></div>
            <p className="font-orbitron text-xl font-bold text-slate-100">{s.value} <span className="text-xs font-normal text-muted">{s.unit}</span></p>
          </motion.div>
        ))}
      </div>

      {/* Tabs */}
      <div className="flex gap-1 p-1 rounded-xl w-fit" style={{ background: "rgba(255,255,255,0.04)" }}>
        {(["overview", "transactions", "goals", "factors"] as const).map((tab) => (
          <button
            key={tab}
            onClick={() => setActiveTab(tab)}
            className={`px-4 py-2 rounded-lg text-xs font-medium capitalize transition-all ${
              activeTab === tab ? "bg-emerald-500 text-white shadow-lg" : "text-muted hover:text-slate-300"
            }`}
          >
            {tab}
          </button>
        ))}
      </div>

      {/* Tab Content */}
      {activeTab === "overview" && (
        <div className="grid grid-cols-1 xl:grid-cols-3 gap-6">
          {/* Scope chart */}
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="xl:col-span-2 glass-card p-6">
            <h3 className="font-orbitron text-sm font-semibold text-slate-200 mb-4">Scope 1 / 2 / 3 Breakdown</h3>
            <ResponsiveContainer width="100%" height={260}>
              <AreaChart data={monthlyData}>
                <defs>
                  {[["s1", "#f43f5e"], ["s2", "#f59e0b"], ["s3", "#8b5cf6"]].map(([id, color]) => (
                    <linearGradient key={id} id={id} x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor={color} stopOpacity={0.3} />
                      <stop offset="95%" stopColor={color} stopOpacity={0.02} />
                    </linearGradient>
                  ))}
                </defs>
                <CartesianGrid stroke="rgba(255,255,255,0.04)" vertical={false} />
                <XAxis dataKey="month" tick={{ fill: "#475569", fontSize: 11 }} axisLine={false} tickLine={false} />
                <YAxis tick={{ fill: "#475569", fontSize: 11 }} axisLine={false} tickLine={false} />
                <Tooltip contentStyle={{ background: "#0d1829", border: "1px solid rgba(255,255,255,0.1)", borderRadius: 10 }} />
                <Area type="monotone" dataKey="scope1" name="Scope 1" stroke="#f43f5e" fill="url(#s1)" strokeWidth={2} />
                <Area type="monotone" dataKey="scope2" name="Scope 2" stroke="#f59e0b" fill="url(#s2)" strokeWidth={2} />
                <Area type="monotone" dataKey="scope3" name="Scope 3" stroke="#8b5cf6" fill="url(#s3)" strokeWidth={2} />
              </AreaChart>
            </ResponsiveContainer>
          </motion.div>

          {/* Pie by source */}
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="glass-card p-6">
            <h3 className="font-orbitron text-sm font-semibold text-slate-200 mb-4">By Emission Source</h3>
            <ResponsiveContainer width="100%" height={200}>
              <PieChart>
                <Pie data={emissionsBySource} cx="50%" cy="50%" innerRadius={55} outerRadius={80} paddingAngle={3} dataKey="value">
                  {emissionsBySource.map((e, i) => <Cell key={i} fill={e.color} />)}
                </Pie>
                <Tooltip contentStyle={{ background: "#0d1829", border: "1px solid rgba(255,255,255,0.1)", borderRadius: 10 }} />
              </PieChart>
            </ResponsiveContainer>
            <div className="space-y-1.5 mt-2">
              {emissionsBySource.map((e) => (
                <div key={e.name} className="flex items-center justify-between text-xs">
                  <div className="flex items-center gap-2">
                    <div className="w-2 h-2 rounded-full" style={{ background: e.color }} />
                    <span className="text-muted">{e.name}</span>
                  </div>
                  <span className="text-slate-300 font-medium">{e.value}%</span>
                </div>
              ))}
            </div>
          </motion.div>
        </div>
      )}

      {activeTab === "transactions" && (
        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="glass-card overflow-hidden">
          <div className="p-5 border-b border-white/5 flex items-center justify-between">
            <h3 className="font-orbitron text-sm font-semibold text-slate-200">Carbon Transactions</h3>
            <button 
              onClick={() => setIsModalOpen(true)}
              className="btn-emerald px-3 py-1.5 rounded-lg text-xs font-medium flex items-center gap-1.5"
            >
              <Plus size={12} /> Add Transaction
            </button>
          </div>
          <table className="data-table">
            <thead>
              <tr>
                <th>Source</th><th>Department</th><th>CO₂e</th><th>Date</th><th>Type</th>
              </tr>
            </thead>
            <tbody>
              {transactions.map((t) => (
                <tr key={t.id}>
                  <td className="font-medium text-slate-200">{t.source}</td>
                  <td className="text-muted">{t.dept}</td>
                  <td><span className="text-rose-400 font-orbitron text-xs">{t.co2}</span></td>
                  <td className="text-muted">{t.date}</td>
                  <td>
                    <span className={`text-xs px-2 py-0.5 rounded-full ${t.auto ? "badge-emerald" : "badge-cyan"}`}>
                      {t.auto ? "Auto" : "Manual"}
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </motion.div>
      )}

      {activeTab === "goals" && (
        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="space-y-4">
          {goals.map((goal, i) => (
            <div key={i} className="glass-card p-6">
              <div className="flex items-start justify-between mb-4">
                <div>
                  <h3 className="font-medium text-slate-200">{goal.title}</h3>
                  <p className="text-xs text-muted mt-0.5">Deadline: {goal.deadline}</p>
                </div>
                <span className={`text-xs px-2.5 py-1 rounded-full ${goal.status === "on_track" ? "badge-emerald" : "badge-amber"}`}>
                  {goal.status === "on_track" ? "On Track" : "At Risk"}
                </span>
              </div>
              <div className="flex items-center gap-3 mb-2">
                <div className="flex-1 bg-white/5 rounded-full h-2.5">
                  <motion.div
                    className="h-2.5 rounded-full"
                    style={{ background: goal.status === "on_track" ? "linear-gradient(90deg, #10b981, #06b6d4)" : "linear-gradient(90deg, #f59e0b, #f43f5e)" }}
                    initial={{ width: 0 }}
                    animate={{ width: `${Math.min(100, (goal.current / goal.target) * 100)}%` }}
                    transition={{ duration: 1.2, ease: "easeOut", delay: i * 0.1 }}
                  />
                </div>
                <span className="text-xs font-orbitron font-bold text-slate-200 w-10 text-right">
                  {Math.round(Math.min(100, (goal.current / goal.target) * 100))}%
                </span>
              </div>
              <p className="text-xs text-muted">{goal.current} / {goal.target} {goal.unit}</p>
            </div>
          ))}
        </motion.div>
      )}

      {activeTab === "factors" && (
        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="glass-card overflow-hidden">
          <div className="p-5 border-b border-white/5 flex items-center justify-between">
            <h3 className="font-orbitron text-sm font-semibold text-slate-200">Emission Factors</h3>
          </div>
          <table className="data-table">
            <thead><tr><th>Name</th><th>Category</th><th>Factor</th><th>Unit</th><th>Source</th></tr></thead>
            <tbody>
              {factors.map((f, i) => (
                <tr key={i}>
                  <td className="font-medium text-slate-200">{f.name}</td>
                  <td><span className="badge-cyan text-xs px-2 py-0.5 rounded-full">{f.category}</span></td>
                  <td className="font-orbitron text-emerald-400 text-xs">{f.factor}</td>
                  <td className="text-muted text-xs">{f.unit}</td>
                  <td className="text-muted text-xs">{f.source}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </motion.div>
      )}

      {/* Log Emission Dialog Modal */}
      <AnimatePresence>
        {isModalOpen && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm">
            <motion.div 
              initial={{ scale: 0.95, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.95, opacity: 0 }}
              className="w-full max-w-lg glass-card border border-white/10 p-6 relative overflow-hidden"
            >
              <button 
                onClick={() => setIsModalOpen(false)}
                className="absolute top-4 right-4 text-slate-400 hover:text-slate-200 transition-colors"
              >
                <X size={18} />
              </button>

              <div className="flex items-center gap-2 mb-4">
                <Leaf className="text-emerald-400" size={18} />
                <h3 className="font-orbitron text-base font-semibold text-slate-200">Log Emission Transaction</h3>
              </div>

              <form onSubmit={handleLogEmission} className="space-y-4">
                <div>
                  <label className="text-xs text-muted mb-1.5 block">Emission Source</label>
                  <select 
                    value={newSource} 
                    onChange={(e) => setNewSource(e.target.value as EmissionSource)}
                    className="input-field text-xs w-full bg-[#0a101d]"
                  >
                    <option value={EmissionSource.FLEET}>Fleet</option>
                    <option value={EmissionSource.ENERGY}>Energy</option>
                    <option value={EmissionSource.MANUFACTURING}>Manufacturing</option>
                    <option value={EmissionSource.EXPENSE}>Expense</option>
                    <option value={EmissionSource.PURCHASE}>Purchase</option>
                    <option value={EmissionSource.WASTE}>Waste</option>
                    <option value={EmissionSource.TRAVEL}>Travel</option>
                    <option value={EmissionSource.OTHER}>Other</option>
                  </select>
                </div>

                <div>
                  <label className="text-xs text-muted mb-1.5 block">Emission Factor (Optional - Auto calculates CO2e)</label>
                  <select 
                    value={newFactorId} 
                    onChange={(e) => {
                      setNewFactorId(e.target.value);
                      const fact = factors.find(f => f.id === e.target.value);
                      if (fact) setNewUnit(fact.unit.split("/")[1] || "unit");
                    }}
                    className="input-field text-xs w-full bg-[#0a101d]"
                  >
                    <option value="">Manual Entry (No Factor)</option>
                    {factors.map(f => (
                      <option key={f.id} value={f.id}>{f.name} ({f.factor} {f.unit})</option>
                    ))}
                  </select>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="text-xs text-muted mb-1.5 block">Quantity</label>
                    <input 
                      type="number" 
                      required 
                      value={newQuantity || ""} 
                      onChange={(e) => setNewQuantity(Number(e.target.value))}
                      placeholder="e.g. 150"
                      className="input-field text-xs w-full"
                    />
                  </div>
                  <div>
                    <label className="text-xs text-muted mb-1.5 block">Unit</label>
                    <input 
                      type="text" 
                      required
                      value={newUnit} 
                      onChange={(e) => setNewUnit(e.target.value)}
                      placeholder="e.g. L or kWh"
                      className="input-field text-xs w-full"
                    />
                  </div>
                </div>

                {!newFactorId && (
                  <div>
                    <label className="text-xs text-muted mb-1.5 block">Manual CO2e (tons)</label>
                    <input 
                      type="number" 
                      step="any"
                      required
                      value={newCo2 || ""} 
                      onChange={(e) => setNewCo2(Number(e.target.value))}
                      placeholder="e.g. 2.4"
                      className="input-field text-xs w-full"
                    />
                  </div>
                )}

                <div>
                  <label className="text-xs text-muted mb-1.5 block">Description / Reference</label>
                  <input 
                    type="text" 
                    value={newDescription} 
                    onChange={(e) => setNewDescription(e.target.value)}
                    placeholder="e.g. Fleet Diesel refuel"
                    className="input-field text-xs w-full"
                  />
                </div>

                <div className="pt-2 flex justify-end gap-2">
                  <button 
                    type="button" 
                    onClick={() => setIsModalOpen(false)}
                    className="px-4 py-2 rounded-xl text-xs text-slate-400 border border-white/10 hover:bg-white/5 transition-colors"
                  >
                    Cancel
                  </button>
                  <button 
                    type="submit" 
                    className="btn-emerald px-4 py-2 rounded-xl text-xs font-semibold"
                  >
                    Log Emission
                  </button>
                </div>
              </form>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
}
