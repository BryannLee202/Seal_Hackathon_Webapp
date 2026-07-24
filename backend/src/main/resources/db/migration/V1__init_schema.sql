-- SEAL Hackathon Management System - initial schema
CREATE EXTENSION IF NOT EXISTS pgcrypto;

CREATE TABLE app_user (
    id                       UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    created_at               TIMESTAMPTZ NOT NULL DEFAULT now(),
    updated_at               TIMESTAMPTZ NOT NULL DEFAULT now(),
    full_name                VARCHAR(255) NOT NULL,
    email                    VARCHAR(255) NOT NULL UNIQUE,
    password_hash            VARCHAR(255) NOT NULL,
    user_category            VARCHAR(30) NOT NULL,
    student_code             VARCHAR(50),
    school_name              VARCHAR(255),
    account_status           VARCHAR(20) NOT NULL,
    guest_judge              BOOLEAN NOT NULL DEFAULT FALSE,
    guest_access_expires_at  TIMESTAMPTZ,
    rejection_reason         VARCHAR(500)
);

CREATE TABLE user_role_assignment (
    id          UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    created_at  TIMESTAMPTZ NOT NULL DEFAULT now(),
    updated_at  TIMESTAMPTZ NOT NULL DEFAULT now(),
    user_id     UUID NOT NULL REFERENCES app_user(id) ON DELETE CASCADE,
    role_name   VARCHAR(30) NOT NULL,
    scope_type  VARCHAR(20) NOT NULL,
    scope_id    UUID,
    judge_type  VARCHAR(20)
);
CREATE INDEX idx_role_assignment_user ON user_role_assignment(user_id);
CREATE INDEX idx_role_assignment_scope ON user_role_assignment(scope_type, scope_id);

CREATE TABLE criteria_template (
    id          UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    created_at  TIMESTAMPTZ NOT NULL DEFAULT now(),
    updated_at  TIMESTAMPTZ NOT NULL DEFAULT now(),
    name        VARCHAR(255) NOT NULL,
    description TEXT,
    is_default  BOOLEAN NOT NULL DEFAULT FALSE
);

CREATE TABLE hackathon_event (
    id                          UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    created_at                  TIMESTAMPTZ NOT NULL DEFAULT now(),
    updated_at                  TIMESTAMPTZ NOT NULL DEFAULT now(),
    name                        VARCHAR(255) NOT NULL,
    description                 TEXT,
    start_date                  DATE,
    end_date                    DATE,
    status                      VARCHAR(20) NOT NULL,
    base_criteria_template_id   UUID REFERENCES criteria_template(id),
    rbl_enabled                 BOOLEAN NOT NULL DEFAULT FALSE
);

CREATE TABLE track (
    id          UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    created_at  TIMESTAMPTZ NOT NULL DEFAULT now(),
    updated_at  TIMESTAMPTZ NOT NULL DEFAULT now(),
    event_id    UUID NOT NULL REFERENCES hackathon_event(id) ON DELETE CASCADE,
    name        VARCHAR(255) NOT NULL,
    description TEXT,
    max_teams   INTEGER
);
CREATE INDEX idx_track_event ON track(event_id);

CREATE TABLE round (
    id                    UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    created_at            TIMESTAMPTZ NOT NULL DEFAULT now(),
    updated_at            TIMESTAMPTZ NOT NULL DEFAULT now(),
    event_id              UUID NOT NULL REFERENCES hackathon_event(id) ON DELETE CASCADE,
    name                  VARCHAR(255) NOT NULL,
    order_index           INTEGER NOT NULL,
    submission_deadline   TIMESTAMPTZ NOT NULL,
    promotion_top_n       INTEGER,
    results_published     BOOLEAN NOT NULL DEFAULT FALSE
);
CREATE INDEX idx_round_event ON round(event_id);

CREATE TABLE criterion (
    id           UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    created_at   TIMESTAMPTZ NOT NULL DEFAULT now(),
    updated_at   TIMESTAMPTZ NOT NULL DEFAULT now(),
    template_id  UUID REFERENCES criteria_template(id) ON DELETE CASCADE,
    round_id     UUID REFERENCES round(id) ON DELETE CASCADE,
    name         VARCHAR(255) NOT NULL,
    description  TEXT,
    weight       NUMERIC(5,2) NOT NULL,
    max_score    NUMERIC(5,2) NOT NULL,
    CONSTRAINT chk_criterion_owner CHECK (
        (template_id IS NOT NULL AND round_id IS NULL) OR
        (template_id IS NULL AND round_id IS NOT NULL)
    )
);
CREATE INDEX idx_criterion_template ON criterion(template_id);
CREATE INDEX idx_criterion_round ON criterion(round_id);

CREATE TABLE team (
    id          UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    created_at  TIMESTAMPTZ NOT NULL DEFAULT now(),
    updated_at  TIMESTAMPTZ NOT NULL DEFAULT now(),
    event_id    UUID NOT NULL REFERENCES hackathon_event(id) ON DELETE CASCADE,
    name        VARCHAR(255) NOT NULL,
    track_id    UUID REFERENCES track(id),
    status      VARCHAR(20) NOT NULL
);
CREATE INDEX idx_team_event ON team(event_id);
CREATE INDEX idx_team_track ON team(track_id);

CREATE TABLE team_member (
    id            UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    created_at    TIMESTAMPTZ NOT NULL DEFAULT now(),
    updated_at    TIMESTAMPTZ NOT NULL DEFAULT now(),
    team_id       UUID NOT NULL REFERENCES team(id) ON DELETE CASCADE,
    user_id       UUID NOT NULL REFERENCES app_user(id) ON DELETE CASCADE,
    role_in_team  VARCHAR(20) NOT NULL,
    UNIQUE (team_id, user_id)
);

CREATE TABLE team_invite (
    id             UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    created_at     TIMESTAMPTZ NOT NULL DEFAULT now(),
    updated_at     TIMESTAMPTZ NOT NULL DEFAULT now(),
    team_id        UUID NOT NULL REFERENCES team(id) ON DELETE CASCADE,
    invited_email  VARCHAR(255) NOT NULL,
    status         VARCHAR(20) NOT NULL
);
CREATE INDEX idx_team_invite_email ON team_invite(invited_email);

CREATE TABLE submission (
    id                    UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    created_at            TIMESTAMPTZ NOT NULL DEFAULT now(),
    updated_at            TIMESTAMPTZ NOT NULL DEFAULT now(),
    team_id               UUID NOT NULL REFERENCES team(id) ON DELETE CASCADE,
    round_id              UUID NOT NULL REFERENCES round(id) ON DELETE CASCADE,
    repo_url              VARCHAR(1000) NOT NULL,
    demo_url              VARCHAR(1000),
    doc_url               VARCHAR(1000),
    repo_metadata_json    TEXT,
    submitted_at          TIMESTAMPTZ NOT NULL,
    is_late               BOOLEAN NOT NULL DEFAULT FALSE,
    UNIQUE (team_id, round_id)
);
CREATE INDEX idx_submission_round ON submission(round_id);

CREATE TABLE score (
    id                UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    created_at        TIMESTAMPTZ NOT NULL DEFAULT now(),
    updated_at        TIMESTAMPTZ NOT NULL DEFAULT now(),
    submission_id     UUID NOT NULL REFERENCES submission(id) ON DELETE CASCADE,
    judge_id          UUID NOT NULL REFERENCES app_user(id),
    criterion_id      UUID NOT NULL REFERENCES criterion(id),
    score_value       NUMERIC(5,2) NOT NULL,
    comment           TEXT,
    finalized         BOOLEAN NOT NULL DEFAULT FALSE,
    scored_at         TIMESTAMPTZ,
    judge_calibrated  BOOLEAN NOT NULL DEFAULT FALSE,
    UNIQUE (submission_id, judge_id, criterion_id)
);
CREATE INDEX idx_score_submission ON score(submission_id);
CREATE INDEX idx_score_judge ON score(judge_id);

CREATE TABLE ranking (
    id                     UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    created_at             TIMESTAMPTZ NOT NULL DEFAULT now(),
    updated_at             TIMESTAMPTZ NOT NULL DEFAULT now(),
    team_id                UUID NOT NULL REFERENCES team(id) ON DELETE CASCADE,
    round_id               UUID NOT NULL REFERENCES round(id) ON DELETE CASCADE,
    total_weighted_score   NUMERIC(6,2) NOT NULL,
    rank_in_track          INTEGER,
    rank_overall           INTEGER,
    promoted               BOOLEAN NOT NULL DEFAULT FALSE,
    UNIQUE (team_id, round_id)
);
CREATE INDEX idx_ranking_round ON ranking(round_id);

CREATE TABLE disqualification (
    id            UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    created_at    TIMESTAMPTZ NOT NULL DEFAULT now(),
    updated_at    TIMESTAMPTZ NOT NULL DEFAULT now(),
    target_type   VARCHAR(20) NOT NULL,
    team_id       UUID REFERENCES team(id),
    submission_id UUID REFERENCES submission(id),
    reason        TEXT NOT NULL,
    decided_by    UUID NOT NULL REFERENCES app_user(id),
    decided_at    TIMESTAMPTZ NOT NULL,
    revoked       BOOLEAN NOT NULL DEFAULT FALSE
);

CREATE TABLE prize (
    id               UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    created_at       TIMESTAMPTZ NOT NULL DEFAULT now(),
    updated_at       TIMESTAMPTZ NOT NULL DEFAULT now(),
    event_id         UUID NOT NULL REFERENCES hackathon_event(id) ON DELETE CASCADE,
    track_id         UUID REFERENCES track(id),
    name             VARCHAR(255) NOT NULL,
    rank_condition   INTEGER NOT NULL,
    awarded_team_id  UUID REFERENCES team(id),
    revoked          BOOLEAN NOT NULL DEFAULT FALSE
);

CREATE TABLE audit_log (
    id             UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    created_at     TIMESTAMPTZ NOT NULL DEFAULT now(),
    updated_at     TIMESTAMPTZ NOT NULL DEFAULT now(),
    actor_id       UUID REFERENCES app_user(id),
    action         VARCHAR(50) NOT NULL,
    entity_type    VARCHAR(100) NOT NULL,
    entity_id      UUID,
    old_value_json TEXT,
    new_value_json TEXT,
    timestamp      TIMESTAMPTZ NOT NULL
);
CREATE INDEX idx_audit_entity ON audit_log(entity_type, entity_id);

CREATE TABLE calibration_round (
    id                    UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    created_at            TIMESTAMPTZ NOT NULL DEFAULT now(),
    updated_at            TIMESTAMPTZ NOT NULL DEFAULT now(),
    event_id              UUID NOT NULL REFERENCES hackathon_event(id) ON DELETE CASCADE,
    sample_submission_id  UUID NOT NULL REFERENCES submission(id),
    name                  VARCHAR(255) NOT NULL,
    active                BOOLEAN NOT NULL DEFAULT TRUE
);

CREATE TABLE calibration_score (
    id                     UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    created_at             TIMESTAMPTZ NOT NULL DEFAULT now(),
    updated_at             TIMESTAMPTZ NOT NULL DEFAULT now(),
    calibration_round_id   UUID NOT NULL REFERENCES calibration_round(id) ON DELETE CASCADE,
    judge_id               UUID NOT NULL REFERENCES app_user(id),
    criterion_id           UUID NOT NULL REFERENCES criterion(id),
    score_value            NUMERIC(5,2) NOT NULL,
    UNIQUE (calibration_round_id, judge_id, criterion_id)
);
