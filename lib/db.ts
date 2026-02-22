import { supabase } from "./supabase";

// ─── Types ──────────────────────────────────────────────────────────────
export type Application = {
  id: string;
  role: string;
  company: string;
  status: "SAVED" | "APPLIED" | "INTERVIEWING" | "OFFERED" | "REJECTED";
  applied_date: string;
};

export type PracticeItem = {
  id: string;
  text: string;
  done: boolean;
  practice_date: string;
};

export type Topic = {
  id: string;
  subcategory_id: string;
  text: string;
  done: boolean;
};

export type Subcategory = {
  id: string;
  role_id: string;
  name: string;
  sort_order: number;
  topics: Topic[];
};

export type Role = {
  id: string;
  name: string;
  sort_order: number;
  subcategories: Subcategory[];
};

export type ProgressEntry = {
  log_date: string;
  applications_count: number;
  questions_count: number;
};

// ─── Applications ───────────────────────────────────────────────────────
export async function getApplications(): Promise<Application[]> {
  const { data, error } = await supabase
    .from("applications")
    .select("*")
    .order("created_at", { ascending: false });
  if (error) throw error;
  return data || [];
}

export async function addApplication(app: Omit<Application, "id">): Promise<Application> {
  const { data, error } = await supabase
    .from("applications")
    .insert({ role: app.role, company: app.company, status: app.status, applied_date: app.applied_date })
    .select()
    .single();
  if (error) throw error;
  return data;
}

export async function updateApplication(id: string, updates: Partial<Application>): Promise<Application> {
  const { data, error } = await supabase
    .from("applications")
    .update(updates)
    .eq("id", id)
    .select()
    .single();
  if (error) throw error;
  return data;
}

export async function deleteApplication(id: string): Promise<void> {
  const { error } = await supabase.from("applications").delete().eq("id", id);
  if (error) throw error;
}

// ─── Daily Practice ─────────────────────────────────────────────────────
export async function getDailyPractice(date?: string): Promise<PracticeItem[]> {
  let query = supabase.from("daily_practice").select("*").order("created_at", { ascending: true });
  if (date) query = query.eq("practice_date", date);
  const { data, error } = await query;
  if (error) throw error;
  return data || [];
}

export async function addPracticeItem(text: string): Promise<PracticeItem> {
  const { data, error } = await supabase
    .from("daily_practice")
    .insert({ text, done: false, practice_date: new Date().toISOString().slice(0, 10) })
    .select()
    .single();
  if (error) throw error;
  return data;
}

export async function togglePracticeItem(id: string, done: boolean): Promise<void> {
  const { error } = await supabase.from("daily_practice").update({ done }).eq("id", id);
  if (error) throw error;
}

export async function deletePracticeItem(id: string): Promise<void> {
  const { error } = await supabase.from("daily_practice").delete().eq("id", id);
  if (error) throw error;
}

// ─── Roles / Subcategories / Topics (nested fetch) ──────────────────────
export async function getRolesWithTopics(): Promise<Role[]> {
  const { data: roles, error: re } = await supabase
    .from("roles")
    .select("*")
    .order("sort_order");
  if (re) throw re;

  const { data: subcats, error: se } = await supabase
    .from("subcategories")
    .select("*")
    .order("sort_order");
  if (se) throw se;

  const { data: topics, error: te } = await supabase
    .from("topics")
    .select("*")
    .order("created_at");
  if (te) throw te;

  // Nest the data
  const topicsBySubcat: Record<string, Topic[]> = {};
  (topics || []).forEach((t) => {
    if (!topicsBySubcat[t.subcategory_id]) topicsBySubcat[t.subcategory_id] = [];
    topicsBySubcat[t.subcategory_id].push(t);
  });

  const subcatsByRole: Record<string, Subcategory[]> = {};
  (subcats || []).forEach((sc) => {
    if (!subcatsByRole[sc.role_id]) subcatsByRole[sc.role_id] = [];
    subcatsByRole[sc.role_id].push({ ...sc, topics: topicsBySubcat[sc.id] || [] });
  });

  return (roles || []).map((r) => ({
    ...r,
    subcategories: subcatsByRole[r.id] || [],
  }));
}

export async function addRole(name: string, sortOrder: number): Promise<Role> {
  const { data, error } = await supabase
    .from("roles")
    .insert({ name, sort_order: sortOrder })
    .select()
    .single();
  if (error) throw error;
  return { ...data, subcategories: [] };
}

export async function deleteRole(id: string): Promise<void> {
  const { error } = await supabase.from("roles").delete().eq("id", id);
  if (error) throw error;
}

export async function addSubcategory(roleId: string, name: string, sortOrder: number): Promise<Subcategory> {
  const { data, error } = await supabase
    .from("subcategories")
    .insert({ role_id: roleId, name, sort_order: sortOrder })
    .select()
    .single();
  if (error) throw error;
  return { ...data, topics: [] };
}

export async function deleteSubcategory(id: string): Promise<void> {
  const { error } = await supabase.from("subcategories").delete().eq("id", id);
  if (error) throw error;
}

export async function addTopic(subcategoryId: string, text: string): Promise<Topic> {
  const { data, error } = await supabase
    .from("topics")
    .insert({ subcategory_id: subcategoryId, text, done: false })
    .select()
    .single();
  if (error) throw error;
  return data;
}

export async function toggleTopic(id: string, done: boolean): Promise<void> {
  const { error } = await supabase.from("topics").update({ done }).eq("id", id);
  if (error) throw error;
}

export async function deleteTopic(id: string): Promise<void> {
  const { error } = await supabase.from("topics").delete().eq("id", id);
  if (error) throw error;
}

// ─── Streak ─────────────────────────────────────────────────────────────
export async function logActivity(): Promise<void> {
  const today = new Date().toISOString().slice(0, 10);
  const { error } = await supabase
    .from("streak_log")
    .upsert({ log_date: today, active: true }, { onConflict: "log_date" });
  if (error) throw error;
}

export async function getStreak(): Promise<number> {
  const { data, error } = await supabase
    .from("streak_log")
    .select("log_date")
    .eq("active", true)
    .order("log_date", { ascending: false })
    .limit(60);
  if (error) throw error;
  if (!data || data.length === 0) return 0;

  let streak = 0;
  const today = new Date();
  for (let i = 0; i < 60; i++) {
    const d = new Date(today);
    d.setDate(d.getDate() - i);
    const key = d.toISOString().slice(0, 10);
    if (data.find((r) => r.log_date === key)) {
      streak++;
    } else {
      if (i === 0) continue; // today might not be logged yet
      break;
    }
  }
  return streak;
}

// ─── Progress Log ───────────────────────────────────────────────────────
export async function getProgressLog(days: number = 14): Promise<ProgressEntry[]> {
  const since = new Date();
  since.setDate(since.getDate() - days);
  const { data, error } = await supabase
    .from("progress_log")
    .select("*")
    .gte("log_date", since.toISOString().slice(0, 10))
    .order("log_date");
  if (error) throw error;
  return data || [];
}

export async function upsertProgressLog(
  date: string,
  appCount: number,
  questionsCount: number
): Promise<void> {
  const { error } = await supabase
    .from("progress_log")
    .upsert(
      { log_date: date, applications_count: appCount, questions_count: questionsCount },
      { onConflict: "log_date" }
    );
  if (error) throw error;
}

// Auto-sync: queries today's actual counts from DB and upserts into progress_log
export async function syncTodayProgress(): Promise<void> {
  const today = new Date().toISOString().slice(0, 10);
  try {
    const { count: appCount } = await supabase
      .from("applications")
      .select("*", { count: "exact", head: true })
      .eq("applied_date", today);

    const { count: questionsCount } = await supabase
      .from("daily_practice")
      .select("*", { count: "exact", head: true })
      .eq("practice_date", today)
      .eq("done", true);

    await upsertProgressLog(today, appCount || 0, questionsCount || 0);
  } catch (e) {
    console.error("Failed to sync progress:", e);
  }
}
