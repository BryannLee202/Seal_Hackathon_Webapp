package com.seal.hackathon.dto.auth;

import java.util.List;
import java.util.UUID;

public record AuthResponse(
        String accessToken,
        String refreshToken,
        UUID userId,
        String fullName,
        String email,
        List<String> roles
) {
}
