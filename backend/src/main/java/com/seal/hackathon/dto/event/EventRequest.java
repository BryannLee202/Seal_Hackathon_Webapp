package com.seal.hackathon.dto.event;

import jakarta.validation.constraints.NotBlank;

import java.time.LocalDate;
import java.util.UUID;

public record EventRequest(
        @NotBlank String name,
        String description,
        LocalDate startDate,
        LocalDate endDate,
        UUID baseCriteriaTemplateId,
        boolean rblEnabled
) {
}
