package com.seal.hackathon.repository;

import com.seal.hackathon.domain.entity.Team;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;
import java.util.UUID;

public interface TeamRepository extends JpaRepository<Team, UUID> {
    Page<Team> findByEventId(UUID eventId, Pageable pageable);
    List<Team> findByTrackId(UUID trackId);
}
