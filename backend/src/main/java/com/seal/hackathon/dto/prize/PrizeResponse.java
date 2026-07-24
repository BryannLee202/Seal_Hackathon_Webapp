package com.seal.hackathon.dto.prize;

import com.seal.hackathon.domain.entity.Prize;

import java.util.UUID;

public record PrizeResponse(
        UUID id,
        UUID eventId,
        UUID trackId,
        String name,
        Integer rankCondition,
        UUID awardedTeamId,
        String awardedTeamName,
        boolean revoked
) {
    public static PrizeResponse from(Prize p) {
        return new PrizeResponse(
                p.getId(),
                p.getEvent().getId(),
                p.getTrack() == null ? null : p.getTrack().getId(),
                p.getName(),
                p.getRankCondition(),
                p.getAwardedTeam() == null ? null : p.getAwardedTeam().getId(),
                p.getAwardedTeam() == null ? null : p.getAwardedTeam().getName(),
                p.isRevoked()
        );
    }
}
