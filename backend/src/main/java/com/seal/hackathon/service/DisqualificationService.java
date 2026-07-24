package com.seal.hackathon.service;

import com.seal.hackathon.domain.entity.Disqualification;
import com.seal.hackathon.domain.entity.Submission;
import com.seal.hackathon.domain.entity.Team;
import com.seal.hackathon.domain.entity.User;
import com.seal.hackathon.domain.enums.AuditAction;
import com.seal.hackathon.domain.enums.DisqualificationTargetType;
import com.seal.hackathon.domain.enums.TeamStatus;
import com.seal.hackathon.dto.scoring.DisqualificationRequest;
import com.seal.hackathon.dto.scoring.DisqualificationResponse;
import com.seal.hackathon.exception.ApiException;
import com.seal.hackathon.repository.DisqualificationRepository;
import com.seal.hackathon.repository.SubmissionRepository;
import com.seal.hackathon.repository.TeamRepository;
import com.seal.hackathon.repository.UserRepository;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.Instant;
import java.util.ArrayList;
import java.util.List;
import java.util.UUID;
import java.util.stream.Collectors;

@Service
public class DisqualificationService {

    private final DisqualificationRepository disqualificationRepository;
    private final TeamRepository teamRepository;
    private final SubmissionRepository submissionRepository;
    private final UserRepository userRepository;
    private final AuditService auditService;

    public DisqualificationService(
            DisqualificationRepository disqualificationRepository,
            TeamRepository teamRepository,
            SubmissionRepository submissionRepository,
            UserRepository userRepository,
            AuditService auditService
    ) {
        this.disqualificationRepository = disqualificationRepository;
        this.teamRepository = teamRepository;
        this.submissionRepository = submissionRepository;
        this.userRepository = userRepository;
        this.auditService = auditService;
    }

    @Transactional
    public DisqualificationResponse disqualify(DisqualificationRequest request, UUID actorId) {
        User actor = userRepository.findById(actorId)
                .orElseThrow(() -> ApiException.notFound("Không tìm thấy người dùng"));

        Team team = null;
        Submission submission = null;
        if (request.targetType() == DisqualificationTargetType.TEAM) {
            team = teamRepository.findById(request.teamId())
                    .orElseThrow(() -> ApiException.notFound("Không tìm thấy đội thi"));
            team.setStatus(TeamStatus.DISQUALIFIED);
            teamRepository.save(team);
        } else {
            submission = submissionRepository.findById(request.submissionId())
                    .orElseThrow(() -> ApiException.notFound("Không tìm thấy bài nộp"));
        }

        Disqualification disqualification = Disqualification.builder()
                .targetType(request.targetType())
                .team(team)
                .submission(submission)
                .reason(request.reason())
                .decidedBy(actor)
                .decidedAt(Instant.now())
                .revoked(false)
                .build();
        disqualification = disqualificationRepository.save(disqualification);

        AuditAction action = request.targetType() == DisqualificationTargetType.TEAM
                ? AuditAction.TEAM_DISQUALIFY : AuditAction.SUBMISSION_DISQUALIFY;
        UUID entityId = request.targetType() == DisqualificationTargetType.TEAM ? request.teamId() : request.submissionId();
        auditService.record(actorId, action,
                request.targetType() == DisqualificationTargetType.TEAM ? "Team" : "Submission",
                entityId, null, request.reason());

        return DisqualificationResponse.from(disqualification);
    }

    @Transactional(readOnly = true)
    public List<DisqualificationResponse> listByEvent(UUID eventId) {
        List<Disqualification> all = new ArrayList<>();
        all.addAll(disqualificationRepository.findByTeam_Event_Id(eventId));
        all.addAll(disqualificationRepository.findBySubmission_Round_Event_Id(eventId));
        return all.stream().map(DisqualificationResponse::from).collect(Collectors.toList());
    }
}
