package com.seal.hackathon.repository;

import com.seal.hackathon.domain.entity.MentorFeedbackMessage;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import java.util.List;
import java.util.UUID;

public interface MentorFeedbackMessageRepository extends JpaRepository<MentorFeedbackMessage, UUID> {

    @Query("SELECT m FROM MentorFeedbackMessage m JOIN FETCH m.author WHERE m.team.id = :teamId ORDER BY m.createdAt ASC")
    List<MentorFeedbackMessage> findByTeamIdWithAuthorOrderByCreatedAtAsc(@Param("teamId") UUID teamId);
}
