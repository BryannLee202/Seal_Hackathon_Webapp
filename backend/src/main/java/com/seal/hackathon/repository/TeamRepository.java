package com.seal.hackathon.repository;

import com.seal.hackathon.domain.entity.Team;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;
import java.util.UUID;

public interface TeamRepository extends JpaRepository<Team, UUID> {
    List<Team> findByEventId(UUID eventId);
    List<Team> findByTrackId(UUID trackId);
}
