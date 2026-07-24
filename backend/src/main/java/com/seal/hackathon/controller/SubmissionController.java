package com.seal.hackathon.controller;

import com.seal.hackathon.dto.submission.SubmissionRequest;
import com.seal.hackathon.dto.submission.SubmissionResponse;
import com.seal.hackathon.security.AuthenticatedPrincipal;
import com.seal.hackathon.service.SubmissionService;
import jakarta.validation.Valid;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.UUID;

@RestController
public class SubmissionController {

    private final SubmissionService submissionService;

    public SubmissionController(SubmissionService submissionService) {
        this.submissionService = submissionService;
    }

    @PutMapping("/api/teams/{teamId}/rounds/{roundId}/submission")
    public SubmissionResponse submit(
            @PathVariable UUID teamId,
            @PathVariable UUID roundId,
            @Valid @RequestBody SubmissionRequest request,
            @AuthenticationPrincipal AuthenticatedPrincipal principal
    ) {
        return submissionService.submit(teamId, roundId, request, principal.userId());
    }

    @GetMapping("/api/teams/{teamId}/rounds/{roundId}/submission")
    public SubmissionResponse get(@PathVariable UUID teamId, @PathVariable UUID roundId) {
        return submissionService.getByTeamAndRound(teamId, roundId);
    }

    @GetMapping("/api/rounds/{roundId}/submissions")
    public List<SubmissionResponse> listByRound(@PathVariable UUID roundId) {
        return submissionService.listByRound(roundId);
    }

    @GetMapping("/api/submissions/{submissionId}")
    public SubmissionResponse get(@PathVariable UUID submissionId) {
        return submissionService.get(submissionId);
    }
}
