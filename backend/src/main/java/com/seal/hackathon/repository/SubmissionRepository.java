package com.seal.hackathon.repository;

import com.seal.hackathon.domain.entity.Submission;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import java.util.List;
import java.util.Optional;
import java.util.UUID;

public interface SubmissionRepository extends JpaRepository<Submission, UUID> {
    List<Submission> findByRoundId(UUID roundId);
    Page<Submission> findByRoundId(UUID roundId, Pageable pageable);
    Optional<Submission> findByTeamIdAndRoundId(UUID teamId, UUID roundId);

    /**
     * Same result as {@link #findByRoundId}, but eagerly joins team + track so that
     * ranking computation doesn't trigger a lazy-load query per submission.
     */
    @Query("SELECT s FROM Submission s JOIN FETCH s.team t LEFT JOIN FETCH t.track WHERE s.round.id = :roundId")
    List<Submission> findByRoundIdWithTeam(@Param("roundId") UUID roundId);
}
