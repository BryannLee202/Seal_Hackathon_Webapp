package com.seal.hackathon.dto.vote;

import java.util.UUID;

public record VoteCastResponse(
        UUID teamId,
        long teamVoteCount,
        String voterToken
) {
}
