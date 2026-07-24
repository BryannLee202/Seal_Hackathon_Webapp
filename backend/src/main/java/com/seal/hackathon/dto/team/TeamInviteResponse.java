package com.seal.hackathon.dto.team;

import com.seal.hackathon.domain.entity.TeamInvite;
import com.seal.hackathon.domain.enums.TeamInviteStatus;

import java.util.UUID;

public record TeamInviteResponse(
        UUID id,
        UUID teamId,
        String teamName,
        String invitedEmail,
        TeamInviteStatus status
) {
    public static TeamInviteResponse from(TeamInvite invite) {
        return new TeamInviteResponse(
                invite.getId(),
                invite.getTeam().getId(),
                invite.getTeam().getName(),
                invite.getInvitedEmail(),
                invite.getStatus()
        );
    }
}
