package com.seal.hackathon.dto.event;

import jakarta.validation.constraints.NotBlank;

public record TrackRequest(
        @NotBlank String name,
        String description,
        Integer maxTeams
) {
}
