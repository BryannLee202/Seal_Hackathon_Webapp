package com.seal.hackathon.controller;

import com.seal.hackathon.dto.submission.SubmissionRequest;
import com.seal.hackathon.dto.submission.SubmissionResponse;
import com.seal.hackathon.security.AuthenticatedPrincipal;
import com.seal.hackathon.service.SubmissionService;
import jakarta.validation.Valid;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.web.PageableDefault;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.*;

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
    public SubmissionResponse get(
            @PathVariable UUID teamId,
            @PathVariable UUID roundId,
            @AuthenticationPrincipal AuthenticatedPrincipal principal
    ) {
        return submissionService.getByTeamAndRound(teamId, roundId, principal);
    }

    @GetMapping("/api/rounds/{roundId}/submissions")
    public Page<SubmissionResponse> listByRound(
            @PathVariable UUID roundId,
            @AuthenticationPrincipal AuthenticatedPrincipal principal,
            @PageableDefault(size = 200) Pageable pageable
    ) {
        return submissionService.listByRound(roundId, principal, pageable);
    }

    @GetMapping("/api/submissions/{submissionId}")
    public SubmissionResponse get(@PathVariable UUID submissionId, @AuthenticationPrincipal AuthenticatedPrincipal principal) {
        return submissionService.get(submissionId, principal);
    }
}
