package com.seal.hackathon.dto.rbl;

import jakarta.validation.constraints.NotNull;

import java.math.BigDecimal;
import java.util.UUID;

public record CalibrationScoreItemRequest(
        @NotNull UUID criterionId,
        @NotNull BigDecimal scoreValue
) {
}
