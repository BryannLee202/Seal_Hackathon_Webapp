package com.seal.hackathon.service;

import com.seal.hackathon.domain.entity.HackathonEvent;
import com.seal.hackathon.domain.entity.Team;
import com.seal.hackathon.domain.entity.TeamInvite;
import com.seal.hackathon.domain.entity.TeamMember;
import com.seal.hackathon.domain.entity.Track;
import com.seal.hackathon.domain.entity.User;
import com.seal.hackathon.domain.enums.RoleName;
import com.seal.hackathon.domain.enums.ScopeType;
import com.seal.hackathon.domain.enums.TeamInviteStatus;
import com.seal.hackathon.domain.enums.TeamMemberRole;
import com.seal.hackathon.domain.enums.TeamStatus;
import com.seal.hackathon.dto.team.RegisterTrackRequest;
import com.seal.hackathon.dto.team.TeamInviteRequest;
import com.seal.hackathon.dto.team.TeamInviteResponse;
import com.seal.hackathon.dto.team.TeamMemberResponse;
import com.seal.hackathon.dto.team.TeamRequest;
import com.seal.hackathon.dto.team.TeamResponse;
import com.seal.hackathon.exception.ApiException;
import com.seal.hackathon.repository.TeamInviteRepository;
import com.seal.hackathon.repository.TeamMemberRepository;
import com.seal.hackathon.repository.TeamRepository;
import com.seal.hackathon.repository.TrackRepository;
import com.seal.hackathon.repository.UserRepository;
import com.seal.hackathon.security.AuthenticatedPrincipal;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.UUID;
import java.util.stream.Collectors;

@Service
public class TeamService {

    private static final int MIN_TEAM_SIZE = 3;
    private static final int MAX_TEAM_SIZE = 5;

    private final TeamRepository teamRepository;
    private final TeamMemberRepository teamMemberRepository;
    private final TeamInviteRepository teamInviteRepository;
    private final UserRepository userRepository;
    private final TrackRepository trackRepository;
    private final EventService eventService;

    public TeamService(
            TeamRepository teamRepository,
            TeamMemberRepository teamMemberRepository,
            TeamInviteRepository teamInviteRepository,
            UserRepository userRepository,
            TrackRepository trackRepository,
            EventService eventService
    ) {
        this.teamRepository = teamRepository;
        this.teamMemberRepository = teamMemberRepository;
        this.teamInviteRepository = teamInviteRepository;
        this.userRepository = userRepository;
        this.trackRepository = trackRepository;
        this.eventService = eventService;
    }

    @Transactional
    public TeamResponse create(UUID eventId, TeamRequest request, UUID creatorUserId) {
        HackathonEvent event = eventService.findOrThrow(eventId);
        User creator = userRepository.findById(creatorUserId)
                .orElseThrow(() -> ApiException.notFound("Không tìm thấy người dùng"));

        boolean alreadyInATeam = teamMemberRepository.findByUserId(creatorUserId).stream()
                .anyMatch(tm -> tm.getTeam().getEvent().getId().equals(eventId));
        if (alreadyInATeam) {
            throw ApiException.conflict("Bạn đã thuộc một đội trong sự kiện này");
        }

        Team team = Team.builder()
                .event(event)
                .name(request.name())
                .status(TeamStatus.FORMING)
                .build();
        team = teamRepository.save(team);

        TeamMember leader = TeamMember.builder()
                .team(team)
                .user(creator)
                .roleInTeam(TeamMemberRole.LEADER)
                .build();
        teamMemberRepository.save(leader);

        return toResponse(team);
    }

    @Transactional(readOnly = true)
    public TeamResponse get(UUID teamId, AuthenticatedPrincipal principal) {
        Team team = findOrThrow(teamId);
        assertCanView(team, principal);
        return toResponse(team);
    }

    private void assertCanView(Team team, AuthenticatedPrincipal principal) {
        if (principal.isCoordinator()) {
            return;
        }
        if (teamMemberRepository.existsByTeamIdAndUserId(team.getId(), principal.userId())) {
            return;
        }
        if (team.getTrack() != null
                && principal.hasRoleInScope(RoleName.MENTOR, ScopeType.TRACK, team.getTrack().getId())) {
            return;
        }
        throw ApiException.forbidden("Bạn không có quyền xem thông tin đội này");
    }

    @Transactional(readOnly = true)
    public Page<TeamResponse> listByEvent(UUID eventId, Pageable pageable) {
        return teamRepository.findByEventId(eventId, pageable).map(this::toResponse);
    }

    @Transactional(readOnly = true)
    public List<TeamResponse> listMyTeams(UUID userId) {
        return teamMemberRepository.findByUserId(userId).stream()
                .map(tm -> toResponse(tm.getTeam()))
                .collect(Collectors.toList());
    }

    @Transactional
    public TeamInviteResponse invite(UUID teamId, TeamInviteRequest request, UUID requesterUserId) {
        Team team = findOrThrow(teamId);
        assertIsLeader(team, requesterUserId);

        long currentSize = teamMemberRepository.findByTeamId(teamId).size();
        if (currentSize >= MAX_TEAM_SIZE) {
            throw ApiException.conflict("Đội đã đủ số lượng thành viên tối đa (5)");
        }
        TeamInvite invite = TeamInvite.builder()
                .team(team)
                .invitedEmail(request.email().toLowerCase())
                .status(TeamInviteStatus.PENDING)
                .build();
        return TeamInviteResponse.from(teamInviteRepository.save(invite));
    }

    @Transactional(readOnly = true)
    public List<TeamInviteResponse> myInvites(String email) {
        return teamInviteRepository.findByInvitedEmailIgnoreCase(email).stream()
                .filter(i -> i.getStatus() == TeamInviteStatus.PENDING)
                .map(TeamInviteResponse::from)
                .collect(Collectors.toList());
    }

    @Transactional
    public TeamResponse acceptInvite(UUID inviteId, UUID userId) {
        TeamInvite invite = teamInviteRepository.findById(inviteId)
                .orElseThrow(() -> ApiException.notFound("Không tìm thấy lời mời"));
        User user = userRepository.findById(userId)
                .orElseThrow(() -> ApiException.notFound("Không tìm thấy người dùng"));
        if (!invite.getInvitedEmail().equalsIgnoreCase(user.getEmail())) {
            throw ApiException.forbidden("Lời mời này không dành cho bạn");
        }
        if (invite.getStatus() != TeamInviteStatus.PENDING) {
            throw ApiException.conflict("Lời mời đã được xử lý trước đó");
        }
        Team team = invite.getTeam();
        long currentSize = teamMemberRepository.findByTeamId(team.getId()).size();
        if (currentSize >= MAX_TEAM_SIZE) {
            throw ApiException.conflict("Đội đã đủ số lượng thành viên tối đa (5)");
        }
        if (teamMemberRepository.existsByTeamIdAndUserId(team.getId(), userId)) {
            throw ApiException.conflict("Bạn đã là thành viên của đội này");
        }

        invite.setStatus(TeamInviteStatus.ACCEPTED);
        teamInviteRepository.save(invite);

        TeamMember member = TeamMember.builder()
                .team(team)
                .user(user)
                .roleInTeam(TeamMemberRole.MEMBER)
                .build();
        teamMemberRepository.save(member);

        return toResponse(team);
    }

    @Transactional
    public TeamResponse registerTrack(UUID teamId, RegisterTrackRequest request, UUID requesterUserId) {
        Team team = findOrThrow(teamId);
        assertIsLeader(team, requesterUserId);

        int size = teamMemberRepository.findByTeamId(teamId).size();
        if (size < MIN_TEAM_SIZE) {
            throw ApiException.conflict("Đội cần tối thiểu " + MIN_TEAM_SIZE + " thành viên để đăng ký Hạng mục");
        }
        Track track = trackRepository.findById(request.trackId())
                .orElseThrow(() -> ApiException.notFound("Không tìm thấy Hạng mục"));
        if (!track.getEvent().getId().equals(team.getEvent().getId())) {
            throw ApiException.badRequest("Hạng mục không thuộc sự kiện của đội");
        }
        if (track.getMaxTeams() != null) {
            long registered = teamRepository.findByTrackId(track.getId()).size();
            if (registered >= track.getMaxTeams()) {
                throw ApiException.conflict("Hạng mục đã đủ số lượng đội tối đa");
            }
        }

        team.setTrack(track);
        team.setStatus(TeamStatus.REGISTERED);
        return toResponse(teamRepository.save(team));
    }

    private void assertIsLeader(Team team, UUID userId) {
        TeamMember member = teamMemberRepository.findByTeamIdAndUserId(team.getId(), userId)
                .orElseThrow(() -> ApiException.forbidden("Bạn không phải thành viên của đội này"));
        if (member.getRoleInTeam() != TeamMemberRole.LEADER) {
            throw ApiException.forbidden("Chỉ đội trưởng mới có quyền thực hiện hành động này");
        }
    }

    Team findOrThrow(UUID teamId) {
        return teamRepository.findById(teamId)
                .orElseThrow(() -> ApiException.notFound("Không tìm thấy đội thi"));
    }

    private TeamResponse toResponse(Team team) {
        List<TeamMemberResponse> members = teamMemberRepository.findByTeamId(team.getId()).stream()
                .map(TeamMemberResponse::from)
                .collect(Collectors.toList());
        return TeamResponse.from(team, members);
    }
}
