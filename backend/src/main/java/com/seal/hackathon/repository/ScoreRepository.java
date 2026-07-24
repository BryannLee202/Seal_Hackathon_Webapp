package com.seal.hackathon.repository;

import com.seal.hackathon.domain.entity.Score;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;
import java.util.Optional;
import java.util.UUID;

public interface ScoreRepository extends JpaRepository<Score, UUID> {
    List<Score> findBySubmissionId(UUID submissionId);
    List<Score> findByJudgeId(UUID judgeId);
    List<Score> findBySubmissionIdIn(List<UUID> submissionIds);
    Optional<Score> findBySubmissionIdAndJudgeIdAndCriterionId(UUID submissionId, UUID judgeId, UUID criterionId);
    boolean existsByCriterion_Round_Id(UUID roundId);
}
