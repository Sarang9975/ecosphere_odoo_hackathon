"use client";

import { motion } from "framer-motion";
import { useState } from "react";
import { RadialBarChart, RadialBar, ResponsiveContainer, BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Cell } from "recharts";
import { Users, Heart, Star, Plus, CheckCircle, Clock, XCircle } from "lucide-react";

const diversityData = [
  { name: "Gender Parity", value: 48, fill: "#10b981" },
  { name: "Ethnic Diversity", value: 63, fill: "#06b6d4" },
  { name: "Disability Inclusion", value: 8, fill: "#8b5cf6" },
  { name: "Age Diversity", value: 72, fill: "#f59e0b" },
];

const csrActivities = [
  { id: 1, title: "Tree Planting Drive", category: "Environment", date: "Jul 15", participants: 45, max: 60, status: "upcoming", points: 100 },
  { id: 2, title: "Community Clean-Up", category: "Community", date: "Jul 8", participants: 32, max: 32, status: "completed", points: 75 },
  { id: 3, title: "Blood Donation Camp", category: "Health", date: "Jul 20", participants: 18, max: 40, status: "upcoming", points: 150 },
  { id: 4, title: "Digital Literacy Workshop", category: "Education", date: "Jun 28", participants: 20, max: 25, status: "completed", points: 80 },
  { id: 5, title: "Mangrove Restoration", category: "Environment", date: "Aug 5", participants: 8, max: 50, status: "upcoming", points: 200 },
];

const engagementData = [
  { dept: "Engineering", rate: 87 },
  { dept: "HR", rate: 92 },
  { dept: "Marketing", rate: 78 },
  { dept: "Finance", rate: 65 },
  { dept: "Operations", rate: 71 },
];

const participations = [
  { name: "Sarah K.", activity: "Tree Planting Drive", status: "approved", points: 100, date: "Jul 15" },
  { name: "Alex M.", activity: "Blood Donation Camp", status: "pending", points: 0, date: "Jul 20" },
  { name: "Priya R.", activity: "Community Clean-Up", status: "approved", points: 75, date: "Jul 8" },
  { name: "James T.", activity: "Community Clean-Up", status: "rejected", points: 0, date: "Jul 8" },
  { name: "Mei L.", activity: "Digital Literacy Workshop", status: "approved", points: 80, date: "Jun 28" },
];

const STATUS_ICONS = {
  approved: <CheckCircle size={13} className="text-emerald-400" />,
  pending: <Clock size={13} className="text-amber-400" />,
  rejected: <XCircle size={13} className="text-rose-400" />,
};

export default function SocialPage() {
  const [activeTab, setActiveTab] = useState<"overview" | "csr" | "participation" | "diversity">("overview");

  return (
    <div className="space-y-6 max-w-[1600px] mx-auto">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="font-orbitron text-2xl font-bold" style={{ background: "linear-gradient(135deg, #06b6d4, #10b981)", WebkitBackgroundClip: "text", WebkitTextFillColor: "transparent" }}>
            👥 Social Impact
          </h1>
          <p className="text-sm text-muted mt-1">CSR activities, employee participation & diversity metrics</p>
        </div>
        <button className="btn-cyan px-4 py-2 rounded-xl text-sm font-medium flex items-center gap-2">
          <Plus size={15} /> New CSR Activity
        </button>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {[
          { label: "Total CSR Activities", value: "28", icon: <Heart size={16} className="text-rose-400" />, bg: "rgba(244,63,94,0.08)", border: "rgba(244,63,94,0.15)" },
          { label: "Active Participants", value: "487", icon: <Users size={16} className="text-cyan-400" />, bg: "rgba(6,182,212,0.08)", border: "rgba(6,182,212,0.15)" },
          { label: "Avg Engagement Rate", value: "79%", icon: <Star size={16} className="text-amber-400" />, bg: "rgba(245,158,11,0.08)", border: "rgba(245,158,11,0.15)" },
          { label: "CSR Points Awarded", value: "14.2K", icon: <CheckCircle size={16} className="text-emerald-400" />, bg: "rgba(16,185,129,0.08)", border: "rgba(16,185,129,0.15)" },
        ].map((s, i) => (
          <motion.div key={i} initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.05 }}
            className="glass-card p-4" style={{ background: s.bg, border: `1px solid ${s.border}` }}>
            <div className="flex items-center gap-2 mb-2">{s.icon}<span className="text-xs text-muted">{s.label}</span></div>
            <p className="font-orbitron text-xl font-bold text-slate-100">{s.value}</p>
          </motion.div>
        ))}
      </div>

      {/* Tabs */}
      <div className="flex gap-1 p-1 rounded-xl w-fit" style={{ background: "rgba(255,255,255,0.04)" }}>
        {(["overview", "csr", "participation", "diversity"] as const).map((tab) => (
          <button key={tab} onClick={() => setActiveTab(tab)}
            className={`px-4 py-2 rounded-lg text-xs font-medium capitalize transition-all ${activeTab === tab ? "bg-cyan-500 text-white" : "text-muted hover:text-slate-300"}`}>
            {tab}
          </button>
        ))}
      </div>

      {activeTab === "overview" && (
        <div className="grid grid-cols-1 xl:grid-cols-2 gap-6">
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="glass-card p-6">
            <h3 className="font-orbitron text-sm font-semibold text-slate-200 mb-4">Department Engagement Rate</h3>
            <ResponsiveContainer width="100%" height={240}>
              <BarChart data={engagementData} margin={{ left: -20 }}>
                <CartesianGrid stroke="rgba(255,255,255,0.04)" vertical={false} />
                <XAxis dataKey="dept" tick={{ fill: "#475569", fontSize: 10 }} axisLine={false} tickLine={false} />
                <YAxis tick={{ fill: "#475569", fontSize: 11 }} axisLine={false} tickLine={false} domain={[0, 100]} />
                <Tooltip contentStyle={{ background: "#0d1829", border: "1px solid rgba(255,255,255,0.1)", borderRadius: 10 }} />
                <Bar dataKey="rate" name="Engagement %" radius={[6, 6, 0, 0]} maxBarSize={40}>
                  {engagementData.map((_, i) => <Cell key={i} fill={`hsl(${160 + i * 20}, 70%, 50%)`} />)}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </motion.div>

          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="glass-card p-6">
            <h3 className="font-orbitron text-sm font-semibold text-slate-200 mb-4">Diversity Index</h3>
            <ResponsiveContainer width="100%" height={180}>
              <RadialBarChart innerRadius="30%" outerRadius="90%" data={diversityData} startAngle={90} endAngle={-270}>
                <RadialBar dataKey="value" cornerRadius={4} />
                <Tooltip contentStyle={{ background: "#0d1829", border: "1px solid rgba(255,255,255,0.1)", borderRadius: 10 }} />
              </RadialBarChart>
            </ResponsiveContainer>
            <div className="grid grid-cols-2 gap-2 mt-2">
              {diversityData.map((d) => (
                <div key={d.name} className="flex items-center gap-2 text-xs">
                  <div className="w-2 h-2 rounded-full flex-shrink-0" style={{ background: d.fill }} />
                  <span className="text-muted truncate">{d.name}</span>
                  <span className="text-slate-300 font-medium ml-auto">{d.value}%</span>
                </div>
              ))}
            </div>
          </motion.div>
        </div>
      )}

      {activeTab === "csr" && (
        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
          {csrActivities.map((a, i) => (
            <motion.div key={a.id} initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.06 }} className="glass-card p-5">
              <div className="flex items-start justify-between mb-3">
                <div>
                  <h3 className="text-sm font-semibold text-slate-200">{a.title}</h3>
                  <span className="text-xs badge-cyan px-2 py-0.5 rounded-full mt-1 inline-block">{a.category}</span>
                </div>
                <span className={`text-xs px-2 py-0.5 rounded-full ${a.status === "completed" ? "badge-emerald" : "badge-amber"}`}>
                  {a.status}
                </span>
              </div>
              <div className="flex items-center justify-between text-xs text-muted mb-3">
                <span>📅 {a.date}</span>
                <span>🏆 {a.points} pts</span>
              </div>
              <div className="mb-2">
                <div className="flex justify-between text-xs mb-1">
                  <span className="text-muted">Participants</span>
                  <span className="text-slate-300">{a.participants}/{a.max}</span>
                </div>
                <div className="w-full bg-white/5 rounded-full h-1.5">
                  <motion.div className="h-1.5 rounded-full bg-cyan-400" initial={{ width: 0 }}
                    animate={{ width: `${(a.participants / a.max) * 100}%` }} transition={{ duration: 1, delay: i * 0.1 }} />
                </div>
              </div>
              <button className="w-full mt-3 py-1.5 rounded-lg text-xs font-medium border border-cyan-500/25 text-cyan-400 hover:bg-cyan-500/10 transition-colors">
                View Details
              </button>
            </motion.div>
          ))}
        </motion.div>
      )}

      {activeTab === "participation" && (
        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="glass-card overflow-hidden">
          <div className="p-5 border-b border-white/5">
            <h3 className="font-orbitron text-sm font-semibold text-slate-200">Employee Participation</h3>
          </div>
          <table className="data-table">
            <thead><tr><th>Employee</th><th>Activity</th><th>Status</th><th>Points</th><th>Date</th><th>Actions</th></tr></thead>
            <tbody>
              {participations.map((p, i) => (
                <tr key={i}>
                  <td className="font-medium text-slate-200">{p.name}</td>
                  <td className="text-muted text-xs">{p.activity}</td>
                  <td>
                    <div className="flex items-center gap-1.5">
                      {STATUS_ICONS[p.status as keyof typeof STATUS_ICONS]}
                      <span className="text-xs capitalize">{p.status}</span>
                    </div>
                  </td>
                  <td><span className="font-orbitron text-xs text-amber-400">{p.points > 0 ? `+${p.points}` : "—"}</span></td>
                  <td className="text-muted text-xs">{p.date}</td>
                  <td>
                    {p.status === "pending" && (
                      <div className="flex gap-2">
                        <button className="text-xs badge-emerald px-2 py-0.5 rounded-full">Approve</button>
                        <button className="text-xs badge-rose px-2 py-0.5 rounded-full">Reject</button>
                      </div>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </motion.div>
      )}

      {activeTab === "diversity" && (
        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {diversityData.map((d, i) => (
            <div key={i} className="glass-card p-6">
              <h3 className="text-sm font-semibold text-slate-200 mb-1">{d.name}</h3>
              <div className="flex items-end gap-2 mb-3">
                <span className="font-orbitron text-3xl font-bold" style={{ color: d.fill }}>{d.value}%</span>
                <span className="text-xs text-muted mb-1">of workforce</span>
              </div>
              <div className="w-full bg-white/5 rounded-full h-3">
                <motion.div className="h-3 rounded-full" style={{ background: d.fill }}
                  initial={{ width: 0 }} animate={{ width: `${d.value}%` }} transition={{ duration: 1.2, delay: i * 0.1 }} />
              </div>
              <p className="text-xs text-muted mt-3">Industry benchmark: 50% · {d.value >= 50 ? "✅ Exceeding" : "⚠️ Below target"}</p>
            </div>
          ))}
        </motion.div>
      )}
    </div>
  );
}
