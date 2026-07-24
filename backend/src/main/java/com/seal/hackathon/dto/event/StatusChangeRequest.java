package com.seal.hackathon.dto.event;

import com.seal.hackathon.domain.enums.EventStatus;
import jakarta.validation.constraints.NotNull;

public record StatusChangeRequest(
        @NotNull EventStatus status
) {
}
