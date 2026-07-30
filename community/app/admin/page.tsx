"use client";

import { useEffect, useState } from "react";
import Link from "next/link";

type AdminIdea = { id: string; title: string; category: string; status: string; votes: number; response: string; priority: string };

async function adminRequest<T>(path: string, init?: RequestInit): Promise<T> {
  const response = await fetch(path, { credentials: "same-origin", ...init, headers: { "content-type": "application/json", ...(init?.headers ?? {}) } });
  const body = await response.json().catch(() => ({}));
  if (!response.ok) throw new Error(typeof body.error === "string" ? body.error : "Admin request failed");
  return body as T;
}
export default function AdminPage() {
  const [ideas, setIdeas] = useState<AdminIdea[]>([]);
  const [activeId, setActiveId] = useState("");
  const [notice, setNotice] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const active = ideas.find((idea) => idea.id === activeId) ?? ideas[0];

  useEffect(() => {
    adminRequest<{ suggestions: AdminIdea[] }>("/api/admin/overview").then((result) => {
      setIdeas(result.suggestions);
      setActiveId(result.suggestions[0]?.id ?? "");
    }).catch((requestError) => setError(requestError instanceof Error ? requestError.message : "Admin access is unavailable")).finally(() => setLoading(false));
  }, []);

  function updateActive(field: "status" | "response", value: string) {
    setIdeas((current) => current.map((idea) => idea.id === activeId ? { ...idea, [field]: value } : idea));
  }

  async function saveActive() {
    if (!active) return;
    setSaving(true);
    try {
      await adminRequest(`/api/admin/suggestions/${encodeURIComponent(active.id)}`, { method: "PATCH", body: JSON.stringify({ status: active.status, developerResponse: active.response }) });
      setNotice("Public update saved with status history and audit record.");
    } catch (requestError) { setNotice(requestError instanceof Error ? requestError.message : "Update failed"); }
    finally { setSaving(false); }
  }

  async function mergeActive() {
    if (!active) return;
    const canonicalId = window.prompt("Canonical idea id to keep:");
    if (!canonicalId) return;
    try {
      await adminRequest(`/api/admin/suggestions/${encodeURIComponent(active.id)}/merge`, { method: "POST", body: JSON.stringify({ canonicalId }) });
      setIdeas((current) => current.filter((idea) => idea.id !== active.id));
      setNotice("Duplicate merged and hidden from the public queue.");
    } catch (requestError) { setNotice(requestError instanceof Error ? requestError.message : "Merge failed"); }
  }

  if (loading) return <main className="admin-gate"><div className="admin-gate-card"><p className="eyebrow">Private workspace</p><h1>Community admin</h1><p>Checking the server-side admin session…</p></div></main>;
  if (error) return <main className="admin-gate"><div className="admin-gate-card"><Link className="back-link" href="/">← Back to Community</Link><div className="admin-lock">⌁</div><p className="eyebrow">Private workspace</p><h1>Community admin</h1><p>{error}</p><a className="button button-primary" href={`/api/auth/apple/start?return_to=${encodeURIComponent("/admin")}`}>Sign in with Apple <span aria-hidden="true">→</span></a><small>Access is checked by the Worker; this page never decides who is an administrator.</small></div></main>;

  return <main className="admin-shell"><header className="admin-header"><Link className="brand" href="/"><span className="brand-mark" aria-hidden="true"><span /><span /><span /></span><span>YourBreath <em>Community</em></span></Link><div><span className="admin-badge">Server-authorized admin</span><Link className="back-link" href="/">Public Community ↗</Link></div></header><div className="admin-content"><div className="admin-title"><div><p className="eyebrow">Private workspace</p><h1>Community overview</h1><p>Turn product signals into calm, transparent decisions.</p></div><button className="button button-primary" onClick={() => setNotice("Review queues are driven by the server-side suggestion and report data.")}>Review queue</button></div>{notice && <div className="admin-notice" role="status">✓ {notice}</div>}<section className="admin-metrics"><div><span>Ideas in queue</span><strong>{ideas.length}</strong><small>server data</small></div><div><span>Votes</span><strong>{ideas.reduce((sum, idea) => sum + idea.votes, 0)}</strong><small>first-party signal</small></div><div><span>Needs attention</span><strong>{ideas.filter((idea) => idea.status === "New" || idea.status === "Under review").length}</strong><small>review queue</small></div><div><span>Reports</span><strong>—</strong><small>open reports use the moderation API</small></div></section><div className="admin-grid"><section className="admin-panel"><div className="panel-heading"><div><p className="eyebrow">Needs attention</p><h2>Suggestion queue</h2></div></div><div className="admin-idea-list">{ideas.map((idea) => <button className={`admin-idea ${idea.id === activeId ? "active" : ""}`} key={idea.id} onClick={() => setActiveId(idea.id)}><span className={`status status-${idea.status.toLowerCase().replaceAll(" ", "-")}`}>{idea.status}</span><strong>{idea.title}</strong><small>{idea.votes} votes · {idea.priority}</small></button>)}</div></section>{active ? <section className="admin-panel admin-editor"><div className="panel-heading"><div><p className="eyebrow">Manage idea</p><h2>Public details</h2></div><span className="editor-dot">Server-backed</span></div><label>Title<input value={active.title} readOnly /></label><label>Category<input value={active.category} readOnly /></label><label>Status<select value={active.status} onChange={(event) => updateActive("status", event.target.value)}><option>New</option><option>Under review</option><option>Planned</option><option>In progress</option><option>Shipped</option><option>Not planned</option></select></label><label>Developer response<textarea value={active.response} onChange={(event) => updateActive("response", event.target.value)} placeholder="Write a transparent public response..." /></label><div className="admin-editor-actions"><button className="button button-secondary" disabled={saving} onClick={saveActive}>{saving ? "Saving…" : "Save public update"}</button><button className="text-button" onClick={mergeActive}>Merge duplicate</button></div></section> : <section className="admin-panel"><p>No suggestions are currently available.</p></section>}</div><section className="admin-security-note"><span aria-hidden="true">◇</span><div><strong>Security boundary</strong><p>Every admin read and write is authorized by the Worker role, recorded in audit_log, and never trusted from browser state. Status changes notify followers transactionally.</p></div></section></div></main>;
}
