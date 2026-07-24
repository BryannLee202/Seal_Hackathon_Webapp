package com.seal.hackathon.dto.scoring;

import jakarta.validation.Valid;
import jakarta.validation.constraints.NotEmpty;

import java.util.List;

public record ScoreBatchRequest(
        @NotEmpty @Valid List<ScoreItemRequest> items,
        boolean finalized
) {
}
