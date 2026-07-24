package com.seal.hackathon.controller;

import com.seal.hackathon.dto.rbl.VarianceStatResponse;
import com.seal.hackathon.service.RblExportService;
import com.seal.hackathon.service.VarianceDashboardService;
import org.springframework.http.HttpHeaders;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.RestController;

import java.nio.charset.StandardCharsets;
import java.util.List;
import java.util.UUID;

@RestController
@PreAuthorize("hasRole('COORDINATOR')")
public class RblController {

    private final VarianceDashboardService varianceDashboardService;
    private final RblExportService rblExportService;

    public RblController(VarianceDashboardService varianceDashboardService, RblExportService rblExportService) {
        this.varianceDashboardService = varianceDashboardService;
        this.rblExportService = rblExportService;
    }

    @GetMapping("/api/rounds/{roundId}/rbl/variance")
    public List<VarianceStatResponse> variance(@PathVariable UUID roundId) {
        return varianceDashboardService.computeForRound(roundId);
    }

    @GetMapping("/api/rounds/{roundId}/rbl/export.csv")
    public ResponseEntity<byte[]> exportCsv(@PathVariable UUID roundId) {
        String csv = rblExportService.exportAnonymizedCsv(roundId);
        byte[] bytes = csv.getBytes(StandardCharsets.UTF_8);
        return ResponseEntity.ok()
                .contentType(MediaType.parseMediaType("text/csv; charset=UTF-8"))
                .header(HttpHeaders.CONTENT_DISPOSITION, "attachment; filename=\"rbl_scores_" + roundId + ".csv\"")
                .body(bytes);
    }
}
