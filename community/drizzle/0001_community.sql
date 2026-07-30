-- Follow-up hardening migration for Community identity semantics.
-- 0000_new_famine.sql is generated from db/schema.ts and creates the tables.

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

CREATE INDEX IF NOT EXISTS suggestions_search_idx ON suggestions(title, description);
CREATE INDEX IF NOT EXISTS suggestions_status_idx ON suggestions(status, updated_at);
CREATE INDEX IF NOT EXISTS reports_status_idx ON reports(status, created_at);

INSERT OR IGNORE INTO categories (id, name, sort_order) VALUES
('breathing-techniques', 'Breathing techniques', 1),
('sessions-customisation', 'Sessions & customisation', 2),
('apple-watch', 'Apple Watch', 3),
('live-biofeedback', 'Live biofeedback', 4),
('progress-insights', 'Progress & insights', 5),
('programs', 'Programs', 6),
('reminders-habits', 'Reminders & habits', 7),
('widgets-complications', 'Widgets & complications', 8),
('accessibility', 'Accessibility', 9),
('premium', 'Premium', 10),
('other', 'Other', 11);
