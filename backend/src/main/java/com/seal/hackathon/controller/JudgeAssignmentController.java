package com.seal.hackathon.controller;

import com.seal.hackathon.dto.scoring.JudgeAssignmentRequest;
import com.seal.hackathon.dto.scoring.MentorAssignmentRequest;
import com.seal.hackathon.service.JudgeAssignmentService;
import jakarta.validation.Valid;
import org.springframework.http.HttpStatus;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.UUID;

@RestController
@PreAuthorize("hasRole('COORDINATOR')")
public class JudgeAssignmentController {

    private final JudgeAssignmentService judgeAssignmentService;

    public JudgeAssignmentController(JudgeAssignmentService judgeAssignmentService) {
        this.judgeAssignmentService = judgeAssignmentService;
    }

    @PostMapping("/api/rounds/{roundId}/judges")
    @ResponseStatus(HttpStatus.CREATED)
    public void assignJudge(@PathVariable UUID roundId, @Valid @RequestBody JudgeAssignmentRequest request) {
        judgeAssignmentService.assignJudge(roundId, request);
    }

    @GetMapping("/api/rounds/{roundId}/judges")
    public List<UUID> listJudges(@PathVariable UUID roundId) {
        return judgeAssignmentService.listJudgeIdsForRound(roundId);
    }

    @PostMapping("/api/tracks/{trackId}/mentors")
    @ResponseStatus(HttpStatus.CREATED)
    public void assignMentor(@PathVariable UUID trackId, @Valid @RequestBody MentorAssignmentRequest request) {
        judgeAssignmentService.assignMentor(trackId, request);
    }
}
