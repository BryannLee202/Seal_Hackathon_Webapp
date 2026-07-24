package com.seal.hackathon.dto.rbl;

import com.seal.hackathon.domain.entity.CalibrationScore;

import java.math.BigDecimal;
import java.util.UUID;

public record CalibrationScoreResponse(
        UUID judgeId,
        String judgeName,
        UUID criterionId,
        String criterionName,
        BigDecimal scoreValue
) {
    public static CalibrationScoreResponse from(CalibrationScore cs) {
        return new CalibrationScoreResponse(
                cs.getJudge().getId(),
                cs.getJudge().getFullName(),
                cs.getCriterion().getId(),
                cs.getCriterion().getName(),
                cs.getScoreValue()
        );
    }
}
