package com.seal.hackathon.dto.criteria;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;

import java.math.BigDecimal;

public record CriterionRequest(
        @NotBlank String name,
        String description,
        @NotNull BigDecimal weight,
        @NotNull BigDecimal maxScore
) {
}
