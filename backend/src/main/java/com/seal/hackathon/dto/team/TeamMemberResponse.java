package com.seal.hackathon.dto.team;

import com.seal.hackathon.domain.entity.TeamMember;
import com.seal.hackathon.domain.enums.TeamMemberRole;

import java.util.UUID;

public record TeamMemberResponse(
        UUID userId,
        String fullName,
        String email,
        TeamMemberRole roleInTeam
) {
    public static TeamMemberResponse from(TeamMember tm) {
        return new TeamMemberResponse(
                tm.getUser().getId(),
                tm.getUser().getFullName(),
                tm.getUser().getEmail(),
                tm.getRoleInTeam()
        );
    }
}
