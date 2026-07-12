"use client";

import { motion, AnimatePresence } from "framer-motion";
import { useState, useEffect } from "react";
import { Trophy, Zap, Star, Gift, Crown, Swords, Medal, Plus } from "lucide-react";
import ReactConfetti from "react-confetti";

const challenges = [
  { id: 1, title: "Zero-Waste Week", category: "Environment", xp: 500, difficulty: "HARD", deadline: "Jul 14", status: "ACTIVE", participants: 45 },
  { id: 2, title: "Cycle to Work Month", category: "Transport", xp: 300, difficulty: "MEDIUM", deadline: "Jul 31", status: "ACTIVE", participants: 28 },
  { id: 3, title: "Plant-Based Lunch Week", category: "Food", xp: 200, difficulty: "EASY", deadline: "Jul 12", status: "UNDER_REVIEW", participants: 67 },
  { id: 4, title: "Digital Carbon Detox", category: "Technology", xp: 150, difficulty: "EASY", deadline: "Aug 1", status: "DRAFT", participants: 0 },
  { id: 5, title: "Office Energy Blitz", category: "Energy", xp: 800, difficulty: "EPIC", deadline: "Aug 31", status: "ACTIVE", participants: 12 },
];

const badges = [
  { id: 1, name: "Carbon Champion", icon: "🌱", color: "#10b981", rule: "Earn 1000 XP", unlocked: true, holders: 12 },
  { id: 2, name: "Eco Warrior", icon: "⚔️", color: "#06b6d4", rule: "Complete 5 challenges", unlocked: true, holders: 8 },
  { id: 3, name: "CSR Hero", icon: "🦸", color: "#8b5cf6", rule: "10 CSR activities", unlocked: false, holders: 0 },
  { id: 4, name: "Policy Guardian", icon: "🛡️", color: "#f59e0b", rule: "Acknowledge all policies", unlocked: false, holders: 3 },
  { id: 5, name: "Green Team", icon: "🏆", color: "#f43f5e", rule: "Dept score > 85", unlocked: false, holders: 1 },
  { id: 6, name: "First Steps", icon: "👣", color: "#a78bfa", rule: "First login", unlocked: true, holders: 98 },
];

const rewards = [
  { id: 1, name: "Extra Day Off", icon: "🌴", points: 2000, stock: 5, status: "active" },
  { id: 2, name: "Amazon Gift Card ($50)", icon: "🎁", points: 1000, stock: 20, status: "active" },
  { id: 3, name: "Team Lunch Voucher", icon: "🍽️", points: 500, stock: 15, status: "active" },
  { id: 4, name: "Carbon-Offset Flight", icon: "✈️", points: 5000, stock: 2, status: "active" },
  { id: 5, name: "EV Charging Credit", icon: "⚡", points: 750, stock: 0, status: "out_of_stock" },
];

const leaderboard = [
  { rank: 1, name: "Sarah K.", dept: "Engineering", xp: 2840, badges: 4, avatar: "SK" },
  { rank: 2, name: "Alex M.", dept: "HR", xp: 2310, badges: 3, avatar: "AM" },
  { rank: 3, name: "Priya R.", dept: "Marketing", xp: 1950, badges: 3, avatar: "PR" },
  { rank: 4, name: "James T.", dept: "Operations", xp: 1640, badges: 2, avatar: "JT" },
  { rank: 5, name: "Mei L.", dept: "Finance", xp: 1420, badges: 2, avatar: "ML" },
];

const DEPT_BATTLES = [
  { dept1: { name: "Engineering", score: 88, color: "#10b981" }, dept2: { name: "Operations", score: 61, color: "#f43f5e" } },
  { dept1: { name: "HR", score: 92, color: "#06b6d4" }, dept2: { name: "Finance", score: 74, color: "#8b5cf6" } },
];

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
  const [activeTab, setActiveTab] = useState<"overview" | "challenges" | "badges" | "rewards" | "leaderboard" | "battles">("overview");
  const [showConfetti, setShowConfetti] = useState(false);
  const [redeemTarget, setRedeemTarget] = useState<number | null>(null);

  const handleRedeem = (id: number) => {
    setRedeemTarget(id);
    setShowConfetti(true);
    setTimeout(() => setShowConfetti(false), 4000);
  };

  return (
    <div className="space-y-6 max-w-[1600px] mx-auto">
      {showConfetti && <ReactConfetti recycle={false} numberOfPieces={300} colors={["#10b981", "#06b6d4", "#f59e0b", "#8b5cf6"]} className="confetti-container" />}

      <div className="flex items-center justify-between">
        <div>
          <h1 className="font-orbitron text-2xl font-bold gradient-text-purple">🏆 Gamification</h1>
          <p className="text-sm text-muted mt-1">Challenges, XP, badges & rewards · Department battles</p>
        </div>
        <button className="px-4 py-2 rounded-xl text-sm font-medium flex items-center gap-2 text-amber-400 border border-amber-500/25 hover:bg-amber-500/10 transition-colors">
          <Plus size={15} /> New Challenge
        </button>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {[
          { label: "Active Challenges", value: "12", icon: <Swords size={16} className="text-amber-400" />, bg: "rgba(245,158,11,0.08)", border: "rgba(245,158,11,0.15)" },
          { label: "Total XP Awarded", value: "48.2K", icon: <Zap size={16} className="text-cyan-400" />, bg: "rgba(6,182,212,0.08)", border: "rgba(6,182,212,0.15)" },
          { label: "Badges Unlocked", value: "234", icon: <Medal size={16} className="text-purple-400" />, bg: "rgba(139,92,246,0.08)", border: "rgba(139,92,246,0.15)" },
          { label: "Rewards Redeemed", value: "87", icon: <Gift size={16} className="text-rose-400" />, bg: "rgba(244,63,94,0.08)", border: "rgba(244,63,94,0.15)" },
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
        {(["overview", "challenges", "badges", "rewards", "leaderboard", "battles"] as const).map((tab) => (
          <button key={tab} onClick={() => setActiveTab(tab)}
            className={`px-3 py-2 rounded-lg text-xs font-medium capitalize transition-all ${activeTab === tab ? "bg-amber-500 text-white" : "text-muted hover:text-slate-300"}`}>
            {tab === "battles" ? "⚔️ Battles" : tab}
          </button>
        ))}
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
                <span className={`text-xs px-2 py-0.5 rounded-full ${STATUS_STYLES[c.status as keyof typeof STATUS_STYLES]}`}>{c.status.replace("_", " ")}</span>
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
              <button className="w-full mt-4 py-1.5 rounded-lg text-xs font-medium border border-amber-500/25 text-amber-400 hover:bg-amber-500/10 transition-colors">
                {c.status === "DRAFT" ? "Activate Challenge" : "View Participation"}
              </button>
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
              <div className="flex items-center justify-between mb-4">
                <div className="flex items-center gap-1.5">
                  <Star size={12} className="text-amber-400" />
                  <span className="font-orbitron text-sm font-bold text-amber-400">{r.points.toLocaleString()} pts</span>
                </div>
                <span className="text-xs text-muted">{r.stock} left</span>
              </div>
              <button
                onClick={() => r.status === "active" && handleRedeem(r.id)}
                disabled={r.status === "out_of_stock"}
                className={`w-full py-2 rounded-xl text-xs font-medium transition-all ${
                  r.status === "out_of_stock"
                    ? "bg-white/5 text-muted cursor-not-allowed"
                    : "btn-emerald"
                }`}
              >
                {r.status === "out_of_stock" ? "Out of Stock" : "Redeem Reward"}
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
              {/* XP Bar */}
              <div className="w-24 bg-white/5 rounded-full h-1.5 hidden md:block">
                <motion.div className="h-1.5 rounded-full" style={{ background: "linear-gradient(90deg, #f59e0b, #10b981)" }}
                  initial={{ width: 0 }} animate={{ width: `${(person.xp / 2840) * 100}%` }} transition={{ duration: 1, delay: i * 0.1 }} />
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

            {DEPT_BATTLES.map((battle, i) => {
              const total = battle.dept1.score + battle.dept2.score;
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

          <div className="glass-card-amber p-6">
            <h3 className="font-orbitron text-sm font-semibold text-amber-400 mb-1">🔥 Eco Sprint — Active Event</h3>
            <p className="text-xs text-muted mb-4">48-hour team sustainability sprint · Ends in 6h 24m</p>
            <div className="w-full bg-white/5 rounded-full h-2 mb-2">
              <motion.div className="h-2 rounded-full battle-bar-active" style={{ background: "linear-gradient(90deg, #f59e0b, #f43f5e)", width: "74%" }} />
            </div>
            <div className="flex justify-between text-xs text-muted">
              <span>Started 41h ago</span>
              <span>74% of sprint complete</span>
            </div>
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
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="glass-card p-6 xl:col-span-2">
            <h3 className="font-orbitron text-sm font-semibold text-slate-200 mb-4">Challenge Status Overview</h3>
            <div className="grid grid-cols-5 gap-3">
              {(["DRAFT", "ACTIVE", "UNDER_REVIEW", "COMPLETED", "ARCHIVED"] as const).map((status) => {
                const count = challenges.filter((c) => c.status === status).length;
                return (
                  <div key={status} className="text-center p-3 rounded-xl" style={{ background: "rgba(255,255,255,0.03)" }}>
                    <p className="font-orbitron text-2xl font-bold text-slate-200">{count}</p>
                    <p className="text-[9px] text-muted mt-1 uppercase tracking-wider">{status.replace("_", " ")}</p>
                  </div>
                );
              })}
            </div>
          </motion.div>
        </div>
      )}
    </div>
  );
}
