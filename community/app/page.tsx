"use client";

import { FormEvent, useEffect, useMemo, useState } from "react";
import { createComment as apiCreateComment, createSuggestion as apiCreateSuggestion, fetchActivity, fetchSession, fetchSuggestion, fetchSuggestions, signInWithApple, toggleFollow as apiToggleFollow, toggleVote as apiToggleVote } from "./community-api";

type Status = "New" | "Under review" | "Planned" | "In progress" | "Shipped" | "Not planned";
type View = "ideas" | "roadmap" | "shipped" | "activity";
type SortMode = "Top" | "Trending" | "Newest";

type Comment = { id: string; author: string; body: string; date: string };
type Idea = {
  id: string;
  title: string;
  description: string;
  category: string;
  status: Status;
  votes: number;
  submitted: string;
  author: string;
  developerResponse?: string;
  comments: Comment[];
  commentCount?: number;
  isShipped?: boolean;
  version?: string;
  availability?: string;
  isPinned?: boolean;
  viewerVoted?: boolean;
  viewerFollowed?: boolean;
};

const categories = [
  "All categories",
  "Breathing techniques",
  "Sessions & customisation",
  "Apple Watch",
  "Live biofeedback",
  "Progress & insights",
  "Programs",
  "Reminders & habits",
  "Widgets & complications",
  "Accessibility",
  "Premium",
  "Other",
];
const statuses: Status[] = ["New", "Under review", "Planned", "In progress", "Shipped", "Not planned"];

function initialView(): View {
  if (typeof window === "undefined") return "ideas";
  const pathname = window.location.pathname.replace(/\/+$/, "") || "/";
  if (pathname === "/roadmap") return "roadmap";
  if (pathname === "/shipped") return "shipped";
  if (pathname === "/activity") return "activity";
  return "ideas";
}

function statusIcon(status: Status) {
  return { New: "✦", "Under review": "◌", Planned: "◎", "In progress": "↗", Shipped: "✓", "Not planned": "–" }[status];
}

function formatVotes(votes: number) {
  return new Intl.NumberFormat("en", { notation: "compact", maximumFractionDigits: 1 }).format(votes);
}

function mapSuggestion(item: { id: string; title: string; description: string; category: string; status: string; votes: number; comments: number; submitted: string; author: string; developerResponse: string | null; isPinned: boolean; isShipped: boolean; version: string | null; availability: string | null; viewerVoted: boolean; viewerFollowed: boolean }): Idea {
  return {
    id: item.id,
    title: item.title,
    description: item.description,
    category: item.category,
    status: item.status as Status,
    votes: item.votes,
    submitted: item.submitted,
    author: item.author,
    developerResponse: item.developerResponse ?? undefined,
    comments: [],
    commentCount: item.comments,
    isShipped: item.isShipped,
    version: item.version ?? undefined,
    availability: item.availability ?? undefined,
    isPinned: item.isPinned,
    viewerVoted: item.viewerVoted,
    viewerFollowed: item.viewerFollowed,
  };
}

function IdeaCard({ idea, voted, followed, onVote, onOpen, onFollow }: { idea: Idea; voted: boolean; followed: boolean; onVote: () => void; onOpen: () => void; onFollow: () => void }) {
  return (
    <article className={`idea-row ${idea.isPinned ? "is-pinned" : ""}`}>
      <button className={`vote-button ${voted ? "is-voted" : ""}`} onClick={onVote} aria-label={`${voted ? "Remove vote from" : "Vote for"} ${idea.title}`} aria-pressed={voted}>
        <span aria-hidden="true">▲</span><strong>{formatVotes(idea.votes)}</strong><small>{voted ? "Voted" : "Votes"}</small>
      </button>
      <button className="idea-main" onClick={onOpen} aria-label={`Open idea: ${idea.title}`}>
        <div className="row-heading"><h3>{idea.title}</h3>{idea.isPinned && <span className="pin-mark">Pinned</span>}</div>
        <p>{idea.description}</p>
        <div className="idea-meta"><span className={`status status-${idea.status.toLowerCase().replaceAll(" ", "-")}`}><span aria-hidden="true">{statusIcon(idea.status)}</span>{idea.status}</span><span>{idea.category}</span><span>{idea.commentCount ?? idea.comments.length} {(idea.commentCount ?? idea.comments.length) === 1 ? "comment" : "comments"}</span><span>{idea.submitted}</span></div>
      </button>
      <button className={`follow-button ${followed ? "is-followed" : ""}`} onClick={onFollow} aria-label={`${followed ? "Unfollow" : "Follow"} ${idea.title}`} aria-pressed={followed}>{followed ? "Following" : "Follow"}</button>
    </article>
  );
}

function Modal({ children, onClose, label }: { children: React.ReactNode; onClose: () => void; label: string }) {
  return <div className="modal-backdrop" role="presentation" onMouseDown={(event) => { if (event.target === event.currentTarget) onClose(); }}><div className="modal" role="dialog" aria-modal="true" aria-label={label}><button className="modal-close" onClick={onClose} aria-label="Close">×</button>{children}</div></div>;
}

export default function Home() {
  const [view, setView] = useState<View>(initialView);
  const [ideas, setIdeas] = useState<Idea[]>([]);
  const [shippedIdeas, setShippedIdeas] = useState<Idea[]>([]);
  const [votedIds, setVotedIds] = useState<string[]>([]);
  const [followedIds, setFollowedIds] = useState<string[]>([]);
  const [submittedIds, setSubmittedIds] = useState<string[]>([]);
  const [query, setQuery] = useState("");
  const [sort, setSort] = useState<SortMode>("Top");
  const [category, setCategory] = useState("All categories");
  const [status, setStatus] = useState("All statuses");
  const [activeIdea, setActiveIdea] = useState<Idea | null>(null);
  const [showSuggest, setShowSuggest] = useState(false);
  const [showSignIn, setShowSignIn] = useState(false);
  const [signedIn, setSignedIn] = useState(false);
  const [notice, setNotice] = useState("");
  const [loading, setLoading] = useState(true);
  const [apiError, setApiError] = useState("");

  useEffect(() => {
    fetchSession().then((session) => setSignedIn(session.authenticated)).catch(() => setApiError("Community session could not be loaded. You can still retry below."));
  }, []);

  useEffect(() => {
    let cancelled = false;
    fetchSuggestions({ query, category, status, sort }).then(({ suggestions }) => {
      if (cancelled) return;
      const mapped = suggestions.map(mapSuggestion);
      setIdeas(mapped.filter((idea) => !idea.isShipped));
      setShippedIdeas(mapped.filter((idea) => idea.isShipped));
      setVotedIds(mapped.filter((idea) => idea.viewerVoted).map((idea) => idea.id));
      setFollowedIds(mapped.filter((idea) => idea.viewerFollowed).map((idea) => idea.id));
      setApiError("");
    }).catch(() => { if (!cancelled) setApiError("The Community ideas could not be loaded."); }).finally(() => { if (!cancelled) setLoading(false); });
    return () => { cancelled = true; };
  }, [query, category, status, sort]);

  useEffect(() => {
    fetchActivity().then(({ activity }) => {
      setVotedIds(activity.votes.map((item) => item.id));
      setFollowedIds(activity.follows.map((item) => item.id));
      setSubmittedIds(activity.submissions.map((item) => item.id));
    }).catch(() => undefined);
  }, [signedIn]);

  const activeIdeaId = activeIdea?.id;
  useEffect(() => {
    if (!activeIdeaId) return;
    fetchSuggestion(activeIdeaId).then(({ suggestion }) => setActiveIdea((current) => current?.id === activeIdeaId ? { ...current, comments: (suggestion.comments ?? []).map((item) => ({ id: item.id, author: item.author, body: item.body, date: item.date })) } : current)).catch(() => undefined);
  }, [activeIdeaId]);

  const allIdeas = useMemo(() => [...ideas, ...shippedIdeas], [ideas, shippedIdeas]);
  const filteredIdeas = useMemo(() => {
    const normalized = query.trim().toLowerCase();
    const result = ideas.filter((idea) => {
      const matchesQuery = !normalized || `${idea.title} ${idea.description}`.toLowerCase().includes(normalized);
      return matchesQuery && (category === "All categories" || idea.category === category) && (status === "All statuses" || idea.status === status);
    });
    return result.sort((a, b) => sort === "Newest" ? b.id.localeCompare(a.id) : sort === "Trending" ? (b.votes + (b.status === "Under review" ? 12 : 0)) - (a.votes + (a.status === "Under review" ? 12 : 0)) : b.votes - a.votes);
  }, [ideas, query, category, status, sort]);

  function announce(message: string) { setNotice(message); window.setTimeout(() => setNotice(""), 2600); }
  async function vote(id: string) {
    const already = votedIds.includes(id);
    setVotedIds((current) => already ? current.filter((item) => item !== id) : [...current, id]);
    setIdeas((current) => current.map((idea) => idea.id === id ? { ...idea, votes: Math.max(0, idea.votes + (already ? -1 : 1)) } : idea));
    try {
      const result = await apiToggleVote(id);
      setVotedIds((current) => result.voted ? [...new Set([...current, id])] : current.filter((item) => item !== id));
      setIdeas((current) => current.map((idea) => idea.id === id ? { ...idea, votes: result.votes, viewerVoted: result.voted } : idea));
      setActiveIdea((current) => current?.id === id ? { ...current, votes: result.votes, viewerVoted: result.voted } : current);
      announce(result.voted ? "Vote added — thank you for helping shape YourBreath" : "Vote removed");
    } catch (error) {
      setVotedIds((current) => already ? [...current, id] : current.filter((item) => item !== id));
      setIdeas((current) => current.map((idea) => idea.id === id ? { ...idea, votes: Math.max(0, idea.votes + (already ? 1 : -1)) } : idea));
      announce(error instanceof Error ? error.message : "Vote could not be saved");
    }
  }
  async function follow(id: string) {
    if (!signedIn) { setShowSignIn(true); return; }
    try {
      const result = await apiToggleFollow(id);
      setFollowedIds((current) => result.followed ? [...new Set([...current, id])] : current.filter((item) => item !== id));
      setActiveIdea((current) => current?.id === id ? { ...current, viewerFollowed: result.followed } : current);
      announce(result.followed ? "You’re following this idea across devices" : "You no longer follow this idea");
    } catch (error) { announce(error instanceof Error ? error.message : "Follow could not be saved"); }
  }
  async function submitIdea(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const data = new FormData(event.currentTarget);
    const title = String(data.get("title") ?? "").trim();
    const description = String(data.get("description") ?? "").trim();
    if (!title || !description) return;
    try {
      const result = await apiCreateSuggestion({ title, description, category: String(data.get("category") ?? "Other") });
      setSubmittedIds((current) => [...current, result.id]);
      setShowSuggest(false);
      announce("Thanks — your idea is in");
      setQuery("");
      const refreshed = await fetchSuggestions({ sort });
      const mapped = refreshed.suggestions.map(mapSuggestion);
      setIdeas(mapped.filter((idea) => !idea.isShipped));
      setShippedIdeas(mapped.filter((idea) => idea.isShipped));
    } catch (error) { announce(error instanceof Error ? error.message : "Idea could not be saved"); }
  }
  async function commentOnIdea(body: string) {
    if (!activeIdea) return;
    try {
      await apiCreateComment(activeIdea.id, body);
      const refreshed = await fetchSuggestion(activeIdea.id);
      setActiveIdea((current) => current?.id === activeIdea.id ? { ...current, comments: (refreshed.suggestion.comments ?? []).map((item) => ({ id: item.id, author: item.author, body: item.body, date: item.date })) } : current);
      announce("Comment added");
    } catch (error) { announce(error instanceof Error ? error.message : "Comment could not be saved"); }
  }
  function navigate(next: View) { setView(next); window.scrollTo({ top: 0, behavior: "smooth" }); }

  return <div className="site-shell">
    <div className="ambient ambient-one" aria-hidden="true" /><div className="ambient ambient-two" aria-hidden="true" />
    <header className="site-header"><a className="brand" href="#ideas" onClick={(event) => { event.preventDefault(); navigate("ideas"); }}><span className="brand-mark" aria-hidden="true"><span /><span /><span /></span><span>YourBreath <em>Community</em></span></a><nav aria-label="Community navigation"><button className={view === "ideas" ? "active" : ""} onClick={() => navigate("ideas")}>Ideas</button><button className={view === "roadmap" ? "active" : ""} onClick={() => navigate("roadmap")}>Roadmap</button><button className={view === "shipped" ? "active" : ""} onClick={() => navigate("shipped")}>Shipped</button><button className={view === "activity" ? "active" : ""} onClick={() => navigate("activity")}>My Activity</button></nav><div className="header-actions"><button className="button button-primary compact" onClick={() => setShowSuggest(true)}>Suggest an idea <span aria-hidden="true">↗</span></button><button className="avatar-button" onClick={() => setShowSignIn(true)} aria-label="Sign in to Community">{signedIn ? "JC" : "·"}</button></div></header>

    <main className="main-content">
      {view === "ideas" && <>
        <section className="intro-section"><div><p className="eyebrow">A calmer way to be heard</p><h1>Help shape<br /><span>YourBreath</span></h1><p className="intro-copy">Suggest what you’d love to see next, vote for the ideas that matter to you, and follow what we’re building.</p><div className="intro-actions"><button className="button button-primary" onClick={() => setShowSuggest(true)}>Suggest an idea <span aria-hidden="true">↗</span></button><button className="text-button" onClick={() => navigate("roadmap")}>See roadmap <span aria-hidden="true">→</span></button></div><p className="privacy-line"><span aria-hidden="true">✦</span> Participate without an account. Sign in only when you want to keep activity across devices.</p></div><div className="breath-orbit" aria-label="A quiet visual reminder of the YourBreath breathing rhythm"><div className="orbit-ring ring-one" /><div className="orbit-ring ring-two" /><div className="orbit-core"><span>your<br />voice</span></div><span className="orbit-label orbit-label-top">listen</span><span className="orbit-label orbit-label-bottom">build gently</span></div></section>
        <section className="ideas-section" id="ideas"><div className="section-heading"><div><p className="eyebrow">Community ideas</p><h2>What should we make easier?</h2></div><span className="result-count">{filteredIdeas.length} ideas</span></div><div className="toolbar"><label className="search-field"><span aria-hidden="true">⌕</span><input value={query} onChange={(event) => setQuery(event.target.value)} placeholder="Search ideas" aria-label="Search ideas" /></label><div className="filter-group"><select value={sort} onChange={(event) => setSort(event.target.value as SortMode)} aria-label="Sort ideas"><option>Top</option><option>Trending</option><option>Newest</option></select><select value={category} onChange={(event) => setCategory(event.target.value)} aria-label="Filter by category">{categories.map((item) => <option key={item}>{item}</option>)}</select><select value={status} onChange={(event) => setStatus(event.target.value)} aria-label="Filter by status"><option>All statuses</option>{statuses.map((item) => <option key={item}>{item}</option>)}</select></div></div><div className="ideas-list">{loading ? <div className="empty-state"><span>◌</span><h3>Loading Community ideas…</h3><p>Connecting to the public Community service.</p></div> : apiError ? <div className="empty-state"><span>!</span><h3>{apiError}</h3><button className="text-button" onClick={() => window.location.reload()}>Retry</button></div> : filteredIdeas.length ? filteredIdeas.map((idea) => <IdeaCard key={idea.id} idea={idea} voted={votedIds.includes(idea.id)} followed={followedIds.includes(idea.id)} onVote={() => vote(idea.id)} onOpen={() => setActiveIdea(idea)} onFollow={() => follow(idea.id)} />) : <div className="empty-state"><span>◌</span><h3>No ideas match that search</h3><p>Try a different phrase or suggest a new idea.</p><button className="text-button" onClick={() => { setQuery(""); setCategory("All categories"); setStatus("All statuses"); }}>Clear filters</button></div>}</div></section>
        <section className="participation-band"><div><p className="eyebrow">A small privacy promise</p><h2>YourBreath stays personal.<br />Community stays separate.</h2></div><p>Your breathing sessions, HealthKit information and progress data never come here. Community only stores the ideas, votes and follows you choose to share.</p><a href="/privacy">Read the Community Privacy Notice <span aria-hidden="true">→</span></a></section>
      </>}
      {view === "roadmap" && <Roadmap ideas={ideas} onOpen={setActiveIdea} />}
      {view === "shipped" && <Shipped ideas={shippedIdeas} onOpen={setActiveIdea} />}
      {view === "activity" && <Activity ideas={allIdeas} votedIds={votedIds} followedIds={followedIds} submittedIds={submittedIds} signedIn={signedIn} onSignIn={() => setShowSignIn(true)} onOpen={setActiveIdea} />}
    </main>
    <footer className="site-footer"><div className="footer-brand"><span className="brand-mark" aria-hidden="true"><span /><span /><span /></span><span>YourBreath <em>Community</em></span></div><p>Made to help a calm app keep getting better.</p><div className="footer-links"><a href="https://yourbreath.app">YourBreath app</a><a href="/privacy">Privacy Notice</a><a href="/terms">Terms</a><a href="/admin">Admin</a></div></footer>
    {notice && <div className="toast" role="status"><span aria-hidden="true">✓</span>{notice}</div>}
    {activeIdea && <IdeaDetail idea={activeIdea} voted={votedIds.includes(activeIdea.id)} followed={followedIds.includes(activeIdea.id)} signedIn={signedIn} onClose={() => setActiveIdea(null)} onVote={() => vote(activeIdea.id)} onFollow={() => follow(activeIdea.id)} onSignIn={() => setShowSignIn(true)} onComment={commentOnIdea} />}
    {showSuggest && <SuggestModal ideas={ideas} onClose={() => setShowSuggest(false)} onSubmit={submitIdea} />}
    {showSignIn && <Modal label="Sign in to Community" onClose={() => setShowSignIn(false)}><div className="modal-icon">✦</div><p className="eyebrow">Optional, always</p><h2>Keep your Community close</h2><p className="modal-copy">YourBreath itself doesn’t require an account. Community sign-in uses a secure Sign in with Apple flow so your activity can follow you across devices.</p><button className="button button-dark full" onClick={() => signInWithApple(window.location.pathname)}>Sign in with Apple <span aria-hidden="true">→</span></button><button className="text-button center" onClick={() => setShowSignIn(false)}>Not now</button><p className="modal-footnote">Your Apple credentials are handled by Apple; Community receives only the identity details needed for your profile.</p></Modal>}
  </div>;
}

function Roadmap({ ideas, onOpen }: { ideas: Idea[]; onOpen: (idea: Idea) => void }) {
  const columns: Status[] = ["Under review", "Planned", "In progress"];
  return <section className="page-section"><div className="page-heading"><p className="eyebrow">The path ahead</p><h1>Roadmap</h1><p>Votes help guide priorities, alongside feasibility, safety, accessibility and product fit. We’ll share direction here as it becomes clear.</p></div><div className="roadmap-grid">{columns.map((column) => <div className="roadmap-column" key={column}><div className="column-heading"><span className={`status status-${column.toLowerCase().replaceAll(" ", "-")}`}><span aria-hidden="true">{statusIcon(column)}</span>{column}</span><span>{ideas.filter((idea) => idea.status === column).length}</span></div>{ideas.filter((idea) => idea.status === column).map((idea) => <button className="roadmap-item" key={idea.id} onClick={() => onOpen(idea)}><strong>{idea.title}</strong><span>{formatVotes(idea.votes)} votes · {idea.category}</span><span className="roadmap-arrow" aria-hidden="true">↗</span></button>)}</div>)}</div><div className="roadmap-note"><span aria-hidden="true">✦</span><div><strong>Roadmaps are conversations, not promises.</strong><p>Target information may change as ideas meet real-world constraints. Meaningful updates will appear on the idea itself.</p></div></div></section>;
}

function Shipped({ ideas, onOpen }: { ideas: Idea[]; onOpen: (idea: Idea) => void }) {
  return <section className="page-section shipped-page"><div className="page-heading"><p className="eyebrow">The feedback loop</p><h1>You asked.<br /><span>We built it.</span></h1><p>Community is most useful when you can see that your voice has somewhere to go.</p></div><div className="shipped-list">{ideas.map((idea) => <button className="shipped-card" key={idea.id} onClick={() => onOpen(idea)}><div className="shipped-mark">✓</div><div><span className="status status-shipped"><span aria-hidden="true">✓</span> Shipped</span><h2>{idea.title}</h2><p>{idea.description}</p><div className="idea-meta"><span>{idea.availability}</span><span>{formatVotes(idea.votes)} votes from the Community</span></div></div><span className="roadmap-arrow" aria-hidden="true">↗</span></button>)}</div><a className="button button-primary" href="https://yourbreath.app">Open YourBreath <span aria-hidden="true">↗</span></a></section>;
}

function Activity({ ideas, votedIds, followedIds, submittedIds, signedIn, onSignIn, onOpen }: { ideas: Idea[]; votedIds: string[]; followedIds: string[]; submittedIds: string[]; signedIn: boolean; onSignIn: () => void; onOpen: (idea: Idea) => void }) {
  const local = ideas.filter((idea) => votedIds.includes(idea.id) || followedIds.includes(idea.id) || submittedIds.includes(idea.id));
  return <section className="page-section activity-page"><div className="page-heading"><p className="eyebrow">Your corner of Community</p><h1>My Activity</h1><p>{signedIn ? "Your Community activity is ready to follow across devices." : "Anonymous activity is kept for this browser. Sign in when you want to keep it across devices."}</p></div><div className="activity-banner"><div className="activity-orb">✦</div><div><strong>{signedIn ? "Signed in to Community" : "Activity on this browser"}</strong><p>{signedIn ? "Meaningful idea updates can follow you wherever you use Community." : "Your activity is stored by the Community service using an opaque browser identifier; it is not a profile or a browser fingerprint."}</p></div>{!signedIn && <button className="button button-dark" onClick={onSignIn}>Sign in to Community</button>}</div><h2 className="subheading">{local.length ? "Your recent activity" : "Your activity will appear here"}</h2>{local.length ? <div className="activity-list">{local.map((idea) => <button key={idea.id} onClick={() => onOpen(idea)}><span className="activity-symbol">{submittedIds.includes(idea.id) ? "✦" : followedIds.includes(idea.id) ? "♡" : "▲"}</span><span><strong>{idea.title}</strong><small>{submittedIds.includes(idea.id) ? "Suggested by you" : followedIds.includes(idea.id) ? "Following" : "Voted"}</small></span><span aria-hidden="true">↗</span></button>)}</div> : <div className="empty-state soft"><span>◌</span><h3>Start with a vote or a thought</h3><p>There’s no account wall here. Browse ideas and take part when something resonates.</p></div>}</section>;
}

function IdeaDetail({ idea, voted, followed, signedIn, onClose, onVote, onFollow, onSignIn, onComment }: { idea: Idea; voted: boolean; followed: boolean; signedIn: boolean; onClose: () => void; onVote: () => void; onFollow: () => void; onSignIn: () => void; onComment: (body: string) => void }) {
  const [comment, setComment] = useState("");
  return <Modal label={`Idea: ${idea.title}`} onClose={onClose}><div className="detail-top"><span className={`status status-${idea.status.toLowerCase().replaceAll(" ", "-")}`}><span aria-hidden="true">{statusIcon(idea.status)}</span>{idea.status}</span><span>{idea.category}</span></div><h2>{idea.title}</h2><p className="detail-description">{idea.description}</p><div className="detail-actions"><button className={`vote-button inline ${voted ? "is-voted" : ""}`} onClick={onVote} aria-pressed={voted}><span aria-hidden="true">▲</span><strong>{formatVotes(idea.votes)}</strong><small>{voted ? "Voted" : "Votes"}</small></button><button className={`button ${followed ? "button-dark" : "button-secondary"}`} onClick={onFollow}>{followed ? "Following" : "Follow this idea"}</button></div><div className="developer-response"><span className="developer-avatar">J</span><div><strong>From the YourBreath developer</strong><p>{idea.developerResponse ?? "I’m listening. I’ll share more when I understand how this could fit the calm, private YourBreath experience."}</p></div></div><div className="timeline"><strong>Status timeline</strong><div className="timeline-steps">{["Submitted", "Under review", "Planned", "In progress", "Shipped"].map((step, index) => <span className={(step === idea.status || (idea.status === "New" && index === 0) || (idea.status === "Not planned" && index === 1)) ? "current" : index < ["New", "Under review", "Planned", "In progress", "Shipped"].indexOf(idea.status) + 1 ? "past" : ""} key={step}><i>{index + 1}</i>{step}</span>)}</div></div><div className="comments"><div className="comments-heading"><strong>{idea.comments.length} {idea.comments.length === 1 ? "comment" : "comments"}</strong><span>Keep it kind and useful</span></div>{idea.comments.map((item) => <div className="comment" key={item.id}><span>{item.author.slice(0, 1)}</span><p><strong>{item.author}</strong><small>{item.date}</small>{item.body}</p></div>)}{signedIn ? <form className="comment-form" onSubmit={(event) => { event.preventDefault(); if (comment.trim()) { onComment(comment.trim()); setComment(""); } }}><input value={comment} onChange={(event) => setComment(event.target.value)} placeholder="Add a thoughtful comment" aria-label="Add a comment" /><button className="button button-dark" type="submit">Comment</button></form> : <div className="comment-gate"><p>Sign in to Community to join the discussion.</p><button className="text-button" onClick={onSignIn}>Sign in with Apple <span aria-hidden="true">→</span></button></div>}</div></Modal>;
}

function SuggestModal({ ideas, onClose, onSubmit }: { ideas: Idea[]; onClose: () => void; onSubmit: (event: FormEvent<HTMLFormElement>) => void }) {
  const [title, setTitle] = useState("");
  const similar = title.length > 4 ? ideas.filter((idea) => idea.title.toLowerCase().includes(title.toLowerCase().split(" ")[0])).slice(0, 2) : [];
  return <Modal label="Suggest an idea" onClose={onClose}><p className="eyebrow">Your turn</p><h2>What would make YourBreath better for you?</h2><p className="modal-copy">You can suggest an idea without an account. Please don’t include personal medical or sensitive health information.</p><form className="suggest-form" onSubmit={onSubmit}><label>Idea title<input name="title" value={title} onChange={(event) => setTitle(event.target.value)} required maxLength={100} placeholder="For example: ..." /></label>{similar.length > 0 && <div className="similar-ideas"><strong>Similar ideas</strong>{similar.map((idea) => <div key={idea.id}><span>▲ {idea.votes}</span><p><strong>{idea.title}</strong><small>{idea.status}</small></p><button type="button" className="text-button" onClick={onClose}>Vote for this instead</button></div>)}</div>}<label>Tell us a little more<textarea name="description" required maxLength={1000} placeholder="What would you like to be able to do? Why would it help?" /></label><label>Category<select name="category" defaultValue="Other">{categories.slice(1).map((item) => <option key={item}>{item}</option>)}</select></label><div className="form-foot"><span>Submitted ideas start as New.</span><button className="button button-primary" type="submit">Send idea <span aria-hidden="true">↗</span></button></div></form></Modal>;
}
