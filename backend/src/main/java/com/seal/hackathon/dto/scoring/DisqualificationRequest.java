package com.seal.hackathon.dto.scoring;

import com.seal.hackathon.domain.enums.DisqualificationTargetType;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;

import java.util.UUID;

public record DisqualificationRequest(
        @NotNull DisqualificationTargetType targetType,
        UUID teamId,
        UUID submissionId,
        @NotBlank String reason
) {
}
