"use client";
import { useState, useEffect, useCallback } from "react";
import * as db from "./db";
import type { Application, PracticeItem, Role, ProgressEntry } from "./db";

export type DashboardData = {
  applications: Application[];
  dailyPractice: PracticeItem[];
  roles: Role[];
  progressLog: ProgressEntry[];
  streak: number;
  loading: boolean;
  error: string | null;
};

export function useDashboard() {
  const [applications, setApplications] = useState<Application[]>([]);
  const [dailyPractice, setDailyPractice] = useState<PracticeItem[]>([]);
  const [roles, setRoles] = useState<Role[]>([]);
  const [progressLog, setProgressLog] = useState<ProgressEntry[]>([]);
  const [streak, setStreak] = useState(0);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // ── Initial fetch ──
  const fetchAll = useCallback(async () => {
    try {
      setLoading(true);
      const [apps, practice, rolesData, progress, streakCount] = await Promise.all([
        db.getApplications(),
        db.getDailyPractice(),
        db.getRolesWithTopics(),
        db.getProgressLog(14),
        db.getStreak(),
      ]);
      setApplications(apps);
      setDailyPractice(practice);
      setRoles(rolesData);
      setProgressLog(progress);
      setStreak(streakCount);
      setError(null);
    } catch (e: any) {
      setError(e.message || "Failed to load data");
      console.error("Dashboard fetch error:", e);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { fetchAll(); }, [fetchAll]);

  // ── Applications ──
  const addApp = async (app: Omit<Application, "id">) => {
    try {
      const newApp = await db.addApplication(app);
      setApplications((p) => [newApp, ...p]);
      await db.logActivity();
    } catch (e: any) { setError(e.message); }
  };

  const updateApp = async (id: string, updates: Partial<Application>) => {
    try {
      const updated = await db.updateApplication(id, updates);
      setApplications((p) => p.map((a) => (a.id === id ? updated : a)));
    } catch (e: any) { setError(e.message); }
  };

  const deleteApp = async (id: string) => {
    try {
      await db.deleteApplication(id);
      setApplications((p) => p.filter((a) => a.id !== id));
    } catch (e: any) { setError(e.message); }
  };

  // ── Daily Practice ──
  const addPractice = async (text: string) => {
    try {
      const item = await db.addPracticeItem(text);
      setDailyPractice((p) => [...p, item]);
      await db.logActivity();
    } catch (e: any) { setError(e.message); }
  };

  const togglePractice = async (id: string) => {
    const item = dailyPractice.find((p) => p.id === id);
    if (!item) return;
    const newDone = !item.done;
    setDailyPractice((p) => p.map((x) => (x.id === id ? { ...x, done: newDone } : x)));
    try {
      await db.togglePracticeItem(id, newDone);
      if (newDone) await db.logActivity();
    } catch (e: any) { setError(e.message); }
  };

  const removePractice = async (id: string) => {
    try {
      await db.deletePracticeItem(id);
      setDailyPractice((p) => p.filter((x) => x.id !== id));
    } catch (e: any) { setError(e.message); }
  };

  // ── Roles ──
  const addRole = async (name: string) => {
    try {
      const r = await db.addRole(name, roles.length);
      setRoles((p) => [...p, r]);
    } catch (e: any) { setError(e.message); }
  };

  const removeRole = async (id: string) => {
    try {
      await db.deleteRole(id);
      setRoles((p) => p.filter((r) => r.id !== id));
    } catch (e: any) { setError(e.message); }
  };

  // ── Subcategories ──
  const addSubcategory = async (roleId: string, name: string) => {
    try {
      const role = roles.find((r) => r.id === roleId);
      const sc = await db.addSubcategory(roleId, name, role?.subcategories.length || 0);
      setRoles((p) =>
        p.map((r) =>
          r.id === roleId ? { ...r, subcategories: [...r.subcategories, sc] } : r
        )
      );
    } catch (e: any) { setError(e.message); }
  };

  const removeSubcategory = async (roleId: string, subcatId: string) => {
    try {
      await db.deleteSubcategory(subcatId);
      setRoles((p) =>
        p.map((r) =>
          r.id === roleId
            ? { ...r, subcategories: r.subcategories.filter((sc) => sc.id !== subcatId) }
            : r
        )
      );
    } catch (e: any) { setError(e.message); }
  };

  // ── Topics ──
  const addTopic = async (roleId: string, subcatId: string, text: string) => {
    try {
      const topic = await db.addTopic(subcatId, text);
      setRoles((p) =>
        p.map((r) =>
          r.id === roleId
            ? {
                ...r,
                subcategories: r.subcategories.map((sc) =>
                  sc.id === subcatId ? { ...sc, topics: [...sc.topics, topic] } : sc
                ),
              }
            : r
        )
      );
    } catch (e: any) { setError(e.message); }
  };

  const toggleTopicItem = async (roleId: string, subcatId: string, topicId: string) => {
    const role = roles.find((r) => r.id === roleId);
    const sc = role?.subcategories.find((s) => s.id === subcatId);
    const topic = sc?.topics.find((t) => t.id === topicId);
    if (!topic) return;
    const newDone = !topic.done;
    setRoles((p) =>
      p.map((r) =>
        r.id === roleId
          ? {
              ...r,
              subcategories: r.subcategories.map((s) =>
                s.id === subcatId
                  ? { ...s, topics: s.topics.map((t) => (t.id === topicId ? { ...t, done: newDone } : t)) }
                  : s
              ),
            }
          : r
      )
    );
    try {
      await db.toggleTopic(topicId, newDone);
      if (newDone) await db.logActivity();
    } catch (e: any) { setError(e.message); }
  };

  const removeTopic = async (roleId: string, subcatId: string, topicId: string) => {
    try {
      await db.deleteTopic(topicId);
      setRoles((p) =>
        p.map((r) =>
          r.id === roleId
            ? {
                ...r,
                subcategories: r.subcategories.map((s) =>
                  s.id === subcatId ? { ...s, topics: s.topics.filter((t) => t.id !== topicId) } : s
                ),
              }
            : r
        )
      );
    } catch (e: any) { setError(e.message); }
  };

  return {
    // Data
    applications, dailyPractice, roles, progressLog, streak, loading, error,
    // Application actions
    addApp, updateApp, deleteApp,
    // Practice actions
    addPractice, togglePractice, removePractice,
    // Role actions
    addRole, removeRole,
    // Subcategory actions
    addSubcategory, removeSubcategory,
    // Topic actions
    addTopic, toggleTopicItem, removeTopic,
    // Refresh
    refresh: fetchAll,
  };
}
