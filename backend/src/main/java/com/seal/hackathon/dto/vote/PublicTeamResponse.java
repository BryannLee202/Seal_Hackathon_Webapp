package com.seal.hackathon.dto.vote;

import com.seal.hackathon.domain.entity.Team;

import java.util.UUID;

public record PublicTeamResponse(
        UUID id,
        String name
) {
    public static PublicTeamResponse from(Team team) {
        return new PublicTeamResponse(team.getId(), team.getName());
    }
}
