package com.seal.hackathon.service;

import com.seal.hackathon.domain.entity.Criterion;
import com.seal.hackathon.domain.entity.HackathonEvent;
import com.seal.hackathon.domain.entity.Round;
import com.seal.hackathon.domain.entity.Score;
import com.seal.hackathon.domain.entity.Submission;
import com.seal.hackathon.domain.entity.User;
import com.seal.hackathon.dto.scoring.ScoreBatchRequest;
import com.seal.hackathon.dto.scoring.ScoreItemRequest;
import com.seal.hackathon.exception.ApiException;
import com.seal.hackathon.repository.CalibrationRoundRepository;
import com.seal.hackathon.repository.CalibrationScoreRepository;
import com.seal.hackathon.repository.CriterionRepository;
import com.seal.hackathon.repository.ScoreRepository;
import com.seal.hackathon.repository.SubmissionRepository;
import com.seal.hackathon.repository.UserRepository;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;

import java.math.BigDecimal;
import java.util.List;
import java.util.Optional;
import java.util.UUID;

import static org.assertj.core.api.Assertions.assertThat;
import static org.assertj.core.api.Assertions.assertThatThrownBy;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.when;

@ExtendWith(MockitoExtension.class)
class ScoreServiceTest {

    @Mock
    private ScoreRepository scoreRepository;
    @Mock
    private SubmissionRepository submissionRepository;
    @Mock
    private CriterionRepository criterionRepository;
    @Mock
    private UserRepository userRepository;
    @Mock
    private CalibrationRoundRepository calibrationRoundRepository;
    @Mock
    private CalibrationScoreRepository calibrationScoreRepository;
    @Mock
    private JudgeAssignmentService judgeAssignmentService;
    @Mock
    private AuditService auditService;

    @InjectMocks
    private ScoreService scoreService;

    private UUID submissionId;
    private UUID judgeId;
    private UUID roundId;
    private UUID criterionId;
    private Submission submission;
    private Round round;
    private User judge;
    private Criterion criterion;

    @BeforeEach
    void setUp() {
        submissionId = UUID.randomUUID();
        judgeId = UUID.randomUUID();
        roundId = UUID.randomUUID();
        criterionId = UUID.randomUUID();

        HackathonEvent event = HackathonEvent.builder().build();
        event.setId(UUID.randomUUID());

        round = Round.builder().event(event).build();
        round.setId(roundId);

        submission = Submission.builder().round(round).build();
        submission.setId(submissionId);

        judge = User.builder().fullName("Giam Khao A").build();
        judge.setId(judgeId);

        criterion = Criterion.builder().round(round).name("Tinh sang tao").maxScore(BigDecimal.TEN).build();
        criterion.setId(criterionId);

        when(submissionRepository.findById(submissionId)).thenReturn(Optional.of(submission));
        org.mockito.Mockito.lenient().when(calibrationRoundRepository.findByEventId(event.getId())).thenReturn(List.of());
    }

    @Test
    void submitScores_shouldThrowForbidden_whenJudgeNotAssignedToRound() {
        ScoreBatchRequest request = new ScoreBatchRequest(
                List.of(new ScoreItemRequest(criterionId, BigDecimal.valueOf(8), null)), false);
        when(judgeAssignmentService.isJudgeAssignedToRound(judgeId, roundId)).thenReturn(false);

        assertThatThrownBy(() -> scoreService.submitScores(submissionId, request, judgeId))
                .isInstanceOf(ApiException.class)
                .hasMessageContaining("không được phân công");
    }

    @Test
    void submitScores_shouldThrowBadRequest_whenCriterionDoesNotBelongToRound() {
        Round otherRound = Round.builder().build();
        otherRound.setId(UUID.randomUUID());
        criterion.setRound(otherRound);

        ScoreBatchRequest request = new ScoreBatchRequest(
                List.of(new ScoreItemRequest(criterionId, BigDecimal.valueOf(8), null)), false);
        when(judgeAssignmentService.isJudgeAssignedToRound(judgeId, roundId)).thenReturn(true);
        when(userRepository.findById(judgeId)).thenReturn(Optional.of(judge));
        when(criterionRepository.findById(criterionId)).thenReturn(Optional.of(criterion));

        assertThatThrownBy(() -> scoreService.submitScores(submissionId, request, judgeId))
                .isInstanceOf(ApiException.class)
                .hasMessageContaining("không thuộc vòng thi");
    }

    @Test
    void submitScores_shouldThrowBadRequest_whenScoreValueExceedsMax() {
        ScoreBatchRequest request = new ScoreBatchRequest(
                List.of(new ScoreItemRequest(criterionId, BigDecimal.valueOf(11), null)), false);
        when(judgeAssignmentService.isJudgeAssignedToRound(judgeId, roundId)).thenReturn(true);
        when(userRepository.findById(judgeId)).thenReturn(Optional.of(judge));
        when(criterionRepository.findById(criterionId)).thenReturn(Optional.of(criterion));

        assertThatThrownBy(() -> scoreService.submitScores(submissionId, request, judgeId))
                .isInstanceOf(ApiException.class)
                .hasMessageContaining("phải trong khoảng");
    }

    @Test
    void submitScores_shouldThrowBadRequest_whenScoreValueIsNegative() {
        ScoreBatchRequest request = new ScoreBatchRequest(
                List.of(new ScoreItemRequest(criterionId, BigDecimal.valueOf(-1), null)), false);
        when(judgeAssignmentService.isJudgeAssignedToRound(judgeId, roundId)).thenReturn(true);
        when(userRepository.findById(judgeId)).thenReturn(Optional.of(judge));
        when(criterionRepository.findById(criterionId)).thenReturn(Optional.of(criterion));

        assertThatThrownBy(() -> scoreService.submitScores(submissionId, request, judgeId))
                .isInstanceOf(ApiException.class)
                .hasMessageContaining("phải trong khoảng");
    }

    @Test
    void submitScores_shouldSaveNewScore_whenValidRequest() {
        ScoreBatchRequest request = new ScoreBatchRequest(
                List.of(new ScoreItemRequest(criterionId, BigDecimal.valueOf(8), "Tot")), true);
        when(judgeAssignmentService.isJudgeAssignedToRound(judgeId, roundId)).thenReturn(true);
        when(userRepository.findById(judgeId)).thenReturn(Optional.of(judge));
        when(criterionRepository.findById(criterionId)).thenReturn(Optional.of(criterion));
        when(scoreRepository.findBySubmissionIdAndJudgeIdAndCriterionId(submissionId, judgeId, criterionId))
                .thenReturn(Optional.empty());
        when(scoreRepository.save(any(Score.class))).thenAnswer(invocation -> {
            Score score = invocation.getArgument(0);
            score.setId(UUID.randomUUID());
            return score;
        });

        var responses = scoreService.submitScores(submissionId, request, judgeId);

        assertThat(responses).hasSize(1);
        assertThat(responses.get(0).scoreValue()).isEqualByComparingTo(BigDecimal.valueOf(8));
        assertThat(responses.get(0).finalized()).isTrue();
    }
}
