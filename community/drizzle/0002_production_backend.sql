-- Server-backed Community identity, moderation, notifications and abuse controls.
-- All inserts are idempotent so a redeploy cannot duplicate the public seed data.

ALTER TABLE profiles ADD COLUMN apple_subject TEXT;

CREATE UNIQUE INDEX IF NOT EXISTS profiles_apple_subject_unique
  ON profiles (apple_subject)
  WHERE apple_subject IS NOT NULL;

CREATE UNIQUE INDEX IF NOT EXISTS votes_authenticated_unique
  ON votes (suggestion_id, user_id)
  WHERE user_id IS NOT NULL;

CREATE UNIQUE INDEX IF NOT EXISTS votes_anonymous_unique
  ON votes (suggestion_id, anonymous_participant_id)
  WHERE anonymous_participant_id IS NOT NULL;

CREATE TRIGGER IF NOT EXISTS votes_exactly_one_identity
BEFORE INSERT ON votes
WHEN (NEW.user_id IS NULL) = (NEW.anonymous_participant_id IS NULL)
BEGIN
  SELECT RAISE(ABORT, 'vote must belong to exactly one identity');
END;

CREATE TABLE IF NOT EXISTS sessions (
  id_hash TEXT PRIMARY KEY NOT NULL,
  profile_id TEXT NOT NULL REFERENCES profiles(id),
  anonymous_participant_id TEXT REFERENCES anonymous_participants(id),
  created_at TEXT DEFAULT CURRENT_TIMESTAMP NOT NULL,
  last_seen_at TEXT DEFAULT CURRENT_TIMESTAMP NOT NULL,
  expires_at TEXT NOT NULL
);

CREATE INDEX IF NOT EXISTS sessions_profile_idx ON sessions(profile_id, expires_at);
CREATE INDEX IF NOT EXISTS sessions_expiry_idx ON sessions(expires_at);

CREATE TABLE IF NOT EXISTS auth_nonces (
  state_hash TEXT PRIMARY KEY NOT NULL,
  nonce_hash TEXT NOT NULL,
  return_path TEXT NOT NULL,
  created_at TEXT DEFAULT CURRENT_TIMESTAMP NOT NULL,
  expires_at TEXT NOT NULL,
  used_at TEXT
);

CREATE INDEX IF NOT EXISTS auth_nonces_expiry_idx ON auth_nonces(expires_at);

CREATE TABLE IF NOT EXISTS audit_log (
  id TEXT PRIMARY KEY NOT NULL,
  actor_profile_id TEXT REFERENCES profiles(id),
  action TEXT NOT NULL,
  entity_type TEXT NOT NULL,
  entity_id TEXT,
  metadata_json TEXT,
  created_at TEXT DEFAULT CURRENT_TIMESTAMP NOT NULL
);

CREATE INDEX IF NOT EXISTS audit_log_created_idx ON audit_log(created_at);
CREATE INDEX IF NOT EXISTS audit_log_entity_idx ON audit_log(entity_type, entity_id, created_at);

CREATE TABLE IF NOT EXISTS notifications (
  id TEXT PRIMARY KEY NOT NULL,
  profile_id TEXT NOT NULL REFERENCES profiles(id),
  suggestion_id TEXT REFERENCES suggestions(id),
  type TEXT NOT NULL,
  message TEXT NOT NULL,
  is_read INTEGER DEFAULT 0 NOT NULL,
  created_at TEXT DEFAULT CURRENT_TIMESTAMP NOT NULL
);

CREATE INDEX IF NOT EXISTS notifications_profile_idx ON notifications(profile_id, is_read, created_at);

CREATE TABLE IF NOT EXISTS notification_preferences (
  profile_id TEXT PRIMARY KEY NOT NULL REFERENCES profiles(id),
  status_updates INTEGER DEFAULT 1 NOT NULL,
  comment_replies INTEGER DEFAULT 1 NOT NULL,
  updated_at TEXT DEFAULT CURRENT_TIMESTAMP NOT NULL
);

CREATE TABLE IF NOT EXISTS rate_limit_events (
  id TEXT PRIMARY KEY NOT NULL,
  bucket TEXT NOT NULL,
  created_at INTEGER NOT NULL
);

CREATE INDEX IF NOT EXISTS rate_limit_events_bucket_idx ON rate_limit_events(bucket, created_at);

INSERT OR IGNORE INTO suggestions
  (id, title, description, category_id, status, developer_response, is_pinned, created_at, updated_at)
VALUES
  ('saved-rhythms', 'Save multiple custom breathing rhythms', 'I’d love to keep a few personal rhythms ready to switch between, depending on how much time I have.', 'sessions-customisation', 'Under review', 'This fits the calm, low-friction direction well. I’m looking at how to make switching simple without turning the home screen into a settings panel.', 1, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP),
  ('program-calendar', 'A gentle calendar for guided programs', 'A simple week view could help me see the next practice without making breathing feel like another task to manage.', 'programs', 'Planned', 'Planned. The important part is keeping it supportive rather than streak-driven, with room to miss a day without feeling behind.', 0, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP),
  ('spoken-cues', 'Optional spoken phase cues', 'A clear voice cue for inhale and exhale would make sessions more accessible when I’m not looking at the screen.', 'accessibility', 'In progress', 'I’m testing how this can work alongside the existing visual, sound and haptic cues without making the experience feel busy.', 0, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP),
  ('watch-program-day', 'Show the next program day on Apple Watch', 'If I’m following a program, I’d like the watch to gently point me to the next session when I have a moment.', 'apple-watch', 'Under review', NULL, 0, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP),
  ('practice-summary', 'Export a simple practice summary', 'A private, readable summary of my own practice would help me reflect without exporting raw health data.', 'progress-insights', 'New', NULL, 0, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP),
  ('reminder-pause', 'Pause reminders for a day', 'Sometimes a day is already full. A gentle one-day pause would feel better than turning reminders off completely.', 'reminders-habits', 'New', NULL, 0, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP),
  ('haptic-finish', 'Choose a quieter session finish', 'Let me choose between the current completion cue and a softer ending when I’m practising in bed or at work.', 'apple-watch', 'New', NULL, 0, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP),
  ('private-widget', 'A small widget for a calm moment', 'A private widget that opens a favourite free breathing exercise could make it easier to start without searching.', 'widgets-complications', 'Not planned', 'Not planned for the current release direction. The app’s one-tap home and Watch complications already cover the quickest path, but I’ll keep listening.', 0, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP),
  ('shipped-watch', 'Quick breathing sessions on Apple Watch', 'Start a short breathing session from the Watch, with gentle visual and haptic guidance.', 'apple-watch', 'Shipped', NULL, 0, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP),
  ('shipped-progress', 'Narrative progress insights', 'See the meaning behind your practice with calm, contextual progress reflections.', 'progress-insights', 'Shipped', NULL, 0, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP);
