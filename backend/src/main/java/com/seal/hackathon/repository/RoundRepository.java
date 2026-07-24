package com.seal.hackathon.repository;

import com.seal.hackathon.domain.entity.Round;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;
import java.util.UUID;

public interface RoundRepository extends JpaRepository<Round, UUID> {
    List<Round> findByEventIdOrderByOrderIndexAsc(UUID eventId);
}
