package com.seal.hackathon.dto.rbl;

import java.math.BigDecimal;
import java.util.UUID;

public record VarianceStatResponse(
        UUID criterionId,
        String criterionName,
        int sampleCount,
        BigDecimal mean,
        BigDecimal stdDev,
        BigDecimal min,
        BigDecimal max
) {
}
