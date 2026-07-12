"use client";

import { motion, AnimatePresence } from "framer-motion";
import { useState, useEffect } from "react";
import { RadialBarChart, RadialBar, ResponsiveContainer, BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Cell } from "recharts";
import { Users, Heart, Star, Plus, CheckCircle, Clock, XCircle, X, Upload, Camera, Image as ImageIcon } from "lucide-react";
import { getCSRData, createCSRActivity, approveCSRParticipation, registerForCSRActivity, submitCSRProof } from "@/actions/social";
import { getEmissionFactors } from "@/actions/environmental";
import { ApprovalStatus } from "@prisma/client";

const diversityData = [
  { name: "Gender Parity", value: 48, fill: "#10b981" },
  { name: "Ethnic Diversity", value: 63, fill: "#06b6d4" },
  { name: "Disability Inclusion", value: 8, fill: "#8b5cf6" },
  { name: "Age Diversity", value: 72, fill: "#f59e0b" },
];

const STATUS_ICONS = {
  approved: <CheckCircle size={13} className="text-emerald-400" />,
  pending: <Clock size={13} className="text-amber-400" />,
  rejected: <XCircle size={13} className="text-rose-400" />,
};

export default function SocialPage() {
  const [activeTab, setActiveTab] = useState<"overview" | "csr" | "participation" | "diversity">("overview");
  
  // Data States
  const [loading, setLoading] = useState(true);
  const [activities, setActivities] = useState<any[]>([]);
  const [participations, setParticipations] = useState<any[]>([]);
  const [engagementData, setEngagementData] = useState<any[]>([]);
  const [stats, setStats] = useState({ totalActivities: 28, activeParticipants: 487, avgEngagementRate: "79%", pointsAwarded: "14.2K" });
  const [categories, setCategories] = useState<any[]>([]);
  const [currentUser, setCurrentUser] = useState<any>(null);

  // Modal State
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [newTitle, setNewTitle] = useState("");
  const [newDescription, setNewDescription] = useState("");
  const [newCategoryId, setNewCategoryId] = useState("");
  const [newDate, setNewDate] = useState("");
  const [newLocation, setNewLocation] = useState("");
  const [newMaxParticipants, setNewMaxParticipants] = useState<number>(50);
  const [newPoints, setNewPoints] = useState<number>(100);
  const [newEvidence, setNewEvidence] = useState(false);

  // Proof Modal State
  const [proofModalOpen, setProofModalOpen] = useState(false);
  const [selectedPartId, setSelectedPartId] = useState("");
  const [proofText, setProofText] = useState("");
  const [proofType, setProofType] = useState<"file" | "link">("file");
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const [lightboxUrl, setLightboxUrl] = useState<string | null>(null);

  const loadData = async () => {
    try {
      setLoading(true);
      const res = await getCSRData();
      
      // Get categories
      setCategories(res.categories || []);

      setCurrentUser(res.currentUser);
      setActivities(res.activities);
      setParticipations(res.participations);
      setEngagementData(res.engagementData);
      
      setStats({
        totalActivities: res.stats.totalActivities,
        activeParticipants: res.stats.activeParticipants,
        avgEngagementRate: `${res.stats.avgEngagementRate}%`,
        pointsAwarded: res.stats.pointsAwarded.toLocaleString(),
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

  const handleCreateActivity = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await createCSRActivity({
        title: newTitle,
        description: newDescription,
        categoryId: newCategoryId || undefined,
        date: new Date(newDate),
        location: newLocation,
        maxParticipants: Number(newMaxParticipants),
        points: Number(newPoints),
        evidenceRequired: newEvidence,
      });
      setIsModalOpen(false);
      // Reset
      setNewTitle("");
      setNewDescription("");
      setNewLocation("");
      loadData();
    } catch (e) {
      console.error(e);
    }
  };

  const handleJoin = async (activityId: string) => {
    try {
      await registerForCSRActivity(activityId);
      loadData();
    } catch (e) {
      console.error(e);
    }
  };

  const handleSubmitProof = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedPartId) return;
    try {
      await submitCSRProof(selectedPartId, proofText);
      setProofModalOpen(false);
      setProofText("");
      setPreviewUrl(null);
      loadData();
    } catch (e) {
      console.error(e);
    }
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        const base64String = reader.result as string;
        setProofText(base64String);
        setPreviewUrl(base64String);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleApprove = async (id: string, status: ApprovalStatus) => {
    try {
      await approveCSRParticipation(id, status);
      loadData();
    } catch (e) {
      console.error(e);
    }
  };

  if (loading && activities.length === 0) {
    return (
      <div className="w-full h-96 flex items-center justify-center">
        <div className="text-center">
          <div className="text-4xl mb-2 animate-bounce">👥</div>
          <p className="font-orbitron text-xs text-cyan-400">Loading CSR analytics twin...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6 max-w-[1600px] mx-auto">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="font-orbitron text-2xl font-bold" style={{ background: "linear-gradient(135deg, #06b6d4, #10b981)", WebkitBackgroundClip: "text", WebkitTextFillColor: "transparent" }}>
            👥 Social Impact
          </h1>
          <p className="text-sm text-muted mt-1">CSR activities, employee participation & diversity metrics</p>
        </div>
        {currentUser && currentUser.role === "EMPLOYEE" ? (
          <div className="flex items-center gap-4 bg-[#0a1220] border border-white/10 px-4 py-2 rounded-xl">
            <div>
              <p className="text-[10px] text-muted uppercase tracking-wider">My Points Balance</p>
              <p className="font-orbitron text-sm font-bold text-amber-400">{currentUser.points} pts</p>
            </div>
            <div className="border-l border-white/10 pl-4">
              <p className="text-[10px] text-muted uppercase tracking-wider">My XP</p>
              <p className="font-orbitron text-sm font-bold text-purple-400">{currentUser.xp} XP</p>
            </div>
          </div>
        ) : (
          (!currentUser || currentUser.role === "MANAGER" || currentUser.role === "ADMIN") && (
            <button 
              onClick={() => setIsModalOpen(true)}
              className="btn-cyan px-4 py-2 rounded-xl text-sm font-medium flex items-center gap-2"
            >
              <Plus size={15} /> New CSR Activity
            </button>
          )
        )}
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {[
          { label: "Total CSR Activities", value: String(stats.totalActivities), icon: <Heart size={16} className="text-rose-400" />, bg: "rgba(244,63,94,0.08)", border: "rgba(244,63,94,0.15)" },
          { label: "Active Participants", value: String(stats.activeParticipants), icon: <Users size={16} className="text-cyan-400" />, bg: "rgba(6,182,212,0.08)", border: "rgba(6,182,212,0.15)" },
          { label: "Avg Engagement Rate", value: stats.avgEngagementRate, icon: <Star size={16} className="text-amber-400" />, bg: "rgba(245,158,11,0.08)", border: "rgba(245,158,11,0.15)" },
          { label: "CSR Points Awarded", value: stats.pointsAwarded, icon: <CheckCircle size={16} className="text-emerald-400" />, bg: "rgba(16,185,129,0.08)", border: "rgba(16,185,129,0.15)" },
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
          {activities.map((a, i) => (
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
                <div className="w-full bg-white/5 rounded-full h-1.5 mb-3">
                  <motion.div className="h-1.5 rounded-full bg-cyan-400" initial={{ width: 0 }}
                    animate={{ width: `${(a.participants / a.max) * 100}%` }} transition={{ duration: 1, delay: i * 0.1 }} />
                </div>
              </div>

              {currentUser && currentUser.role === "EMPLOYEE" && (
                <div className="mt-4 pt-4 border-t border-white/5">
                  {!a.joined ? (
                    <button
                      onClick={() => handleJoin(a.id)}
                      className="w-full py-1.5 rounded-lg text-xs font-semibold border border-cyan-500/25 text-cyan-400 hover:bg-cyan-500/10 transition-all flex items-center justify-center gap-1.5"
                    >
                      <Plus size={13} />
                      <span>Join Activity</span>
                    </button>
                  ) : !a.hasProof ? (
                    <button
                      onClick={() => { setSelectedPartId(a.participationId); setProofModalOpen(true); }}
                      className="w-full py-1.5 rounded-lg text-xs font-semibold bg-gradient-to-r from-cyan-500 to-emerald-500 text-white hover:opacity-90 shadow-md transition-all"
                    >
                      Submit Proof (Upload Pic)
                    </button>
                  ) : a.approvalStatus === "approved" ? (
                    <div className="w-full py-1.5 rounded-lg text-xs font-semibold text-center bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
                      Completed & Verified ✓ (+{a.points} pts)
                    </div>
                  ) : (
                    <div className="w-full py-1.5 rounded-lg text-xs font-semibold text-center bg-amber-500/10 text-amber-400 border border-amber-500/20">
                      Pending Verification...
                    </div>
                  )}
                </div>
              )}
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
            <thead><tr><th>Employee</th><th>Activity</th><th>Status</th><th>Points</th><th>Date</th><th>Evidence</th><th>Actions</th></tr></thead>
            <tbody>
              {participations.map((p, i) => (
                <tr key={i}>
                  <td className="font-medium text-slate-200">{p.name}</td>
                  <td className="text-muted text-xs">{p.activity}</td>
                  <td>
                    <div className="flex items-center gap-1.5">
                      {STATUS_ICONS[p.status as keyof typeof STATUS_ICONS] || STATUS_ICONS.pending}
                      <span className="text-xs capitalize">{p.status}</span>
                    </div>
                  </td>
                  <td><span className="font-orbitron text-xs text-amber-400">{p.points > 0 ? `+${p.points}` : "—"}</span></td>
                  <td className="text-muted text-xs">{p.date}</td>
                  <td>
                    {p.proof ? (
                      p.proof.startsWith("data:image/") ? (
                        <div 
                          onClick={() => setLightboxUrl(p.proof)}
                          className="w-10 h-10 rounded border border-white/10 overflow-hidden cursor-pointer hover:border-cyan-400/50 transition-all flex items-center justify-center bg-black/40"
                        >
                          <img src={p.proof} alt="Proof thumbnail" className="w-full h-full object-cover" />
                        </div>
                      ) : p.proof.startsWith("http") ? (
                        <div className="flex flex-col gap-1">
                          <a href={p.proof} target="_blank" rel="noopener noreferrer" className="text-cyan-400 underline block text-[10px]">
                            External Link
                          </a>
                          {(p.proof.match(/\.(jpeg|jpg|gif|png|webp)/i) || p.proof.includes("imgur") || p.proof.includes("files.ecosphere")) && (
                            <div 
                              onClick={() => setLightboxUrl(p.proof)}
                              className="w-10 h-10 rounded border border-white/10 overflow-hidden cursor-pointer hover:border-cyan-400/50 transition-all flex items-center justify-center bg-black/40 mt-1"
                            >
                              <img src={p.proof} alt="Proof thumbnail" className="w-full h-full object-cover" />
                            </div>
                          )}
                        </div>
                      ) : (
                        <span className="text-slate-300 font-mono text-[10px] truncate max-w-[120px] block" title={p.proof}>{p.proof}</span>
                      )
                    ) : (
                      <span className="text-muted">—</span>
                    )}
                  </td>
                  <td>
                    {p.status === "pending" && (
                      <div className="flex gap-2">
                        <button 
                          onClick={() => handleApprove(p.id, ApprovalStatus.APPROVED)}
                          className="text-xs badge-emerald px-2 py-0.5 rounded-full"
                        >
                          Approve
                        </button>
                        <button 
                          onClick={() => handleApprove(p.id, ApprovalStatus.REJECTED)}
                          className="text-xs badge-rose px-2 py-0.5 rounded-full"
                        >
                          Reject
                        </button>
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

      {/* New Activity Dialog Modal */}
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
                <Heart className="text-cyan-400" size={18} />
                <h3 className="font-orbitron text-base font-semibold text-slate-200">Log New CSR Activity</h3>
              </div>

              <form onSubmit={handleCreateActivity} className="space-y-4">
                <div>
                  <label className="text-xs text-muted mb-1.5 block">Activity Title</label>
                  <input 
                    type="text" 
                    required 
                    value={newTitle} 
                    onChange={(e) => setNewTitle(e.target.value)}
                    placeholder="e.g. Forestation Campaign"
                    className="input-field text-xs w-full"
                  />
                </div>

                <div>
                  <label className="text-xs text-muted mb-1.5 block">Description</label>
                  <textarea 
                    required 
                    value={newDescription} 
                    onChange={(e) => setNewDescription(e.target.value)}
                    placeholder="Provide details about the activity..."
                    className="input-field text-xs w-full h-20"
                  />
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="text-xs text-muted mb-1.5 block">Category</label>
                    <select 
                      value={newCategoryId} 
                      onChange={(e) => setNewCategoryId(e.target.value)}
                      className="input-field text-xs w-full bg-[#0a101d]"
                    >
                      <option value="">Select Category</option>
                      {categories.map(c => (
                        <option key={c.id} value={c.id}>{c.name}</option>
                      ))}
                    </select>
                  </div>
                  <div>
                    <label className="text-xs text-muted mb-1.5 block">Date</label>
                    <input 
                      type="date" 
                      required
                      value={newDate} 
                      onChange={(e) => setNewDate(e.target.value)}
                      className="input-field text-xs w-full"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-3 gap-3">
                  <div className="col-span-2">
                    <label className="text-xs text-muted mb-1.5 block">Location</label>
                    <input 
                      type="text" 
                      value={newLocation} 
                      onChange={(e) => setNewLocation(e.target.value)}
                      placeholder="e.g. Central Park"
                      className="input-field text-xs w-full"
                    />
                  </div>
                  <div>
                    <label className="text-xs text-muted mb-1.5 block">Max Participants</label>
                    <input 
                      type="number" 
                      value={newMaxParticipants} 
                      onChange={(e) => setNewMaxParticipants(Number(e.target.value))}
                      className="input-field text-xs w-full"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="text-xs text-muted mb-1.5 block">Points Awarded</label>
                    <input 
                      type="number" 
                      value={newPoints} 
                      onChange={(e) => setNewPoints(Number(e.target.value))}
                      className="input-field text-xs w-full"
                    />
                  </div>
                  <div className="flex items-center gap-2 pt-6">
                    <input 
                      type="checkbox" 
                      id="evidenceReq"
                      checked={newEvidence} 
                      onChange={(e) => setNewEvidence(e.target.checked)}
                      className="w-4 h-4 rounded border-white/10 bg-[#0d1829]"
                    />
                    <label htmlFor="evidenceReq" className="text-xs text-muted cursor-pointer">Evidence Required</label>
                  </div>
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
                    className="btn-cyan px-4 py-2 rounded-xl text-xs font-semibold"
                  >
                    Create Activity
                  </button>
                </div>
              </form>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* Proof Submission Modal */}
      <AnimatePresence>
        {proofModalOpen && (
          <div className="fixed inset-0 bg-black/60 backdrop-blur-md flex items-center justify-center p-4 z-50">
            <motion.div 
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="w-full max-w-md glass-card p-6 border border-white/10 relative"
            >
              <button 
                onClick={() => { setProofModalOpen(false); setPreviewUrl(null); }}
                className="absolute top-4 right-4 text-muted hover:text-white"
              >
                <X size={18} />
              </button>
              
              <h3 className="font-orbitron text-sm font-semibold text-slate-200 mb-4 flex items-center gap-2">
                <Heart size={16} className="text-cyan-400" />
                Submit CSR Evidence (Proof)
              </h3>

              {/* Toggle proof type */}
              <div className="grid grid-cols-2 gap-2 mb-4 p-1 bg-white/5 border border-white/10 rounded-xl">
                <button
                  type="button"
                  onClick={() => { setProofType("file"); setProofText(""); setPreviewUrl(null); }}
                  className={`py-1.5 rounded-lg text-xs font-semibold flex items-center justify-center gap-1.5 transition-all ${proofType === "file" ? "bg-cyan-500 text-white" : "text-muted hover:text-slate-300"}`}
                >
                  <Camera size={13} />
                  Upload Photo
                </button>
                <button
                  type="button"
                  onClick={() => { setProofType("link"); setProofText(""); setPreviewUrl(null); }}
                  className={`py-1.5 rounded-lg text-xs font-semibold flex items-center justify-center gap-1.5 transition-all ${proofType === "link" ? "bg-cyan-500 text-white" : "text-muted hover:text-slate-300"}`}
                >
                  <ImageIcon size={13} />
                  Paste Link
                </button>
              </div>
              
              <form onSubmit={handleSubmitProof} className="space-y-4">
                {proofType === "file" ? (
                  <div>
                    <label className="text-[10px] font-semibold text-slate-400 block mb-1.5">
                      Select Plantation Photo / Document
                    </label>
                    {!previewUrl ? (
                      <label className="border-2 border-dashed border-white/10 hover:border-cyan-500/50 bg-white/5 hover:bg-white/10 transition-all rounded-xl p-8 flex flex-col items-center justify-center gap-2 cursor-pointer">
                        <Upload size={24} className="text-cyan-400" />
                        <span className="text-xs font-medium text-slate-300">Click to upload photo</span>
                        <span className="text-[10px] text-muted">Supports PNG, JPG, JPEG</span>
                        <input
                          type="file"
                          required
                          accept="image/*"
                          onChange={handleFileChange}
                          className="hidden"
                        />
                      </label>
                    ) : (
                      <div className="relative rounded-xl border border-white/10 overflow-hidden bg-black/40 p-2 flex flex-col items-center">
                        <img 
                          src={previewUrl} 
                          alt="Plantation Proof Preview" 
                          className="max-h-48 object-contain rounded-lg shadow-md"
                        />
                        <button
                          type="button"
                          onClick={() => { setPreviewUrl(null); setProofText(""); }}
                          className="absolute top-4 right-4 p-1.5 rounded-full bg-rose-500 text-white shadow-lg hover:bg-rose-600 transition-all"
                        >
                          <X size={14} />
                        </button>
                        <span className="text-[10px] text-emerald-400 mt-2 flex items-center gap-1">
                          <CheckCircle size={10} /> Photo attached successfully
                        </span>
                      </div>
                    )}
                  </div>
                ) : (
                  <div>
                    <label className="text-[10px] font-semibold text-slate-400 block mb-1">
                      Link / URL Reference
                    </label>
                    <input 
                      required
                      type="text" 
                      placeholder="e.g. https://files.ecosphere.org/proof/tree-planting.jpg"
                      value={proofText}
                      onChange={(e) => setProofText(e.target.value)}
                      className="input-field w-full text-xs"
                    />
                  </div>
                )}
                
                <div className="pt-2 flex justify-end gap-2">
                  <button 
                    type="button" 
                    onClick={() => { setProofModalOpen(false); setPreviewUrl(null); }}
                    className="px-4 py-2 rounded-xl text-xs text-slate-400 border border-white/10 hover:bg-white/5 transition-colors"
                  >
                    Cancel
                  </button>
                  <button 
                    type="submit" 
                    className="btn-cyan px-4 py-2 rounded-xl text-xs font-semibold"
                  >
                    Submit Proof
                  </button>
                </div>
              </form>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* Lightbox Image Preview Modal */}
      <AnimatePresence>
        {lightboxUrl && (
          <div 
            onClick={() => setLightboxUrl(null)}
            className="fixed inset-0 bg-black/90 backdrop-blur-md flex items-center justify-center p-4 z-50 cursor-pointer"
          >
            <motion.div 
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.9 }}
              className="relative max-w-4xl max-h-[85vh] overflow-hidden rounded-2xl border border-white/10"
              onClick={(e) => e.stopPropagation()}
            >
              <button 
                onClick={() => setLightboxUrl(null)}
                className="absolute top-4 right-4 p-2 rounded-full bg-black/60 text-white hover:bg-black/80 transition-all border border-white/10"
              >
                <X size={18} />
              </button>
              <img 
                src={lightboxUrl} 
                alt="CSR Evidence Full Resolution" 
                className="max-w-full max-h-[80vh] object-contain"
              />
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
}
