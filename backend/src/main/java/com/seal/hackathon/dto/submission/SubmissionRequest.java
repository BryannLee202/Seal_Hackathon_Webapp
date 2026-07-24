package com.seal.hackathon.dto.submission;

import jakarta.validation.constraints.NotBlank;

public record SubmissionRequest(
        @NotBlank String repoUrl,
        String demoUrl,
        String docUrl
) {
}
