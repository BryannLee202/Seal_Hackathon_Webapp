package com.seal.hackathon.dto.event;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;

import java.time.Instant;

public record RoundRequest(
        @NotBlank String name,
        @NotNull Integer orderIndex,
        @NotNull Instant submissionDeadline,
        Integer promotionTopN
) {
}
