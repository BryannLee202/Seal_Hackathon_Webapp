package com.seal.hackathon.service;

import com.fasterxml.jackson.databind.ObjectMapper;
import com.seal.hackathon.domain.entity.AuditLog;
import com.seal.hackathon.domain.entity.User;
import com.seal.hackathon.domain.enums.AuditAction;
import com.seal.hackathon.repository.AuditLogRepository;
import com.seal.hackathon.repository.UserRepository;
import org.springframework.stereotype.Service;

import java.time.Instant;
import java.util.UUID;

@Service
public class AuditService {

    private final AuditLogRepository auditLogRepository;
    private final UserRepository userRepository;
    private final ObjectMapper objectMapper = new ObjectMapper();

    public AuditService(AuditLogRepository auditLogRepository, UserRepository userRepository) {
        this.auditLogRepository = auditLogRepository;
        this.userRepository = userRepository;
    }

    public void record(UUID actorId, AuditAction action, String entityType, UUID entityId, Object oldValue, Object newValue) {
        User actor = actorId == null ? null : userRepository.findById(actorId).orElse(null);
        AuditLog log = AuditLog.builder()
                .actor(actor)
                .action(action)
                .entityType(entityType)
                .entityId(entityId)
                .oldValueJson(toJson(oldValue))
                .newValueJson(toJson(newValue))
                .timestamp(Instant.now())
                .build();
        auditLogRepository.save(log);
    }

    private String toJson(Object value) {
        if (value == null) {
            return null;
        }
        try {
            return objectMapper.writeValueAsString(value);
        } catch (Exception e) {
            return String.valueOf(value);
        }
    }
}
