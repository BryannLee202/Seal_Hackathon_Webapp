package com.seal.hackathon.dto.criteria;

import com.seal.hackathon.domain.entity.Criterion;

import java.math.BigDecimal;
import java.util.UUID;

public record CriterionResponse(
        UUID id,
        UUID templateId,
        UUID roundId,
        String name,
        String description,
        BigDecimal weight,
        BigDecimal maxScore
) {
    public static CriterionResponse from(Criterion c) {
        return new CriterionResponse(
                c.getId(),
                c.getTemplate() == null ? null : c.getTemplate().getId(),
                c.getRound() == null ? null : c.getRound().getId(),
                c.getName(),
                c.getDescription(),
                c.getWeight(),
                c.getMaxScore()
        );
    }
}
