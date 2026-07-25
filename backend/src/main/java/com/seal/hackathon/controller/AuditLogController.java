package com.seal.hackathon.controller;

import com.seal.hackathon.dto.audit.AuditLogResponse;
import com.seal.hackathon.service.AuditLogQueryService;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

import java.util.UUID;

@RestController
@RequestMapping("/api/admin/audit-logs")
@PreAuthorize("hasRole('COORDINATOR')")
public class AuditLogController {

    private final AuditLogQueryService auditLogQueryService;

    public AuditLogController(AuditLogQueryService auditLogQueryService) {
        this.auditLogQueryService = auditLogQueryService;
    }

    @GetMapping
    public Page<AuditLogResponse> list(
            @RequestParam String entityType,
            @RequestParam UUID entityId,
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "50") int size
    ) {
        return auditLogQueryService.listByEntity(entityType, entityId, PageRequest.of(page, size));
    }

    @GetMapping("/recent")
    public Page<AuditLogResponse> listRecent(
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "50") int size
    ) {
        return auditLogQueryService.listRecent(page, size);
    }
}
