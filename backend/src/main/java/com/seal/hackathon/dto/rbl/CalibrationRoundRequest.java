package com.seal.hackathon.dto.rbl;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;

import java.util.UUID;

public record CalibrationRoundRequest(
        @NotBlank String name,
        @NotNull UUID sampleSubmissionId
) {
}
