import type { PlannerMilestoneCrewInput } from "@/data/planner";
import type { createServiceRoleClient } from "@/lib/supabase/admin";

type Db = ReturnType<typeof createServiceRoleClient>;

export function milestoneSqlError(message: string) {
  if (/horizon|proof_|planner_milestone_deps|milestone_id|column "?role"?/i.test(message)) {
    return "Run supabase/migrations/104_planner_milestone_depth.sql in the Supabase SQL editor.";
  }
  if (/does not exist|schema cache/i.test(message)) {
    return "Run supabase/migrations/103_planner_milestones.sql in the Supabase SQL editor.";
  }
  return message;
}

export async function replaceMilestoneCrew(db: Db, milestoneId: string, crew: PlannerMilestoneCrewInput[]) {
  const { error: clearError } = await db.from("planner_milestone_members").delete().eq("milestone_id", milestoneId);
  if (clearError) return clearError.message;
  if (!crew.length) return null;
  const { error } = await db.from("planner_milestone_members").insert(
    crew.map((person) => ({
      milestone_id: milestoneId,
      member_id: person.member_id,
      role: person.role,
    })),
  );
  return error?.message ?? null;
}

/** Replace who this target is waiting on. Returns an error string, or null. */
export async function replaceMilestoneDeps(db: Db, milestoneId: string, blockedBy: string[]) {
  const ids = [...new Set(blockedBy.map((id) => id.trim()).filter((id) => id && id !== milestoneId))];
  const { data, error } = await db.from("planner_milestone_deps").select("milestone_id, blocked_by");
  if (error) return error.message;
  const graph = new Map<string, string[]>();
  for (const row of (data ?? []) as { milestone_id: string; blocked_by: string }[]) {
    if (row.milestone_id === milestoneId) continue;
    const list = graph.get(row.milestone_id) ?? [];
    list.push(row.blocked_by);
    graph.set(row.milestone_id, list);
  }
  graph.set(milestoneId, ids);

  function reaches(start: string, target: string, seen = new Set<string>()): boolean {
    if (start === target) return true;
    if (seen.has(start)) return false;
    seen.add(start);
    for (const next of graph.get(start) ?? []) {
      if (reaches(next, target, seen)) return true;
    }
    return false;
  }

  for (const blocked of ids) {
    if (reaches(blocked, milestoneId)) {
      return "That would loop. A target can't wait on something that is already waiting on it.";
    }
  }

  const { error: clearError } = await db.from("planner_milestone_deps").delete().eq("milestone_id", milestoneId);
  if (clearError) return clearError.message;
  if (!ids.length) return null;
  const { error: insertError } = await db.from("planner_milestone_deps").insert(
    ids.map((blocked_by) => ({ milestone_id: milestoneId, blocked_by })),
  );
  return insertError?.message ?? null;
}
