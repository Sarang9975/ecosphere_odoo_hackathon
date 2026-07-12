"use client";

import { motion, AnimatePresence } from "framer-motion";
import { useState, useEffect } from "react";
import { Trophy, Zap, Star, Gift, Crown, Swords, Medal, Plus, X } from "lucide-react";
import ReactConfetti from "react-confetti";
import { getGamificationData, joinChallenge, submitChallengeProof, redeemReward, approveChallengeParticipation } from "@/actions/gamification";
import { ApprovalStatus } from "@prisma/client";

const DIFFICULTY_STYLES = {
  EASY: "badge-emerald",
  MEDIUM: "badge-cyan",
  HARD: "badge-amber",
  EPIC: "badge-rose",
};

const STATUS_STYLES = {
  ACTIVE: "badge-emerald",
  DRAFT: "badge-purple",
  UNDER_REVIEW: "badge-amber",
  COMPLETED: "badge-cyan",
  ARCHIVED: "badge-rose",
};

export default function GamificationPage() {
  const [activeTab, setActiveTab] = useState<"overview" | "challenges" | "badges" | "rewards" | "leaderboard" | "battles" | "review">("overview");
  const [showConfetti, setShowConfetti] = useState(false);
  
  // Data States
  const [loading, setLoading] = useState(true);
  const [challenges, setChallenges] = useState<any[]>([]);
  const [badges, setBadges] = useState<any[]>([]);
  const [rewards, setRewards] = useState<any[]>([]);
  const [leaderboard, setLeaderboard] = useState<any[]>([]);
  const [battles, setBattles] = useState<any[]>([]);
  const [stats, setStats] = useState({ activeChallenges: 12, totalXpAwarded: "48.2K", badgesUnlocked: 234, rewardsRedeemed: 87 });
  const [currentUser, setCurrentUser] = useState<any>(null);
  const [participations, setParticipations] = useState<any[]>([]);

  // Dialog State
  const [proofModalOpen, setProofModalOpen] = useState(false);
  const [selectedPartId, setSelectedPartId] = useState("");
  const [proofText, setProofText] = useState("");

  const loadData = async () => {
    try {
      setLoading(true);
      const res = await getGamificationData();
      setCurrentUser(res.currentUser);
      setChallenges(res.challenges);
      setBadges(res.badges);
      setRewards(res.rewards);
      setLeaderboard(res.leaderboard);
      setBattles(res.battles);
      setParticipations(res.participations || []);
      setStats({
        activeChallenges: res.stats.activeChallenges,
        totalXpAwarded: res.stats.totalXpAwarded.toLocaleString(),
        badgesUnlocked: res.stats.badgesUnlocked,
        rewardsRedeemed: res.stats.rewardsRedeemed,
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

  const handleJoin = async (challengeId: string) => {
    if (!currentUser) return;
    try {
      await joinChallenge(challengeId, currentUser.id);
      loadData();
    } catch (e) {
      console.error(e);
    }
  };

  const handleRedeem = async (rewardId: string) => {
    if (!currentUser) return;
    try {
      await redeemReward(rewardId, currentUser.id);
      setShowConfetti(true);
      setTimeout(() => setShowConfetti(false), 4000);
      loadData();
    } catch (e: any) {
      alert(e.message || "Failed to redeem reward.");
    }
  };

  const handleSubmitProof = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedPartId) return;
    try {
      await submitChallengeProof(selectedPartId, proofText);
      setProofModalOpen(false);
      setProofText("");
      loadData();
    } catch (e) {
      console.error(e);
    }
  };

  const handleApproveChallenge = async (id: string, status: ApprovalStatus) => {
    try {
      await approveChallengeParticipation(id, status);
      loadData();
    } catch (e) {
      console.error(e);
    }
  };

  if (loading && challenges.length === 0) {
    return (
      <div className="w-full h-96 flex items-center justify-center">
        <div className="text-center">
          <div className="text-4xl mb-2 animate-bounce">🏆</div>
          <p className="font-orbitron text-xs text-purple-400">Loading Gamification engine twin...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6 max-w-[1600px] mx-auto">
      {showConfetti && <ReactConfetti recycle={false} numberOfPieces={300} colors={["#10b981", "#06b6d4", "#f59e0b", "#8b5cf6"]} className="confetti-container" />}

      <div className="flex items-center justify-between">
        <div>
          <h1 className="font-orbitron text-2xl font-bold gradient-text-purple">🏆 Gamification</h1>
          <p className="text-sm text-muted mt-1">Challenges, XP, badges & rewards · Department battles</p>
        </div>
        {currentUser && (
          <div className="flex items-center gap-4 bg-white/5 border border-white/10 px-4 py-2 rounded-xl">
            <div>
              <p className="text-xs text-muted">My Points Balance</p>
              <p className="font-orbitron text-sm font-bold text-amber-400">{currentUser.points} pts</p>
            </div>
            <div className="border-l border-white/10 pl-4">
              <p className="text-xs text-muted">My XP</p>
              <p className="font-orbitron text-sm font-bold text-purple-400">{currentUser.xp} XP</p>
            </div>
          </div>
        )}
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {[
          { label: "Active Challenges", value: String(stats.activeChallenges), icon: <Swords size={16} className="text-amber-400" />, bg: "rgba(245,158,11,0.08)", border: "rgba(245,158,11,0.15)" },
          { label: "Total XP Awarded", value: String(stats.totalXpAwarded), icon: <Zap size={16} className="text-cyan-400" />, bg: "rgba(6,182,212,0.08)", border: "rgba(6,182,212,0.15)" },
          { label: "Badges Unlocked", value: String(stats.badgesUnlocked), icon: <Medal size={16} className="text-purple-400" />, bg: "rgba(139,92,246,0.08)", border: "rgba(139,92,246,0.15)" },
          { label: "Rewards Redeemed", value: String(stats.rewardsRedeemed), icon: <Gift size={16} className="text-rose-400" />, bg: "rgba(244,63,94,0.08)", border: "rgba(244,63,94,0.15)" },
        ].map((s, i) => (
          <motion.div key={i} initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.05 }}
            className="glass-card p-4" style={{ background: s.bg, border: `1px solid ${s.border}` }}>
            <div className="flex items-center gap-2 mb-2">{s.icon}<span className="text-xs text-muted">{s.label}</span></div>
            <p className="font-orbitron text-xl font-bold text-slate-100">{s.value}</p>
          </motion.div>
        ))}
      </div>

      {/* Tabs */}
      <div className="flex gap-1 p-1 rounded-xl w-fit flex-wrap" style={{ background: "rgba(255,255,255,0.04)" }}>
        {(["overview", "challenges", "badges", "rewards", "leaderboard", "battles", "review"] as const).map((tab) => {
          if (tab === "review" && currentUser?.role === "EMPLOYEE") return null;
          return (
            <button key={tab} onClick={() => setActiveTab(tab)}
              className={`px-3 py-2 rounded-lg text-xs font-medium capitalize transition-all ${activeTab === tab ? "bg-amber-500 text-white" : "text-muted hover:text-slate-300"}`}>
              {tab === "battles" ? "⚔️ Battles" : tab === "review" ? "⭐ Approvals" : tab}
            </button>
          );
        })}
      </div>

      {/* Challenges */}
      {activeTab === "challenges" && (
        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
          {challenges.map((c, i) => (
            <motion.div key={c.id} initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.06 }}
              className="glass-card p-5 relative overflow-hidden group" whileHover={{ y: -2 }}>
              <div className="absolute top-0 right-0 opacity-5 group-hover:opacity-10 transition-opacity text-6xl p-2">⚡</div>
              <div className="flex items-start justify-between mb-3">
                <span className={`text-xs px-2 py-0.5 rounded-full ${DIFFICULTY_STYLES[c.difficulty as keyof typeof DIFFICULTY_STYLES]}`}>{c.difficulty}</span>
                <span className={`text-xs px-2 py-0.5 rounded-full ${STATUS_STYLES[c.status as keyof typeof STATUS_STYLES]}`}>{c.status}</span>
              </div>
              <h3 className="text-sm font-semibold text-slate-200 mb-1">{c.title}</h3>
              <p className="text-xs text-muted mb-3">{c.category} · Deadline: {c.deadline}</p>
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-1.5">
                  <Zap size={12} className="text-amber-400" />
                  <span className="font-orbitron text-sm font-bold text-amber-400">{c.xp} XP</span>
                </div>
                <span className="text-xs text-muted">{c.participants} participants</span>
              </div>
              
              {!c.joined && (
                <button 
                  onClick={() => handleJoin(c.id)}
                  className="w-full mt-4 py-1.5 rounded-lg text-xs font-medium border border-amber-500/25 text-amber-400 hover:bg-amber-500/10 transition-colors"
                >
                  Join Challenge
                </button>
              )}

              {c.joined && c.approvalStatus === "pending" && (
                <button 
                  onClick={() => { setSelectedPartId(c.participationId); setProofModalOpen(true); }}
                  className="w-full mt-4 py-1.5 rounded-lg text-xs font-medium bg-amber-500 text-white shadow-lg"
                >
                  Submit Proof
                </button>
              )}

              {c.joined && c.approvalStatus === "approved" && (
                <div className="w-full mt-4 py-1.5 rounded-lg text-xs font-medium text-center bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
                  Completed & Verified ✓
                </div>
              )}
            </motion.div>
          ))}
        </motion.div>
      )}

      {/* Badges */}
      {activeTab === "badges" && (
        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="grid grid-cols-2 md:grid-cols-3 xl:grid-cols-6 gap-4">
          {badges.map((b, i) => (
            <motion.div key={b.id} initial={{ opacity: 0, scale: 0.8 }} animate={{ opacity: 1, scale: 1 }} transition={{ delay: i * 0.06, type: "spring" }}
              className="glass-card p-5 text-center relative group" whileHover={{ y: -4 }}>
              <div className={`text-4xl mb-3 ${!b.unlocked ? "grayscale opacity-30" : "filter drop-shadow-lg"}`}>
                {b.icon}
              </div>
              {b.unlocked && (
                <motion.div className="absolute top-2 right-2 w-4 h-4 rounded-full bg-emerald-400 flex items-center justify-center"
                  initial={{ scale: 0 }} animate={{ scale: 1 }} transition={{ delay: i * 0.1 + 0.3 }}>
                  <span className="text-white text-[8px]">✓</span>
                </motion.div>
              )}
              <p className="text-xs font-semibold text-slate-200 mb-1">{b.name}</p>
              <p className="text-[10px] text-muted mb-2">{b.rule}</p>
              <div className="text-[10px]" style={{ color: b.color }}>{b.holders} holders</div>
            </motion.div>
          ))}
        </motion.div>
      )}

      {/* Rewards */}
      {activeTab === "rewards" && (
        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
          {rewards.map((r, i) => (
            <motion.div key={r.id} initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.06 }}
              className={`glass-card p-5 ${r.status === "out_of_stock" ? "opacity-50" : ""}`} whileHover={{ y: r.status !== "out_of_stock" ? -2 : 0 }}>
              <div className="text-3xl mb-3">{r.icon}</div>
              <h3 className="text-sm font-semibold text-slate-200 mb-1">{r.name}</h3>
              <p className="text-xs text-muted mb-3 h-10">{r.description}</p>
              <div className="flex items-center justify-between mb-4">
                <div className="flex items-center gap-1.5">
                  <Star size={12} className="text-amber-400" />
                  <span className="font-orbitron text-sm font-bold text-amber-400">{r.points.toLocaleString()} pts</span>
                </div>
                <span className="text-xs text-muted">{r.stock} left</span>
              </div>
              <button
                onClick={() => r.status === "active" && handleRedeem(r.id)}
                disabled={r.status === "out_of_stock" || (currentUser && currentUser.points < r.points)}
                className={`w-full py-2 rounded-xl text-xs font-medium transition-all ${
                  r.status === "out_of_stock"
                    ? "bg-white/5 text-muted cursor-not-allowed"
                    : currentUser && currentUser.points < r.points
                      ? "bg-white/5 text-rose-400 border border-rose-500/20 cursor-not-allowed"
                      : "btn-emerald"
                }`}
              >
                {r.status === "out_of_stock" ? "Out of Stock" : currentUser && currentUser.points < r.points ? "Insufficient Points" : "Redeem Reward"}
              </button>
            </motion.div>
          ))}
        </motion.div>
      )}

      {/* Leaderboard */}
      {activeTab === "leaderboard" && (
        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="space-y-3">
          {leaderboard.map((person, i) => (
            <motion.div key={person.rank} initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: i * 0.07 }}
              className={`glass-card p-4 flex items-center gap-4 ${i < 3 ? `rank-${i + 1}` : ""}`}>
              <div className="w-8 h-8 flex items-center justify-center flex-shrink-0">
                {i === 0 ? <Crown size={22} className="text-amber-400" style={{ filter: "drop-shadow(0 0 8px #f59e0b)" }} /> :
                  i === 1 ? <span className="text-lg">🥈</span> :
                  i === 2 ? <span className="text-lg">🥉</span> :
                  <span className="font-orbitron text-sm text-muted">#{person.rank}</span>}
              </div>
              <div className="w-9 h-9 rounded-full flex items-center justify-center text-xs font-bold text-white flex-shrink-0"
                style={{ background: `linear-gradient(135deg, hsl(${i * 40 + 160}, 70%, 50%), hsl(${i * 40 + 200}, 70%, 40%))` }}>
                {person.avatar}
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-sm font-semibold text-slate-200">{person.name}</p>
                <p className="text-xs text-muted">{person.dept}</p>
              </div>
              <div className="text-right">
                <div className="flex items-center gap-1 justify-end">
                  <Zap size={12} className="text-amber-400" />
                  <span className="font-orbitron text-sm font-bold text-amber-400">{person.xp.toLocaleString()}</span>
                </div>
                <p className="text-xs text-muted">{person.badges} badges</p>
              </div>
            </motion.div>
          ))}
        </motion.div>
      )}

      {/* Department Battles */}
      {activeTab === "battles" && (
        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="space-y-6">
          <div className="glass-card p-6">
            <div className="flex items-center gap-3 mb-6">
              <Swords size={20} className="text-amber-400" style={{ filter: "drop-shadow(0 0 6px #f59e0b)" }} />
              <h2 className="font-orbitron text-base font-bold text-slate-200">⚡ Department ESG Battles</h2>
              <span className="text-xs badge-amber px-2 py-0.5 rounded-full ml-2">LIVE</span>
            </div>

            {battles.map((battle, i) => {
              const total = Math.max(1, battle.dept1.score + battle.dept2.score);
              const d1pct = (battle.dept1.score / total) * 100;
              const d2pct = 100 - d1pct;
              const winner = battle.dept1.score > battle.dept2.score ? battle.dept1 : battle.dept2;
              return (
                <div key={i} className="mb-8 last:mb-0">
                  <div className="flex items-center justify-between mb-4">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-xl flex items-center justify-center text-lg" style={{ background: `${battle.dept1.color}15`, border: `1px solid ${battle.dept1.color}30` }}>🏢</div>
                      <div>
                        <p className="text-sm font-bold text-slate-200">{battle.dept1.name}</p>
                        <p className="font-orbitron text-xl font-bold" style={{ color: battle.dept1.color }}>{battle.dept1.score}</p>
                      </div>
                    </div>
                    <div className="flex flex-col items-center gap-1">
                      <span className="text-xs font-orbitron font-bold text-slate-500">VS</span>
                      <Swords size={16} className="text-slate-600" />
                    </div>
                    <div className="flex items-center gap-3 flex-row-reverse">
                      <div className="w-10 h-10 rounded-xl flex items-center justify-center text-lg" style={{ background: `${battle.dept2.color}15`, border: `1px solid ${battle.dept2.color}30` }}>🏢</div>
                      <div className="text-right">
                        <p className="text-sm font-bold text-slate-200">{battle.dept2.name}</p>
                        <p className="font-orbitron text-xl font-bold" style={{ color: battle.dept2.color }}>{battle.dept2.score}</p>
                      </div>
                    </div>
                  </div>

                  {/* Battle Bar */}
                  <div className="flex rounded-full overflow-hidden h-6 mb-2">
                    <motion.div className="flex items-center justify-center text-xs font-bold text-white"
                      style={{ background: battle.dept1.color, boxShadow: `0 0 10px ${battle.dept1.color}50` }}
                      initial={{ width: "50%" }} animate={{ width: `${d1pct}%` }} transition={{ duration: 1.5, ease: "easeOut" }}>
                      {d1pct.toFixed(0)}%
                    </motion.div>
                    <motion.div className="flex items-center justify-center text-xs font-bold text-white"
                      style={{ background: battle.dept2.color, boxShadow: `0 0 10px ${battle.dept2.color}50` }}
                      initial={{ width: "50%" }} animate={{ width: `${d2pct}%` }} transition={{ duration: 1.5, ease: "easeOut" }}>
                      {d2pct.toFixed(0)}%
                    </motion.div>
                  </div>

                  <p className="text-xs text-center text-muted">
                    <span style={{ color: winner.color }} className="font-bold">{winner.name}</span> leading by {Math.abs(battle.dept1.score - battle.dept2.score)} points
                  </p>
                </div>
              );
            })}
          </div>
        </motion.div>
      )}

      {/* Overview Tab */}
      {activeTab === "overview" && (
        <div className="grid grid-cols-1 xl:grid-cols-3 gap-6">
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="glass-card p-6">
            <h3 className="font-orbitron text-sm font-semibold text-slate-200 mb-4">Top XP Earners</h3>
            <div className="space-y-3">
              {leaderboard.slice(0, 3).map((p, i) => (
                <div key={i} className="flex items-center gap-3">
                  <span className="text-lg">{["🥇", "🥈", "🥉"][i]}</span>
                  <div className="flex-1">
                    <p className="text-xs font-medium text-slate-200">{p.name}</p>
                    <p className="text-xs text-muted">{p.dept}</p>
                  </div>
                  <div className="flex items-center gap-1">
                    <Zap size={11} className="text-amber-400" />
                    <span className="font-orbitron text-xs text-amber-400">{p.xp.toLocaleString()}</span>
                  </div>
                </div>
              ))}
            </div>
          </motion.div>
        </div>
      )}

      {/* Approvals Tab */}
      {activeTab === "review" && (
        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="glass-card overflow-hidden">
          <div className="p-5 border-b border-white/5">
            <h3 className="font-orbitron text-sm font-semibold text-slate-200">Challenge Completion Approvals</h3>
          </div>
          <table className="data-table">
            <thead>
              <tr>
                <th>Employee</th><th>Challenge</th><th>Status</th><th>XP</th><th>Date</th><th>Proof Link</th><th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {participations.map((p, i) => (
                <tr key={i}>
                  <td className="font-medium text-slate-200">{p.name}</td>
                  <td className="text-muted text-xs">{p.challenge}</td>
                  <td>
                    <span className={`text-xs capitalize ${p.status === "approved" ? "text-emerald-400" : p.status === "pending" ? "text-amber-400" : "text-rose-400"}`}>
                      {p.status}
                    </span>
                  </td>
                  <td><span className="font-orbitron text-xs text-amber-400">+{p.xp} XP</span></td>
                  <td className="text-muted text-xs">{p.date}</td>
                  <td className="text-muted text-xs truncate max-w-[150px]">
                    {p.proof ? (
                      <span className="text-cyan-400 underline cursor-pointer">{p.proof}</span>
                    ) : "No proof uploaded"}
                  </td>
                  <td>
                    {p.status === "pending" && (
                      <div className="flex gap-2">
                        <button 
                          onClick={() => handleApproveChallenge(p.id, ApprovalStatus.APPROVED)}
                          className="text-[10px] badge-emerald px-2 py-0.5 rounded-full"
                        >
                          Approve
                        </button>
                        <button 
                          onClick={() => handleApproveChallenge(p.id, ApprovalStatus.REJECTED)}
                          className="text-[10px] badge-rose px-2 py-0.5 rounded-full"
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

      {/* Submit Proof Modal */}
      <AnimatePresence>
        {proofModalOpen && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm">
            <motion.div 
              initial={{ scale: 0.95, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.95, opacity: 0 }}
              className="w-full max-w-md glass-card border border-white/10 p-6 relative overflow-hidden"
            >
              <button 
                onClick={() => setProofModalOpen(false)}
                className="absolute top-4 right-4 text-slate-400 hover:text-slate-200 transition-colors"
              >
                <X size={18} />
              </button>

              <div className="flex items-center gap-2 mb-4">
                <Medal className="text-amber-400" size={18} />
                <h3 className="font-orbitron text-base font-semibold text-slate-200">Submit Challenge Proof</h3>
              </div>

              <form onSubmit={handleSubmitProof} className="space-y-4">
                <div>
                  <label className="text-xs text-muted mb-1.5 block">Evidence / Proof Details</label>
                  <textarea 
                    required 
                    value={proofText} 
                    onChange={(e) => setProofText(e.target.value)}
                    placeholder="Describe how you completed the challenge..."
                    className="input-field text-xs w-full h-24"
                  />
                </div>

                <div className="pt-2 flex justify-end gap-2">
                  <button 
                    type="button" 
                    onClick={() => setProofModalOpen(false)}
                    className="px-4 py-2 rounded-xl text-xs text-slate-400 border border-white/10 hover:bg-white/5 transition-colors"
                  >
                    Cancel
                  </button>
                  <button 
                    type="submit" 
                    className="btn-emerald px-4 py-2 rounded-xl text-xs font-semibold"
                  >
                    Submit Proof
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
