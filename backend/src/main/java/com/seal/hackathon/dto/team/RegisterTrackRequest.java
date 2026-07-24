package com.seal.hackathon.dto.team;

import jakarta.validation.constraints.NotNull;

import java.util.UUID;

public record RegisterTrackRequest(
        @NotNull UUID trackId
) {
}
