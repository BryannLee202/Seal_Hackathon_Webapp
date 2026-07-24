package com.seal.hackathon.service;

import com.seal.hackathon.domain.entity.CalibrationRound;
import com.seal.hackathon.domain.entity.Criterion;
import com.seal.hackathon.domain.entity.Score;
import com.seal.hackathon.domain.entity.Submission;
import com.seal.hackathon.domain.entity.User;
import com.seal.hackathon.domain.enums.AuditAction;
import com.seal.hackathon.dto.scoring.ScoreBatchRequest;
import com.seal.hackathon.dto.scoring.ScoreItemRequest;
import com.seal.hackathon.dto.scoring.ScoreResponse;
import com.seal.hackathon.exception.ApiException;
import com.seal.hackathon.repository.CalibrationRoundRepository;
import com.seal.hackathon.repository.CalibrationScoreRepository;
import com.seal.hackathon.repository.CriterionRepository;
import com.seal.hackathon.repository.ScoreRepository;
import com.seal.hackathon.repository.SubmissionRepository;
import com.seal.hackathon.repository.UserRepository;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;
import java.time.Instant;
import java.util.List;
import java.util.UUID;
import java.util.stream.Collectors;

@Service
public class ScoreService {

    private final ScoreRepository scoreRepository;
    private final SubmissionRepository submissionRepository;
    private final CriterionRepository criterionRepository;
    private final UserRepository userRepository;
    private final CalibrationRoundRepository calibrationRoundRepository;
    private final CalibrationScoreRepository calibrationScoreRepository;
    private final JudgeAssignmentService judgeAssignmentService;
    private final AuditService auditService;

    public ScoreService(
            ScoreRepository scoreRepository,
            SubmissionRepository submissionRepository,
            CriterionRepository criterionRepository,
            UserRepository userRepository,
            CalibrationRoundRepository calibrationRoundRepository,
            CalibrationScoreRepository calibrationScoreRepository,
            JudgeAssignmentService judgeAssignmentService,
            AuditService auditService
    ) {
        this.scoreRepository = scoreRepository;
        this.submissionRepository = submissionRepository;
        this.criterionRepository = criterionRepository;
        this.userRepository = userRepository;
        this.calibrationRoundRepository = calibrationRoundRepository;
        this.calibrationScoreRepository = calibrationScoreRepository;
        this.judgeAssignmentService = judgeAssignmentService;
        this.auditService = auditService;
    }

    @Transactional
    public List<ScoreResponse> submitScores(UUID submissionId, ScoreBatchRequest request, UUID judgeUserId) {
        Submission submission = submissionRepository.findById(submissionId)
                .orElseThrow(() -> ApiException.notFound("Không tìm thấy bài nộp"));
        UUID roundId = submission.getRound().getId();

        if (!judgeAssignmentService.isJudgeAssignedToRound(judgeUserId, roundId)) {
            throw ApiException.forbidden("Bạn không được phân công chấm điểm vòng thi này");
        }
        User judge = userRepository.findById(judgeUserId)
                .orElseThrow(() -> ApiException.notFound("Không tìm thấy giám khảo"));

        boolean judgeCalibrated = isJudgeCalibrated(submission, judgeUserId);

        List<Score> results = request.items().stream().map(item -> {
            Criterion criterion = criterionRepository.findById(item.criterionId())
                    .orElseThrow(() -> ApiException.notFound("Không tìm thấy tiêu chí"));
            if (criterion.getRound() == null || !criterion.getRound().getId().equals(roundId)) {
                throw ApiException.badRequest("Tiêu chí không thuộc vòng thi của bài nộp này");
            }
            validateScoreRange(item, criterion);

            Score score = scoreRepository.findBySubmissionIdAndJudgeIdAndCriterionId(submissionId, judgeUserId, item.criterionId())
                    .orElseGet(() -> Score.builder().submission(submission).judge(judge).criterion(criterion).build());
            BigDecimal oldValue = score.getScoreValue();
            boolean isNew = score.getId() == null;

            score.setScoreValue(item.scoreValue());
            score.setComment(item.comment());
            score.setFinalized(request.finalized());
            score.setScoredAt(Instant.now());
            score.setJudgeCalibrated(judgeCalibrated);
            score = scoreRepository.save(score);

            auditService.record(judgeUserId,
                    isNew ? AuditAction.SCORE_CREATE : (request.finalized() ? AuditAction.SCORE_FINALIZE : AuditAction.SCORE_UPDATE),
                    "Score", score.getId(), oldValue, score.getScoreValue());

            return score;
        }).collect(Collectors.toList());

        return results.stream().map(ScoreResponse::from).collect(Collectors.toList());
    }

    @Transactional(readOnly = true)
    public List<ScoreResponse> listBySubmission(UUID submissionId) {
        return scoreRepository.findBySubmissionId(submissionId).stream()
                .map(ScoreResponse::from).collect(Collectors.toList());
    }

    private void validateScoreRange(ScoreItemRequest item, Criterion criterion) {
        if (item.scoreValue().compareTo(BigDecimal.ZERO) < 0 || item.scoreValue().compareTo(criterion.getMaxScore()) > 0) {
            throw ApiException.badRequest(
                    "Điểm cho tiêu chí '" + criterion.getName() + "' phải trong khoảng 0 - " + criterion.getMaxScore());
        }
    }

    private boolean isJudgeCalibrated(Submission submission, UUID judgeUserId) {
        UUID eventId = submission.getRound().getEvent().getId();
        List<CalibrationRound> rounds = calibrationRoundRepository.findByEventId(eventId);
        if (rounds.isEmpty()) {
            return true; // RBL calibration not configured for this event - not applicable.
        }
        return rounds.stream().anyMatch(cr ->
                !calibrationScoreRepository.findByCalibrationRoundId(cr.getId()).stream()
                        .filter(cs -> cs.getJudge().getId().equals(judgeUserId))
                        .toList().isEmpty());
    }
}
