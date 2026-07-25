CREATE TABLE mentor_feedback_message (
    id              UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    created_at      TIMESTAMPTZ NOT NULL DEFAULT now(),
    updated_at      TIMESTAMPTZ NOT NULL DEFAULT now(),
    team_id         UUID NOT NULL REFERENCES team(id) ON DELETE CASCADE,
    author_user_id  UUID NOT NULL REFERENCES app_user(id),
    author_role     VARCHAR(20) NOT NULL,
    body            TEXT NOT NULL
);
CREATE INDEX idx_feedback_team ON mentor_feedback_message(team_id);
