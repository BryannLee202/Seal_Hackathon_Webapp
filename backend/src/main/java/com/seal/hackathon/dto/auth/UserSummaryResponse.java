package com.seal.hackathon.dto.auth;

import com.seal.hackathon.domain.entity.User;
import com.seal.hackathon.domain.enums.AccountStatus;
import com.seal.hackathon.domain.enums.UserCategory;

import java.time.Instant;
import java.util.UUID;

public record UserSummaryResponse(
        UUID id,
        String fullName,
        String email,
        UserCategory userCategory,
        String studentCode,
        String schoolName,
        AccountStatus accountStatus,
        boolean guestJudge,
        Instant createdAt
) {
    public static UserSummaryResponse from(User user) {
        return new UserSummaryResponse(
                user.getId(),
                user.getFullName(),
                user.getEmail(),
                user.getUserCategory(),
                user.getStudentCode(),
                user.getSchoolName(),
                user.getAccountStatus(),
                user.isGuestJudge(),
                user.getCreatedAt()
        );
    }
}
