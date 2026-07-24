package com.seal.hackathon.dto.event;

import com.seal.hackathon.domain.entity.HackathonEvent;
import com.seal.hackathon.domain.enums.EventStatus;

import java.time.LocalDate;
import java.util.UUID;

public record EventResponse(
        UUID id,
        String name,
        String description,
        LocalDate startDate,
        LocalDate endDate,
        EventStatus status,
        UUID baseCriteriaTemplateId,
        boolean rblEnabled
) {
    public static EventResponse from(HackathonEvent event) {
        return new EventResponse(
                event.getId(),
                event.getName(),
                event.getDescription(),
                event.getStartDate(),
                event.getEndDate(),
                event.getStatus(),
                event.getBaseCriteriaTemplate() == null ? null : event.getBaseCriteriaTemplate().getId(),
                event.isRblEnabled()
        );
    }
}
