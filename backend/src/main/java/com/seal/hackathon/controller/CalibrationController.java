package com.seal.hackathon.controller;

import com.seal.hackathon.dto.rbl.CalibrationRoundRequest;
import com.seal.hackathon.dto.rbl.CalibrationRoundResponse;
import com.seal.hackathon.dto.rbl.CalibrationScoreItemRequest;
import com.seal.hackathon.dto.rbl.CalibrationScoreResponse;
import com.seal.hackathon.security.AuthenticatedPrincipal;
import com.seal.hackathon.service.CalibrationService;
import jakarta.validation.Valid;
import jakarta.validation.constraints.NotEmpty;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.UUID;

@RestController
public class CalibrationController {

    private final CalibrationService calibrationService;

    public CalibrationController(CalibrationService calibrationService) {
        this.calibrationService = calibrationService;
    }

    @PostMapping("/api/events/{eventId}/calibration-rounds")
    @PreAuthorize("hasRole('COORDINATOR')")
    public CalibrationRoundResponse create(@PathVariable UUID eventId, @Valid @RequestBody CalibrationRoundRequest request) {
        return calibrationService.create(eventId, request);
    }

    @GetMapping("/api/events/{eventId}/calibration-rounds")
    public List<CalibrationRoundResponse> list(@PathVariable UUID eventId) {
        return calibrationService.listByEvent(eventId);
    }

    @PutMapping("/api/calibration-rounds/{calibrationRoundId}/scores")
    @PreAuthorize("hasRole('JUDGE')")
    public List<CalibrationScoreResponse> submitScores(
            @PathVariable UUID calibrationRoundId,
            @NotEmpty @Valid @RequestBody List<CalibrationScoreItemRequest> items,
            @AuthenticationPrincipal AuthenticatedPrincipal principal
    ) {
        return calibrationService.submitScores(calibrationRoundId, items, principal.userId());
    }

    @GetMapping("/api/calibration-rounds/{calibrationRoundId}/distribution")
    public List<CalibrationScoreResponse> distribution(@PathVariable UUID calibrationRoundId) {
        return calibrationService.distribution(calibrationRoundId);
    }
}
