package com.seal.hackathon.controller;

import com.seal.hackathon.dto.scoring.DisqualificationRequest;
import com.seal.hackathon.dto.scoring.DisqualificationResponse;
import com.seal.hackathon.security.AuthenticatedPrincipal;
import com.seal.hackathon.service.DisqualificationService;
import jakarta.validation.Valid;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import java.util.List;
import java.util.UUID;

@RestController
@PreAuthorize("hasRole('COORDINATOR')")
public class DisqualificationController {

    private final DisqualificationService disqualificationService;

    public DisqualificationController(DisqualificationService disqualificationService) {
        this.disqualificationService = disqualificationService;
    }

    @PostMapping("/api/disqualifications")
    public DisqualificationResponse disqualify(
            @Valid @RequestBody DisqualificationRequest request,
            @AuthenticationPrincipal AuthenticatedPrincipal principal
    ) {
        return disqualificationService.disqualify(request, principal.userId());
    }

    @GetMapping("/api/events/{eventId}/disqualifications")
    public List<DisqualificationResponse> listByEvent(@PathVariable UUID eventId) {
        return disqualificationService.listByEvent(eventId);
    }
}
