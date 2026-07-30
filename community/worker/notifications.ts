import { makeOpaqueId } from "./domain.mjs";
import type { Env } from "./types";

export async function listNotifications(env: Env, profileId: string) {
  const rows = await env.DB.prepare("SELECT id, suggestion_id as suggestionId, type, message, is_read as isRead, created_at as createdAt FROM notifications WHERE profile_id = ? ORDER BY created_at DESC LIMIT 50").bind(profileId).all<Record<string, unknown>>();
  return rows.results;
}

export async function markNotificationsRead(env: Env, profileId: string, id?: string) {
  if (id) await env.DB.prepare("UPDATE notifications SET is_read = 1 WHERE profile_id = ? AND id = ?").bind(profileId, id).run();
  else await env.DB.prepare("UPDATE notifications SET is_read = 1 WHERE profile_id = ?").bind(profileId).run();
}

export async function getPreferences(env: Env, profileId: string) {
  const row = await env.DB.prepare("SELECT status_updates as statusUpdates, comment_replies as commentReplies FROM notification_preferences WHERE profile_id = ?").bind(profileId).first<Record<string, unknown>>();
  return row ?? { statusUpdates: 1, commentReplies: 1 };
}

export async function updatePreferences(env: Env, profileId: string, input: { statusUpdates: boolean; commentReplies: boolean }) {
  await env.DB.prepare(
    `INSERT INTO notification_preferences (profile_id, status_updates, comment_replies) VALUES (?, ?, ?)
     ON CONFLICT(profile_id) DO UPDATE SET status_updates = excluded.status_updates, comment_replies = excluded.comment_replies, updated_at = CURRENT_TIMESTAMP`,
  ).bind(profileId, input.statusUpdates ? 1 : 0, input.commentReplies ? 1 : 0).run();
  return getPreferences(env, profileId);
}

export async function notifyProfile(env: Env, profileId: string, suggestionId: string | null, type: string, message: string) {
  await env.DB.prepare("INSERT INTO notifications (id, profile_id, suggestion_id, type, message) VALUES (?, ?, ?, ?, ?)").bind(makeOpaqueId(), profileId, suggestionId, type, message).run();
}

