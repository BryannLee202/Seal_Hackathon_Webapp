package com.seal.hackathon.controller;

import com.seal.hackathon.dto.criteria.CriteriaTemplateRequest;
import com.seal.hackathon.dto.criteria.CriteriaTemplateResponse;
import com.seal.hackathon.dto.criteria.CriterionRequest;
import com.seal.hackathon.dto.criteria.CriterionResponse;
import com.seal.hackathon.service.CriteriaTemplateService;
import jakarta.validation.Valid;
import org.springframework.http.HttpStatus;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.UUID;

@RestController
@RequestMapping("/api/criteria-templates")
public class CriteriaTemplateController {

    private final CriteriaTemplateService templateService;

    public CriteriaTemplateController(CriteriaTemplateService templateService) {
        this.templateService = templateService;
    }

    @PostMapping
    @PreAuthorize("hasRole('COORDINATOR')")
    public CriteriaTemplateResponse create(@Valid @RequestBody CriteriaTemplateRequest request) {
        return templateService.create(request);
    }

    @GetMapping
    public List<CriteriaTemplateResponse> list() {
        return templateService.list();
    }

    @GetMapping("/{id}")
    public CriteriaTemplateResponse get(@PathVariable UUID id) {
        return templateService.get(id);
    }

    @PostMapping("/{id}/criteria")
    @PreAuthorize("hasRole('COORDINATOR')")
    public CriterionResponse addCriterion(@PathVariable UUID id, @Valid @RequestBody CriterionRequest request) {
        return templateService.addCriterion(id, request);
    }

    @DeleteMapping("/{id}/criteria/{criterionId}")
    @PreAuthorize("hasRole('COORDINATOR')")
    @ResponseStatus(HttpStatus.NO_CONTENT)
    public void removeCriterion(@PathVariable UUID id, @PathVariable UUID criterionId) {
        templateService.removeCriterion(id, criterionId);
    }
}
