"use client";

import { FormEvent, useEffect, useMemo, useState } from "react";

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
  isShipped?: boolean;
  version?: string;
  availability?: string;
  isPinned?: boolean;
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

const seededIdeas: Idea[] = [
  {
    id: "saved-rhythms",
    title: "Save multiple custom breathing rhythms",
    description: "I’d love to keep a few personal rhythms ready to switch between, depending on how much time I have.",
    category: "Sessions & customisation",
    status: "Under review",
    votes: 126,
    submitted: "2 days ago",
    author: "Developer idea",
    developerResponse: "This fits the calm, low-friction direction well. I’m looking at how to make switching simple without turning the home screen into a settings panel.",
    comments: [{ id: "c1", author: "Maya", body: "A short version for busy afternoons would be lovely.", date: "Yesterday" }],
    isPinned: true,
  },
  {
    id: "program-calendar",
    title: "A gentle calendar for guided programs",
    description: "A simple week view could help me see the next practice without making breathing feel like another task to manage.",
    category: "Programs",
    status: "Planned",
    votes: 84,
    submitted: "5 days ago",
    author: "Developer idea",
    developerResponse: "Planned. The important part is keeping it supportive rather than streak-driven, with room to miss a day without feeling behind.",
    comments: [{ id: "c2", author: "Jonas", body: "Please keep the calendar quiet and optional.", date: "3 days ago" }],
  },
  {
    id: "spoken-cues",
    title: "Optional spoken phase cues",
    description: "A clear voice cue for inhale and exhale would make sessions more accessible when I’m not looking at the screen.",
    category: "Accessibility",
    status: "In progress",
    votes: 71,
    submitted: "1 week ago",
    author: "Developer idea",
    developerResponse: "I’m testing how this can work alongside the existing visual, sound and haptic cues without making the experience feel busy.",
    comments: [],
  },
  {
    id: "watch-program-day",
    title: "Show the next program day on Apple Watch",
    description: "If I’m following a program, I’d like the watch to gently point me to the next session when I have a moment.",
    category: "Apple Watch",
    status: "Under review",
    votes: 58,
    submitted: "1 week ago",
    author: "Developer idea",
    comments: [],
  },
  {
    id: "practice-summary",
    title: "Export a simple practice summary",
    description: "A private, readable summary of my own practice would help me reflect without exporting raw health data.",
    category: "Progress & insights",
    status: "New",
    votes: 49,
    submitted: "2 weeks ago",
    author: "Developer idea",
    comments: [],
  },
  {
    id: "reminder-pause",
    title: "Pause reminders for a day",
    description: "Sometimes a day is already full. A gentle one-day pause would feel better than turning reminders off completely.",
    category: "Reminders & habits",
    status: "New",
    votes: 36,
    submitted: "2 weeks ago",
    author: "Developer idea",
    comments: [],
  },
  {
    id: "haptic-finish",
    title: "Choose a quieter session finish",
    description: "Let me choose between the current completion cue and a softer ending when I’m practising in bed or at work.",
    category: "Apple Watch",
    status: "New",
    votes: 31,
    submitted: "3 weeks ago",
    author: "Developer idea",
    comments: [],
  },
  {
    id: "private-widget",
    title: "A small widget for a calm moment",
    description: "A private widget that opens a favourite free breathing exercise could make it easier to start without searching.",
    category: "Widgets & complications",
    status: "Not planned",
    votes: 22,
    submitted: "1 month ago",
    author: "Developer idea",
    developerResponse: "Not planned for the current release direction. The app’s one-tap home and Watch complications already cover the quickest path, but I’ll keep listening.",
    comments: [],
  },
];

const shipped: Idea[] = [
  { id: "shipped-watch", title: "Quick breathing sessions on Apple Watch", description: "Start a short breathing session from the Watch, with gentle visual and haptic guidance.", category: "Apple Watch", status: "Shipped", votes: 148, submitted: "Earlier Community idea", author: "YourBreath team", isShipped: true, availability: "Available in the current YourBreath app", comments: [] },
  { id: "shipped-progress", title: "Narrative progress insights", description: "See the meaning behind your practice with calm, contextual progress reflections.", category: "Progress & insights", status: "Shipped", votes: 103, submitted: "Earlier Community idea", author: "YourBreath team", isShipped: true, availability: "Available in the current YourBreath app", comments: [] },
];

function initialView(): View {
  if (typeof window === "undefined") return "ideas";
  const pathname = window.location.pathname.replace(/\/+$/, "") || "/";
  if (pathname === "/roadmap") return "roadmap";
  if (pathname === "/shipped") return "shipped";
  if (pathname === "/activity") return "activity";
  return "ideas";
}

function makeParticipantId() {
  if (typeof crypto !== "undefined" && "randomUUID" in crypto) return crypto.randomUUID();
  return `anon-${Math.random().toString(36).slice(2)}-${Date.now()}`;
}

function statusIcon(status: Status) {
  return { New: "✦", "Under review": "◌", Planned: "◎", "In progress": "↗", Shipped: "✓", "Not planned": "–" }[status];
}

function formatVotes(votes: number) {
  return new Intl.NumberFormat("en", { notation: "compact", maximumFractionDigits: 1 }).format(votes);
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
        <div className="idea-meta"><span className={`status status-${idea.status.toLowerCase().replaceAll(" ", "-")}`}><span aria-hidden="true">{statusIcon(idea.status)}</span>{idea.status}</span><span>{idea.category}</span><span>{idea.comments.length} {idea.comments.length === 1 ? "comment" : "comments"}</span><span>{idea.submitted}</span></div>
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
  const [ideas, setIdeas] = useState<Idea[]>(seededIdeas);
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
  const [participantId, setParticipantId] = useState("");

  useEffect(() => {
    const hydrate = () => {
      const saved = window.localStorage.getItem("yourbreath-community-state");
      if (saved) {
        try {
          const state = JSON.parse(saved);
          setVotedIds(state.votedIds ?? []); setFollowedIds(state.followedIds ?? []); setSubmittedIds(state.submittedIds ?? []); setIdeas(state.ideas ?? seededIdeas); setParticipantId(state.participantId ?? makeParticipantId());
        } catch { setParticipantId(makeParticipantId()); }
      } else setParticipantId(makeParticipantId());
    };
    const timer = window.setTimeout(hydrate, 0);
    return () => window.clearTimeout(timer);
  }, []);

  useEffect(() => {
    if (!participantId) return;
    window.localStorage.setItem("yourbreath-community-state", JSON.stringify({ participantId, votedIds, followedIds, submittedIds, ideas }));
  }, [participantId, votedIds, followedIds, submittedIds, ideas]);

  const allIdeas = useMemo(() => [...ideas, ...shipped], [ideas]);
  const filteredIdeas = useMemo(() => {
    const normalized = query.trim().toLowerCase();
    const result = ideas.filter((idea) => {
      const matchesQuery = !normalized || `${idea.title} ${idea.description}`.toLowerCase().includes(normalized);
      return matchesQuery && (category === "All categories" || idea.category === category) && (status === "All statuses" || idea.status === status);
    });
    return result.sort((a, b) => sort === "Newest" ? b.id.localeCompare(a.id) : sort === "Trending" ? (b.votes + (b.status === "Under review" ? 12 : 0)) - (a.votes + (a.status === "Under review" ? 12 : 0)) : b.votes - a.votes);
  }, [ideas, query, category, status, sort]);

  function announce(message: string) { setNotice(message); window.setTimeout(() => setNotice(""), 2600); }
  function vote(id: string) {
    const already = votedIds.includes(id);
    setVotedIds((current) => already ? current.filter((item) => item !== id) : [...current, id]);
    setIdeas((current) => current.map((idea) => idea.id === id ? { ...idea, votes: Math.max(0, idea.votes + (already ? -1 : 1)) } : idea));
    announce(already ? "Vote removed" : "Vote added — thank you for helping shape YourBreath");
  }
  function follow(id: string) {
    const already = followedIds.includes(id);
    setFollowedIds((current) => already ? current.filter((item) => item !== id) : [...current, id]);
    if (!already && !signedIn) setShowSignIn(true); else announce(already ? "You no longer follow this idea" : "You’re following this idea on this device");
  }
  function submitIdea(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const data = new FormData(event.currentTarget);
    const title = String(data.get("title") ?? "").trim();
    const description = String(data.get("description") ?? "").trim();
    const newIdea: Idea = { id: `local-${Date.now()}`, title, description, category: String(data.get("category") ?? "Other"), status: "New", votes: 1, submitted: "Just now", author: "You · on this device", comments: [] };
    if (!title || !description) return;
    setIdeas((current) => [newIdea, ...current]); setSubmittedIds((current) => [...current, newIdea.id]); setShowSuggest(false); setActiveIdea(newIdea); announce("Thanks — your idea is in");
  }
  function navigate(next: View) { setView(next); window.scrollTo({ top: 0, behavior: "smooth" }); }

  return <div className="site-shell">
    <div className="ambient ambient-one" aria-hidden="true" /><div className="ambient ambient-two" aria-hidden="true" />
    <header className="site-header"><a className="brand" href="#ideas" onClick={(event) => { event.preventDefault(); navigate("ideas"); }}><span className="brand-mark" aria-hidden="true"><span /><span /><span /></span><span>YourBreath <em>Community</em></span></a><nav aria-label="Community navigation"><button className={view === "ideas" ? "active" : ""} onClick={() => navigate("ideas")}>Ideas</button><button className={view === "roadmap" ? "active" : ""} onClick={() => navigate("roadmap")}>Roadmap</button><button className={view === "shipped" ? "active" : ""} onClick={() => navigate("shipped")}>Shipped</button><button className={view === "activity" ? "active" : ""} onClick={() => navigate("activity")}>My Activity</button></nav><div className="header-actions"><button className="button button-primary compact" onClick={() => setShowSuggest(true)}>Suggest an idea <span aria-hidden="true">↗</span></button><button className="avatar-button" onClick={() => setShowSignIn(true)} aria-label="Sign in to Community">{signedIn ? "JC" : "·"}</button></div></header>

    <main className="main-content">
      {view === "ideas" && <>
        <section className="intro-section"><div><p className="eyebrow">A calmer way to be heard</p><h1>Help shape<br /><span>YourBreath</span></h1><p className="intro-copy">Suggest what you’d love to see next, vote for the ideas that matter to you, and follow what we’re building.</p><div className="intro-actions"><button className="button button-primary" onClick={() => setShowSuggest(true)}>Suggest an idea <span aria-hidden="true">↗</span></button><button className="text-button" onClick={() => navigate("roadmap")}>See roadmap <span aria-hidden="true">→</span></button></div><p className="privacy-line"><span aria-hidden="true">✦</span> Participate without an account. Sign in only when you want to keep activity across devices.</p></div><div className="breath-orbit" aria-label="A quiet visual reminder of the YourBreath breathing rhythm"><div className="orbit-ring ring-one" /><div className="orbit-ring ring-two" /><div className="orbit-core"><span>your<br />voice</span></div><span className="orbit-label orbit-label-top">listen</span><span className="orbit-label orbit-label-bottom">build gently</span></div></section>
        <section className="ideas-section" id="ideas"><div className="section-heading"><div><p className="eyebrow">Community ideas</p><h2>What should we make easier?</h2></div><span className="result-count">{filteredIdeas.length} ideas</span></div><div className="toolbar"><label className="search-field"><span aria-hidden="true">⌕</span><input value={query} onChange={(event) => setQuery(event.target.value)} placeholder="Search ideas" aria-label="Search ideas" /></label><div className="filter-group"><select value={sort} onChange={(event) => setSort(event.target.value as SortMode)} aria-label="Sort ideas"><option>Top</option><option>Trending</option><option>Newest</option></select><select value={category} onChange={(event) => setCategory(event.target.value)} aria-label="Filter by category">{categories.map((item) => <option key={item}>{item}</option>)}</select><select value={status} onChange={(event) => setStatus(event.target.value)} aria-label="Filter by status"><option>All statuses</option>{statuses.map((item) => <option key={item}>{item}</option>)}</select></div></div><div className="ideas-list">{filteredIdeas.length ? filteredIdeas.map((idea) => <IdeaCard key={idea.id} idea={idea} voted={votedIds.includes(idea.id)} followed={followedIds.includes(idea.id)} onVote={() => vote(idea.id)} onOpen={() => setActiveIdea(idea)} onFollow={() => follow(idea.id)} />) : <div className="empty-state"><span>◌</span><h3>No ideas match that search</h3><p>Try a different phrase or suggest a new idea.</p><button className="text-button" onClick={() => { setQuery(""); setCategory("All categories"); setStatus("All statuses"); }}>Clear filters</button></div>}</div></section>
        <section className="participation-band"><div><p className="eyebrow">A small privacy promise</p><h2>YourBreath stays personal.<br />Community stays separate.</h2></div><p>Your breathing sessions, HealthKit information and progress data never come here. Community only stores the ideas, votes and follows you choose to share.</p><a href="/privacy">Read the Community Privacy Notice <span aria-hidden="true">→</span></a></section>
      </>}
      {view === "roadmap" && <Roadmap ideas={ideas} onOpen={setActiveIdea} />}
      {view === "shipped" && <Shipped ideas={shipped} onOpen={setActiveIdea} />}
      {view === "activity" && <Activity ideas={allIdeas} votedIds={votedIds} followedIds={followedIds} submittedIds={submittedIds} signedIn={signedIn} onSignIn={() => setShowSignIn(true)} onOpen={setActiveIdea} />}
    </main>
    <footer className="site-footer"><div className="footer-brand"><span className="brand-mark" aria-hidden="true"><span /><span /><span /></span><span>YourBreath <em>Community</em></span></div><p>Made to help a calm app keep getting better.</p><div className="footer-links"><a href="https://yourbreath.app">YourBreath app</a><a href="/privacy">Privacy Notice</a><a href="/terms">Terms</a><a href="/admin">Admin</a></div></footer>
    {notice && <div className="toast" role="status"><span aria-hidden="true">✓</span>{notice}</div>}
    {activeIdea && <IdeaDetail idea={activeIdea} voted={votedIds.includes(activeIdea.id)} followed={followedIds.includes(activeIdea.id)} signedIn={signedIn} onClose={() => setActiveIdea(null)} onVote={() => vote(activeIdea.id)} onFollow={() => follow(activeIdea.id)} onSignIn={() => setShowSignIn(true)} onComment={(body) => { const next = { id: `comment-${Date.now()}`, author: "You", body, date: "Just now" }; setIdeas((current) => current.map((idea) => idea.id === activeIdea.id ? { ...idea, comments: [...idea.comments, next] } : idea)); setActiveIdea({ ...activeIdea, comments: [...activeIdea.comments, next] }); }} />}
    {showSuggest && <SuggestModal ideas={ideas} onClose={() => setShowSuggest(false)} onSubmit={submitIdea} />}
    {showSignIn && <Modal label="Sign in to Community" onClose={() => setShowSignIn(false)}><div className="modal-icon">✦</div><p className="eyebrow">Optional, always</p><h2>Keep your Community close</h2><p className="modal-copy">YourBreath itself doesn’t require an account. Community sign-in is only used to keep track of your ideas, votes and follows across devices.</p><button className="button button-dark full" onClick={() => { setSignedIn(true); setShowSignIn(false); announce("You’re signed in to Community"); }}>Sign in with Apple <span aria-hidden="true">→</span></button><button className="text-button center" onClick={() => setShowSignIn(false)}>Not now</button><p className="modal-footnote">In this preview, sign-in is represented locally. Production identity will use Sign in with Apple.</p></Modal>}
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
  return <section className="page-section activity-page"><div className="page-heading"><p className="eyebrow">Your corner of Community</p><h1>My Activity</h1><p>{signedIn ? "Your Community activity is ready to follow across devices." : "Here’s what you’ve done on this device. Sign in when you want to keep it across devices."}</p></div><div className="activity-banner"><div className="activity-orb">✦</div><div><strong>{signedIn ? "Signed in to Community" : "Activity on this device"}</strong><p>{signedIn ? "Meaningful idea updates can follow you wherever you use Community." : "Your ideas and votes are stored locally in this browser. They are not synchronized."}</p></div>{!signedIn && <button className="button button-dark" onClick={onSignIn}>Sign in to Community</button>}</div><h2 className="subheading">{local.length ? "Your recent activity" : "Your activity will appear here"}</h2>{local.length ? <div className="activity-list">{local.map((idea) => <button key={idea.id} onClick={() => onOpen(idea)}><span className="activity-symbol">{submittedIds.includes(idea.id) ? "✦" : followedIds.includes(idea.id) ? "♡" : "▲"}</span><span><strong>{idea.title}</strong><small>{submittedIds.includes(idea.id) ? "Suggested by you" : followedIds.includes(idea.id) ? "Following" : "Voted"}</small></span><span aria-hidden="true">↗</span></button>)}</div> : <div className="empty-state soft"><span>◌</span><h3>Start with a vote or a thought</h3><p>There’s no account wall here. Browse ideas and take part when something resonates.</p></div>}</section>;
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
