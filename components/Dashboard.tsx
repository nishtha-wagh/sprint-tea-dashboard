"use client";
import { useState, useEffect } from "react";
import { XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Area, AreaChart } from "recharts";
import type { Application, PracticeItem, Role, ProgressEntry } from "@/lib/db";

// ─── Icons ──────────────────────────────────────────────────────────────
const SendIcon = () => <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M22 2L11 13"/><path d="M22 2L15 22L11 13L2 9L22 2Z"/></svg>;
const ChatIcon = () => <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M21 15a2 2 0 01-2 2H7l-4 4V5a2 2 0 012-2h14a2 2 0 012 2z"/></svg>;
const CheckCircle = () => <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M22 11.08V12a10 10 0 11-5.93-9.14"/><path d="M22 4L12 14.01l-3-3"/></svg>;
const FlameIcon = () => <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M8.5 14.5A2.5 2.5 0 0011 12c0-1.38-.5-2-1-3-1.072-2.143-.224-4.054 2-6 .5 2.5 2 4.9 4 6.5 2 1.6 3 3.5 3 5.5a7 7 0 11-14 0c0-1.153.433-2.294 1-3a2.5 2.5 0 002.5 2.5z"/></svg>;
const PlusIcon = ({ size = 18 }: { size?: number }) => <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round"><path d="M12 5v14M5 12h14"/></svg>;
const XIcon = ({ size = 14 }: { size?: number }) => <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round"><path d="M18 6L6 18M6 6l12 12"/></svg>;
const CheckSmall = () => <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round"><path d="M20 6L9 17l-5-5"/></svg>;
const ChevronIcon = ({ open }: { open: boolean }) => <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" style={{ transition: "transform 0.25s ease", transform: open ? "rotate(0deg)" : "rotate(-90deg)" }}><path d="M6 9l6 6 6-6"/></svg>;
const TrashIcon = () => <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M3 6h18"/><path d="M19 6v14a2 2 0 01-2 2H7a2 2 0 01-2-2V6m3 0V4a2 2 0 012-2h4a2 2 0 012 2v2"/></svg>;
const EditIcon = () => <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M11 4H4a2 2 0 00-2 2v14a2 2 0 002 2h14a2 2 0 002-2v-7"/><path d="M18.5 2.5a2.121 2.121 0 013 3L12 15l-4 1 1-4 9.5-9.5z"/></svg>;
const BookIcon = () => <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M4 19.5A2.5 2.5 0 016.5 17H20"/><path d="M6.5 2H20v20H6.5A2.5 2.5 0 014 19.5v-15A2.5 2.5 0 016.5 2z"/></svg>;
const BoltIcon = () => <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><path d="M13 2L3 14h9l-1 8 10-12h-9l1-8z"/></svg>;
const CupIcon = () => <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M17 8h1a4 4 0 010 8h-1"/><path d="M3 8h14v9a4 4 0 01-4 4H7a4 4 0 01-4-4V8z"/><line x1="6" y1="2" x2="6" y2="4"/><line x1="10" y1="2" x2="10" y2="4"/><line x1="14" y1="2" x2="14" y2="4"/></svg>;
const FolderIcon = () => <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M22 19a2 2 0 01-2 2H4a2 2 0 01-2-2V5a2 2 0 012-2h5l2 3h9a2 2 0 012 2z"/></svg>;

const STATUS_OPTIONS = ["SAVED", "APPLIED", "INTERVIEWING", "OFFERED", "REJECTED"] as const;
const STATUS_COLORS: Record<string, { bg: string; text: string }> = { SAVED: { bg: "#f0f0f0", text: "#666" }, APPLIED: { bg: "#e0f5e9", text: "#2d8a56" }, INTERVIEWING: { bg: "#e0ecff", text: "#3366cc" }, OFFERED: { bg: "#fff3d4", text: "#b8860b" }, REJECTED: { bg: "#ffe0e0", text: "#cc3333" } };
const ghostBtn = (x: any = {}) => ({ background: "none", border: "none", cursor: "pointer", display: "flex", alignItems: "center", justifyContent: "center", padding: 4, transition: "all 0.15s", ...x } as React.CSSProperties);
const companyInitial = (n: string) => n.charAt(0).toUpperCase();
const INIT_COLORS = ["#a8d5ba", "#f5c6aa", "#c4b5e0", "#a8c8e8", "#f0c6d0", "#d4e8a8", "#e8d4a8"];
const getColor = (n: string) => INIT_COLORS[n.charCodeAt(0) % INIT_COLORS.length];

type Props = {
  applications: Application[];
  dailyPractice: PracticeItem[];
  roles: Role[];
  progressLog: ProgressEntry[];
  streak: number;
  loading: boolean;
  error: string | null;
  addApp: (app: Omit<Application, "id">) => Promise<void>;
  updateApp: (id: string, u: Partial<Application>) => Promise<void>;
  deleteApp: (id: string) => Promise<void>;
  addPractice: (text: string) => Promise<void>;
  togglePractice: (id: string) => Promise<void>;
  removePractice: (id: string) => Promise<void>;
  addRole: (name: string) => Promise<void>;
  removeRole: (id: string) => Promise<void>;
  addSubcategory: (roleId: string, name: string) => Promise<void>;
  removeSubcategory: (roleId: string, subcatId: string) => Promise<void>;
  addTopic: (roleId: string, subcatId: string, text: string) => Promise<void>;
  toggleTopicItem: (roleId: string, subcatId: string, topicId: string) => Promise<void>;
  removeTopic: (roleId: string, subcatId: string, topicId: string) => Promise<void>;
};

// ─── Chart data builder ─────────────────────────────────────────────────
function buildChartData(progressLog: ProgressEntry[]) {
  const data = [];
  const now = new Date();
  const logMap: Record<string, ProgressEntry> = {};
  progressLog.forEach(e => { logMap[e.log_date] = e; });
  for (let i = 13; i >= 0; i--) {
    const d = new Date(now); d.setDate(d.getDate() - i);
    const key = d.toISOString().slice(0, 10);
    const label = d.toLocaleDateString("en-US", { month: "short", day: "2-digit" });
    const entry = logMap[key];
    data.push({ name: label, Applications: entry?.applications_count || 0, Questions: entry?.questions_count || 0 });
  }
  return data;
}

// ─── Applications Section (collapsible) ─────────────────────────────────
function ApplicationsSection({ applications, onAdd, onEdit, onCycleStatus, onDelete }: {
  applications: Application[];
  onAdd: () => void;
  onEdit: (app: Application) => void;
  onCycleStatus: (app: Application) => void;
  onDelete: (id: string) => void;
}) {
  const [expanded, setExpanded] = useState<Record<string, boolean>>({ APPLIED: true, INTERVIEWING: true, SAVED: true, OFFERED: true, REJECTED: false });
  const grouped: Record<string, Application[]> = {};
  STATUS_OPTIONS.forEach(s => { grouped[s] = applications.filter(a => a.status === s); });
  const nonEmpty = STATUS_OPTIONS.filter(s => grouped[s].length > 0);

  return (
    <div style={{ marginBottom: 28 }} className="animate-fade-slide" >
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 16 }}>
        <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
          <div style={{ width: 32, height: 32, borderRadius: 8, background: "#e8ecf5", display: "flex", alignItems: "center", justifyContent: "center", color: "#5566aa" }}><FolderIcon /></div>
          <h2 style={{ fontFamily: "'DM Serif Display', serif", fontSize: 22, margin: 0 }}>Applications</h2>
          <span style={{ fontSize: 13, color: "#99aa99", fontWeight: 600 }}>({applications.length})</span>
        </div>
        <button onClick={onAdd} style={{ display: "flex", alignItems: "center", gap: 6, background: "#1a2e1a", color: "white", border: "none", borderRadius: 12, padding: "10px 20px", fontSize: 13, fontWeight: 600, cursor: "pointer", fontFamily: "inherit", transition: "all 0.2s" }}
          onMouseEnter={e => { (e.currentTarget as any).style.background = "#2d4a2d"; }} onMouseLeave={e => { (e.currentTarget as any).style.background = "#1a2e1a"; }}>
          <PlusIcon /> Add Application
        </button>
      </div>
      {applications.length === 0 && <div style={{ textAlign: "center", padding: "40px 20px", color: "#bbb", fontSize: 14, background: "white", borderRadius: 16, border: "1px solid rgba(0,0,0,0.04)" }}>No applications yet. Add your first one!</div>}
      <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
        {nonEmpty.map(status => {
          const apps = grouped[status]; const isOpen = expanded[status] !== false; const sc = STATUS_COLORS[status];
          return (
            <div key={status} style={{ background: "white", borderRadius: 16, border: "1px solid rgba(0,0,0,0.04)", boxShadow: "0 1px 6px rgba(0,0,0,0.03)", overflow: "hidden" }}>
              <div onClick={() => setExpanded(p => ({ ...p, [status]: !isOpen }))} style={{ display: "flex", alignItems: "center", gap: 10, padding: "13px 18px", cursor: "pointer", userSelect: "none", transition: "background 0.15s" }}
                onMouseEnter={e => { (e.currentTarget as any).style.background = "#fafcfa"; }} onMouseLeave={e => { (e.currentTarget as any).style.background = "transparent"; }}>
                <ChevronIcon open={isOpen} />
                <span style={{ padding: "3px 12px", borderRadius: 6, background: sc.bg, color: sc.text, fontSize: 11, fontWeight: 700, letterSpacing: "0.04em" }}>{status}</span>
                <span style={{ flex: 1 }} />
                <span style={{ fontSize: 12.5, color: "#99aa99", fontWeight: 600 }}>{apps.length} {apps.length === 1 ? "app" : "apps"}</span>
              </div>
              {isOpen && <div style={{ padding: "0 12px 10px" }} className="animate-topic-slide">
                {apps.map(app => (
                  <div key={app.id} style={{ display: "flex", alignItems: "center", gap: 14, padding: "10px 8px", borderRadius: 12, transition: "background 0.12s", marginBottom: 2 }}
                    onMouseEnter={e => { (e.currentTarget as any).style.background = "#f8faf8"; }} onMouseLeave={e => { (e.currentTarget as any).style.background = "transparent"; }}>
                    <div style={{ width: 38, height: 38, borderRadius: 10, background: getColor(app.company), display: "flex", alignItems: "center", justifyContent: "center", fontSize: 14, fontWeight: 700, color: "#444", flexShrink: 0 }}>{companyInitial(app.company)}</div>
                    <div style={{ flex: 1, minWidth: 0 }}>
                      <div style={{ fontSize: 14, fontWeight: 600, marginBottom: 1 }}>{app.role}</div>
                      <div style={{ fontSize: 12.5, color: "#888" }}>{app.company}</div>
                    </div>
                    <button onClick={() => onCycleStatus(app)} title="Cycle status" style={{ padding: "4px 12px", borderRadius: 6, border: "none", background: sc.bg, color: sc.text, fontSize: 10, fontWeight: 700, cursor: "pointer", opacity: 0.7, transition: "opacity 0.15s" } as any}>{status}</button>
                    <button onClick={() => onEdit(app)} style={ghostBtn({ color: "#ccc" })}><EditIcon /></button>
                    <button onClick={() => onDelete(app.id)} style={ghostBtn({ color: "#ccc" })}><TrashIcon /></button>
                  </div>
                ))}
              </div>}
            </div>
          );
        })}
      </div>
    </div>
  );
}

// ─── Topics to Master ───────────────────────────────────────────────────
function TopicsToMaster({ roles, onAddRole, onRemoveRole, onAddSubcategory, onRemoveSubcategory, onAddTopic, onToggleTopic, onRemoveTopic }: {
  roles: Role[];
  onAddRole: (name: string) => Promise<void>;
  onRemoveRole: (id: string) => Promise<void>;
  onAddSubcategory: (roleId: string, name: string) => Promise<void>;
  onRemoveSubcategory: (roleId: string, subcatId: string) => Promise<void>;
  onAddTopic: (roleId: string, subcatId: string, text: string) => Promise<void>;
  onToggleTopic: (roleId: string, subcatId: string, topicId: string) => Promise<void>;
  onRemoveTopic: (roleId: string, subcatId: string, topicId: string) => Promise<void>;
}) {
  const [activeRole, setActiveRole] = useState(roles[0]?.id || "");
  const [expanded, setExpanded] = useState<Record<string, boolean>>({});
  const [addingTopicTo, setAddingTopicTo] = useState<string | null>(null);
  const [newTopicText, setNewTopicText] = useState("");
  const [addingSubcat, setAddingSubcat] = useState(false);
  const [newSubcatName, setNewSubcatName] = useState("");
  const [addingRole, setAddingRole] = useState(false);
  const [newRoleName, setNewRoleName] = useState("");

  useEffect(() => { if (roles.length && !roles.find(r => r.id === activeRole)) setActiveRole(roles[0].id); }, [roles]);

  const role = roles.find(r => r.id === activeRole);
  const getRoleCounts = (r: Role) => { let d = 0, t = 0; r.subcategories.forEach(sc => sc.topics.forEach(tp => { t++; if (tp.done) d++; })); return { done: d, total: t }; };
  const getSubcatCounts = (sc: any) => ({ done: sc.topics.filter((t: any) => t.done).length, total: sc.topics.length });
  const rc = role ? getRoleCounts(role) : { done: 0, total: 0 };

  const handleAddTopic = async (subcatId: string) => {
    if (!newTopicText.trim() || !role) return;
    await onAddTopic(role.id, subcatId, newTopicText.trim());
    setNewTopicText(""); setAddingTopicTo(null);
  };
  const handleAddSubcat = async () => {
    if (!newSubcatName.trim() || !role) return;
    await onAddSubcategory(role.id, newSubcatName.trim());
    setNewSubcatName(""); setAddingSubcat(false);
  };
  const handleAddRole = async () => {
    if (!newRoleName.trim()) return;
    await onAddRole(newRoleName.trim());
    setNewRoleName(""); setAddingRole(false);
  };

  return (
    <div style={{ background: "linear-gradient(135deg, #f9fdf8 0%, #f4f8f2 100%)", borderRadius: 22, padding: "26px 28px 22px", border: "1px solid #e4eddf", boxShadow: "0 2px 12px rgba(0,0,0,0.03)" }}>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 18 }}>
        <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
          <div style={{ width: 32, height: 32, borderRadius: 8, background: "#e0f5e9", display: "flex", alignItems: "center", justifyContent: "center", color: "#2d8a56" }}><BookIcon /></div>
          <h2 style={{ fontFamily: "'DM Serif Display', serif", fontSize: 21, margin: 0 }}>Topics to Master</h2>
        </div>
        <span style={{ fontSize: 15, fontWeight: 700, color: rc.total === 0 ? "#bbb" : rc.done === rc.total ? "#2d8a56" : "#3cb371" }}>{rc.done}/{rc.total}</span>
      </div>
      {/* Role Tabs */}
      <div style={{ display: "flex", gap: 8, flexWrap: "wrap", marginBottom: 20, paddingBottom: 16, borderBottom: "1.5px dashed #e0e8dc" }}>
        {roles.map(r => { const a = r.id === activeRole; return (
          <div key={r.id} style={{ display: "inline-flex", alignItems: "center" }}>
            <button onClick={() => setActiveRole(r.id)} style={{ padding: "7px 18px", borderRadius: 20, border: a ? "none" : "1.5px solid #d4ddd0", background: a ? "#2d8a56" : "white", color: a ? "white" : "#556655", fontSize: 13, fontWeight: 600, cursor: "pointer", fontFamily: "inherit", transition: "all 0.2s" }}>{r.name}</button>
            {roles.length > 1 && a && <button onClick={() => onRemoveRole(r.id)} style={ghostBtn({ color: "#fff8", marginLeft: -8 })}><XIcon size={10} /></button>}
          </div>
        ); })}
        {addingRole ? (
          <div style={{ display: "flex", alignItems: "center", gap: 6 }}>
            <input autoFocus value={newRoleName} onChange={e => setNewRoleName(e.target.value)} onKeyDown={e => { if (e.key === "Enter") handleAddRole(); if (e.key === "Escape") { setAddingRole(false); setNewRoleName(""); }}} placeholder="Role name" style={{ padding: "6px 12px", borderRadius: 16, border: "1.5px dashed #aacaaa", fontSize: 13, fontFamily: "inherit", outline: "none", width: 120, background: "white" }} />
            <button onClick={handleAddRole} style={{ padding: "5px 12px", borderRadius: 14, border: "none", background: "#2d8a56", color: "white", fontSize: 12, fontWeight: 600, cursor: "pointer" }}>Add</button>
            <button onClick={() => { setAddingRole(false); setNewRoleName(""); }} style={ghostBtn({ color: "#999" })}><XIcon size={12} /></button>
          </div>
        ) : (
          <button onClick={() => setAddingRole(true)} style={{ padding: "7px 16px", borderRadius: 20, border: "1.5px dashed #c0d0bc", background: "transparent", color: "#88a888", fontSize: 13, fontWeight: 500, cursor: "pointer", fontFamily: "inherit", display: "flex", alignItems: "center", gap: 5 }}><PlusIcon size={14} /> Add Role</button>
        )}
      </div>
      {/* Subcategories */}
      {role && <div style={{ display: "flex", flexDirection: "column", gap: 6 }}>
        {role.subcategories.map(sc => { const isOpen = expanded[sc.id] !== false; const c = getSubcatCounts(sc); return (
          <div key={sc.id} style={{ background: "white", borderRadius: 14, border: "1px solid #eef2eb", overflow: "hidden" }}>
            <div onClick={() => setExpanded(p => ({ ...p, [sc.id]: !isOpen }))} style={{ display: "flex", alignItems: "center", gap: 8, padding: "12px 16px", cursor: "pointer", userSelect: "none" }}>
              <ChevronIcon open={isOpen} />
              <span style={{ flex: 1, fontWeight: 600, fontSize: 14.5 }}>{sc.name}</span>
              <div style={{ width: 80, height: 5, borderRadius: 3, background: "#eef2eb", overflow: "hidden", flexShrink: 0 }}>
                <div style={{ height: "100%", borderRadius: 3, background: c.done === c.total && c.total > 0 ? "linear-gradient(90deg, #2d8a56, #3cb371)" : "linear-gradient(90deg, #bbd4bb, #9ec09e)", width: c.total > 0 ? `${(c.done / c.total) * 100}%` : "0%", transition: "width 0.4s" }} />
              </div>
              <span style={{ fontSize: 12, color: "#99aa99", fontWeight: 600, minWidth: 32, textAlign: "right" }}>{c.done}/{c.total}</span>
              <button onClick={e => { e.stopPropagation(); onRemoveSubcategory(role.id, sc.id); }} style={ghostBtn({ color: "#ddd", padding: 2 })}><XIcon size={12} /></button>
            </div>
            {isOpen && <div style={{ padding: "0 16px 12px 42px" }} className="animate-topic-slide">
              {sc.topics.map(tp => (
                <div key={tp.id} style={{ display: "flex", alignItems: "center", gap: 10, padding: "7px 4px", borderRadius: 8, transition: "background 0.12s" }}>
                  <div style={{ color: "#3cb371", flexShrink: 0, display: "flex", opacity: 0.5 }}><BoltIcon /></div>
                  <span style={{ flex: 1, fontSize: 13.5, fontWeight: 500, color: tp.done ? "#aab8aa" : "#2a3a2a", textDecoration: tp.done ? "line-through" : "none" }}>{tp.text}</span>
                  <button onClick={() => onToggleTopic(role.id, sc.id, tp.id)} style={{ width: 22, height: 22, borderRadius: 6, border: tp.done ? "none" : "1.5px solid #ccd8cc", background: tp.done ? "#3cb371" : "transparent", display: "flex", alignItems: "center", justifyContent: "center", cursor: "pointer" } as any}>{tp.done && <CheckSmall />}</button>
                  <button onClick={() => onRemoveTopic(role.id, sc.id, tp.id)} style={ghostBtn({ color: "#ddd" })}><XIcon size={12} /></button>
                </div>
              ))}
              {addingTopicTo === sc.id ? (
                <div style={{ display: "flex", alignItems: "center", gap: 8, marginTop: 6 }}>
                  <input autoFocus value={newTopicText} onChange={e => setNewTopicText(e.target.value)} onKeyDown={e => { if (e.key === "Enter") handleAddTopic(sc.id); if (e.key === "Escape") { setAddingTopicTo(null); setNewTopicText(""); }}} placeholder="Topic name" style={{ flex: 1, padding: "7px 12px", borderRadius: 8, border: "1.5px solid #d0e0d0", fontSize: 13, fontFamily: "inherit", outline: "none" }} />
                  <button onClick={() => handleAddTopic(sc.id)} style={{ padding: "6px 14px", borderRadius: 8, border: "none", background: "#2d8a56", color: "white", fontSize: 12, fontWeight: 600, cursor: "pointer" }}>Add</button>
                  <button onClick={() => { setAddingTopicTo(null); setNewTopicText(""); }} style={ghostBtn({ color: "#999" })}><XIcon size={12} /></button>
                </div>
              ) : (
                <button onClick={() => { setAddingTopicTo(sc.id); setNewTopicText(""); }} style={{ background: "none", border: "none", color: "#aacaaa", fontSize: 12.5, fontWeight: 500, cursor: "pointer", fontFamily: "inherit", padding: "6px 4px", display: "flex", alignItems: "center", gap: 4 }}><PlusIcon size={12} /> Add topic</button>
              )}
            </div>}
          </div>
        ); })}
        {addingSubcat ? (
          <div style={{ display: "flex", alignItems: "center", gap: 8, padding: "8px 4px" }}>
            <input autoFocus value={newSubcatName} onChange={e => setNewSubcatName(e.target.value)} onKeyDown={e => { if (e.key === "Enter") handleAddSubcat(); if (e.key === "Escape") { setAddingSubcat(false); setNewSubcatName(""); }}} placeholder="Subcategory name" style={{ flex: 1, padding: "8px 14px", borderRadius: 10, border: "1.5px dashed #bbd4bb", fontSize: 13.5, fontFamily: "inherit", outline: "none" }} />
            <button onClick={handleAddSubcat} style={{ padding: "7px 16px", borderRadius: 10, border: "none", background: "#2d8a56", color: "white", fontSize: 13, fontWeight: 600, cursor: "pointer" }}>Add</button>
            <button onClick={() => { setAddingSubcat(false); setNewSubcatName(""); }} style={ghostBtn({ color: "#999" })}><XIcon size={14} /></button>
          </div>
        ) : (
          <button onClick={() => setAddingSubcat(true)} style={{ background: "none", border: "none", color: "#99bb99", fontSize: 13, fontWeight: 500, cursor: "pointer", fontFamily: "inherit", padding: "10px 4px", display: "flex", alignItems: "center", gap: 5 }}><PlusIcon size={14} /> Add subcategory</button>
        )}
      </div>}
    </div>
  );
}

// ─── Main Dashboard ─────────────────────────────────────────────────────
export default function Dashboard(props: Props) {
  const { applications, dailyPractice, roles, progressLog, streak } = props;
  const [showAppModal, setShowAppModal] = useState(false);
  const [showPracticeInput, setShowPracticeInput] = useState(false);
  const [newPractice, setNewPractice] = useState("");
  const [editingApp, setEditingApp] = useState<Application | null>(null);
  const [appForm, setAppForm] = useState({ role: "", company: "", status: "SAVED" as string });
  const [mounted, setMounted] = useState(false);
  useEffect(() => { setMounted(true); }, []);

  const topicsStudied = roles.reduce((a, r) => a + r.subcategories.reduce((a2, sc) => a2 + sc.topics.filter(t => t.done).length, 0), 0);
  const stats = { saved: applications.filter(a => a.status === "SAVED").length, applied: applications.filter(a => a.status === "APPLIED").length, questions: dailyPractice.filter(p => p.done).length, topicsStudied, streak };
  const chartData = buildChartData(progressLog);

  const openAddApp = () => { setEditingApp(null); setAppForm({ role: "", company: "", status: "SAVED" }); setShowAppModal(true); };
  const openEditApp = (app: Application) => { setEditingApp(app); setAppForm({ role: app.role, company: app.company, status: app.status }); setShowAppModal(true); };
  const saveApp = async () => {
    if (!appForm.role.trim() || !appForm.company.trim()) return;
    if (editingApp) { await props.updateApp(editingApp.id, appForm as any); }
    else { await props.addApp({ role: appForm.role, company: appForm.company, status: appForm.status as any, applied_date: new Date().toISOString().slice(0, 10) }); }
    setShowAppModal(false);
  };
  const cycleStatus = async (app: Application) => {
    const idx = STATUS_OPTIONS.indexOf(app.status);
    await props.updateApp(app.id, { status: STATUS_OPTIONS[(idx + 1) % STATUS_OPTIONS.length] });
  };
  const handleAddPractice = async () => {
    if (!newPractice.trim()) return;
    await props.addPractice(newPractice.trim());
    setNewPractice(""); setShowPracticeInput(false);
  };

  return (
    <div style={{ opacity: mounted ? 1 : 0, transform: mounted ? "none" : "translateY(12px)", transition: "all 0.6s cubic-bezier(0.23, 1, 0.32, 1)" }}>
      {/* Dot texture */}
      <div style={{ position: "fixed", inset: 0, opacity: 0.025, pointerEvents: "none", zIndex: 0, backgroundImage: "radial-gradient(circle at 1px 1px, #2d5a2d 1px, transparent 0)", backgroundSize: "28px 28px" }} />
      <div style={{ maxWidth: 1140, margin: "0 auto", padding: "32px 24px 60px", position: "relative", zIndex: 1 }}>
        {/* Header */}
        <div style={{ marginBottom: 36 }} className="animate-fade-slide">
          <div style={{ display: "inline-flex", alignItems: "center", gap: 8, background: "white", borderRadius: 20, padding: "6px 16px", fontSize: 13, fontWeight: 600, color: "#3a7a4a", boxShadow: "0 1px 4px rgba(0,0,0,0.06)", marginBottom: 16 }}><CupIcon /> Sprint Tea Party Dashboard</div>
          <h1 style={{ fontFamily: "'Playfair Display', serif", fontSize: "clamp(32px, 5vw, 48px)", fontWeight: 800, lineHeight: 1.1, margin: "0 0 8px" }}>Keep the <span style={{ color: "#3cb371", textDecoration: "underline", textDecorationStyle: "wavy", textDecorationColor: "#3cb37188", textUnderlineOffset: 6 } as any}>momentum</span> going!</h1>
          <p style={{ fontSize: 15, color: "#667766", margin: 0, maxWidth: 460 }}>Track your progress, manage applications, and master new skills one sip at a time.</p>
        </div>
        {/* Stats */}
        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(150px, 1fr))", gap: 14, marginBottom: 28 }}>
          {[{ label: "TOTAL SAVED", value: stats.saved, icon: <SendIcon />, color: "#e0f5e9", ic: "#3a7a4a" }, { label: "TOTAL APPLIED", value: stats.applied, icon: <ChatIcon />, color: "#e8ecf5", ic: "#5566aa" }, { label: "QUESTIONS PRACTICED", value: stats.questions, icon: <CheckCircle />, color: "#eee8f5", ic: "#7755aa" }, { label: "TOPICS STUDIED", value: stats.topicsStudied, icon: <BookIcon />, color: "#e0f5e9", ic: "#3a9a5a" }, { label: "DAILY STREAK", value: stats.streak, icon: <FlameIcon />, color: "#f5e0e5", ic: "#cc5577" }].map((s, i) => (
            <div key={s.label} style={{ background: "white", borderRadius: 16, padding: "20px 16px", textAlign: "center", boxShadow: "0 1px 6px rgba(0,0,0,0.04)", border: "1px solid rgba(0,0,0,0.04)", animationDelay: `${0.1 + i * 0.06}s` } as any} className="animate-fade-slide">
              <div style={{ width: 44, height: 44, borderRadius: 12, background: s.color, color: s.ic, display: "inline-flex", alignItems: "center", justifyContent: "center", marginBottom: 10 }}>{s.icon}</div>
              <div style={{ fontSize: 28, fontWeight: 700 }}>{s.value}</div>
              <div style={{ fontSize: 11, fontWeight: 600, color: "#99aa99", letterSpacing: "0.06em", marginTop: 2 }}>{s.label}</div>
            </div>
          ))}
        </div>
        {/* Chart + Practice */}
        <div style={{ display: "grid", gridTemplateColumns: "1fr 340px", gap: 20, marginBottom: 28 }}>
          <div style={{ background: "white", borderRadius: 20, padding: "24px 24px 16px", boxShadow: "0 1px 6px rgba(0,0,0,0.04)", border: "1px solid rgba(0,0,0,0.04)" }}>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 16 }}>
              <h2 style={{ fontFamily: "'DM Serif Display', serif", fontSize: 20, margin: 0 }}>14-Day Progress</h2>
              <div style={{ display: "flex", gap: 16, fontSize: 12, color: "#888" }}>
                <span style={{ display: "flex", alignItems: "center", gap: 5 }}><span style={{ width: 8, height: 8, borderRadius: "50%", background: "#3cb371" }} /> Applications</span>
                <span style={{ display: "flex", alignItems: "center", gap: 5 }}><span style={{ width: 8, height: 8, borderRadius: "50%", background: "#f0a0b0" }} /> Questions</span>
              </div>
            </div>
            <ResponsiveContainer width="100%" height={220}>
              <AreaChart data={chartData}>
                <defs><linearGradient id="gG" x1="0" y1="0" x2="0" y2="1"><stop offset="0%" stopColor="#3cb371" stopOpacity={0.2} /><stop offset="100%" stopColor="#3cb371" stopOpacity={0.02} /></linearGradient><linearGradient id="gP" x1="0" y1="0" x2="0" y2="1"><stop offset="0%" stopColor="#f0a0b0" stopOpacity={0.15} /><stop offset="100%" stopColor="#f0a0b0" stopOpacity={0.02} /></linearGradient></defs>
                <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" vertical={false} /><XAxis dataKey="name" tick={{ fontSize: 11, fill: "#aaa" }} axisLine={false} tickLine={false} /><YAxis tick={{ fontSize: 11, fill: "#aaa" }} axisLine={false} tickLine={false} />
                <Tooltip contentStyle={{ background: "white", border: "1px solid #eee", borderRadius: 10, boxShadow: "0 4px 12px rgba(0,0,0,0.08)", fontSize: 13 }} />
                <Area type="monotone" dataKey="Questions" stroke="#f0a0b0" strokeWidth={2.5} fill="url(#gP)" dot={false} /><Area type="monotone" dataKey="Applications" stroke="#3cb371" strokeWidth={2.5} fill="url(#gG)" dot={false} />
              </AreaChart>
            </ResponsiveContainer>
          </div>
          <div style={{ background: "white", borderRadius: 20, padding: 20, boxShadow: "0 1px 6px rgba(0,0,0,0.04)", border: "1px solid rgba(0,0,0,0.04)", display: "flex", flexDirection: "column" }}>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 14 }}>
              <h2 style={{ fontFamily: "'DM Serif Display', serif", fontSize: 18, margin: 0 }}>Daily Practice</h2>
              <button onClick={() => setShowPracticeInput(true)} style={{ width: 32, height: 32, borderRadius: "50%", border: "2px solid #3cb371", background: "transparent", color: "#3cb371", display: "flex", alignItems: "center", justifyContent: "center", cursor: "pointer" }}><PlusIcon /></button>
            </div>
            {showPracticeInput && <div style={{ display: "flex", gap: 8, marginBottom: 12 }}><input autoFocus value={newPractice} onChange={e => setNewPractice(e.target.value)} onKeyDown={e => e.key === "Enter" && handleAddPractice()} placeholder="Add a practice task..." style={{ flex: 1, padding: "8px 12px", borderRadius: 10, border: "1.5px solid #d0e0d0", fontSize: 13, outline: "none", fontFamily: "inherit" }} /><button onClick={handleAddPractice} style={{ padding: "8px 14px", borderRadius: 10, border: "none", background: "#3cb371", color: "white", fontSize: 13, fontWeight: 600, cursor: "pointer" }}>Add</button></div>}
            <div style={{ display: "flex", flexDirection: "column", gap: 4, flex: 1 }}>
              {dailyPractice.map(item => (
                <div key={item.id} style={{ display: "flex", alignItems: "center", gap: 10, padding: "8px 6px", borderRadius: 10 }}>
                  <button onClick={() => props.togglePractice(item.id)} style={{ width: 22, height: 22, borderRadius: 6, flexShrink: 0, border: item.done ? "none" : "2px solid #ccc", background: item.done ? "#3cb371" : "transparent", display: "flex", alignItems: "center", justifyContent: "center", cursor: "pointer" }}>{item.done && <CheckSmall />}</button>
                  <span style={{ flex: 1, fontSize: 13.5, fontWeight: 500, textDecoration: item.done ? "line-through" : "none", color: item.done ? "#aaa" : "#333" }}>{item.text}</span>
                  <button onClick={() => props.removePractice(item.id)} style={ghostBtn({ color: "#ccc", opacity: 0.5 })}><XIcon /></button>
                </div>
              ))}
            </div>
          </div>
        </div>
        {/* Applications */}
        <ApplicationsSection applications={applications} onAdd={openAddApp} onEdit={openEditApp} onCycleStatus={cycleStatus} onDelete={(id) => props.deleteApp(id)} />
        {/* Topics to Master */}
        <div style={{ marginBottom: 28 }}><TopicsToMaster roles={roles} onAddRole={props.addRole} onRemoveRole={props.removeRole} onAddSubcategory={props.addSubcategory} onRemoveSubcategory={props.removeSubcategory} onAddTopic={props.addTopic} onToggleTopic={props.toggleTopicItem} onRemoveTopic={props.removeTopic} /></div>
      </div>
      {/* App Modal */}
      {showAppModal && <div style={{ position: "fixed", inset: 0, background: "rgba(0,0,0,0.35)", backdropFilter: "blur(4px)", display: "flex", alignItems: "center", justifyContent: "center", zIndex: 100 }} className="animate-fade-in" onClick={() => setShowAppModal(false)}>
        <div onClick={e => e.stopPropagation()} style={{ background: "white", borderRadius: 20, padding: 28, width: 380, boxShadow: "0 20px 60px rgba(0,0,0,0.15)" }} className="animate-scale-in">
          <h3 style={{ fontFamily: "'DM Serif Display', serif", fontSize: 20, margin: "0 0 20px" }}>{editingApp ? "Edit Application" : "New Application"}</h3>
          <div style={{ display: "flex", flexDirection: "column", gap: 14 }}>
            <div><label style={{ fontSize: 12, fontWeight: 600, color: "#888", marginBottom: 4, display: "block" }}>ROLE</label><input autoFocus value={appForm.role} onChange={e => setAppForm(p => ({ ...p, role: e.target.value }))} placeholder="e.g. Data Scientist" style={{ width: "100%", padding: "10px 14px", borderRadius: 10, border: "1.5px solid #e0e0e0", fontSize: 14, fontFamily: "inherit", outline: "none", boxSizing: "border-box" }} /></div>
            <div><label style={{ fontSize: 12, fontWeight: 600, color: "#888", marginBottom: 4, display: "block" }}>COMPANY</label><input value={appForm.company} onChange={e => setAppForm(p => ({ ...p, company: e.target.value }))} placeholder="e.g. Anthropic" style={{ width: "100%", padding: "10px 14px", borderRadius: 10, border: "1.5px solid #e0e0e0", fontSize: 14, fontFamily: "inherit", outline: "none", boxSizing: "border-box" }} /></div>
            <div><label style={{ fontSize: 12, fontWeight: 600, color: "#888", marginBottom: 4, display: "block" }}>STATUS</label><div style={{ display: "flex", flexWrap: "wrap", gap: 6 }}>{STATUS_OPTIONS.map(s => <button key={s} onClick={() => setAppForm(p => ({ ...p, status: s }))} style={{ padding: "6px 14px", borderRadius: 8, border: "none", background: appForm.status === s ? STATUS_COLORS[s].bg : "#f5f5f5", color: appForm.status === s ? STATUS_COLORS[s].text : "#999", fontSize: 11, fontWeight: 700, cursor: "pointer", outline: appForm.status === s ? `2px solid ${STATUS_COLORS[s].text}33` : "none" }}>{s}</button>)}</div></div>
          </div>
          <div style={{ display: "flex", gap: 10, marginTop: 24, justifyContent: "flex-end" }}>
            <button onClick={() => setShowAppModal(false)} style={{ padding: "10px 20px", borderRadius: 10, border: "1.5px solid #e0e0e0", background: "white", fontSize: 13, fontWeight: 600, cursor: "pointer", fontFamily: "inherit" }}>Cancel</button>
            <button onClick={saveApp} style={{ padding: "10px 24px", borderRadius: 10, border: "none", background: "#1a2e1a", color: "white", fontSize: 13, fontWeight: 600, cursor: "pointer", fontFamily: "inherit" }}>{editingApp ? "Save Changes" : "Add Application"}</button>
          </div>
        </div>
      </div>}
    </div>
  );
}
