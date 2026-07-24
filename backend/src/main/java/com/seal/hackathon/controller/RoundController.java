package com.seal.hackathon.controller;

import com.seal.hackathon.dto.event.RoundRequest;
import com.seal.hackathon.dto.event.RoundResponse;
import com.seal.hackathon.security.AuthenticatedPrincipal;
import com.seal.hackathon.service.RoundService;
import jakarta.validation.Valid;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.UUID;

@RestController
public class RoundController {

    private final RoundService roundService;

    public RoundController(RoundService roundService) {
        this.roundService = roundService;
    }

    @PostMapping("/api/events/{eventId}/rounds")
    @PreAuthorize("hasRole('COORDINATOR')")
    public RoundResponse create(@PathVariable UUID eventId, @Valid @RequestBody RoundRequest request) {
        return roundService.create(eventId, request);
    }

    @GetMapping("/api/events/{eventId}/rounds")
    public List<RoundResponse> list(@PathVariable UUID eventId) {
        return roundService.listByEvent(eventId);
    }

    @GetMapping("/api/rounds/{roundId}")
    public RoundResponse get(@PathVariable UUID roundId) {
        return roundService.get(roundId);
    }

    @PutMapping("/api/rounds/{roundId}")
    @PreAuthorize("hasRole('COORDINATOR')")
    public RoundResponse update(@PathVariable UUID roundId, @Valid @RequestBody RoundRequest request) {
        return roundService.update(roundId, request);
    }

    @PostMapping("/api/rounds/{roundId}/publish-results")
    @PreAuthorize("hasRole('COORDINATOR')")
    public RoundResponse publishResults(@PathVariable UUID roundId, @AuthenticationPrincipal AuthenticatedPrincipal principal) {
        return roundService.publishResults(roundId, principal.userId());
    }
}
