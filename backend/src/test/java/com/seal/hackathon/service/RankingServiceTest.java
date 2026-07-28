package com.seal.hackathon.service;

import com.seal.hackathon.domain.entity.Criterion;
import com.seal.hackathon.domain.entity.Disqualification;
import com.seal.hackathon.domain.entity.Ranking;
import com.seal.hackathon.domain.entity.Round;
import com.seal.hackathon.domain.entity.Score;
import com.seal.hackathon.domain.entity.Submission;
import com.seal.hackathon.domain.entity.Team;
import com.seal.hackathon.domain.entity.Track;
import com.seal.hackathon.domain.enums.RoleName;
import com.seal.hackathon.dto.scoring.RankingResponse;
import com.seal.hackathon.exception.ApiException;
import com.seal.hackathon.repository.CriterionRepository;
import com.seal.hackathon.repository.DisqualificationRepository;
import com.seal.hackathon.repository.RankingRepository;
import com.seal.hackathon.repository.ScoreRepository;
import com.seal.hackathon.repository.SubmissionRepository;
import com.seal.hackathon.security.AuthenticatedPrincipal;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;
import org.springframework.http.HttpStatus;

import java.math.BigDecimal;
import java.util.List;
import java.util.UUID;

import static org.assertj.core.api.Assertions.assertThat;
import static org.assertj.core.api.Assertions.assertThatThrownBy;
import static org.mockito.ArgumentMatchers.anyList;
import static org.mockito.Mockito.verify;
import static org.mockito.Mockito.verifyNoInteractions;
import static org.mockito.Mockito.when;

@ExtendWith(MockitoExtension.class)
class RankingServiceTest {

    @Mock
    private SubmissionRepository submissionRepository;
    @Mock
    private ScoreRepository scoreRepository;
    @Mock
    private CriterionRepository criterionRepository;
    @Mock
    private RankingRepository rankingRepository;
    @Mock
    private DisqualificationRepository disqualificationRepository;
    @Mock
    private RoundService roundService;
    @Mock
    private AuditService auditService;

    @InjectMocks
    private RankingService rankingService;

    private final AuthenticatedPrincipal principal = new AuthenticatedPrincipal(UUID.randomUUID(), "a@b.com", "A",
            List.of(new AuthenticatedPrincipal.RoleGrant(RoleName.COORDINATOR, null, null, null)));

    private Score buildScore(Submission submission, Criterion criterion, BigDecimal value, boolean finalized) {
        Score score = Score.builder()
                .submission(submission)
                .criterion(criterion)
                .scoreValue(value)
                .finalized(finalized)
                .build();
        score.setId(UUID.randomUUID());
        return score;
    }

    private Ranking saveAnswer(org.mockito.invocation.InvocationOnMock invocation) {
        Ranking r = invocation.getArgument(0);
        if (r.getId() == null) {
            r.setId(UUID.randomUUID());
        }
        return r;
    }

    // ---------------------------------------------------------------------
    // list()
    // ---------------------------------------------------------------------

    @Test
    void list_shouldPropagateException_andNotQueryRankings_whenVisibilityCheckFails() {
        UUID roundId = UUID.randomUUID();
        when(roundService.findOrThrowVisibleForRankings(roundId, principal))
                .thenThrow(ApiException.forbidden("Bảng xếp hạng của vòng thi này chưa được công bố"));

        assertThatThrownBy(() -> rankingService.list(roundId, principal))
                .isInstanceOf(ApiException.class)
                .hasFieldOrPropertyWithValue("status", HttpStatus.FORBIDDEN);

        verifyNoInteractions(rankingRepository);
    }

    @Test
    void list_shouldReturnMappedRankings_whenVisibilityCheckPasses() {
        UUID roundId = UUID.randomUUID();
        Round round = Round.builder().build();
        round.setId(roundId);
        when(roundService.findOrThrowVisibleForRankings(roundId, principal)).thenReturn(round);

        Team team = Team.builder().name("Team A").build();
        team.setId(UUID.randomUUID());

        Ranking ranking = Ranking.builder()
                .team(team)
                .round(round)
                .totalWeightedScore(BigDecimal.valueOf(80))
                .rankOverall(1)
                .rankInTrack(null)
                .promoted(false)
                .build();
        ranking.setId(UUID.randomUUID());

        when(rankingRepository.findByRoundIdOrderByRankOverallAsc(roundId)).thenReturn(List.of(ranking));

        List<RankingResponse> result = rankingService.list(roundId, principal);

        assertThat(result).hasSize(1);
        assertThat(result.get(0).teamId()).isEqualTo(team.getId());
        assertThat(result.get(0).teamName()).isEqualTo("Team A");
        assertThat(result.get(0).rankOverall()).isEqualTo(1);
        assertThat(result.get(0).totalWeightedScore()).isEqualByComparingTo(BigDecimal.valueOf(80));
    }

    // ---------------------------------------------------------------------
    // compute()
    // ---------------------------------------------------------------------

    @Test
    void compute_shouldRankEntriesByDescendingWeightedScore() {
        UUID roundId = UUID.randomUUID();
        UUID actorId = UUID.randomUUID();
        Round round = Round.builder().promotionTopN(null).build();
        round.setId(roundId);

        Track track = Track.builder().name("Track A").build();
        track.setId(UUID.randomUUID());

        Team teamHigh = Team.builder().name("Team High").track(track).build();
        teamHigh.setId(UUID.randomUUID());
        Team teamLow = Team.builder().name("Team Low").track(track).build();
        teamLow.setId(UUID.randomUUID());

        Submission subHigh = Submission.builder().team(teamHigh).round(round).build();
        subHigh.setId(UUID.randomUUID());
        Submission subLow = Submission.builder().team(teamLow).round(round).build();
        subLow.setId(UUID.randomUUID());

        Criterion c1 = Criterion.builder().round(round).name("C1").weight(BigDecimal.valueOf(60)).maxScore(BigDecimal.TEN).build();
        c1.setId(UUID.randomUUID());
        Criterion c2 = Criterion.builder().round(round).name("C2").weight(BigDecimal.valueOf(40)).maxScore(BigDecimal.TEN).build();
        c2.setId(UUID.randomUUID());

        Score highC1 = buildScore(subHigh, c1, BigDecimal.valueOf(10), true);
        Score highC2 = buildScore(subHigh, c2, BigDecimal.valueOf(10), true);
        Score lowC1 = buildScore(subLow, c1, BigDecimal.valueOf(2), true);
        Score lowC2 = buildScore(subLow, c2, BigDecimal.valueOf(2), true);

        when(roundService.findOrThrow(roundId)).thenReturn(round);
        // Deliberately returned out of rank order to prove the service does the sorting.
        when(submissionRepository.findByRoundIdWithTeam(roundId)).thenReturn(List.of(subLow, subHigh));
        when(criterionRepository.findByRoundId(roundId)).thenReturn(List.of(c1, c2));
        when(disqualificationRepository.findByTeamIdInAndRevokedFalse(anyList())).thenReturn(List.of());
        when(disqualificationRepository.findBySubmissionIdInAndRevokedFalse(anyList())).thenReturn(List.of());
        when(scoreRepository.findBySubmissionIdIn(anyList())).thenReturn(List.of(highC1, highC2, lowC1, lowC2));
        when(rankingRepository.findByRoundIdOrderByRankOverallAsc(roundId)).thenReturn(List.of());
        when(rankingRepository.save(org.mockito.ArgumentMatchers.any(Ranking.class))).thenAnswer(this::saveAnswer);

        List<RankingResponse> result = rankingService.compute(roundId, actorId);

        assertThat(result).hasSize(2);
        assertThat(result.get(0).teamId()).isEqualTo(teamHigh.getId());
        assertThat(result.get(0).rankOverall()).isEqualTo(1);
        assertThat(result.get(1).teamId()).isEqualTo(teamLow.getId());
        assertThat(result.get(1).rankOverall()).isEqualTo(2);
    }

    @Test
    void compute_shouldExcludeDisqualifiedTeam_andDeleteItsExistingRanking() {
        UUID roundId = UUID.randomUUID();
        UUID actorId = UUID.randomUUID();
        Round round = Round.builder().promotionTopN(null).build();
        round.setId(roundId);

        Team teamOk = Team.builder().name("Team OK").build();
        teamOk.setId(UUID.randomUUID());
        Team teamDisqualified = Team.builder().name("Team DQ").build();
        teamDisqualified.setId(UUID.randomUUID());

        Submission subOk = Submission.builder().team(teamOk).round(round).build();
        subOk.setId(UUID.randomUUID());
        Submission subDq = Submission.builder().team(teamDisqualified).round(round).build();
        subDq.setId(UUID.randomUUID());

        Criterion c1 = Criterion.builder().round(round).name("C1").weight(BigDecimal.valueOf(100)).maxScore(BigDecimal.TEN).build();
        c1.setId(UUID.randomUUID());

        Score okScore = buildScore(subOk, c1, BigDecimal.valueOf(8), true);

        Disqualification dq = Disqualification.builder().team(teamDisqualified).build();
        dq.setId(UUID.randomUUID());

        Ranking existingDqRanking = Ranking.builder()
                .team(teamDisqualified)
                .round(round)
                .totalWeightedScore(BigDecimal.TEN)
                .rankOverall(1)
                .promoted(false)
                .build();
        existingDqRanking.setId(UUID.randomUUID());

        when(roundService.findOrThrow(roundId)).thenReturn(round);
        when(submissionRepository.findByRoundIdWithTeam(roundId)).thenReturn(List.of(subOk, subDq));
        when(criterionRepository.findByRoundId(roundId)).thenReturn(List.of(c1));
        when(disqualificationRepository.findByTeamIdInAndRevokedFalse(anyList())).thenReturn(List.of(dq));
        when(disqualificationRepository.findBySubmissionIdInAndRevokedFalse(anyList())).thenReturn(List.of());
        when(scoreRepository.findBySubmissionIdIn(anyList())).thenReturn(List.of(okScore));
        when(rankingRepository.findByRoundIdOrderByRankOverallAsc(roundId)).thenReturn(List.of(existingDqRanking));
        when(rankingRepository.save(org.mockito.ArgumentMatchers.any(Ranking.class))).thenAnswer(this::saveAnswer);

        List<RankingResponse> result = rankingService.compute(roundId, actorId);

        assertThat(result).hasSize(1);
        assertThat(result.get(0).teamId()).isEqualTo(teamOk.getId());
        verify(rankingRepository).delete(existingDqRanking);
    }

    @Test
    void compute_shouldPromoteOnlyTopNPerTrack() {
        UUID roundId = UUID.randomUUID();
        UUID actorId = UUID.randomUUID();
        Round round = Round.builder().promotionTopN(1).build();
        round.setId(roundId);

        Track track = Track.builder().name("Track A").build();
        track.setId(UUID.randomUUID());

        Team teamHigh = Team.builder().name("Team High").track(track).build();
        teamHigh.setId(UUID.randomUUID());
        Team teamLow = Team.builder().name("Team Low").track(track).build();
        teamLow.setId(UUID.randomUUID());

        Submission subHigh = Submission.builder().team(teamHigh).round(round).build();
        subHigh.setId(UUID.randomUUID());
        Submission subLow = Submission.builder().team(teamLow).round(round).build();
        subLow.setId(UUID.randomUUID());

        Criterion c1 = Criterion.builder().round(round).name("C1").weight(BigDecimal.valueOf(100)).maxScore(BigDecimal.TEN).build();
        c1.setId(UUID.randomUUID());

        Score highScore = buildScore(subHigh, c1, BigDecimal.valueOf(9), true);
        Score lowScore = buildScore(subLow, c1, BigDecimal.valueOf(3), true);

        when(roundService.findOrThrow(roundId)).thenReturn(round);
        when(submissionRepository.findByRoundIdWithTeam(roundId)).thenReturn(List.of(subHigh, subLow));
        when(criterionRepository.findByRoundId(roundId)).thenReturn(List.of(c1));
        when(disqualificationRepository.findByTeamIdInAndRevokedFalse(anyList())).thenReturn(List.of());
        when(disqualificationRepository.findBySubmissionIdInAndRevokedFalse(anyList())).thenReturn(List.of());
        when(scoreRepository.findBySubmissionIdIn(anyList())).thenReturn(List.of(highScore, lowScore));
        when(rankingRepository.findByRoundIdOrderByRankOverallAsc(roundId)).thenReturn(List.of());
        when(rankingRepository.save(org.mockito.ArgumentMatchers.any(Ranking.class))).thenAnswer(this::saveAnswer);

        List<RankingResponse> result = rankingService.compute(roundId, actorId);

        RankingResponse highResp = result.stream().filter(r -> r.teamId().equals(teamHigh.getId())).findFirst().orElseThrow();
        RankingResponse lowResp = result.stream().filter(r -> r.teamId().equals(teamLow.getId())).findFirst().orElseThrow();

        assertThat(highResp.promoted()).isTrue();
        assertThat(lowResp.promoted()).isFalse();
    }
}
