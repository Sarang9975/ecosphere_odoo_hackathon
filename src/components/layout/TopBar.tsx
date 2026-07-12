"use client";

import { Bell, Search, User } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { useState } from "react";

interface TopBarProps {
  title: string;
  subtitle?: string;
}

const mockNotifications = [
  { id: 1, type: "warning", title: "Compliance Issue Overdue", desc: "Q3 Carbon Audit - Critical", time: "2m ago" },
  { id: 2, type: "success", title: "Badge Unlocked! 🏆", desc: "Sarah K. earned 'Carbon Champion'", time: "15m ago" },
  { id: 3, type: "info", title: "CSR Activity Approved", desc: "Tree Planting Drive approved", time: "1h ago" },
  { id: 4, type: "warning", title: "Policy Reminder", desc: "5 employees haven't acknowledged Policy v2", time: "3h ago" },
];

export function TopBar({ title, subtitle }: TopBarProps) {
  const [showNotifications, setShowNotifications] = useState(false);
  const [showSearch, setShowSearch] = useState(false);

  return (
    <header className="h-16 flex items-center justify-between px-6 border-b border-white/5 bg-[rgba(8,12,20,0.8)] backdrop-blur-xl sticky top-0 z-40">
      {/* Title */}
      <div>
        <h1 className="font-orbitron font-semibold text-sm tracking-wide text-slate-200">
          {title}
        </h1>
        {subtitle && <p className="text-xs text-muted mt-0.5">{subtitle}</p>}
      </div>

      {/* Right Actions */}
      <div className="flex items-center gap-3">
        {/* Search */}
        <AnimatePresence>
          {showSearch && (
            <motion.input
              initial={{ width: 0, opacity: 0 }}
              animate={{ width: 200, opacity: 1 }}
              exit={{ width: 0, opacity: 0 }}
              className="input-field text-sm py-1.5"
              placeholder="Search anything..."
              autoFocus
              onBlur={() => setShowSearch(false)}
            />
          )}
        </AnimatePresence>
        <button
          onClick={() => setShowSearch(!showSearch)}
          className="w-8 h-8 rounded-lg flex items-center justify-center text-slate-400 hover:text-slate-200 hover:bg-white/5 transition-colors"
        >
          <Search size={16} />
        </button>

        {/* Notifications */}
        <div className="relative">
          <button
            onClick={() => setShowNotifications(!showNotifications)}
            className="w-8 h-8 rounded-lg flex items-center justify-center text-slate-400 hover:text-slate-200 hover:bg-white/5 transition-colors relative"
          >
            <Bell size={16} />
            <span className="absolute top-1 right-1 w-2 h-2 rounded-full bg-rose-500 ring-2 ring-[#080c14]" />
          </button>

          <AnimatePresence>
            {showNotifications && (
              <motion.div
                initial={{ opacity: 0, y: 8, scale: 0.96 }}
                animate={{ opacity: 1, y: 0, scale: 1 }}
                exit={{ opacity: 0, y: 8, scale: 0.96 }}
                className="absolute right-0 top-10 w-80 glass-card border border-white/10 py-2 shadow-2xl z-50"
              >
                <div className="px-4 py-2 border-b border-white/5 flex items-center justify-between">
                  <span className="text-sm font-medium text-slate-200">Notifications</span>
                  <span className="text-xs badge-rose px-2 py-0.5 rounded-full">4 new</span>
                </div>
                <div className="max-h-80 overflow-y-auto">
                  {mockNotifications.map((n) => (
                    <motion.div
                      key={n.id}
                      whileHover={{ x: 2 }}
                      className="px-4 py-3 hover:bg-white/3 cursor-pointer border-b border-white/3"
                    >
                      <div className="flex items-start gap-3">
                        <div
                          className={`w-2 h-2 rounded-full mt-1.5 flex-shrink-0 ${
                            n.type === "warning"
                              ? "bg-amber-400"
                              : n.type === "success"
                                ? "bg-emerald-400"
                                : "bg-cyan-400"
                          }`}
                        />
                        <div className="flex-1 min-w-0">
                          <p className="text-xs font-medium text-slate-200 truncate">{n.title}</p>
                          <p className="text-xs text-muted mt-0.5 truncate">{n.desc}</p>
                          <p className="text-xs text-slate-600 mt-1">{n.time}</p>
                        </div>
                      </div>
                    </motion.div>
                  ))}
                </div>
                <div className="px-4 py-2">
                  <button className="text-xs text-emerald-400 hover:text-emerald-300 transition-colors">
                    View all notifications →
                  </button>
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>

        {/* User */}
        <div className="flex items-center gap-2.5 pl-3 border-l border-white/5">
          <div className="w-8 h-8 rounded-full bg-gradient-to-br from-emerald-500 to-cyan-500 flex items-center justify-center">
            <User size={14} className="text-white" />
          </div>
          <div className="hidden sm:block">
            <p className="text-xs font-medium text-slate-200">Admin</p>
            <p className="text-xs text-muted">EcoSphere</p>
          </div>
        </div>
      </div>
    </header>
  );
}
