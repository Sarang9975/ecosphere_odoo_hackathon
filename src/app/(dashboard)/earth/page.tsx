"use client";

import dynamic from "next/dynamic";

function LoadingScreen() {
  return (
    <div
      className="w-full h-full flex items-center justify-center"
      style={{ background: "#030a14", minHeight: "100vh" }}
    >
      <div className="text-center">
        <div
          className="w-16 h-16 rounded-full mx-auto mb-4 flex items-center justify-center text-3xl"
          style={{ background: "rgba(16,185,129,0.1)", border: "1px solid rgba(16,185,129,0.3)" }}
        >
          🌍
        </div>
        <p className="font-orbitron text-emerald-400 text-sm">Loading 3D Earth...</p>
        <p className="text-xs text-slate-600 mt-2">Initialising WebGL environment</p>
      </div>
    </div>
  );
}

const EarthVisualizer = dynamic(
  () => import("@/components/earth/EarthVisualizer").then((m) => m.EarthVisualizer),
  { ssr: false, loading: () => <LoadingScreen /> }
);

export default function EarthPage() {
  return (
    <div style={{ position: "fixed", inset: 0, zIndex: 100, background: "#030a14" }}>
      <EarthVisualizer isFullPage initialESG={72} initialCarbon={45} initialCSR={60} />
    </div>
  );
}

