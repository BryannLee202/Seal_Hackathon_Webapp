package com.seal.hackathon.service;

import com.seal.hackathon.domain.entity.HackathonEvent;
import com.seal.hackathon.domain.entity.Round;
import com.seal.hackathon.domain.entity.Submission;
import com.seal.hackathon.domain.entity.Team;
import com.seal.hackathon.domain.entity.TeamMember;
import com.seal.hackathon.domain.entity.Track;
import com.seal.hackathon.domain.enums.RoleName;
import com.seal.hackathon.domain.enums.ScopeType;
import com.seal.hackathon.domain.enums.TeamMemberRole;
import com.seal.hackathon.dto.submission.SubmissionRequest;
import com.seal.hackathon.exception.ApiException;
import com.seal.hackathon.repository.SubmissionRepository;
import com.seal.hackathon.repository.TeamMemberRepository;
import com.seal.hackathon.repository.TeamRepository;
import com.seal.hackathon.security.AuthenticatedPrincipal;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;

import java.time.Instant;
import java.util.Optional;
import java.util.UUID;

import static org.assertj.core.api.Assertions.assertThat;
import static org.assertj.core.api.Assertions.assertThatThrownBy;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.when;

@ExtendWith(MockitoExtension.class)
class SubmissionServiceTest {

    @Mock
    private SubmissionRepository submissionRepository;
    @Mock
    private TeamRepository teamRepository;
    @Mock
    private TeamMemberRepository teamMemberRepository;
    @Mock
    private RoundService roundService;
    @Mock
    private JudgeAssignmentService judgeAssignmentService;

    @InjectMocks
    private SubmissionService submissionService;

    private UUID teamId;
    private UUID roundId;
    private UUID userId;
    private HackathonEvent event;
    private Team team;
    private Round round;
    private SubmissionRequest request;

    @BeforeEach
    void setUp() {
        teamId = UUID.randomUUID();
        roundId = UUID.randomUUID();
        userId = UUID.randomUUID();

        event = HackathonEvent.builder().build();
        event.setId(UUID.randomUUID());

        team = Team.builder().event(event).name("Team A").track(Track.builder().build()).build();
        team.setId(teamId);

        round = Round.builder().event(event).submissionDeadline(Instant.now().plusSeconds(3600)).build();
        round.setId(roundId);

        request = new SubmissionRequest("https://github.com/example/repo", null, null);

        org.mockito.Mockito.lenient().when(teamRepository.findById(teamId)).thenReturn(Optional.of(team));
        org.mockito.Mockito.lenient().when(roundService.findOrThrow(roundId)).thenReturn(round);
    }

    @Test
    void submit_shouldThrowForbidden_whenRequesterIsNotTeamMember() {
        when(teamMemberRepository.findByTeamIdAndUserId(teamId, userId)).thenReturn(Optional.empty());

        assertThatThrownBy(() -> submissionService.submit(teamId, roundId, request, userId))
                .isInstanceOf(ApiException.class)
                .hasMessageContaining("không phải thành viên");
    }

    @Test
    void submit_shouldThrowForbidden_whenRequesterIsNotLeader() {
        TeamMember member = TeamMember.builder().team(team).roleInTeam(TeamMemberRole.MEMBER).build();
        when(teamMemberRepository.findByTeamIdAndUserId(teamId, userId)).thenReturn(Optional.of(member));

        assertThatThrownBy(() -> submissionService.submit(teamId, roundId, request, userId))
                .isInstanceOf(ApiException.class)
                .hasMessageContaining("Chỉ đội trưởng");
    }

    @Test
    void submit_shouldThrowConflict_whenTeamHasNoTrack() {
        team.setTrack(null);
        TeamMember member = TeamMember.builder().team(team).roleInTeam(TeamMemberRole.LEADER).build();
        when(teamMemberRepository.findByTeamIdAndUserId(teamId, userId)).thenReturn(Optional.of(member));

        assertThatThrownBy(() -> submissionService.submit(teamId, roundId, request, userId))
                .isInstanceOf(ApiException.class)
                .hasMessageContaining("chưa đăng ký Hạng mục");
    }

    @Test
    void submit_shouldThrowBadRequest_whenRoundBelongsToDifferentEvent() {
        HackathonEvent otherEvent = HackathonEvent.builder().build();
        otherEvent.setId(UUID.randomUUID());
        round.setEvent(otherEvent);
        TeamMember member = TeamMember.builder().team(team).roleInTeam(TeamMemberRole.LEADER).build();
        when(teamMemberRepository.findByTeamIdAndUserId(teamId, userId)).thenReturn(Optional.of(member));

        assertThatThrownBy(() -> submissionService.submit(teamId, roundId, request, userId))
                .isInstanceOf(ApiException.class)
                .hasMessageContaining("không thuộc sự kiện");
    }

    @Test
    void submit_shouldThrowConflict_whenSubmissionDeadlinePassed() {
        round.setSubmissionDeadline(Instant.now().minusSeconds(3600));
        TeamMember member = TeamMember.builder().team(team).roleInTeam(TeamMemberRole.LEADER).build();
        when(teamMemberRepository.findByTeamIdAndUserId(teamId, userId)).thenReturn(Optional.of(member));

        assertThatThrownBy(() -> submissionService.submit(teamId, roundId, request, userId))
                .isInstanceOf(ApiException.class)
                .hasMessageContaining("quá hạn nộp bài");
    }

    @Test
    void submit_shouldSucceed_whenLeaderSubmitsBeforeDeadline() {
        TeamMember member = TeamMember.builder().team(team).roleInTeam(TeamMemberRole.LEADER).build();
        when(teamMemberRepository.findByTeamIdAndUserId(teamId, userId)).thenReturn(Optional.of(member));
        when(submissionRepository.findByTeamIdAndRoundId(teamId, roundId)).thenReturn(Optional.empty());
        when(submissionRepository.save(any(Submission.class))).thenAnswer(invocation -> {
            Submission submission = invocation.getArgument(0);
            submission.setId(UUID.randomUUID());
            return submission;
        });

        var response = submissionService.submit(teamId, roundId, request, userId);

        assertThat(response.repoUrl()).isEqualTo(request.repoUrl());
    }

    private AuthenticatedPrincipal principalWithRole(UUID id, RoleName roleName) {
        return new AuthenticatedPrincipal(id, "user@example.com", "User",
                java.util.List.of(new AuthenticatedPrincipal.RoleGrant(roleName, ScopeType.GLOBAL, null, null)));
    }

    @Test
    void get_shouldThrowForbidden_whenRequesterHasNoRelationToSubmission() {
        Submission submission = Submission.builder().team(team).round(round).build();
        submission.setId(UUID.randomUUID());
        when(submissionRepository.findById(submission.getId())).thenReturn(Optional.of(submission));
        when(teamMemberRepository.existsByTeamIdAndUserId(teamId, userId)).thenReturn(false);
        when(judgeAssignmentService.isJudgeAssignedToRound(userId, roundId)).thenReturn(false);

        AuthenticatedPrincipal outsider = principalWithRole(userId, RoleName.TEAM_MEMBER);

        assertThatThrownBy(() -> submissionService.get(submission.getId(), outsider))
                .isInstanceOf(ApiException.class)
                .hasMessageContaining("không có quyền xem bài nộp");
    }

    @Test
    void get_shouldSucceed_whenRequesterIsTeamMember() {
        Submission submission = Submission.builder().team(team).round(round).repoUrl("https://x").build();
        submission.setId(UUID.randomUUID());
        when(submissionRepository.findById(submission.getId())).thenReturn(Optional.of(submission));
        when(teamMemberRepository.existsByTeamIdAndUserId(teamId, userId)).thenReturn(true);

        AuthenticatedPrincipal member = principalWithRole(userId, RoleName.TEAM_MEMBER);

        var response = submissionService.get(submission.getId(), member);

        assertThat(response.repoUrl()).isEqualTo("https://x");
    }

    @Test
    void get_shouldSucceed_whenRequesterIsCoordinator() {
        Submission submission = Submission.builder().team(team).round(round).repoUrl("https://x").build();
        submission.setId(UUID.randomUUID());
        when(submissionRepository.findById(submission.getId())).thenReturn(Optional.of(submission));

        AuthenticatedPrincipal coordinator = principalWithRole(UUID.randomUUID(), RoleName.COORDINATOR);

        var response = submissionService.get(submission.getId(), coordinator);

        assertThat(response.repoUrl()).isEqualTo("https://x");
    }

    @Test
    void get_shouldSucceed_whenRequesterIsJudgeAssignedToRound() {
        Submission submission = Submission.builder().team(team).round(round).repoUrl("https://x").build();
        submission.setId(UUID.randomUUID());
        UUID judgeId = UUID.randomUUID();
        when(submissionRepository.findById(submission.getId())).thenReturn(Optional.of(submission));
        when(teamMemberRepository.existsByTeamIdAndUserId(teamId, judgeId)).thenReturn(false);
        when(judgeAssignmentService.isJudgeAssignedToRound(judgeId, roundId)).thenReturn(true);

        AuthenticatedPrincipal judgePrincipal = principalWithRole(judgeId, RoleName.JUDGE);

        var response = submissionService.get(submission.getId(), judgePrincipal);

        assertThat(response.repoUrl()).isEqualTo("https://x");
    }
}
