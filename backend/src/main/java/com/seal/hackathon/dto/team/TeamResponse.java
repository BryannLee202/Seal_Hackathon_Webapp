package com.seal.hackathon.dto.team;

import com.seal.hackathon.domain.entity.Team;
import com.seal.hackathon.domain.enums.TeamStatus;

import java.util.List;
import java.util.UUID;

public record TeamResponse(
        UUID id,
        UUID eventId,
        String name,
        UUID trackId,
        String trackName,
        TeamStatus status,
        List<TeamMemberResponse> members
) {
    public static TeamResponse from(Team team, List<TeamMemberResponse> members) {
        return new TeamResponse(
                team.getId(),
                team.getEvent().getId(),
                team.getName(),
                team.getTrack() == null ? null : team.getTrack().getId(),
                team.getTrack() == null ? null : team.getTrack().getName(),
                team.getStatus(),
                members
        );
    }
}
