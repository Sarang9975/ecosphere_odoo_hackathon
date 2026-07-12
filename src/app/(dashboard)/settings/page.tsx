"use client";

import { motion } from "framer-motion";
import { useState, useEffect } from "react";
import { Settings, Bell, Leaf, Users, Shield, Zap, Save, ToggleLeft, ToggleRight } from "lucide-react";
import { getAppSettings, saveAppSettings } from "@/actions/settings";

function Toggle({ enabled, onChange }: { enabled: boolean; onChange: (v: boolean) => void }) {
  return (
    <motion.button
      onClick={() => onChange(!enabled)}
      className="relative w-11 h-6 rounded-full transition-colors flex-shrink-0"
      style={{ background: enabled ? "#10b981" : "rgba(255,255,255,0.08)" }}
      whileTap={{ scale: 0.95 }}
    >
      <motion.div
        className="absolute top-1 left-1 w-4 h-4 rounded-full bg-white shadow"
        animate={{ x: enabled ? 20 : 0 }}
        transition={{ type: "spring", stiffness: 500, damping: 30 }}
      />
    </motion.button>
  );
}

export default function SettingsPage() {
  const [settings, setSettings] = useState({
    autoEmission: true,
    evidenceRequired: false,
    badgeAutoAward: true,
    emailNotifs: true,
    inAppNotifs: true,
    notifyCompliance: true,
    notifyBadge: true,
    notifyCsr: true,
    notifyPolicy: true,
    envWeight: 40,
    socialWeight: 30,
    govWeight: 30,
  });

  const [saved, setSaved] = useState(false);

  useEffect(() => {
    getAppSettings().then((res) => {
      setSettings({
        autoEmission: res.autoEmissionCalculation,
        evidenceRequired: res.evidenceRequired,
        badgeAutoAward: res.badgeAutoAward,
        emailNotifs: res.emailNotifications,
        inAppNotifs: res.inAppNotifications,
        notifyCompliance: res.notifyComplianceIssue,
        notifyBadge: res.notifyBadgeUnlock,
        notifyCsr: res.notifyCsrApproval,
        notifyPolicy: res.notifyPolicyReminder,
        envWeight: Math.round(res.envWeight * 100),
        socialWeight: Math.round(res.socialWeight * 100),
        govWeight: Math.round(res.govWeight * 100),
      });
    });
  }, []);

  const handleSave = async () => {
    await saveAppSettings({
      autoEmissionCalculation: settings.autoEmission,
      evidenceRequired: settings.evidenceRequired,
      badgeAutoAward: settings.badgeAutoAward,
      emailNotifications: settings.emailNotifs,
      inAppNotifications: settings.inAppNotifs,
      notifyComplianceIssue: settings.notifyCompliance,
      notifyBadgeUnlock: settings.notifyBadge,
      notifyCsrApproval: settings.notifyCsr,
      notifyPolicyReminder: settings.notifyPolicy,
      envWeight: settings.envWeight / 100,
      socialWeight: settings.socialWeight / 100,
      govWeight: settings.govWeight / 100,
    });
    setSaved(true);
    setTimeout(() => setSaved(false), 2000);
  };

  const set = (key: keyof typeof settings, value: boolean | number) =>
    setSettings((s) => ({ ...s, [key]: value }));

  const SettingRow = ({
    label,
    desc,
    settingKey,
    icon,
    color = "#10b981",
  }: {
    label: string;
    desc: string;
    settingKey: keyof typeof settings;
    icon: React.ReactNode;
    color?: string;
  }) => (
    <div className="flex items-center justify-between py-4 border-b border-white/5 last:border-0">
      <div className="flex items-start gap-3">
        <div className="w-8 h-8 rounded-lg flex items-center justify-center flex-shrink-0 mt-0.5" style={{ background: `${color}15`, color }}>
          {icon}
        </div>
        <div>
          <p className="text-sm font-medium text-slate-200">{label}</p>
          <p className="text-xs text-muted mt-0.5">{desc}</p>
        </div>
      </div>
      <Toggle enabled={settings[settingKey] as boolean} onChange={(v) => set(settingKey, v)} />
    </div>
  );

  return (
    <div className="space-y-6 max-w-[900px]">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="font-orbitron text-2xl font-bold text-slate-200">⚙️ Settings</h1>
          <p className="text-sm text-muted mt-1">Platform configuration & notification preferences</p>
        </div>
        <motion.button
          onClick={handleSave}
          whileHover={{ scale: 1.02 }}
          whileTap={{ scale: 0.98 }}
          className="flex items-center gap-2 px-5 py-2.5 rounded-xl text-sm font-medium"
          style={{
            background: saved ? "rgba(16,185,129,0.15)" : "linear-gradient(135deg, #10b981, #059669)",
            color: saved ? "#10b981" : "white",
            border: saved ? "1px solid rgba(16,185,129,0.3)" : "none",
          }}
        >
          <Save size={15} />
          {saved ? "Saved!" : "Save Settings"}
        </motion.button>
      </div>

      {/* ESG Automation */}
      <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} className="glass-card p-6">
        <div className="flex items-center gap-2 mb-1">
          <Zap size={14} className="text-amber-400" />
          <h2 className="font-orbitron text-sm font-semibold text-slate-200">ESG Automation</h2>
        </div>
        <p className="text-xs text-muted mb-4">Configure automated calculations and enforcement rules</p>

        <SettingRow
          label="Auto Emission Calculation"
          desc="Automatically calculate CO₂e from Purchase, Manufacturing, Expense & Fleet records using configured Emission Factors"
          settingKey="autoEmission"
          icon={<Leaf size={14} />}
          color="#10b981"
        />
        <SettingRow
          label="Evidence Required for CSR Approval"
          desc="CSR Activity participation cannot be marked Approved without an attached proof file"
          settingKey="evidenceRequired"
          icon={<Users size={14} />}
          color="#06b6d4"
        />
        <SettingRow
          label="Badge Auto-Award"
          desc="Automatically assign badges the moment an employee's XP, challenge count, or metric satisfies the Badge Unlock Rule"
          settingKey="badgeAutoAward"
          icon={<Shield size={14} />}
          color="#8b5cf6"
        />
      </motion.div>

      {/* ESG Score Weights */}
      <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.05 }} className="glass-card p-6">
        <div className="flex items-center gap-2 mb-1">
          <Settings size={14} className="text-cyan-400" />
          <h2 className="font-orbitron text-sm font-semibold text-slate-200">ESG Score Weighting</h2>
        </div>
        <p className="text-xs text-muted mb-5">Configure how each pillar contributes to the overall ESG score (must total 100%)</p>

        <div className="space-y-5">
          {[
            { label: "Environmental Weight", key: "envWeight" as const, color: "#10b981" },
            { label: "Social Weight", key: "socialWeight" as const, color: "#06b6d4" },
            { label: "Governance Weight", key: "govWeight" as const, color: "#8b5cf6" },
          ].map((w) => (
            <div key={w.key}>
              <div className="flex items-center justify-between mb-2">
                <span className="text-xs text-slate-300">{w.label}</span>
                <span className="font-orbitron text-sm font-bold" style={{ color: w.color }}>{settings[w.key]}%</span>
              </div>
              <input
                type="range"
                min={10}
                max={60}
                step={5}
                value={settings[w.key]}
                onChange={(e) => set(w.key, Number(e.target.value))}
                className="w-full h-2 rounded-full appearance-none cursor-pointer"
                style={{
                  background: `linear-gradient(90deg, ${w.color} ${((settings[w.key] as number - 10) / 50) * 100}%, rgba(255,255,255,0.08) ${((settings[w.key] as number - 10) / 50) * 100}%)`,
                }}
              />
            </div>
          ))}

          <div
            className="rounded-xl p-3 text-xs"
            style={{
              background: settings.envWeight + settings.socialWeight + settings.govWeight === 100
                ? "rgba(16,185,129,0.08)"
                : "rgba(244,63,94,0.08)",
              border: `1px solid ${settings.envWeight + settings.socialWeight + settings.govWeight === 100 ? "rgba(16,185,129,0.2)" : "rgba(244,63,94,0.2)"}`,
            }}
          >
            <span className={settings.envWeight + settings.socialWeight + settings.govWeight === 100 ? "text-emerald-400" : "text-rose-400"}>
              Total: {settings.envWeight + settings.socialWeight + settings.govWeight}%
              {settings.envWeight + settings.socialWeight + settings.govWeight === 100
                ? " ✅ Valid configuration"
                : " ⚠️ Must equal 100%"}
            </span>
          </div>
        </div>
      </motion.div>

      {/* Notifications */}
      <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }} className="glass-card p-6">
        <div className="flex items-center gap-2 mb-1">
          <Bell size={14} className="text-rose-400" />
          <h2 className="font-orbitron text-sm font-semibold text-slate-200">Notification Settings</h2>
        </div>
        <p className="text-xs text-muted mb-4">Control which events trigger in-app and email notifications</p>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-0">
          <div>
            <p className="text-xs font-semibold text-slate-400 mb-3 uppercase tracking-wider">Delivery Channels</p>
            <SettingRow label="Email Notifications" desc="Send notifications via email" settingKey="emailNotifs" icon={<Bell size={14} />} color="#06b6d4" />
            <SettingRow label="In-App Notifications" desc="Show notification bell in dashboard" settingKey="inAppNotifs" icon={<Bell size={14} />} color="#8b5cf6" />
          </div>
          <div className="md:pl-6">
            <p className="text-xs font-semibold text-slate-400 mb-3 uppercase tracking-wider">Event Triggers</p>
            <SettingRow label="Compliance Issues" desc="Alert when new/overdue issues arise" settingKey="notifyCompliance" icon={<Shield size={14} />} color="#f43f5e" />
            <SettingRow label="Badge Unlocks" desc="Notify when a badge is awarded" settingKey="notifyBadge" icon={<Zap size={14} />} color="#f59e0b" />
            <SettingRow label="CSR Approvals" desc="Notify on CSR approval decisions" settingKey="notifyCsr" icon={<Users size={14} />} color="#10b981" />
            <SettingRow label="Policy Reminders" desc="Remind unacknowledged employees" settingKey="notifyPolicy" icon={<Leaf size={14} />} color="#06b6d4" />
          </div>
        </div>
      </motion.div>
    </div>
  );
}
