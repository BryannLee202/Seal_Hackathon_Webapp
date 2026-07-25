CREATE TABLE vote (
    id             UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    created_at     TIMESTAMPTZ NOT NULL DEFAULT now(),
    updated_at     TIMESTAMPTZ NOT NULL DEFAULT now(),
    team_id        UUID NOT NULL REFERENCES team(id) ON DELETE CASCADE,
    track_id       UUID NOT NULL REFERENCES track(id) ON DELETE CASCADE,
    voter_id_hash  VARCHAR(64) NOT NULL,
    ip_hash        VARCHAR(64) NOT NULL,
    UNIQUE (track_id, voter_id_hash)
);
CREATE INDEX idx_vote_team ON vote(team_id);
CREATE INDEX idx_vote_track_ip ON vote(track_id, ip_hash);
