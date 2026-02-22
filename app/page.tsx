"use client";
import { useDashboard } from "@/lib/useDashboard";
import Dashboard from "@/components/Dashboard";

export default function Home() {
  const dashboard = useDashboard();

  if (dashboard.loading) {
    return (
      <div style={{ minHeight: "100vh", display: "flex", alignItems: "center", justifyContent: "center", flexDirection: "column", gap: 16 }}>
        <div style={{ width: 40, height: 40, borderRadius: "50%", border: "3px solid #e0f5e9", borderTopColor: "#3cb371", animation: "pulse 1s infinite" }} />
        <p style={{ color: "#667766", fontSize: 14 }}>Loading your dashboard...</p>
      </div>
    );
  }

  if (dashboard.error && dashboard.applications.length === 0) {
    return (
      <div style={{ minHeight: "100vh", display: "flex", alignItems: "center", justifyContent: "center", flexDirection: "column", gap: 16, padding: 24 }}>
        <div style={{ background: "#ffe0e0", color: "#cc3333", padding: "16px 24px", borderRadius: 12, fontSize: 14, maxWidth: 500, textAlign: "center" }}>
          <strong>Connection Error:</strong> {dashboard.error}
          <br /><br />
          Make sure your <code>.env.local</code> has the correct Supabase URL and anon key, and that you've run the schema SQL.
        </div>
        <button onClick={dashboard.refresh} style={{ padding: "10px 24px", borderRadius: 10, border: "none", background: "#1a2e1a", color: "white", fontSize: 13, fontWeight: 600, cursor: "pointer" }}>
          Retry
        </button>
      </div>
    );
  }

  return <Dashboard {...dashboard} />;
}
