package com.seal.hackathon.dto.event;

import com.seal.hackathon.domain.entity.Round;

import java.time.Instant;
import java.util.UUID;

public record RoundResponse(
        UUID id,
        UUID eventId,
        String name,
        Integer orderIndex,
        Instant submissionDeadline,
        Integer promotionTopN,
        boolean resultsPublished
) {
    public static RoundResponse from(Round round) {
        return new RoundResponse(
                round.getId(),
                round.getEvent().getId(),
                round.getName(),
                round.getOrderIndex(),
                round.getSubmissionDeadline(),
                round.getPromotionTopN(),
                round.isResultsPublished()
        );
    }
}
