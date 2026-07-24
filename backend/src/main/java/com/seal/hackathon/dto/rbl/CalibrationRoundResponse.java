package com.seal.hackathon.dto.rbl;

import com.seal.hackathon.domain.entity.CalibrationRound;

import java.util.UUID;

public record CalibrationRoundResponse(
        UUID id,
        UUID eventId,
        UUID sampleSubmissionId,
        String name,
        boolean active
) {
    public static CalibrationRoundResponse from(CalibrationRound cr) {
        return new CalibrationRoundResponse(
                cr.getId(),
                cr.getEvent().getId(),
                cr.getSampleSubmission().getId(),
                cr.getName(),
                cr.isActive()
        );
    }
}
