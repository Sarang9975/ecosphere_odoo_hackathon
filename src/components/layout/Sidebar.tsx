"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";
import {
  LayoutDashboard,
  Globe,
  Leaf,
  Users,
  Shield,
  Trophy,
  BarChart3,
  Sliders,
  Settings,
  Zap,
  ChevronLeft,
  ChevronRight,
} from "lucide-react";
import { useState } from "react";

const navItems = [
  { href: "/dashboard", icon: LayoutDashboard, label: "Dashboard", color: "#10b981" },
  { href: "/earth", icon: Globe, label: "3D Earth Twin", color: "#06b6d4" },
  { href: "/environmental", icon: Leaf, label: "Environmental", color: "#10b981" },
  { href: "/social", icon: Users, label: "Social", color: "#06b6d4" },
  { href: "/governance", icon: Shield, label: "Governance", color: "#8b5cf6" },
  { href: "/gamification", icon: Trophy, label: "Gamification", color: "#f59e0b" },
  { href: "/reports", icon: BarChart3, label: "Reports", color: "#06b6d4" },
  { href: "/simulator", icon: Sliders, label: "Simulator", color: "#f43f5e" },
  { href: "/settings", icon: Settings, label: "Settings", color: "#64748b" },
];

export function Sidebar() {
  const pathname = usePathname();
  const [collapsed, setCollapsed] = useState(false);

  return (
    <motion.div
      className="sidebar flex flex-col h-full relative"
      animate={{ width: collapsed ? 64 : 220 }}
      transition={{ duration: 0.3, ease: "easeInOut" }}
    >
      {/* Logo */}
      <div className="flex items-center gap-3 p-4 h-16 border-b border-white/5">
        <div
          className="w-9 h-9 rounded-xl flex items-center justify-center flex-shrink-0"
          style={{
            background: "linear-gradient(135deg, #10b981, #06b6d4)",
            boxShadow: "0 0 20px rgba(16, 185, 129, 0.4)",
          }}
        >
          <Zap size={18} className="text-white" />
        </div>
        <AnimatePresence>
          {!collapsed && (
            <motion.div
              initial={{ opacity: 0, x: -10 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -10 }}
              transition={{ duration: 0.2 }}
            >
              <span className="font-orbitron font-bold text-sm tracking-wider gradient-text-emerald">
                EcoSphere
              </span>
              <p className="text-xs text-muted mt-0.5">ESG Platform</p>
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      {/* Nav Items */}
      <nav className="flex-1 p-3 space-y-1 overflow-y-auto">
        {navItems.map((item) => {
          const active = pathname.startsWith(item.href);
          return (
            <Link key={item.href} href={item.href}>
              <motion.div
                className={`sidebar-item flex items-center gap-3 px-3 py-2.5 cursor-pointer ${active ? "active" : ""}`}
                style={active ? { boxShadow: `inset 3px 0 0 ${item.color}` } : {}}
                whileHover={{ x: 2 }}
                whileTap={{ scale: 0.98 }}
              >
                <item.icon
                  size={18}
                  style={{ color: active ? item.color : undefined }}
                  className="flex-shrink-0"
                />
                <AnimatePresence>
                  {!collapsed && (
                    <motion.span
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      exit={{ opacity: 0 }}
                      className="text-sm font-medium whitespace-nowrap"
                      style={{ color: active ? item.color : undefined }}
                    >
                      {item.label}
                    </motion.span>
                  )}
                </AnimatePresence>
                {active && !collapsed && (
                  <motion.div
                    layoutId="activeIndicator"
                    className="ml-auto w-1.5 h-1.5 rounded-full"
                    style={{ background: item.color }}
                  />
                )}
              </motion.div>
            </Link>
          );
        })}
      </nav>

      {/* Collapse Button */}
      <button
        onClick={() => setCollapsed(!collapsed)}
        className="absolute -right-3 top-20 w-6 h-6 rounded-full border border-white/10 bg-[#0d1829] flex items-center justify-center text-slate-400 hover:text-emerald-400 hover:border-emerald-500/30 transition-colors z-10"
      >
        {collapsed ? <ChevronRight size={12} /> : <ChevronLeft size={12} />}
      </button>

      {/* Bottom ESG Score */}
      {!collapsed && (
        <div className="p-3 m-3 rounded-xl" style={{ background: "rgba(16,185,129,0.06)", border: "1px solid rgba(16,185,129,0.12)" }}>
          <p className="text-xs text-muted mb-2">Overall ESG Score</p>
          <div className="flex items-end gap-2">
            <span className="font-orbitron text-2xl font-bold text-emerald-400">78</span>
            <span className="text-xs text-emerald-500 mb-1">/ 100</span>
          </div>
          <div className="w-full bg-white/5 rounded-full h-1.5 mt-2">
            <motion.div
              className="h-1.5 rounded-full"
              style={{ background: "linear-gradient(90deg, #10b981, #06b6d4)" }}
              initial={{ width: 0 }}
              animate={{ width: "78%" }}
              transition={{ duration: 1.5, ease: "easeOut" }}
            />
          </div>
        </div>
      )}
    </motion.div>
  );
}
