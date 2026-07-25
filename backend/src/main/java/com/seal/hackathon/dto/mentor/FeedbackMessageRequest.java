package com.seal.hackathon.dto.mentor;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Size;

public record FeedbackMessageRequest(
        @NotBlank @Size(max = 4000) String body
) {
}
