package com.seal.hackathon.dto.auth;

public record ApproveUserRequest(
        boolean approve,
        String rejectionReason
) {
}
