package com.seal.hackathon.controller;

import com.seal.hackathon.dto.team.*;
import com.seal.hackathon.security.AuthenticatedPrincipal;
import com.seal.hackathon.service.TeamService;
import jakarta.validation.Valid;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.web.PageableDefault;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.UUID;

@RestController
public class TeamController {

    private final TeamService teamService;

    public TeamController(TeamService teamService) {
        this.teamService = teamService;
    }

    @PostMapping("/api/events/{eventId}/teams")
    public TeamResponse create(
            @PathVariable UUID eventId,
            @Valid @RequestBody TeamRequest request,
            @AuthenticationPrincipal AuthenticatedPrincipal principal
    ) {
        return teamService.create(eventId, request, principal.userId());
    }

    @GetMapping("/api/events/{eventId}/teams")
    @PreAuthorize("hasRole('COORDINATOR')")
    public Page<TeamResponse> list(@PathVariable UUID eventId, @PageableDefault(size = 200) Pageable pageable) {
        return teamService.listByEvent(eventId, pageable);
    }

    @GetMapping("/api/teams/{teamId}")
    public TeamResponse get(@PathVariable UUID teamId, @AuthenticationPrincipal AuthenticatedPrincipal principal) {
        return teamService.get(teamId, principal);
    }

    @PostMapping("/api/teams/{teamId}/invites")
    public TeamInviteResponse invite(
            @PathVariable UUID teamId,
            @Valid @RequestBody TeamInviteRequest request,
            @AuthenticationPrincipal AuthenticatedPrincipal principal
    ) {
        return teamService.invite(teamId, request, principal.userId());
    }

    @GetMapping("/api/me/teams")
    public List<TeamResponse> myTeams(@AuthenticationPrincipal AuthenticatedPrincipal principal) {
        return teamService.listMyTeams(principal.userId());
    }

    @GetMapping("/api/me/invites")
    public List<TeamInviteResponse> myInvites(@AuthenticationPrincipal AuthenticatedPrincipal principal) {
        return teamService.myInvites(principal.email());
    }

    @PostMapping("/api/invites/{inviteId}/accept")
    public TeamResponse acceptInvite(@PathVariable UUID inviteId, @AuthenticationPrincipal AuthenticatedPrincipal principal) {
        return teamService.acceptInvite(inviteId, principal.userId());
    }

    @PostMapping("/api/teams/{teamId}/register-track")
    public TeamResponse registerTrack(
            @PathVariable UUID teamId,
            @Valid @RequestBody RegisterTrackRequest request,
            @AuthenticationPrincipal AuthenticatedPrincipal principal
    ) {
        return teamService.registerTrack(teamId, request, principal.userId());
    }
}
