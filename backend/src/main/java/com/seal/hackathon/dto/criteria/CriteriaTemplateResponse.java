package com.seal.hackathon.dto.criteria;

import com.seal.hackathon.domain.entity.CriteriaTemplate;

import java.util.List;
import java.util.UUID;

public record CriteriaTemplateResponse(
        UUID id,
        String name,
        String description,
        boolean isDefault,
        List<CriterionResponse> criteria
) {
    public static CriteriaTemplateResponse from(CriteriaTemplate t, List<CriterionResponse> criteria) {
        return new CriteriaTemplateResponse(t.getId(), t.getName(), t.getDescription(), t.isDefault(), criteria);
    }
}
