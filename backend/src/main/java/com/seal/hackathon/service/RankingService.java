package com.seal.hackathon.service;

import com.seal.hackathon.domain.entity.Criterion;
import com.seal.hackathon.domain.entity.Ranking;
import com.seal.hackathon.domain.entity.Round;
import com.seal.hackathon.domain.entity.Score;
import com.seal.hackathon.domain.entity.Submission;
import com.seal.hackathon.domain.entity.Team;
import com.seal.hackathon.domain.enums.AuditAction;
import com.seal.hackathon.dto.scoring.RankingResponse;
import com.seal.hackathon.repository.CriterionRepository;
import com.seal.hackathon.repository.DisqualificationRepository;
import com.seal.hackathon.repository.RankingRepository;
import com.seal.hackathon.repository.ScoreRepository;
import com.seal.hackathon.repository.SubmissionRepository;
import com.seal.hackathon.security.AuthenticatedPrincipal;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;
import java.math.MathContext;
import java.math.RoundingMode;
import java.util.ArrayList;
import java.util.Comparator;
import java.util.HashMap;
import java.util.List;
import java.util.Map;
import java.util.Set;
import java.util.UUID;
import java.util.stream.Collectors;

@Service
public class RankingService {

    private final SubmissionRepository submissionRepository;
    private final ScoreRepository scoreRepository;
    private final CriterionRepository criterionRepository;
    private final RankingRepository rankingRepository;
    private final DisqualificationRepository disqualificationRepository;
    private final RoundService roundService;
    private final AuditService auditService;

    public RankingService(
            SubmissionRepository submissionRepository,
            ScoreRepository scoreRepository,
            CriterionRepository criterionRepository,
            RankingRepository rankingRepository,
            DisqualificationRepository disqualificationRepository,
            RoundService roundService,
            AuditService auditService
    ) {
        this.submissionRepository = submissionRepository;
        this.scoreRepository = scoreRepository;
        this.criterionRepository = criterionRepository;
        this.rankingRepository = rankingRepository;
        this.disqualificationRepository = disqualificationRepository;
        this.roundService = roundService;
        this.auditService = auditService;
    }

    @Transactional
    public List<RankingResponse> compute(UUID roundId, UUID actorId) {
        Round round = roundService.findOrThrow(roundId);
        // Eager-fetch team + track in one query so the ranking pass below never lazy-loads per submission.
        List<Submission> submissions = submissionRepository.findByRoundIdWithTeam(roundId);
        List<Criterion> criteria = criterionRepository.findByRoundId(roundId);

        List<UUID> submissionIds = submissions.stream().map(Submission::getId).toList();
        List<UUID> teamIds = submissions.stream().map(s -> s.getTeam().getId()).toList();

        // Batch-load disqualification and score state for the whole round instead of querying per submission.
        Set<UUID> disqualifiedTeamIds = disqualificationRepository.findByTeamIdInAndRevokedFalse(teamIds).stream()
                .map(d -> d.getTeam().getId())
                .collect(Collectors.toSet());
        Set<UUID> disqualifiedSubmissionIds = disqualificationRepository.findBySubmissionIdInAndRevokedFalse(submissionIds).stream()
                .map(d -> d.getSubmission().getId())
                .collect(Collectors.toSet());
        Map<UUID, List<Score>> finalizedScoresBySubmission = scoreRepository.findBySubmissionIdIn(submissionIds).stream()
                .filter(Score::isFinalized)
                .collect(Collectors.groupingBy(s -> s.getSubmission().getId()));
        Map<UUID, Ranking> existingRankingsByTeam = rankingRepository.findByRoundIdOrderByRankOverallAsc(roundId).stream()
                .collect(Collectors.toMap(r -> r.getTeam().getId(), r -> r));

        record Entry(Submission submission, BigDecimal total) {
        }

        List<Entry> entries = new ArrayList<>();
        for (Submission submission : submissions) {
            UUID teamId = submission.getTeam().getId();
            boolean disqualified = disqualifiedTeamIds.contains(teamId) || disqualifiedSubmissionIds.contains(submission.getId());
            if (disqualified) {
                Ranking existing = existingRankingsByTeam.remove(teamId);
                if (existing != null) {
                    rankingRepository.delete(existing);
                }
                continue;
            }
            List<Score> scores = finalizedScoresBySubmission.getOrDefault(submission.getId(), List.of());
            BigDecimal total = computeWeightedTotal(scores, criteria);
            entries.add(new Entry(submission, total));
        }

        entries.sort(Comparator.comparing(Entry::total, Comparator.reverseOrder()));

        Map<UUID, Integer> trackRankCounter = new HashMap<>();
        List<Ranking> saved = new ArrayList<>();
        int overallRank = 0;
        for (Entry entry : entries) {
            overallRank++;
            Team team = entry.submission().getTeam();
            UUID trackId = team.getTrack() == null ? null : team.getTrack().getId();
            int rankInTrack = trackId == null ? 0 : trackRankCounter.merge(trackId, 1, Integer::sum);

            boolean promoted = round.getPromotionTopN() != null && trackId != null && rankInTrack <= round.getPromotionTopN();

            Ranking ranking = existingRankingsByTeam.getOrDefault(team.getId(), Ranking.builder().team(team).round(round).build());
            ranking.setTotalWeightedScore(entry.total());
            ranking.setRankOverall(overallRank);
            ranking.setRankInTrack(trackId == null ? null : rankInTrack);
            ranking.setPromoted(promoted);
            saved.add(rankingRepository.save(ranking));
        }

        auditService.record(actorId, AuditAction.RANKING_COMPUTE, "Round", roundId, null, saved.size());
        auditService.record(actorId, AuditAction.PROMOTION_COMPUTE, "Round", roundId, null, round.getPromotionTopN());

        return saved.stream().map(RankingResponse::from).collect(Collectors.toList());
    }

    @Transactional(readOnly = true)
    public List<RankingResponse> list(UUID roundId, AuthenticatedPrincipal principal) {
        roundService.findOrThrowVisibleForRankings(roundId, principal);
        return rankingRepository.findByRoundIdOrderByRankOverallAsc(roundId).stream()
                .map(RankingResponse::from).collect(Collectors.toList());
    }

    private BigDecimal computeWeightedTotal(List<Score> scores, List<Criterion> criteria) {
        BigDecimal total = BigDecimal.ZERO;
        for (Criterion criterion : criteria) {
            List<BigDecimal> criterionScores = scores.stream()
                    .filter(s -> s.getCriterion().getId().equals(criterion.getId()))
                    .map(Score::getScoreValue)
                    .toList();
            if (criterionScores.isEmpty()) {
                continue;
            }
            BigDecimal avg = criterionScores.stream().reduce(BigDecimal.ZERO, BigDecimal::add)
                    .divide(BigDecimal.valueOf(criterionScores.size()), MathContext.DECIMAL64);
            BigDecimal normalized = avg.divide(criterion.getMaxScore(), MathContext.DECIMAL64);
            BigDecimal contribution = normalized.multiply(criterion.getWeight());
            total = total.add(contribution);
        }
        return total.setScale(2, RoundingMode.HALF_UP);
    }
}
