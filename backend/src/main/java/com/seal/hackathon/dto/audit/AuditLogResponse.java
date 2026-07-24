package com.seal.hackathon.dto.audit;

import com.seal.hackathon.domain.entity.AuditLog;
import com.seal.hackathon.domain.enums.AuditAction;

import java.time.Instant;
import java.util.UUID;

public record AuditLogResponse(
        UUID id,
        String actorName,
        AuditAction action,
        String entityType,
        UUID entityId,
        String oldValueJson,
        String newValueJson,
        Instant timestamp
) {
    public static AuditLogResponse from(AuditLog log) {
        return new AuditLogResponse(
                log.getId(),
                log.getActor() == null ? "system" : log.getActor().getFullName(),
                log.getAction(),
                log.getEntityType(),
                log.getEntityId(),
                log.getOldValueJson(),
                log.getNewValueJson(),
                log.getTimestamp()
        );
    }
}
