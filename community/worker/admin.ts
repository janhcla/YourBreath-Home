import { makeOpaqueId, validateStatus } from "./domain.mjs";
import type { Env } from "./types";

export async function adminOverview(env: Env) {
  const [suggestions, votes, comments, openReports, recent] = await Promise.all([
    env.DB.prepare("SELECT COUNT(*) as count FROM suggestions WHERE is_hidden = 0 AND canonical_suggestion_id IS NULL").first<{ count: number }>(),
    env.DB.prepare("SELECT COUNT(*) as count FROM votes").first<{ count: number }>(),
    env.DB.prepare("SELECT COUNT(*) as count FROM comments WHERE is_hidden = 0").first<{ count: number }>(),
    env.DB.prepare("SELECT COUNT(*) as count FROM reports WHERE status = 'open'").first<{ count: number }>(),
    env.DB.prepare("SELECT s.id, s.title, c.name as category, s.status, COALESCE(s.developer_response, '') as response, COUNT(v.rowid) as votes, CASE WHEN s.status IN ('New', 'Under review') THEN 'Needs attention' ELSE 'Rising' END as priority FROM suggestions s JOIN categories c ON c.id = s.category_id LEFT JOIN votes v ON v.suggestion_id = s.id WHERE s.is_hidden = 0 AND s.canonical_suggestion_id IS NULL GROUP BY s.id ORDER BY s.updated_at DESC LIMIT 25").all<Record<string, unknown>>(),
  ]);
  return {
    metrics: { suggestions: Number(suggestions?.count ?? 0), votes: Number(votes?.count ?? 0), comments: Number(comments?.count ?? 0), openReports: Number(openReports?.count ?? 0) },
    suggestions: recent.results,
  };
}

export async function updateSuggestion(env: Env, actorId: string, id: string, input: Record<string, unknown>) {
  const current = await env.DB.prepare("SELECT status, developer_response, comments_locked, is_hidden, is_pinned FROM suggestions WHERE id = ?").bind(id).first<{ status: string; developer_response: string | null; comments_locked: number; is_hidden: number; is_pinned: number }>();
  if (!current) return { ok: false as const, error: "Idea not found" };
  const status = input.status === undefined ? current.status : String(input.status);
  if (!validateStatus(status)) return { ok: false as const, error: "Invalid status" };
  const developerResponse = input.developerResponse === undefined ? current.developer_response : String(input.developerResponse).slice(0, 2000);
  const commentsLocked = input.commentsLocked === undefined ? Boolean(current.comments_locked) : Boolean(input.commentsLocked);
  const isHidden = input.isHidden === undefined ? Boolean(current.is_hidden) : Boolean(input.isHidden);
  const isPinned = input.isPinned === undefined ? Boolean(current.is_pinned) : Boolean(input.isPinned);
  const statements: D1PreparedStatement[] = [
    env.DB.prepare("UPDATE suggestions SET status = ?, developer_response = ?, comments_locked = ?, is_hidden = ?, is_pinned = ?, updated_at = CURRENT_TIMESTAMP WHERE id = ?").bind(status, developerResponse, commentsLocked ? 1 : 0, isHidden ? 1 : 0, isPinned ? 1 : 0, id),
  ];
  if (status !== current.status) {
    statements.push(env.DB.prepare("INSERT INTO suggestion_status_history (id, suggestion_id, from_status, to_status, changed_by, note) VALUES (?, ?, ?, ?, ?, ?)").bind(makeOpaqueId(), id, current.status, status, actorId, developerResponse));
    const followers = await env.DB.prepare("SELECT user_id FROM follows WHERE suggestion_id = ?").bind(id).all<{ user_id: string }>();
    for (const follower of followers.results) {
      statements.push(env.DB.prepare("INSERT INTO notifications (id, profile_id, suggestion_id, type, message) VALUES (?, ?, ?, 'status', ?)").bind(makeOpaqueId(), follower.user_id, id, `YourBreath Community updated an idea to ${status}.`));
    }
  }
  statements.push(env.DB.prepare("INSERT INTO audit_log (id, actor_profile_id, action, entity_type, entity_id, metadata_json) VALUES (?, ?, 'update', 'suggestion', ?, ?)").bind(makeOpaqueId(), actorId, id, JSON.stringify({ status, commentsLocked, isHidden, isPinned })));
  await env.DB.batch(statements);
  return { ok: true as const };
}

export async function mergeSuggestion(env: Env, actorId: string, sourceId: string, canonicalId: string) {
  if (!canonicalId || sourceId === canonicalId) return { ok: false as const, error: "Choose a different canonical idea" };
  const source = await env.DB.prepare("SELECT id FROM suggestions WHERE id = ? AND is_hidden = 0").bind(sourceId).first<{ id: string }>();
  const canonical = await env.DB.prepare("SELECT id FROM suggestions WHERE id = ? AND is_hidden = 0").bind(canonicalId).first<{ id: string }>();
  if (!source || !canonical) return { ok: false as const, error: "Idea not found" };
  await env.DB.batch([
    env.DB.prepare("UPDATE suggestions SET canonical_suggestion_id = ?, is_hidden = 1, updated_at = CURRENT_TIMESTAMP WHERE id = ?").bind(canonicalId, sourceId),
    env.DB.prepare("INSERT INTO audit_log (id, actor_profile_id, action, entity_type, entity_id, metadata_json) VALUES (?, ?, 'merge', 'suggestion', ?, ?)").bind(makeOpaqueId(), actorId, sourceId, JSON.stringify({ canonicalId })),
  ]);
  return { ok: true as const };
}

export async function updateReport(env: Env, actorId: string, id: string, status: string, hideTarget: boolean) {
  if (!["open", "reviewed", "dismissed"].includes(status)) return { ok: false as const, error: "Invalid report status" };
  const report = await env.DB.prepare("SELECT suggestion_id, comment_id FROM reports WHERE id = ?").bind(id).first<{ suggestion_id: string | null; comment_id: string | null }>();
  if (!report) return { ok: false as const, error: "Report not found" };
  const statements: D1PreparedStatement[] = [
    env.DB.prepare("UPDATE reports SET status = ? WHERE id = ?").bind(status, id),
    env.DB.prepare("INSERT INTO audit_log (id, actor_profile_id, action, entity_type, entity_id, metadata_json) VALUES (?, ?, 'review', 'report', ?, ?)").bind(makeOpaqueId(), actorId, id, JSON.stringify({ status, hideTarget })),
  ];
  if (hideTarget && report.comment_id) statements.push(env.DB.prepare("UPDATE comments SET is_hidden = 1 WHERE id = ?").bind(report.comment_id));
  if (hideTarget && report.suggestion_id) statements.push(env.DB.prepare("UPDATE suggestions SET is_hidden = 1, updated_at = CURRENT_TIMESTAMP WHERE id = ?").bind(report.suggestion_id));
  await env.DB.batch(statements);
  return { ok: true as const };
}
