package com.seal.hackathon.controller;

import com.seal.hackathon.dto.mentor.FeedbackMessageRequest;
import com.seal.hackathon.dto.mentor.FeedbackMessageResponse;
import com.seal.hackathon.security.AuthenticatedPrincipal;
import com.seal.hackathon.service.TeamFeedbackService;
import jakarta.validation.Valid;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RestController;

import java.util.List;
import java.util.UUID;

@RestController
public class TeamFeedbackController {

    private final TeamFeedbackService teamFeedbackService;

    public TeamFeedbackController(TeamFeedbackService teamFeedbackService) {
        this.teamFeedbackService = teamFeedbackService;
    }

    @GetMapping("/api/teams/{teamId}/messages")
    public List<FeedbackMessageResponse> list(
            @PathVariable UUID teamId,
            @AuthenticationPrincipal AuthenticatedPrincipal principal
    ) {
        return teamFeedbackService.list(teamId, principal);
    }

    @PostMapping("/api/teams/{teamId}/messages")
    public FeedbackMessageResponse post(
            @PathVariable UUID teamId,
            @Valid @RequestBody FeedbackMessageRequest request,
            @AuthenticationPrincipal AuthenticatedPrincipal principal
    ) {
        return teamFeedbackService.post(teamId, request, principal);
    }
}
