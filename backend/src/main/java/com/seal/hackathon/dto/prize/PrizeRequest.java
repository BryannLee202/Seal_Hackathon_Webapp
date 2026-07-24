package com.seal.hackathon.dto.prize;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;

import java.util.UUID;

public record PrizeRequest(
        @NotBlank String name,
        UUID trackId,
        @NotNull Integer rankCondition
) {
}
