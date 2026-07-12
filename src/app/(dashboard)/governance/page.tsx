"use client";

import { motion } from "framer-motion";
import { useState } from "react";
import { Shield, FileText, AlertTriangle, CheckCircle, Clock, XCircle, Plus, Calendar } from "lucide-react";

const policies = [
  { id: 1, title: "Carbon Emissions Disclosure Policy", category: "Environmental", version: "2.1", effective: "Jan 2026", requires: true, ackRate: 94, status: "active" },
  { id: 2, title: "Employee Diversity & Inclusion Policy", category: "Social", version: "1.3", effective: "Mar 2025", requires: true, ackRate: 87, status: "active" },
  { id: 3, title: "Anti-Corruption & Bribery Policy", category: "Governance", version: "3.0", effective: "Jun 2025", requires: true, ackRate: 100, status: "active" },
  { id: 4, title: "Data Privacy & GDPR Compliance", category: "Governance", version: "2.0", effective: "Sep 2025", requires: true, ackRate: 78, status: "active" },
  { id: 5, title: "Health & Safety Framework", category: "Social", version: "1.5", effective: "Feb 2026", requires: false, ackRate: 65, status: "active" },
];

const audits = [
  { id: 1, title: "Q2 Carbon Emissions Audit", policy: "Carbon Emissions Policy", date: "Jun 30", auditor: "Alex M.", score: 88, status: "completed" },
  { id: 2, title: "Annual Governance Review", policy: "Anti-Corruption Policy", date: "Jul 15", auditor: "Admin", score: null, status: "planned" },
  { id: 3, title: "Data Privacy Assessment", policy: "GDPR Policy", date: "Jul 5", auditor: "Sarah K.", score: 72, status: "completed" },
  { id: 4, title: "H&S Site Inspection", policy: "Health & Safety", date: "Jul 20", auditor: "Admin", score: null, status: "in_progress" },
];

const complianceIssues = [
  { id: 1, title: "Missing emissions documentation", severity: "critical", owner: "Ops Team", due: "Jul 10", status: "open", overdue: true },
  { id: 2, title: "5 unsigned policy acknowledgements", severity: "medium", owner: "HR Dept", due: "Jul 18", status: "in_progress", overdue: false },
  { id: 3, title: "Fleet tracker data gap — Jun 15-22", severity: "high", owner: "Fleet Mgr", due: "Jul 15", status: "open", overdue: false },
  { id: 4, title: "Supplier audit documentation", severity: "low", owner: "Procurement", due: "Aug 1", status: "open", overdue: false },
];

const SEVERITY_STYLES = {
  critical: "badge-rose",
  high: "badge-amber",
  medium: "badge-purple",
  low: "badge-cyan",
};

const AUDIT_STATUS = {
  completed: { label: "Completed", cls: "badge-emerald" },
  planned: { label: "Planned", cls: "badge-cyan" },
  in_progress: { label: "In Progress", cls: "badge-amber" },
  cancelled: { label: "Cancelled", cls: "badge-rose" },
};

export default function GovernancePage() {
  const [activeTab, setActiveTab] = useState<"overview" | "policies" | "audits" | "compliance">("overview");

  const overdue = complianceIssues.filter((i) => i.overdue).length;
  const openIssues = complianceIssues.filter((i) => i.status === "open").length;

  return (
    <div className="space-y-6 max-w-[1600px] mx-auto">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="font-orbitron text-2xl font-bold gradient-text-purple">🏛 Governance</h1>
          <p className="text-sm text-muted mt-1">Policies, audits, compliance tracking & risk management</p>
        </div>
        <button className="px-4 py-2 rounded-xl text-sm font-medium flex items-center gap-2 text-purple-400 border border-purple-500/25 hover:bg-purple-500/10 transition-colors">
          <Plus size={15} /> New Policy
        </button>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {[
          { label: "Active Policies", value: "5", icon: <FileText size={16} className="text-purple-400" />, bg: "rgba(139,92,246,0.08)", border: "rgba(139,92,246,0.15)" },
          { label: "Audits This Month", value: "4", icon: <Shield size={16} className="text-cyan-400" />, bg: "rgba(6,182,212,0.08)", border: "rgba(6,182,212,0.15)" },
          { label: "Open Issues", value: String(openIssues), icon: <AlertTriangle size={16} className="text-amber-400" />, bg: "rgba(245,158,11,0.08)", border: "rgba(245,158,11,0.15)" },
          { label: "Overdue Issues", value: String(overdue), icon: <XCircle size={16} className="text-rose-400" />, bg: "rgba(244,63,94,0.1)", border: "rgba(244,63,94,0.2)" },
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
        {(["overview", "policies", "audits", "compliance"] as const).map((tab) => (
          <button key={tab} onClick={() => setActiveTab(tab)}
            className={`px-4 py-2 rounded-lg text-xs font-medium capitalize transition-all ${activeTab === tab ? "bg-purple-600 text-white" : "text-muted hover:text-slate-300"}`}>
            {tab}
          </button>
        ))}
      </div>

      {activeTab === "overview" && (
        <div className="grid grid-cols-1 xl:grid-cols-2 gap-6">
          {/* Risk Matrix */}
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="glass-card p-6">
            <h3 className="font-orbitron text-sm font-semibold text-slate-200 mb-4">Compliance Risk Matrix</h3>
            <div className="grid grid-cols-4 gap-1 text-center text-xs">
              <div />
              {["Low Likelihood", "Medium", "High Likelihood"].map((h) => (
                <div key={h} className="text-muted py-1 text-xs">{h}</div>
              ))}
              {[
                { label: "Critical Impact", cells: ["rgba(245,158,11,0.15)", "rgba(244,63,94,0.2)", "rgba(244,63,94,0.35)"] },
                { label: "High Impact", cells: ["rgba(16,185,129,0.1)", "rgba(245,158,11,0.15)", "rgba(244,63,94,0.2)"] },
                { label: "Low Impact", cells: ["rgba(16,185,129,0.06)", "rgba(16,185,129,0.1)", "rgba(245,158,11,0.12)"] },
              ].map((row) => (
                <>
                  <div key={row.label} className="text-muted py-2 text-right pr-2 flex items-center justify-end text-xs">{row.label}</div>
                  {row.cells.map((bg, j) => (
                    <div key={j} className="rounded-lg h-14 flex items-center justify-center text-xs" style={{ background: bg }}>
                      {j === 2 && row.label === "Critical Impact" && <span className="text-rose-400 font-bold">HIGH</span>}
                    </div>
                  ))}
                </>
              ))}
            </div>
          </motion.div>

          {/* Policy Acknowledgement Overview */}
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="glass-card p-6">
            <h3 className="font-orbitron text-sm font-semibold text-slate-200 mb-4">Policy Acknowledgement Rates</h3>
            <div className="space-y-4">
              {policies.map((p, i) => (
                <div key={p.id}>
                  <div className="flex items-center justify-between mb-1.5">
                    <span className="text-xs text-slate-300 truncate max-w-[180px]">{p.title}</span>
                    <span className="text-xs font-orbitron font-bold" style={{ color: p.ackRate >= 90 ? "#10b981" : p.ackRate >= 75 ? "#f59e0b" : "#f43f5e" }}>
                      {p.ackRate}%
                    </span>
                  </div>
                  <div className="w-full bg-white/5 rounded-full h-1.5">
                    <motion.div className="h-1.5 rounded-full" initial={{ width: 0 }}
                      animate={{ width: `${p.ackRate}%` }} transition={{ duration: 1, delay: i * 0.1 }}
                      style={{ background: p.ackRate >= 90 ? "#10b981" : p.ackRate >= 75 ? "#f59e0b" : "#f43f5e" }} />
                  </div>
                </div>
              ))}
            </div>
          </motion.div>
        </div>
      )}

      {activeTab === "policies" && (
        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="space-y-3">
          {policies.map((p, i) => (
            <motion.div key={p.id} initial={{ opacity: 0, x: -10 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: i * 0.05 }}
              className="glass-card p-5 flex items-center gap-4">
              <div className="w-10 h-10 rounded-xl bg-purple-500/10 border border-purple-500/20 flex items-center justify-center flex-shrink-0">
                <FileText size={18} className="text-purple-400" />
              </div>
              <div className="flex-1 min-w-0">
                <h3 className="text-sm font-semibold text-slate-200 truncate">{p.title}</h3>
                <div className="flex items-center gap-2 mt-1">
                  <span className="text-xs badge-purple px-2 py-0.5 rounded-full">{p.category}</span>
                  <span className="text-xs text-muted">v{p.version}</span>
                  <span className="text-xs text-muted">· Effective {p.effective}</span>
                </div>
              </div>
              <div className="text-right flex-shrink-0">
                <p className="text-xs text-muted mb-1">Acknowledgement</p>
                <p className="font-orbitron text-lg font-bold" style={{ color: p.ackRate >= 90 ? "#10b981" : "#f59e0b" }}>{p.ackRate}%</p>
              </div>
              <div className="flex items-center gap-2">
                {p.requires && <span className="text-xs badge-amber px-2 py-0.5 rounded-full">Requires Ack</span>}
                <button className="text-xs text-purple-400 hover:text-purple-300 transition-colors border border-purple-500/20 px-3 py-1.5 rounded-lg">
                  View
                </button>
              </div>
            </motion.div>
          ))}
        </motion.div>
      )}

      {activeTab === "audits" && (
        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="space-y-3">
          {audits.map((a, i) => (
            <motion.div key={a.id} initial={{ opacity: 0, x: -10 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: i * 0.05 }}
              className="glass-card p-5 flex items-center gap-4">
              <div className="w-10 h-10 rounded-xl bg-cyan-500/10 border border-cyan-500/20 flex items-center justify-center flex-shrink-0">
                <Shield size={18} className="text-cyan-400" />
              </div>
              <div className="flex-1 min-w-0">
                <h3 className="text-sm font-semibold text-slate-200">{a.title}</h3>
                <div className="flex items-center gap-2 mt-1">
                  <Calendar size={10} className="text-muted" />
                  <span className="text-xs text-muted">{a.date}</span>
                  <span className="text-xs text-muted">· {a.auditor}</span>
                </div>
              </div>
              {a.score !== null && (
                <div className="text-right">
                  <p className="font-orbitron text-xl font-bold" style={{ color: a.score >= 80 ? "#10b981" : "#f59e0b" }}>{a.score}</p>
                  <p className="text-xs text-muted">/ 100</p>
                </div>
              )}
              <span className={`text-xs px-2.5 py-1 rounded-full ${AUDIT_STATUS[a.status as keyof typeof AUDIT_STATUS].cls}`}>
                {AUDIT_STATUS[a.status as keyof typeof AUDIT_STATUS].label}
              </span>
            </motion.div>
          ))}
          <button className="px-4 py-2.5 rounded-xl text-sm font-medium flex items-center gap-2 text-cyan-400 border border-cyan-500/25 hover:bg-cyan-500/10 transition-colors w-fit">
            <Plus size={15} /> Schedule Audit
          </button>
        </motion.div>
      )}

      {activeTab === "compliance" && (
        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="space-y-3">
          {complianceIssues.map((issue, i) => (
            <motion.div key={issue.id} initial={{ opacity: 0, x: -10 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: i * 0.05 }}
              className="glass-card p-5"
              style={issue.overdue ? { border: "1px solid rgba(244,63,94,0.25)", boxShadow: "0 0 20px rgba(244,63,94,0.05)" } : {}}>
              <div className="flex items-start gap-4">
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 mb-1">
                    <h3 className="text-sm font-semibold text-slate-200">{issue.title}</h3>
                    {issue.overdue && (
                      <span className="text-xs badge-rose px-2 py-0.5 rounded-full flex items-center gap-1">
                        <AlertTriangle size={9} /> OVERDUE
                      </span>
                    )}
                  </div>
                  <div className="flex items-center gap-3 text-xs text-muted">
                    <span>Owner: {issue.owner}</span>
                    <span>Due: {issue.due}</span>
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <span className={`text-xs px-2 py-0.5 rounded-full capitalize ${SEVERITY_STYLES[issue.severity as keyof typeof SEVERITY_STYLES]}`}>
                    {issue.severity}
                  </span>
                  <span className={`text-xs px-2 py-0.5 rounded-full capitalize ${issue.status === "in_progress" ? "badge-amber" : "badge-rose"}`}>
                    {issue.status}
                  </span>
                </div>
              </div>
            </motion.div>
          ))}
          <button className="px-4 py-2.5 rounded-xl text-sm font-medium flex items-center gap-2 text-rose-400 border border-rose-500/25 hover:bg-rose-500/10 transition-colors w-fit">
            <Plus size={15} /> Log Compliance Issue
          </button>
        </motion.div>
      )}
    </div>
  );
}
