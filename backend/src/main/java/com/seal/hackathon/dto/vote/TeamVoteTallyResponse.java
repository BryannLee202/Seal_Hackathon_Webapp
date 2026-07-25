package com.seal.hackathon.dto.vote;

import java.util.UUID;

public record TeamVoteTallyResponse(
        UUID teamId,
        String teamName,
        long voteCount
) {
}
