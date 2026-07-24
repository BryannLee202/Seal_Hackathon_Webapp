package com.seal.hackathon.dto.criteria;

import jakarta.validation.constraints.NotBlank;

public record CriteriaTemplateRequest(
        @NotBlank String name,
        String description
) {
}
