package com.seal.hackathon.service;

import com.seal.hackathon.domain.entity.Round;
import com.seal.hackathon.domain.entity.Track;
import com.seal.hackathon.domain.entity.User;
import com.seal.hackathon.domain.entity.UserRoleAssignment;
import com.seal.hackathon.domain.enums.RoleName;
import com.seal.hackathon.domain.enums.ScopeType;
import com.seal.hackathon.dto.scoring.JudgeAssignmentRequest;
import com.seal.hackathon.dto.scoring.MentorAssignmentRequest;
import com.seal.hackathon.exception.ApiException;
import com.seal.hackathon.repository.TrackRepository;
import com.seal.hackathon.repository.UserRepository;
import com.seal.hackathon.repository.UserRoleAssignmentRepository;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.UUID;
import java.util.stream.Collectors;

@Service
public class JudgeAssignmentService {

    private final UserRoleAssignmentRepository roleAssignmentRepository;
    private final UserRepository userRepository;
    private final TrackRepository trackRepository;
    private final RoundService roundService;

    public JudgeAssignmentService(
            UserRoleAssignmentRepository roleAssignmentRepository,
            UserRepository userRepository,
            TrackRepository trackRepository,
            RoundService roundService
    ) {
        this.roleAssignmentRepository = roleAssignmentRepository;
        this.userRepository = userRepository;
        this.trackRepository = trackRepository;
        this.roundService = roundService;
    }

    @Transactional
    public void assignJudge(UUID roundId, JudgeAssignmentRequest request) {
        Round round = roundService.findOrThrow(roundId);
        User judge = userRepository.findById(request.judgeUserId())
                .orElseThrow(() -> ApiException.notFound("Không tìm thấy giám khảo"));

        if (roleAssignmentRepository.existsByUserIdAndRoleNameAndScopeTypeAndScopeId(
                judge.getId(), RoleName.JUDGE, ScopeType.ROUND, roundId)) {
            throw ApiException.conflict("Giám khảo đã được phân công cho vòng thi này");
        }

        UserRoleAssignment assignment = UserRoleAssignment.builder()
                .user(judge)
                .roleName(RoleName.JUDGE)
                .scopeType(ScopeType.ROUND)
                .scopeId(roundId)
                .judgeType(request.judgeType())
                .build();
        roleAssignmentRepository.save(assignment);
    }

    @Transactional(readOnly = true)
    public List<UUID> listJudgeIdsForRound(UUID roundId) {
        return roleAssignmentRepository.findByRoleNameAndScopeTypeAndScopeId(RoleName.JUDGE, ScopeType.ROUND, roundId)
                .stream().map(a -> a.getUser().getId()).collect(Collectors.toList());
    }

    @Transactional
    public void assignMentor(UUID trackId, MentorAssignmentRequest request) {
        Track track = trackRepository.findById(trackId)
                .orElseThrow(() -> ApiException.notFound("Không tìm thấy Hạng mục"));
        User mentor = userRepository.findById(request.mentorUserId())
                .orElseThrow(() -> ApiException.notFound("Không tìm thấy giảng viên"));

        if (roleAssignmentRepository.existsByUserIdAndRoleNameAndScopeTypeAndScopeId(
                mentor.getId(), RoleName.MENTOR, ScopeType.TRACK, trackId)) {
            throw ApiException.conflict("Giảng viên đã là Mentor của Hạng mục này");
        }

        UserRoleAssignment assignment = UserRoleAssignment.builder()
                .user(mentor)
                .roleName(RoleName.MENTOR)
                .scopeType(ScopeType.TRACK)
                .scopeId(trackId)
                .build();
        roleAssignmentRepository.save(assignment);
    }

    public boolean isJudgeAssignedToRound(UUID judgeId, UUID roundId) {
        return roleAssignmentRepository.existsByUserIdAndRoleNameAndScopeTypeAndScopeId(
                judgeId, RoleName.JUDGE, ScopeType.ROUND, roundId);
    }
}
