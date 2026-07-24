package com.seal.hackathon.dto.scoring;

import jakarta.validation.constraints.NotNull;

import java.util.UUID;

public record MentorAssignmentRequest(
        @NotNull UUID mentorUserId
) {
}
