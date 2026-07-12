"use client";

import { motion, AnimatePresence } from "framer-motion";
import { useState, useEffect } from "react";
import { Shield, FileText, AlertTriangle, CheckCircle, Clock, XCircle, Plus, Calendar, X } from "lucide-react";
import { getGovernanceData, createPolicy, scheduleAudit, createComplianceIssue, resolveComplianceIssue, acknowledgePolicy } from "@/actions/governance";
import { Severity, PolicyCategory } from "@prisma/client";

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

  // Data States
  const [loading, setLoading] = useState(true);
  const [policies, setPolicies] = useState<any[]>([]);
  const [audits, setAudits] = useState<any[]>([]);
  const [complianceIssues, setComplianceIssues] = useState<any[]>([]);
  const [stats, setStats] = useState({ activePolicies: 5, auditsCount: 4, openIssues: 3, overdueIssues: 1 });
  const [users, setUsers] = useState<any[]>([]);

  // Dialog State
  const [isPolicyModalOpen, setIsPolicyModalOpen] = useState(false);
  const [isIssueModalOpen, setIsIssueModalOpen] = useState(false);

  // Policy Form State
  const [policyTitle, setPolicyTitle] = useState("");
  const [policyDesc, setPolicyDesc] = useState("");
  const [policyCategory, setPolicyCategory] = useState<PolicyCategory>(PolicyCategory.ENVIRONMENTAL);
  const [policyVersion, setPolicyVersion] = useState("1.0");
  const [policyDate, setPolicyDate] = useState("");
  const [policyReqAck, setPolicyReqAck] = useState(true);

  // Compliance Issue Form State
  const [issueTitle, setIssueTitle] = useState("");
  const [issueDesc, setIssueDesc] = useState("");
  const [issueSeverity, setIssueSeverity] = useState<Severity>(Severity.MEDIUM);
  const [issueOwnerId, setIssueOwnerId] = useState("");
  const [issueDueDate, setIssueDueDate] = useState("");

  const loadData = async () => {
    try {
      setLoading(true);
      const res = await getGovernanceData();
      
      // Fetch users for compliance issue owner dropdown
      setUsers(res.users || []);

      setPolicies(res.policies);
      setAudits(res.audits);
      setComplianceIssues(res.complianceIssues);
      setStats({
        activePolicies: res.stats.activePolicies,
        auditsCount: res.stats.auditsCount,
        openIssues: res.stats.openIssues,
        overdueIssues: res.stats.overdueIssues,
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

  const handleCreatePolicy = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await createPolicy({
        title: policyTitle,
        description: policyDesc,
        category: policyCategory,
        version: policyVersion,
        effectiveDate: new Date(policyDate),
        requiresAck: policyReqAck,
      });
      setIsPolicyModalOpen(false);
      // Reset
      setPolicyTitle("");
      setPolicyDesc("");
      loadData();
    } catch (e) {
      console.error(e);
    }
  };

  const handleCreateIssue = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await createComplianceIssue({
        title: issueTitle,
        description: issueDesc,
        severity: issueSeverity,
        ownerId: issueOwnerId || undefined,
        dueDate: new Date(issueDueDate),
      });
      setIsIssueModalOpen(false);
      // Reset
      setIssueTitle("");
      setIssueDesc("");
      loadData();
    } catch (e) {
      console.error(e);
    }
  };

  const handleResolveIssue = async (id: string) => {
    try {
      await resolveComplianceIssue(id);
      loadData();
    } catch (e) {
      console.error(e);
    }
  };

  const handleAckPolicy = async (policyId: string) => {
    try {
      // Mocking Sarah K.'s acknowledgement
      const sarahUser = users.find(u => u.name === "Sarah K.") || users[0];
      if (sarahUser) {
        await acknowledgePolicy(policyId, sarahUser.id);
        alert("Policy Acknowledged successfully!");
        loadData();
      }
    } catch (e) {
      console.error(e);
    }
  };

  if (loading && policies.length === 0) {
    return (
      <div className="w-full h-96 flex items-center justify-center">
        <div className="text-center">
          <div className="text-4xl mb-2 animate-bounce">🏛</div>
          <p className="font-orbitron text-xs text-purple-400">Loading Governance analytics Twin...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6 max-w-[1600px] mx-auto">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="font-orbitron text-2xl font-bold gradient-text-purple">🏛 Governance</h1>
          <p className="text-sm text-muted mt-1">Policies, audits, compliance tracking & risk management</p>
        </div>
        <button 
          onClick={() => setIsPolicyModalOpen(true)}
          className="px-4 py-2 rounded-xl text-sm font-medium flex items-center gap-2 text-purple-400 border border-purple-500/25 hover:bg-purple-500/10 transition-colors"
        >
          <Plus size={15} /> New Policy
        </button>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {[
          { label: "Active Policies", value: String(stats.activePolicies), icon: <FileText size={16} className="text-purple-400" />, bg: "rgba(139,92,246,0.08)", border: "rgba(139,92,246,0.15)" },
          { label: "Audits This Month", value: String(stats.auditsCount), icon: <Shield size={16} className="text-cyan-400" />, bg: "rgba(6,182,212,0.08)", border: "rgba(6,182,212,0.15)" },
          { label: "Open Issues", value: String(stats.openIssues), icon: <AlertTriangle size={16} className="text-amber-400" />, bg: "rgba(245,158,11,0.08)", border: "rgba(245,158,11,0.15)" },
          { label: "Overdue Issues", value: String(stats.overdueIssues), icon: <XCircle size={16} className="text-rose-400" />, bg: "rgba(244,63,94,0.1)", border: "rgba(244,63,94,0.2)" },
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
                {p.requires && !p.userAcknowledged && (
                  <button 
                    onClick={() => handleAckPolicy(p.id)}
                    className="text-xs badge-amber px-3 py-1.5 rounded-lg border border-amber-500/20"
                  >
                    Acknowledge
                  </button>
                )}
                {p.userAcknowledged && (
                  <span className="text-xs text-emerald-400 flex items-center gap-1">
                    <CheckCircle size={12} /> Signed
                  </span>
                )}
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
              <span className={`text-xs px-2.5 py-1 rounded-full ${AUDIT_STATUS[a.status as keyof typeof AUDIT_STATUS]?.cls || "badge-cyan"}`}>
                {AUDIT_STATUS[a.status as keyof typeof AUDIT_STATUS]?.label || a.status}
              </span>
            </motion.div>
          ))}
        </motion.div>
      )}

      {activeTab === "compliance" && (
        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="space-y-3">
          <div className="flex justify-end mb-2">
            <button 
              onClick={() => setIsIssueModalOpen(true)}
              className="px-4 py-2 rounded-xl text-xs font-semibold text-rose-400 border border-rose-500/25 hover:bg-rose-500/10 transition-all flex items-center gap-1.5"
            >
              <Plus size={13} /> Log Issue
            </button>
          </div>
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
                  <span className={`text-xs px-2 py-0.5 rounded-full capitalize ${issue.status === "in_progress" ? "badge-amber" : issue.status === "resolved" ? "badge-emerald" : "badge-rose"}`}>
                    {issue.status}
                  </span>
                  {issue.status !== "resolved" && (
                    <button 
                      onClick={() => handleResolveIssue(issue.id)}
                      className="text-xs bg-emerald-500/20 hover:bg-emerald-500/30 text-emerald-400 transition-colors px-2 py-0.5 rounded-full border border-emerald-500/20 ml-2"
                    >
                      Resolve
                    </button>
                  )}
                </div>
              </div>
            </motion.div>
          ))}
        </motion.div>
      )}

      {/* New Policy Modal */}
      <AnimatePresence>
        {isPolicyModalOpen && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm">
            <motion.div 
              initial={{ scale: 0.95, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.95, opacity: 0 }}
              className="w-full max-w-lg glass-card border border-white/10 p-6 relative overflow-hidden"
            >
              <button 
                onClick={() => setIsPolicyModalOpen(false)}
                className="absolute top-4 right-4 text-slate-400 hover:text-slate-200 transition-colors"
              >
                <X size={18} />
              </button>

              <div className="flex items-center gap-2 mb-4">
                <FileText className="text-purple-400" size={18} />
                <h3 className="font-orbitron text-base font-semibold text-slate-200">Log New ESG Policy</h3>
              </div>

              <form onSubmit={handleCreatePolicy} className="space-y-4">
                <div>
                  <label className="text-xs text-muted mb-1.5 block">Policy Title</label>
                  <input 
                    type="text" 
                    required 
                    value={policyTitle} 
                    onChange={(e) => setPolicyTitle(e.target.value)}
                    placeholder="e.g. Fair Trade & Supply Chain Conduct"
                    className="input-field text-xs w-full"
                  />
                </div>

                <div>
                  <label className="text-xs text-muted mb-1.5 block">Description / Policy Details</label>
                  <textarea 
                    required 
                    value={policyDesc} 
                    onChange={(e) => setPolicyDesc(e.target.value)}
                    placeholder="Describe policy details..."
                    className="input-field text-xs w-full h-20"
                  />
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="text-xs text-muted mb-1.5 block">Category</label>
                    <select 
                      value={policyCategory} 
                      onChange={(e) => setPolicyCategory(e.target.value as PolicyCategory)}
                      className="input-field text-xs w-full bg-[#0a101d]"
                    >
                      <option value={PolicyCategory.ENVIRONMENTAL}>Environmental</option>
                      <option value={PolicyCategory.SOCIAL}>Social</option>
                      <option value={PolicyCategory.GOVERNANCE}>Governance</option>
                      <option value={PolicyCategory.DIVERSITY}>Diversity</option>
                      <option value={PolicyCategory.HEALTH_SAFETY}>Health & Safety</option>
                      <option value={PolicyCategory.DATA_PRIVACY}>Data Privacy</option>
                      <option value={PolicyCategory.ANTI_CORRUPTION}>Anti-Corruption</option>
                    </select>
                  </div>
                  <div>
                    <label className="text-xs text-muted mb-1.5 block">Effective Date</label>
                    <input 
                      type="date" 
                      required
                      value={policyDate} 
                      onChange={(e) => setPolicyDate(e.target.value)}
                      className="input-field text-xs w-full"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="text-xs text-muted mb-1.5 block">Version</label>
                    <input 
                      type="text" 
                      value={policyVersion} 
                      onChange={(e) => setPolicyVersion(e.target.value)}
                      className="input-field text-xs w-full"
                    />
                  </div>
                  <div className="flex items-center gap-2 pt-6">
                    <input 
                      type="checkbox" 
                      id="requiresAck"
                      checked={policyReqAck} 
                      onChange={(e) => setPolicyReqAck(e.target.checked)}
                      className="w-4 h-4 rounded border-white/10 bg-[#0d1829]"
                    />
                    <label htmlFor="requiresAck" className="text-xs text-muted cursor-pointer">Requires Acknowledgement</label>
                  </div>
                </div>

                <div className="pt-2 flex justify-end gap-2">
                  <button 
                    type="button" 
                    onClick={() => setIsPolicyModalOpen(false)}
                    className="px-4 py-2 rounded-xl text-xs text-slate-400 border border-white/10 hover:bg-white/5 transition-colors"
                  >
                    Cancel
                  </button>
                  <button 
                    type="submit" 
                    className="btn-cyan px-4 py-2 rounded-xl text-xs font-semibold"
                  >
                    Publish Policy
                  </button>
                </div>
              </form>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* New Issue Modal */}
      <AnimatePresence>
        {isIssueModalOpen && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm">
            <motion.div 
              initial={{ scale: 0.95, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.95, opacity: 0 }}
              className="w-full max-w-lg glass-card border border-white/10 p-6 relative overflow-hidden"
            >
              <button 
                onClick={() => setIsIssueModalOpen(false)}
                className="absolute top-4 right-4 text-slate-400 hover:text-slate-200 transition-colors"
              >
                <X size={18} />
              </button>

              <div className="flex items-center gap-2 mb-4">
                <AlertTriangle className="text-rose-400" size={18} />
                <h3 className="font-orbitron text-base font-semibold text-slate-200">Log Compliance Issue</h3>
              </div>

              <form onSubmit={handleCreateIssue} className="space-y-4">
                <div>
                  <label className="text-xs text-muted mb-1.5 block">Issue Title</label>
                  <input 
                    type="text" 
                    required 
                    value={issueTitle} 
                    onChange={(e) => setIssueTitle(e.target.value)}
                    placeholder="e.g. Audit documentation gap"
                    className="input-field text-xs w-full"
                  />
                </div>

                <div>
                  <label className="text-xs text-muted mb-1.5 block">Description / Details</label>
                  <textarea 
                    required 
                    value={issueDesc} 
                    onChange={(e) => setIssueDesc(e.target.value)}
                    placeholder="Provide details about the compliance violation..."
                    className="input-field text-xs w-full h-20"
                  />
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="text-xs text-muted mb-1.5 block">Severity</label>
                    <select 
                      value={issueSeverity} 
                      onChange={(e) => setIssueSeverity(e.target.value as Severity)}
                      className="input-field text-xs w-full bg-[#0a101d]"
                    >
                      <option value={Severity.LOW}>Low</option>
                      <option value={Severity.MEDIUM}>Medium</option>
                      <option value={Severity.HIGH}>High</option>
                      <option value={Severity.CRITICAL}>Critical</option>
                    </select>
                  </div>
                  <div>
                    <label className="text-xs text-muted mb-1.5 block">Due Date</label>
                    <input 
                      type="date" 
                      required
                      value={issueDueDate} 
                      onChange={(e) => setIssueDueDate(e.target.value)}
                      className="input-field text-xs w-full"
                    />
                  </div>
                </div>

                <div>
                  <label className="text-xs text-muted mb-1.5 block">Assigned Owner (User)</label>
                  <select 
                    value={issueOwnerId} 
                    onChange={(e) => setIssueOwnerId(e.target.value)}
                    className="input-field text-xs w-full bg-[#0a101d]"
                  >
                    <option value="">Select User</option>
                    {users.map(u => (
                      <option key={u.id} value={u.id}>{u.name || u.email}</option>
                    ))}
                  </select>
                </div>

                <div className="pt-2 flex justify-end gap-2">
                  <button 
                    type="button" 
                    onClick={() => setIsIssueModalOpen(false)}
                    className="px-4 py-2 rounded-xl text-xs text-slate-400 border border-white/10 hover:bg-white/5 transition-colors"
                  >
                    Cancel
                  </button>
                  <button 
                    type="submit" 
                    className="btn-cyan px-4 py-2 rounded-xl text-xs font-semibold"
                  >
                    Log Compliance Issue
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
