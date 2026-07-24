package com.seal.hackathon.repository;

import com.seal.hackathon.domain.entity.Ranking;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;
import java.util.Optional;
import java.util.UUID;

public interface RankingRepository extends JpaRepository<Ranking, UUID> {
    List<Ranking> findByRoundIdOrderByRankOverallAsc(UUID roundId);
    Optional<Ranking> findByTeamIdAndRoundId(UUID teamId, UUID roundId);
    Optional<Ranking> findByRoundIdAndRankOverall(UUID roundId, Integer rankOverall);
    Optional<Ranking> findByRoundIdAndTeam_Track_IdAndRankInTrack(UUID roundId, UUID trackId, Integer rankInTrack);
}
