package com.seal.hackathon.dto.team;

import jakarta.validation.constraints.NotBlank;

public record TeamRequest(
        @NotBlank String name
) {
}
