package com.seal.hackathon.dto.scoring;

import com.seal.hackathon.domain.entity.Ranking;

import java.math.BigDecimal;
import java.util.UUID;

public record RankingResponse(
        UUID teamId,
        String teamName,
        UUID trackId,
        String trackName,
        UUID roundId,
        BigDecimal totalWeightedScore,
        Integer rankInTrack,
        Integer rankOverall,
        boolean promoted
) {
    public static RankingResponse from(Ranking r) {
        return new RankingResponse(
                r.getTeam().getId(),
                r.getTeam().getName(),
                r.getTeam().getTrack() == null ? null : r.getTeam().getTrack().getId(),
                r.getTeam().getTrack() == null ? null : r.getTeam().getTrack().getName(),
                r.getRound().getId(),
                r.getTotalWeightedScore(),
                r.getRankInTrack(),
                r.getRankOverall(),
                r.isPromoted()
        );
    }
}
