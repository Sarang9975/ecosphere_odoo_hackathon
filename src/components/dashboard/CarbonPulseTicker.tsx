"use client";

import { useEffect, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Zap } from "lucide-react";

interface TickerEvent {
  id: string;
  type: "carbon" | "csr" | "badge" | "compliance" | "challenge";
  message: string;
  time: string;
  dept?: string;
}

const MOCK_EVENTS: TickerEvent[] = [
  { id: "1", type: "carbon", message: "Fleet travel logged: 24.5 tCO₂e", time: "just now", dept: "Operations" },
  { id: "2", type: "badge", message: "Alex M. unlocked 'Eco Warrior' badge 🏆", time: "2m ago" },
  { id: "3", type: "csr", message: "Tree Planting Drive: 12 new participants", time: "5m ago", dept: "HR" },
  { id: "4", type: "compliance", message: "⚠️ Emissions Disclosure overdue — Operations", time: "8m ago", dept: "Operations" },
  { id: "5", type: "challenge", message: "Zero-Waste Week: 94% completion rate", time: "11m ago" },
  { id: "6", type: "carbon", message: "Manufacturing emission recorded: 8.2 tCO₂e", time: "15m ago", dept: "Manufacturing" },
  { id: "7", type: "csr", message: "Community Clean-Up approved for Sarah K.", time: "20m ago" },
  { id: "8", type: "badge", message: "Engineering dept earned 'Green Team' badge", time: "25m ago", dept: "Engineering" },
];

const EVENT_STYLES = {
  carbon: { bg: "rgba(244,63,94,0.08)", border: "rgba(244,63,94,0.2)", dot: "#f43f5e", label: "CARBON" },
  csr: { bg: "rgba(16,185,129,0.08)", border: "rgba(16,185,129,0.2)", dot: "#10b981", label: "CSR" },
  badge: { bg: "rgba(245,158,11,0.08)", border: "rgba(245,158,11,0.2)", dot: "#f59e0b", label: "BADGE" },
  compliance: { bg: "rgba(239,68,68,0.1)", border: "rgba(239,68,68,0.25)", dot: "#ef4444", label: "ALERT" },
  challenge: { bg: "rgba(139,92,246,0.08)", border: "rgba(139,92,246,0.2)", dot: "#8b5cf6", label: "QUEST" },
};

export function CarbonPulseTicker() {
  const [events, setEvents] = useState<TickerEvent[]>(MOCK_EVENTS.slice(0, 5));
  const [nextIndex, setNextIndex] = useState(5);

  useEffect(() => {
    const interval = setInterval(() => {
      const newEvent = { ...MOCK_EVENTS[nextIndex % MOCK_EVENTS.length], id: Date.now().toString(), time: "just now" };
      setEvents((prev) => [newEvent, ...prev.slice(0, 7)]);
      setNextIndex((i) => i + 1);
    }, 3500);
    return () => clearInterval(interval);
  }, [nextIndex]);

  return (
    <div className="flex flex-col gap-2 h-full overflow-hidden">
      <div className="flex items-center gap-2 mb-1">
        <Zap size={12} className="text-amber-400" />
        <span className="text-xs font-semibold text-amber-400 font-orbitron tracking-wider">LIVE PULSE</span>
        <motion.span
          className="w-1.5 h-1.5 rounded-full bg-amber-400 ml-auto"
          animate={{ opacity: [1, 0.3, 1] }}
          transition={{ duration: 1.5, repeat: Infinity }}
        />
      </div>

      <div className="flex-1 overflow-hidden space-y-2">
        <AnimatePresence initial={false}>
          {events.map((event) => {
            const style = EVENT_STYLES[event.type];
            return (
              <motion.div
                key={event.id}
                initial={{ x: 60, opacity: 0, height: 0 }}
                animate={{ x: 0, opacity: 1, height: "auto" }}
                exit={{ x: -20, opacity: 0, height: 0 }}
                transition={{ duration: 0.35, ease: "easeOut" }}
                className="rounded-lg px-3 py-2 flex items-start gap-2.5 ticker-item"
                style={{ background: style.bg, border: `1px solid ${style.border}` }}
              >
                <div className="flex flex-col items-center gap-1 pt-0.5">
                  <motion.div
                    className="w-1.5 h-1.5 rounded-full flex-shrink-0"
                    style={{ background: style.dot, boxShadow: `0 0 6px ${style.dot}` }}
                    animate={{ opacity: [1, 0.5, 1] }}
                    transition={{ duration: 1.5, repeat: Infinity }}
                  />
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-1.5 mb-0.5">
                    <span
                      className="text-[9px] font-bold tracking-widest px-1 rounded"
                      style={{ color: style.dot, background: `${style.dot}15` }}
                    >
                      {style.label}
                    </span>
                    {event.dept && (
                      <span className="text-[9px] text-muted truncate">{event.dept}</span>
                    )}
                  </div>
                  <p className="text-xs text-slate-300 leading-relaxed">{event.message}</p>
                  <p className="text-[9px] text-slate-600 mt-0.5">{event.time}</p>
                </div>
              </motion.div>
            );
          })}
        </AnimatePresence>
      </div>
    </div>
  );
}
