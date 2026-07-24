package com.seal.hackathon.controller;

import com.seal.hackathon.service.ReportExportService;
import org.springframework.http.HttpHeaders;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.RestController;

import java.util.UUID;

@RestController
public class ReportExportController {

    private final ReportExportService reportExportService;

    public ReportExportController(ReportExportService reportExportService) {
        this.reportExportService = reportExportService;
    }

    @GetMapping("/api/rounds/{roundId}/rankings/export.xlsx")
    public ResponseEntity<byte[]> exportRankingExcel(@PathVariable UUID roundId) {
        byte[] bytes = reportExportService.exportRankingExcel(roundId);
        return ResponseEntity.ok()
                .contentType(MediaType.parseMediaType("application/vnd.openxmlformats-officedocument.spreadsheetml.sheet"))
                .header(HttpHeaders.CONTENT_DISPOSITION, "attachment; filename=\"ranking_" + roundId + ".xlsx\"")
                .body(bytes);
    }
}
