import { Sidebar } from "@/components/layout/Sidebar";
import { TopBar } from "@/components/layout/TopBar";
import { GreenMindCopilot } from "@/components/ai/GreenMindCopilot";

const PAGE_META: Record<string, { title: string; subtitle?: string }> = {
  "/dashboard": { title: "ESG Command Center", subtitle: "Real-time sustainability intelligence" },
  "/environmental": { title: "Environmental", subtitle: "Carbon tracking & sustainability goals" },
  "/social": { title: "Social Impact", subtitle: "CSR activities & employee engagement" },
  "/governance": { title: "Governance", subtitle: "Policies, audits & compliance" },
  "/gamification": { title: "Gamification", subtitle: "Challenges, badges & rewards" },
  "/reports": { title: "Reports & Analytics", subtitle: "Generate & export ESG reports" },
  "/simulator": { title: "Scenario Simulator", subtitle: "What-if ESG planning" },
  "/settings": { title: "Settings", subtitle: "Platform configuration" },
};

export default function DashboardLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="flex h-screen overflow-hidden relative">
      {/* Aurora background */}
      <div className="aurora-bg" />

      {/* Sidebar */}
      <div className="relative z-10 flex-shrink-0 h-full">
        <Sidebar />
      </div>

      {/* Main content */}
      <div className="flex-1 flex flex-col overflow-hidden relative z-10">
        <TopBar title="EcoSphere" subtitle="ESG Management Platform" />
        <main className="flex-1 overflow-y-auto p-6 page-enter">
          {children}
        </main>
      </div>

      {/* AI Copilot */}
      <GreenMindCopilot />
    </div>
  );
}
