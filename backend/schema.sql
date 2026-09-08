CREATE TABLE users (id TEXT PRIMARY KEY, display_name TEXT NOT NULL, created_at TIMESTAMPTZ NOT NULL DEFAULT now());
CREATE TABLE content (id TEXT PRIMARY KEY, title TEXT NOT NULL, category TEXT NOT NULL, start_time TEXT NOT NULL, tags JSONB NOT NULL, popularity NUMERIC NOT NULL, status TEXT NOT NULL, created_at TIMESTAMPTZ NOT NULL DEFAULT now());
CREATE TABLE sessions (id TEXT PRIMARY KEY, user_id TEXT REFERENCES users(id), started_at TIMESTAMPTZ NOT NULL, ended_at TIMESTAMPTZ, mode TEXT NOT NULL DEFAULT 'intelligent');
CREATE TABLE session_events (id TEXT PRIMARY KEY, session_id TEXT NOT NULL REFERENCES sessions(id), event_type TEXT NOT NULL, content_id TEXT REFERENCES content(id), metadata JSONB NOT NULL DEFAULT '{}', created_at TIMESTAMPTZ NOT NULL DEFAULT now());
CREATE TABLE recommendations (id BIGSERIAL PRIMARY KEY, session_id TEXT NOT NULL REFERENCES sessions(id), content_id TEXT NOT NULL REFERENCES content(id), score NUMERIC NOT NULL, reasons JSONB NOT NULL, created_at TIMESTAMPTZ NOT NULL DEFAULT now());
CREATE INDEX session_events_session_created_idx ON session_events(session_id, created_at);
