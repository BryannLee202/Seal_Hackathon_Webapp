package com.seal.hackathon.repository;

import com.seal.hackathon.domain.entity.CalibrationRound;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;
import java.util.UUID;

public interface CalibrationRoundRepository extends JpaRepository<CalibrationRound, UUID> {
    List<CalibrationRound> findByEventId(UUID eventId);
}
