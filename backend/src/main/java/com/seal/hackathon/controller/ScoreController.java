package com.seal.hackathon.controller;

import com.seal.hackathon.dto.scoring.ScoreBatchRequest;
import com.seal.hackathon.dto.scoring.ScoreResponse;
import com.seal.hackathon.security.AuthenticatedPrincipal;
import com.seal.hackathon.service.ScoreService;
import jakarta.validation.Valid;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.UUID;

@RestController
@RequestMapping("/api/submissions/{submissionId}/scores")
public class ScoreController {

    private final ScoreService scoreService;

    public ScoreController(ScoreService scoreService) {
        this.scoreService = scoreService;
    }

    @PutMapping
    @PreAuthorize("hasRole('JUDGE')")
    public List<ScoreResponse> submit(
            @PathVariable UUID submissionId,
            @Valid @RequestBody ScoreBatchRequest request,
            @AuthenticationPrincipal AuthenticatedPrincipal principal
    ) {
        return scoreService.submitScores(submissionId, request, principal.userId());
    }

    @GetMapping
    public List<ScoreResponse> list(@PathVariable UUID submissionId) {
        return scoreService.listBySubmission(submissionId);
    }
}
