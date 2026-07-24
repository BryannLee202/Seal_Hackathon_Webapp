package com.seal.hackathon.controller;

import com.seal.hackathon.dto.criteria.CriterionRequest;
import com.seal.hackathon.dto.criteria.CriterionResponse;
import com.seal.hackathon.service.RoundCriterionService;
import jakarta.validation.Valid;
import org.springframework.http.HttpStatus;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.UUID;

@RestController
@RequestMapping("/api/rounds/{roundId}/criteria")
public class RoundCriterionController {

    private final RoundCriterionService service;

    public RoundCriterionController(RoundCriterionService service) {
        this.service = service;
    }

    @GetMapping
    public List<CriterionResponse> list(@PathVariable UUID roundId) {
        return service.list(roundId);
    }

    @PostMapping
    @PreAuthorize("hasRole('COORDINATOR')")
    public CriterionResponse add(@PathVariable UUID roundId, @Valid @RequestBody CriterionRequest request) {
        return service.add(roundId, request);
    }

    @PutMapping("/{criterionId}")
    @PreAuthorize("hasRole('COORDINATOR')")
    public CriterionResponse update(@PathVariable UUID roundId, @PathVariable UUID criterionId, @Valid @RequestBody CriterionRequest request) {
        return service.update(roundId, criterionId, request);
    }

    @DeleteMapping("/{criterionId}")
    @PreAuthorize("hasRole('COORDINATOR')")
    @ResponseStatus(HttpStatus.NO_CONTENT)
    public void remove(@PathVariable UUID roundId, @PathVariable UUID criterionId) {
        service.remove(roundId, criterionId);
    }
}
