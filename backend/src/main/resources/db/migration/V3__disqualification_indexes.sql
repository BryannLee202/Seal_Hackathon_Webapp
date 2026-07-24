-- disqualification.team_id / submission_id were queried directly (including the batched
-- IN (...) lookups in RankingService.compute()) but had no index, forcing a sequential scan.
CREATE INDEX idx_disqualification_team ON disqualification(team_id);
CREATE INDEX idx_disqualification_submission ON disqualification(submission_id);
