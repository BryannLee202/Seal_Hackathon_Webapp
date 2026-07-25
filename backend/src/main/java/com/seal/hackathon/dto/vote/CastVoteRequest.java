package com.seal.hackathon.dto.vote;

import jakarta.validation.constraints.NotNull;

import java.util.UUID;

public record CastVoteRequest(
        @NotNull UUID teamId
) {
}
