package com.seal.hackathon.repository;

import com.seal.hackathon.domain.entity.TeamInvite;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;
import java.util.UUID;

public interface TeamInviteRepository extends JpaRepository<TeamInvite, UUID> {
    List<TeamInvite> findByInvitedEmailIgnoreCase(String email);
    List<TeamInvite> findByTeamId(UUID teamId);
}
