package com.seal.hackathon.dto.submission;

import com.seal.hackathon.domain.entity.Submission;

import java.time.Instant;
import java.util.UUID;

public record SubmissionResponse(
        UUID id,
        UUID teamId,
        String teamName,
        UUID roundId,
        String repoUrl,
        String demoUrl,
        String docUrl,
        Instant submittedAt,
        boolean isLate
) {
    public static SubmissionResponse from(Submission s) {
        return new SubmissionResponse(
                s.getId(),
                s.getTeam().getId(),
                s.getTeam().getName(),
                s.getRound().getId(),
                s.getRepoUrl(),
                s.getDemoUrl(),
                s.getDocUrl(),
                s.getSubmittedAt(),
                s.isLate()
        );
    }
}
