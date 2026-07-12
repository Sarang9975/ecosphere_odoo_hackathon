"use client";

import { useState, useEffect, useTransition } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { LogIn, ShieldAlert, Sparkles, UserCheck } from "lucide-react";
import { getSeededUsers, login } from "@/actions/auth";
import { Role } from "@prisma/client";

export default function HomePage() {
  const [users, setUsers] = useState<any[]>([]);
  const [selectedRole, setSelectedRole] = useState<Role | "">("");
  const [selectedUserId, setSelectedUserId] = useState<string>("");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [isPending, startTransition] = useTransition();

  useEffect(() => {
    getSeededUsers()
      .then((res) => {
        setUsers(res);
        setLoading(false);
      })
      .catch((err) => {
        console.error(err);
        setError("Failed to fetch database users.");
        setLoading(false);
      });
  }, []);

  const roles = [
    { value: Role.ADMIN, label: "Admin (Admin)" },
    { value: Role.MANAGER, label: "Manager (Alex M. / Sarah K. / Priya R.)" },
    { value: Role.EMPLOYEE, label: "Employee (James T. / Mei L.)" },
  ];

  // Filter users by selected role
  const filteredUsers = users.filter((u) => u.role === selectedRole);

  const handleLoginSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedUserId) return;

    setError(null);
    startTransition(async () => {
      try {
        await login(selectedUserId);
      } catch (err: any) {
        setError(err.message || "An error occurred during login.");
      }
    });
  };

  return (
    <div className="min-h-screen bg-[#030712] relative overflow-hidden flex items-center justify-center p-4">
      {/* Auroras */}
      <div className="absolute top-[-10%] left-[-10%] w-[50%] h-[50%] rounded-full bg-emerald-500/10 blur-[120px] pointer-events-none" />
      <div className="absolute bottom-[-10%] right-[-10%] w-[50%] h-[50%] rounded-full bg-cyan-500/10 blur-[120px] pointer-events-none" />

      {/* Grid Pattern overlay */}
      <div className="absolute inset-0 bg-[linear-gradient(to_right,rgba(255,255,255,0.015)_1px,transparent_1px),linear-gradient(to_bottom,rgba(255,255,255,0.015)_1px,transparent_1px)] bg-[size:32px_32px] pointer-events-none" />

      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.8 }}
        className="w-full max-w-md glass-card p-8 border border-white/10 relative z-10"
      >
        <div className="text-center mb-8">
          <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-emerald-500 to-cyan-500 flex items-center justify-center mx-auto mb-4 shadow-[0_0_20px_rgba(16,185,129,0.3)]">
            <Sparkles size={20} className="text-white animate-pulse" />
          </div>
          <h1 className="font-orbitron text-2xl font-bold tracking-wide bg-gradient-to-r from-emerald-400 to-cyan-400 bg-clip-text text-transparent">
            EcoSphere ESG Portal
          </h1>
          <p className="text-xs text-muted mt-2">
            Select a role and identity to simulate platform experience
          </p>
        </div>

        {loading ? (
          <div className="flex flex-col items-center justify-center py-8">
            <div className="w-8 h-8 border-2 border-emerald-500/30 border-t-emerald-400 rounded-full animate-spin mb-3" />
            <p className="text-xs text-muted">Reading seeded profiles...</p>
          </div>
        ) : (
          <form onSubmit={handleLoginSubmit} className="space-y-5">
            {/* Step 1: Select Role */}
            <div>
              <label className="text-xs font-semibold text-slate-300 block mb-1.5">
                1. Select Platform Role
              </label>
              <select
                required
                value={selectedRole}
                onChange={(e) => {
                  setSelectedRole(e.target.value as Role);
                  setSelectedUserId(""); // reset selected user
                }}
                className="input-field w-full text-xs bg-[#090d16] border-white/10"
              >
                <option value="">-- Choose Role --</option>
                {roles.map((r) => (
                  <option key={r.value} value={r.value}>
                    {r.label}
                  </option>
                ))}
              </select>
            </div>

            {/* Step 2: Select User */}
            <AnimatePresence mode="wait">
              {selectedRole && (
                <motion.div
                  initial={{ opacity: 0, height: 0 }}
                  animate={{ opacity: 1, height: "auto" }}
                  exit={{ opacity: 0, height: 0 }}
                  transition={{ duration: 0.3 }}
                >
                  <label className="text-xs font-semibold text-slate-300 block mb-1.5">
                    2. Select Seeded Profile
                  </label>
                  <select
                    required
                    value={selectedUserId}
                    onChange={(e) => setSelectedUserId(e.target.value)}
                    className="input-field w-full text-xs bg-[#090d16] border-white/10"
                  >
                    <option value="">-- Choose Profile --</option>
                    {filteredUsers.map((u) => (
                      <option key={u.id} value={u.id}>
                        {u.name || u.email} ({u.email})
                      </option>
                    ))}
                  </select>
                </motion.div>
              )}
            </AnimatePresence>

            {/* Error Message */}
            {error && (
              <div className="flex items-center gap-2 p-3 rounded-lg bg-rose-500/10 border border-rose-500/20 text-rose-400 text-xs mt-2">
                <ShieldAlert size={14} className="flex-shrink-0" />
                <span>{error}</span>
              </div>
            )}

            {/* Submit Button */}
            <motion.button
              type="submit"
              disabled={!selectedUserId || isPending}
              whileTap={{ scale: 0.98 }}
              className={`w-full py-2.5 rounded-xl text-xs font-semibold flex items-center justify-center gap-2 transition-all mt-4 ${
                !selectedUserId || isPending
                  ? "bg-white/5 text-slate-500 border border-white/5 cursor-not-allowed"
                  : "bg-gradient-to-r from-emerald-500 to-cyan-500 text-white shadow-[0_4px_20px_rgba(16,185,129,0.25)] hover:shadow-[0_4px_20px_rgba(16,185,129,0.4)]"
              }`}
            >
              {isPending ? (
                <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
              ) : (
                <>
                  <LogIn size={14} />
                  <span>Access Platform</span>
                </>
              )}
            </motion.button>
          </form>
        )}
      </motion.div>
    </div>
  );
}
