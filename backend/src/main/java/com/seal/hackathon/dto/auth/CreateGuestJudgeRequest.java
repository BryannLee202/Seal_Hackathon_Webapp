package com.seal.hackathon.dto.auth;

import jakarta.validation.constraints.Email;
import jakarta.validation.constraints.NotBlank;

import java.time.Instant;

public record CreateGuestJudgeRequest(
        @NotBlank String fullName,
        @NotBlank @Email String email,
        Instant guestAccessExpiresAt
) {
}
