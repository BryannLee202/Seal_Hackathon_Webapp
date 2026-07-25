package com.seal.hackathon.service;

import com.seal.hackathon.domain.entity.UserRoleAssignment;
import com.seal.hackathon.domain.enums.RoleName;
import com.seal.hackathon.domain.enums.ScopeType;
import com.seal.hackathon.dto.team.TeamResponse;
import com.seal.hackathon.repository.UserRoleAssignmentRepository;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.UUID;
import java.util.stream.Collectors;

@Service
public class MentorService {

    private final UserRoleAssignmentRepository roleAssignmentRepository;
    private final TeamService teamService;

    public MentorService(UserRoleAssignmentRepository roleAssignmentRepository, TeamService teamService) {
        this.roleAssignmentRepository = roleAssignmentRepository;
        this.teamService = teamService;
    }

    @Transactional(readOnly = true)
    public List<TeamResponse> listMyTeams(UUID mentorUserId) {
        List<UUID> trackIds = roleAssignmentRepository.findByUserId(mentorUserId).stream()
                .filter(a -> a.getRoleName() == RoleName.MENTOR && a.getScopeType() == ScopeType.TRACK)
                .map(UserRoleAssignment::getScopeId)
                .collect(Collectors.toList());
        return teamService.listByTracks(trackIds);
    }
}
