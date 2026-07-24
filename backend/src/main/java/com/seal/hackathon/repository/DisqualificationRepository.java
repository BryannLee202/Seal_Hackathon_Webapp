package com.seal.hackathon.repository;

import com.seal.hackathon.domain.entity.Disqualification;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;
import java.util.UUID;

public interface DisqualificationRepository extends JpaRepository<Disqualification, UUID> {
    List<Disqualification> findByTeamIdAndRevokedFalse(UUID teamId);
    List<Disqualification> findBySubmissionIdAndRevokedFalse(UUID submissionId);
    List<Disqualification> findByTeam_Event_Id(UUID eventId);
    List<Disqualification> findBySubmission_Round_Event_Id(UUID eventId);

    /** Batch variants of the single-id lookups above, used to avoid N+1 queries when checking a whole round at once. */
    List<Disqualification> findByTeamIdInAndRevokedFalse(List<UUID> teamIds);
    List<Disqualification> findBySubmissionIdInAndRevokedFalse(List<UUID> submissionIds);
}
