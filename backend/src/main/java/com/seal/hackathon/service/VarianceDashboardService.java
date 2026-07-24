package com.seal.hackathon.service;

import com.seal.hackathon.domain.entity.Criterion;
import com.seal.hackathon.domain.entity.Score;
import com.seal.hackathon.domain.entity.Submission;
import com.seal.hackathon.dto.rbl.VarianceStatResponse;
import com.seal.hackathon.repository.CriterionRepository;
import com.seal.hackathon.repository.ScoreRepository;
import com.seal.hackathon.repository.SubmissionRepository;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;
import java.math.MathContext;
import java.math.RoundingMode;
import java.util.List;
import java.util.UUID;
import java.util.stream.Collectors;

@Service
public class VarianceDashboardService {

    private final SubmissionRepository submissionRepository;
    private final ScoreRepository scoreRepository;
    private final CriterionRepository criterionRepository;

    public VarianceDashboardService(SubmissionRepository submissionRepository, ScoreRepository scoreRepository, CriterionRepository criterionRepository) {
        this.submissionRepository = submissionRepository;
        this.scoreRepository = scoreRepository;
        this.criterionRepository = criterionRepository;
    }

    @Transactional(readOnly = true)
    public List<VarianceStatResponse> computeForRound(UUID roundId) {
        List<Submission> submissions = submissionRepository.findByRoundId(roundId);
        List<Criterion> criteria = criterionRepository.findByRoundId(roundId);
        List<UUID> submissionIds = submissions.stream().map(Submission::getId).toList();
        // Batch-fetch scores for every submission in one query instead of one query per submission.
        List<Score> allScores = scoreRepository.findBySubmissionIdIn(submissionIds).stream()
                .filter(Score::isFinalized)
                .toList();

        return criteria.stream().map(criterion -> {
            List<BigDecimal> values = allScores.stream()
                    .filter(s -> s.getCriterion().getId().equals(criterion.getId()))
                    .map(Score::getScoreValue)
                    .toList();
            return buildStat(criterion, values);
        }).collect(Collectors.toList());
    }

    private VarianceStatResponse buildStat(Criterion criterion, List<BigDecimal> values) {
        if (values.isEmpty()) {
            return new VarianceStatResponse(criterion.getId(), criterion.getName(), 0, null, null, null, null);
        }
        BigDecimal sum = values.stream().reduce(BigDecimal.ZERO, BigDecimal::add);
        BigDecimal mean = sum.divide(BigDecimal.valueOf(values.size()), MathContext.DECIMAL64);

        BigDecimal sumSquaredDiff = values.stream()
                .map(v -> v.subtract(mean).pow(2))
                .reduce(BigDecimal.ZERO, BigDecimal::add);
        BigDecimal variance = values.size() > 1
                ? sumSquaredDiff.divide(BigDecimal.valueOf(values.size() - 1), MathContext.DECIMAL64)
                : BigDecimal.ZERO;
        BigDecimal stdDev = BigDecimal.valueOf(Math.sqrt(variance.doubleValue()));

        BigDecimal min = values.stream().min(BigDecimal::compareTo).orElse(BigDecimal.ZERO);
        BigDecimal max = values.stream().max(BigDecimal::compareTo).orElse(BigDecimal.ZERO);

        return new VarianceStatResponse(
                criterion.getId(),
                criterion.getName(),
                values.size(),
                mean.setScale(2, RoundingMode.HALF_UP),
                stdDev.setScale(2, RoundingMode.HALF_UP),
                min,
                max
        );
    }
}
