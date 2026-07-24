package com.seal.hackathon.dto.scoring;

import jakarta.validation.constraints.NotNull;

import java.math.BigDecimal;
import java.util.UUID;

public record ScoreItemRequest(
        @NotNull UUID criterionId,
        @NotNull BigDecimal scoreValue,
        String comment
) {
}
