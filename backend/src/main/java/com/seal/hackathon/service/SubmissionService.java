package com.seal.hackathon.service;

import com.seal.hackathon.domain.entity.Round;
import com.seal.hackathon.domain.entity.Submission;
import com.seal.hackathon.domain.entity.Team;
import com.seal.hackathon.domain.entity.TeamMember;
import com.seal.hackathon.domain.enums.TeamMemberRole;
import com.seal.hackathon.dto.submission.SubmissionRequest;
import com.seal.hackathon.dto.submission.SubmissionResponse;
import com.seal.hackathon.exception.ApiException;
import com.seal.hackathon.repository.SubmissionRepository;
import com.seal.hackathon.repository.TeamMemberRepository;
import com.seal.hackathon.repository.TeamRepository;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.Instant;
import java.util.List;
import java.util.UUID;
import java.util.stream.Collectors;

@Service
public class SubmissionService {

    private final SubmissionRepository submissionRepository;
    private final TeamRepository teamRepository;
    private final TeamMemberRepository teamMemberRepository;
    private final RoundService roundService;

    public SubmissionService(
            SubmissionRepository submissionRepository,
            TeamRepository teamRepository,
            TeamMemberRepository teamMemberRepository,
            RoundService roundService
    ) {
        this.submissionRepository = submissionRepository;
        this.teamRepository = teamRepository;
        this.teamMemberRepository = teamMemberRepository;
        this.roundService = roundService;
    }

    @Transactional
    public SubmissionResponse submit(UUID teamId, UUID roundId, SubmissionRequest request, UUID requesterUserId) {
        Team team = teamRepository.findById(teamId)
                .orElseThrow(() -> ApiException.notFound("Không tìm thấy đội thi"));
        Round round = roundService.findOrThrow(roundId);

        TeamMember member = teamMemberRepository.findByTeamIdAndUserId(teamId, requesterUserId)
                .orElseThrow(() -> ApiException.forbidden("Bạn không phải thành viên của đội này"));
        if (member.getRoleInTeam() != TeamMemberRole.LEADER) {
            throw ApiException.forbidden("Chỉ đội trưởng mới có quyền nộp bài");
        }
        if (team.getTrack() == null) {
            throw ApiException.conflict("Đội chưa đăng ký Hạng mục, không thể nộp bài");
        }
        if (!round.getEvent().getId().equals(team.getEvent().getId())) {
            throw ApiException.badRequest("Vòng thi không thuộc sự kiện của đội");
        }
        if (Instant.now().isAfter(round.getSubmissionDeadline())) {
            throw ApiException.conflict("Đã quá hạn nộp bài cho vòng thi này");
        }

        Submission submission = submissionRepository.findByTeamIdAndRoundId(teamId, roundId)
                .orElseGet(() -> Submission.builder().team(team).round(round).build());
        submission.setRepoUrl(request.repoUrl());
        submission.setDemoUrl(request.demoUrl());
        submission.setDocUrl(request.docUrl());
        submission.setSubmittedAt(Instant.now());
        submission.setLate(false);

        return SubmissionResponse.from(submissionRepository.save(submission));
    }

    @Transactional(readOnly = true)
    public List<SubmissionResponse> listByRound(UUID roundId) {
        return submissionRepository.findByRoundId(roundId).stream()
                .map(SubmissionResponse::from)
                .collect(Collectors.toList());
    }

    @Transactional(readOnly = true)
    public SubmissionResponse getByTeamAndRound(UUID teamId, UUID roundId) {
        return submissionRepository.findByTeamIdAndRoundId(teamId, roundId)
                .map(SubmissionResponse::from)
                .orElseThrow(() -> ApiException.notFound("Đội chưa nộp bài cho vòng thi này"));
    }

    @Transactional(readOnly = true)
    public SubmissionResponse get(UUID submissionId) {
        return submissionRepository.findById(submissionId)
                .map(SubmissionResponse::from)
                .orElseThrow(() -> ApiException.notFound("Không tìm thấy bài nộp"));
    }
}
