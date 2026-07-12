"use client";

import { useState, useRef, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Bot, X, Send, Sparkles, Minimize2, Maximize2 } from "lucide-react";

const GREETING = "👋 Hi! I'm **GreenMind**, your AI ESG Copilot. Ask me anything about your sustainability data, scores, compliance, or challenges!";

const RESPONSES: Record<string, string> = {
  carbon: "🌱 **Carbon Analysis:** Your organization emitted **2,340 tCO₂e** this quarter — a **12% reduction** from last quarter! Fleet usage and manufacturing are the top contributors. I recommend exploring the Scenario Simulator to model a 20% fleet reduction.",
  department: "🏢 **Department Rankings:** Your top ESG performer is **Engineering** (score: 88/100), followed by **Marketing** (82/100). Operations is at risk with only 61/100 — mainly due to compliance issues.",
  badge: "🏆 **Badge Progress:** Sarah K. is 50 XP away from the 'Carbon Champion' badge. Alex M. needs 2 more challenge completions for 'Eco Warrior'. I can notify them automatically if you enable Badge Auto-Award!",
  report: "📊 **Q3 ESG Summary:** Environmental: 74/100 ✅ | Social: 82/100 ✅ | Governance: 71/100 ⚠️. Overall ESG Score: **76/100**. Governance is lagging — 3 overdue compliance issues need attention. Want me to generate a full PDF report?",
  compliance: "⚠️ **Compliance Alert:** You have **3 overdue** compliance issues. The most critical is 'Emissions Disclosure' owned by the Operations team (overdue by 7 days). I recommend escalating immediately.",
  challenge: "🎯 **Active Challenges:** 12 active challenges with 87 employee participations. The 'Zero-Waste Week' challenge ends in 3 days and has 94% completion rate — exceptional!",
  score: "📈 **ESG Score Breakdown:** Environmental 40% weight → 74 pts | Social 30% weight → 82 pts | Governance 30% weight → 71 pts = **Overall: 76/100**. Improving governance by 10 points would push you to 79 overall.",
  default: "🤔 I can help you analyze your **carbon emissions**, **department rankings**, **badge progress**, **ESG scores**, **compliance issues**, or **challenge status**. What would you like to explore?",
};

function getResponse(input: string): string {
  const lower = input.toLowerCase();
  if (lower.includes("carbon") || lower.includes("emission")) return RESPONSES.carbon;
  if (lower.includes("department") || lower.includes("rank")) return RESPONSES.department;
  if (lower.includes("badge") || lower.includes("achieve")) return RESPONSES.badge;
  if (lower.includes("report") || lower.includes("summary")) return RESPONSES.report;
  if (lower.includes("compli") || lower.includes("audit")) return RESPONSES.compliance;
  if (lower.includes("challenge") || lower.includes("quest")) return RESPONSES.challenge;
  if (lower.includes("score") || lower.includes("esg")) return RESPONSES.score;
  return RESPONSES.default;
}

interface Message {
  role: "user" | "ai";
  content: string;
  timestamp: Date;
}

const QUICK_PROMPTS = [
  "Carbon risk by department?",
  "Which badge is closest?",
  "Draft ESG summary",
  "Compliance alerts?",
];

export function GreenMindCopilot() {
  const [open, setOpen] = useState(false);
  const [minimized, setMinimized] = useState(false);
  const [messages, setMessages] = useState<Message[]>([
    { role: "ai", content: GREETING, timestamp: new Date() },
  ]);
  const [input, setInput] = useState("");
  const [typing, setTyping] = useState(false);
  const endRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    endRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages, typing]);

  const send = async (text?: string) => {
    const msg = text || input.trim();
    if (!msg) return;
    setInput("");
    setMessages((prev) => [...prev, { role: "user", content: msg, timestamp: new Date() }]);
    setTyping(true);
    await new Promise((r) => setTimeout(r, 800 + Math.random() * 600));
    setTyping(false);
    setMessages((prev) => [
      ...prev,
      { role: "ai", content: getResponse(msg), timestamp: new Date() },
    ]);
  };

  return (
    <>
      {/* FAB */}
      <motion.button
        onClick={() => setOpen(true)}
        className="fixed bottom-6 right-6 z-50 w-14 h-14 rounded-2xl flex items-center justify-center shadow-2xl"
        style={{ background: "linear-gradient(135deg, #10b981, #06b6d4)", boxShadow: "0 0 30px rgba(16,185,129,0.4)" }}
        whileHover={{ scale: 1.05 }}
        whileTap={{ scale: 0.95 }}
        animate={open ? { scale: 0, opacity: 0 } : { scale: 1, opacity: 1 }}
      >
        <Sparkles size={22} className="text-white" />
      </motion.button>

      {/* Chat Panel */}
      <AnimatePresence>
        {open && (
          <motion.div
            initial={{ opacity: 0, scale: 0.9, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.9, y: 20 }}
            className="fixed bottom-6 right-6 z-50 w-[360px] flex flex-col"
            style={{
              height: minimized ? "auto" : 520,
              background: "rgba(13, 24, 41, 0.97)",
              border: "1px solid rgba(16, 185, 129, 0.25)",
              borderRadius: 20,
              boxShadow: "0 25px 80px rgba(0,0,0,0.6), 0 0 40px rgba(16,185,129,0.08)",
              backdropFilter: "blur(20px)",
            }}
          >
            {/* Header */}
            <div className="flex items-center gap-3 p-4 border-b border-white/5">
              <div
                className="w-9 h-9 rounded-xl flex items-center justify-center flex-shrink-0"
                style={{ background: "linear-gradient(135deg, #10b981, #06b6d4)", boxShadow: "0 0 15px rgba(16,185,129,0.3)" }}
              >
                <Bot size={18} className="text-white" />
              </div>
              <div className="flex-1">
                <p className="text-sm font-semibold text-slate-100">GreenMind AI</p>
                <div className="flex items-center gap-1.5 mt-0.5">
                  <span className="w-1.5 h-1.5 rounded-full bg-emerald-400" style={{ boxShadow: "0 0 4px #10b981" }} />
                  <span className="text-xs text-emerald-400">Online · ESG Copilot</span>
                </div>
              </div>
              <div className="flex items-center gap-1">
                <button
                  onClick={() => setMinimized(!minimized)}
                  className="w-7 h-7 rounded-lg flex items-center justify-center text-slate-500 hover:text-slate-300 hover:bg-white/5"
                >
                  {minimized ? <Maximize2 size={13} /> : <Minimize2 size={13} />}
                </button>
                <button
                  onClick={() => setOpen(false)}
                  className="w-7 h-7 rounded-lg flex items-center justify-center text-slate-500 hover:text-slate-300 hover:bg-white/5"
                >
                  <X size={13} />
                </button>
              </div>
            </div>

            {!minimized && (
              <>
                {/* Messages */}
                <div className="flex-1 overflow-y-auto p-4 space-y-3">
                  {messages.map((msg, i) => (
                    <motion.div
                      key={i}
                      initial={{ opacity: 0, y: 8 }}
                      animate={{ opacity: 1, y: 0 }}
                      className={`flex ${msg.role === "user" ? "justify-end" : "justify-start"}`}
                    >
                      <div
                        className={`max-w-[85%] rounded-2xl px-3.5 py-2.5 text-xs leading-relaxed ${
                          msg.role === "user"
                            ? "text-white rounded-br-sm"
                            : "text-slate-200 rounded-bl-sm"
                        }`}
                        style={
                          msg.role === "user"
                            ? { background: "linear-gradient(135deg, #10b981, #059669)" }
                            : { background: "rgba(255,255,255,0.05)", border: "1px solid rgba(255,255,255,0.06)" }
                        }
                        dangerouslySetInnerHTML={{
                          __html: msg.content
                            .replace(/\*\*(.*?)\*\*/g, '<strong style="color:#10b981">$1</strong>')
                            .replace(/\n/g, "<br/>"),
                        }}
                      />
                    </motion.div>
                  ))}

                  {typing && (
                    <motion.div
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      className="flex gap-1.5 px-3 py-2"
                    >
                      {[0, 1, 2].map((i) => (
                        <motion.div
                          key={i}
                          className="w-1.5 h-1.5 rounded-full bg-emerald-400"
                          animate={{ y: [-3, 0, -3] }}
                          transition={{ duration: 0.6, repeat: Infinity, delay: i * 0.15 }}
                        />
                      ))}
                    </motion.div>
                  )}
                  <div ref={endRef} />
                </div>

                {/* Quick Prompts */}
                <div className="px-4 pb-2 flex gap-1.5 flex-wrap">
                  {QUICK_PROMPTS.map((p) => (
                    <button
                      key={p}
                      onClick={() => send(p)}
                      className="text-xs px-2.5 py-1 rounded-full border border-emerald-500/20 text-emerald-400 hover:bg-emerald-500/10 transition-colors"
                    >
                      {p}
                    </button>
                  ))}
                </div>

                {/* Input */}
                <div className="p-3 border-t border-white/5">
                  <div className="flex gap-2 items-center">
                    <input
                      value={input}
                      onChange={(e) => setInput(e.target.value)}
                      onKeyDown={(e) => e.key === "Enter" && send()}
                      placeholder="Ask GreenMind anything..."
                      className="flex-1 bg-white/5 border border-white/8 rounded-xl px-3 py-2 text-xs text-slate-200 placeholder:text-slate-600 outline-none focus:border-emerald-500/30"
                    />
                    <motion.button
                      onClick={() => send()}
                      whileHover={{ scale: 1.05 }}
                      whileTap={{ scale: 0.95 }}
                      className="w-8 h-8 rounded-xl flex items-center justify-center flex-shrink-0"
                      style={{ background: "linear-gradient(135deg, #10b981, #06b6d4)" }}
                    >
                      <Send size={13} className="text-white" />
                    </motion.button>
                  </div>
                </div>
              </>
            )}
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}
