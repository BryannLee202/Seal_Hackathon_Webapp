package com.seal.hackathon.dto.auth;

import java.util.UUID;

public record GuestJudgeCreatedResponse(
        UUID userId,
        String fullName,
        String email,
        String temporaryPassword
) {
}
