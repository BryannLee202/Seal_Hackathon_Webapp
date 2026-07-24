package com.seal.hackathon.dto.scoring;

import com.seal.hackathon.domain.entity.Score;

import java.math.BigDecimal;
import java.time.Instant;
import java.util.UUID;

public record ScoreResponse(
        UUID id,
        UUID submissionId,
        UUID judgeId,
        String judgeName,
        UUID criterionId,
        String criterionName,
        BigDecimal scoreValue,
        String comment,
        boolean finalized,
        Instant scoredAt
) {
    public static ScoreResponse from(Score s) {
        return new ScoreResponse(
                s.getId(),
                s.getSubmission().getId(),
                s.getJudge().getId(),
                s.getJudge().getFullName(),
                s.getCriterion().getId(),
                s.getCriterion().getName(),
                s.getScoreValue(),
                s.getComment(),
                s.isFinalized(),
                s.getScoredAt()
        );
    }
}
