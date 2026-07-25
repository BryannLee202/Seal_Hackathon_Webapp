package com.seal.hackathon.service;

import com.seal.hackathon.domain.entity.MentorFeedbackMessage;
import com.seal.hackathon.domain.entity.Team;
import com.seal.hackathon.domain.entity.User;
import com.seal.hackathon.domain.enums.AuditAction;
import com.seal.hackathon.domain.enums.FeedbackAuthorRole;
import com.seal.hackathon.domain.enums.RoleName;
import com.seal.hackathon.domain.enums.ScopeType;
import com.seal.hackathon.dto.mentor.FeedbackMessageRequest;
import com.seal.hackathon.dto.mentor.FeedbackMessageResponse;
import com.seal.hackathon.exception.ApiException;
import com.seal.hackathon.repository.MentorFeedbackMessageRepository;
import com.seal.hackathon.repository.TeamMemberRepository;
import com.seal.hackathon.repository.TeamRepository;
import com.seal.hackathon.repository.UserRepository;
import com.seal.hackathon.security.AuthenticatedPrincipal;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.UUID;
import java.util.stream.Collectors;

@Service
public class TeamFeedbackService {

    private final TeamRepository teamRepository;
    private final TeamMemberRepository teamMemberRepository;
    private final MentorFeedbackMessageRepository messageRepository;
    private final UserRepository userRepository;
    private final AuditService auditService;

    public TeamFeedbackService(
            TeamRepository teamRepository,
            TeamMemberRepository teamMemberRepository,
            MentorFeedbackMessageRepository messageRepository,
            UserRepository userRepository,
            AuditService auditService
    ) {
        this.teamRepository = teamRepository;
        this.teamMemberRepository = teamMemberRepository;
        this.messageRepository = messageRepository;
        this.userRepository = userRepository;
        this.auditService = auditService;
    }

    @Transactional(readOnly = true)
    public List<FeedbackMessageResponse> list(UUID teamId, AuthenticatedPrincipal principal) {
        Team team = findOrThrow(teamId);
        assertCanAccess(team, principal);
        return messageRepository.findByTeamIdWithAuthorOrderByCreatedAtAsc(teamId).stream()
                .map(m -> FeedbackMessageResponse.from(m, teamId))
                .collect(Collectors.toList());
    }

    @Transactional
    public FeedbackMessageResponse post(UUID teamId, FeedbackMessageRequest request, AuthenticatedPrincipal principal) {
        Team team = findOrThrow(teamId);
        FeedbackAuthorRole role = assertCanAccess(team, principal);
        User author = userRepository.findById(principal.userId())
                .orElseThrow(() -> ApiException.notFound("Không tìm thấy người dùng"));

        MentorFeedbackMessage message = MentorFeedbackMessage.builder()
                .team(team)
                .author(author)
                .authorRole(role)
                .body(request.body().trim())
                .build();
        message = messageRepository.save(message);

        auditService.record(principal.userId(), AuditAction.MENTOR_MESSAGE_SEND, "Team", teamId, null, role.name());
        return FeedbackMessageResponse.from(message, teamId);
    }

    /** Returns the role the caller is acting as; the role is always derived server-side, never taken from the client. */
    private FeedbackAuthorRole assertCanAccess(Team team, AuthenticatedPrincipal principal) {
        if (teamMemberRepository.existsByTeamIdAndUserId(team.getId(), principal.userId())) {
            return FeedbackAuthorRole.TEAM_MEMBER;
        }
        if (team.getTrack() != null
                && principal.hasRoleInScope(RoleName.MENTOR, ScopeType.TRACK, team.getTrack().getId())) {
            return FeedbackAuthorRole.MENTOR;
        }
        if (principal.isCoordinator()) {
            return FeedbackAuthorRole.MENTOR;
        }
        throw ApiException.forbidden("Bạn không có quyền truy cập trao đổi của đội này");
    }

    private Team findOrThrow(UUID teamId) {
        return teamRepository.findById(teamId)
                .orElseThrow(() -> ApiException.notFound("Không tìm thấy đội thi"));
    }
}
