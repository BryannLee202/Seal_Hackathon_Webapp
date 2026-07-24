package com.seal.hackathon.repository;

import com.seal.hackathon.domain.entity.Track;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;
import java.util.UUID;

public interface TrackRepository extends JpaRepository<Track, UUID> {
    List<Track> findByEventId(UUID eventId);
}
