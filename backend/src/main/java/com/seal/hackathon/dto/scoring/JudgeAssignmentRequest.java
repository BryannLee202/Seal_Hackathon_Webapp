package com.seal.hackathon.dto.scoring;

import com.seal.hackathon.domain.enums.JudgeType;
import jakarta.validation.constraints.NotNull;

import java.util.UUID;

public record JudgeAssignmentRequest(
        @NotNull UUID judgeUserId,
        @NotNull JudgeType judgeType
) {
}
