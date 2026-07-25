package com.seal.hackathon.dto.mentor;

import com.seal.hackathon.domain.entity.MentorFeedbackMessage;
import com.seal.hackathon.domain.enums.FeedbackAuthorRole;

import java.time.Instant;
import java.util.UUID;

public record FeedbackMessageResponse(
        UUID id,
        UUID teamId,
        UUID authorUserId,
        String authorName,
        FeedbackAuthorRole authorRole,
        String body,
        Instant createdAt
) {
    public static FeedbackMessageResponse from(MentorFeedbackMessage message, UUID teamId) {
        return new FeedbackMessageResponse(
                message.getId(),
                teamId,
                message.getAuthor().getId(),
                message.getAuthor().getFullName(),
                message.getAuthorRole(),
                message.getBody(),
                message.getCreatedAt()
        );
    }
}
