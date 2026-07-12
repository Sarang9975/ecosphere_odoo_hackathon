"use client";

import { motion } from "framer-motion";
import { useState } from "react";
import { BarChart3, Download, Filter, FileText, Leaf, Users, Shield, Plus } from "lucide-react";
import {
  AreaChart, Area, BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Cell, Legend,
} from "recharts";

const reportTypes = [
  { id: "environmental", label: "Environmental Report", icon: <Leaf size={16} />, color: "#10b981", desc: "Carbon emissions, goals & factors" },
  { id: "social", label: "Social Report", icon: <Users size={16} />, color: "#06b6d4", desc: "CSR activities & participation" },
  { id: "governance", label: "Governance Report", icon: <Shield size={16} />, color: "#8b5cf6", desc: "Policies, audits & compliance" },
  { id: "esg_summary", label: "ESG Summary Report", icon: <BarChart3 size={16} />, color: "#f59e0b", desc: "Full organizational overview" },
];

const esgTrendData = [
  { period: "Q1 2025", env: 65, soc: 70, gov: 62, total: 66 },
  { period: "Q2 2025", env: 68, soc: 73, gov: 66, total: 69 },
  { period: "Q3 2025", env: 71, soc: 76, gov: 68, total: 72 },
  { period: "Q4 2025", env: 70, soc: 78, gov: 70, total: 73 },
  { period: "Q1 2026", env: 73, soc: 80, gov: 70, total: 74 },
  { period: "Q2 2026", env: 74, soc: 82, gov: 71, total: 76 },
];

const deptESG = [
  { name: "Engineering", env: 90, soc: 85, gov: 88 },
  { name: "HR", env: 75, soc: 95, gov: 80 },
  { name: "Marketing", env: 70, soc: 88, gov: 78 },
  { name: "Finance", env: 65, soc: 72, gov: 88 },
  { name: "Operations", env: 55, soc: 65, gov: 64 },
];

export default function ReportsPage() {
  const [activeReport, setActiveReport] = useState("esg_summary");
  const [filters, setFilters] = useState({ department: "all", dateRange: "Q2-2026", module: "all" });
  const [generating, setGenerating] = useState(false);

  const handleGenerate = (format: string) => {
    setGenerating(true);
    setTimeout(() => {
      setGenerating(false);
      alert(`${format} report generated! In a live deployment, this would download the file.`);
    }, 1500);
  };

  return (
    <div className="space-y-6 max-w-[1600px] mx-auto">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="font-orbitron text-2xl font-bold gradient-text-emerald">📊 Reports & Analytics</h1>
          <p className="text-sm text-muted mt-1">Generate, filter & export comprehensive ESG reports</p>
        </div>
      </div>

      {/* Report type selector */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
        {reportTypes.map((r) => (
          <motion.button
            key={r.id}
            onClick={() => setActiveReport(r.id)}
            whileHover={{ y: -2 }}
            whileTap={{ scale: 0.98 }}
            className="glass-card p-4 text-left transition-all"
            style={activeReport === r.id ? { border: `1px solid ${r.color}40`, boxShadow: `0 0 20px ${r.color}10` } : {}}
          >
            <div className="w-9 h-9 rounded-xl flex items-center justify-center mb-3" style={{ background: `${r.color}15`, color: r.color }}>
              {r.icon}
            </div>
            <p className="text-xs font-semibold text-slate-200">{r.label}</p>
            <p className="text-xs text-muted mt-0.5">{r.desc}</p>
            {activeReport === r.id && (
              <motion.div className="mt-2 h-0.5 rounded-full" style={{ background: r.color }} layoutId="reportUnderline" />
            )}
          </motion.button>
        ))}
      </div>

      {/* Filters */}
      <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="glass-card p-5">
        <div className="flex items-center gap-2 mb-4">
          <Filter size={14} className="text-slate-400" />
          <h3 className="font-orbitron text-sm font-semibold text-slate-200">Report Filters</h3>
        </div>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          {[
            { label: "Department", options: ["All Departments", "Engineering", "HR", "Marketing", "Finance", "Operations"] },
            { label: "Date Range", options: ["Q2 2026", "Q1 2026", "Q4 2025", "FY 2025", "Custom Range"] },
            { label: "Module", options: ["All Modules", "Environmental", "Social", "Governance"] },
            { label: "Employee", options: ["All Employees", "Sarah K.", "Alex M.", "Priya R."] },
          ].map((f) => (
            <div key={f.label}>
              <label className="text-xs text-muted mb-1.5 block">{f.label}</label>
              <select className="input-field text-xs">
                {f.options.map((o) => <option key={o}>{o}</option>)}
              </select>
            </div>
          ))}
        </div>

        {/* Export buttons */}
        <div className="flex items-center gap-2 mt-4 pt-4 border-t border-white/5">
          <span className="text-xs text-muted mr-2">Export as:</span>
          {["PDF", "Excel", "CSV"].map((fmt) => (
            <motion.button
              key={fmt}
              onClick={() => handleGenerate(fmt)}
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              disabled={generating}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium border transition-all"
              style={
                fmt === "PDF" ? { borderColor: "rgba(244,63,94,0.3)", color: "#f43f5e", background: "rgba(244,63,94,0.06)" } :
                fmt === "Excel" ? { borderColor: "rgba(16,185,129,0.3)", color: "#10b981", background: "rgba(16,185,129,0.06)" } :
                { borderColor: "rgba(6,182,212,0.3)", color: "#06b6d4", background: "rgba(6,182,212,0.06)" }
              }
            >
              <Download size={11} />
              {generating ? "..." : fmt}
            </motion.button>
          ))}

          <motion.button
            onClick={() => {}}
            whileHover={{ scale: 1.02 }}
            className="ml-auto flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium border border-amber-500/25 text-amber-400"
          >
            <Plus size={11} /> Custom Report Builder
          </motion.button>
        </div>
      </motion.div>

      {/* Charts */}
      <div className="grid grid-cols-1 xl:grid-cols-2 gap-6">
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="glass-card p-6">
          <h3 className="font-orbitron text-sm font-semibold text-slate-200 mb-4">ESG Score Trend (Historical)</h3>
          <ResponsiveContainer width="100%" height={240}>
            <AreaChart data={esgTrendData}>
              <defs>
                {[["ge", "#10b981"], ["gs", "#06b6d4"], ["gg", "#8b5cf6"], ["gt", "#f59e0b"]].map(([id, c]) => (
                  <linearGradient key={id} id={id} x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor={c} stopOpacity={0.25} />
                    <stop offset="95%" stopColor={c} stopOpacity={0} />
                  </linearGradient>
                ))}
              </defs>
              <CartesianGrid stroke="rgba(255,255,255,0.04)" vertical={false} />
              <XAxis dataKey="period" tick={{ fill: "#475569", fontSize: 10 }} axisLine={false} tickLine={false} />
              <YAxis domain={[50, 100]} tick={{ fill: "#475569", fontSize: 11 }} axisLine={false} tickLine={false} />
              <Tooltip contentStyle={{ background: "#0d1829", border: "1px solid rgba(255,255,255,0.1)", borderRadius: 10 }} />
              <Legend wrapperStyle={{ fontSize: 11, color: "#64748b" }} />
              <Area type="monotone" dataKey="env" name="Environmental" stroke="#10b981" fill="url(#ge)" strokeWidth={2} />
              <Area type="monotone" dataKey="soc" name="Social" stroke="#06b6d4" fill="url(#gs)" strokeWidth={2} />
              <Area type="monotone" dataKey="gov" name="Governance" stroke="#8b5cf6" fill="url(#gg)" strokeWidth={2} />
              <Area type="monotone" dataKey="total" name="Total ESG" stroke="#f59e0b" fill="url(#gt)" strokeWidth={2.5} strokeDasharray="5 3" />
            </AreaChart>
          </ResponsiveContainer>
        </motion.div>

        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }} className="glass-card p-6">
          <h3 className="font-orbitron text-sm font-semibold text-slate-200 mb-4">Department E / S / G Breakdown</h3>
          <ResponsiveContainer width="100%" height={240}>
            <BarChart data={deptESG} margin={{ left: -20 }}>
              <CartesianGrid stroke="rgba(255,255,255,0.04)" vertical={false} />
              <XAxis dataKey="name" tick={{ fill: "#475569", fontSize: 10 }} axisLine={false} tickLine={false} />
              <YAxis domain={[0, 100]} tick={{ fill: "#475569", fontSize: 11 }} axisLine={false} tickLine={false} />
              <Tooltip contentStyle={{ background: "#0d1829", border: "1px solid rgba(255,255,255,0.1)", borderRadius: 10 }} />
              <Legend wrapperStyle={{ fontSize: 11, color: "#64748b" }} />
              <Bar dataKey="env" name="Environmental" fill="#10b981" radius={[3, 3, 0, 0]} maxBarSize={14} />
              <Bar dataKey="soc" name="Social" fill="#06b6d4" radius={[3, 3, 0, 0]} maxBarSize={14} />
              <Bar dataKey="gov" name="Governance" fill="#8b5cf6" radius={[3, 3, 0, 0]} maxBarSize={14} />
            </BarChart>
          </ResponsiveContainer>
        </motion.div>
      </div>

      {/* Recent Reports */}
      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.15 }} className="glass-card overflow-hidden">
        <div className="p-5 border-b border-white/5">
          <h3 className="font-orbitron text-sm font-semibold text-slate-200">Generated Reports</h3>
        </div>
        <table className="data-table">
          <thead><tr><th>Report Name</th><th>Type</th><th>Period</th><th>Generated</th><th>Format</th><th>Actions</th></tr></thead>
          <tbody>
            {[
              { name: "Q2 2026 ESG Summary", type: "ESG Summary", period: "Apr-Jun 2026", date: "Jul 1", fmt: "PDF" },
              { name: "Q1 2026 Environmental Report", type: "Environmental", period: "Jan-Mar 2026", date: "Apr 3", fmt: "Excel" },
              { name: "FY 2025 Governance Audit", type: "Governance", period: "Full Year 2025", date: "Jan 15", fmt: "PDF" },
              { name: "Jun 2026 Social Impact", type: "Social", period: "June 2026", date: "Jul 2", fmt: "CSV" },
            ].map((r, i) => (
              <tr key={i}>
                <td className="font-medium text-slate-200"><div className="flex items-center gap-2"><FileText size={13} className="text-muted" />{r.name}</div></td>
                <td><span className="text-xs badge-cyan px-2 py-0.5 rounded-full">{r.type}</span></td>
                <td className="text-muted text-xs">{r.period}</td>
                <td className="text-muted text-xs">{r.date}</td>
                <td><span className={`text-xs px-2 py-0.5 rounded-full ${r.fmt === "PDF" ? "badge-rose" : r.fmt === "Excel" ? "badge-emerald" : "badge-cyan"}`}>{r.fmt}</span></td>
                <td><button className="text-xs text-emerald-400 hover:text-emerald-300 transition-colors flex items-center gap-1"><Download size={11} />Download</button></td>
              </tr>
            ))}
          </tbody>
        </table>
      </motion.div>
    </div>
  );
}
