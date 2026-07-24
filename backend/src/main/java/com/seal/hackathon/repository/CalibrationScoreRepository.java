package com.seal.hackathon.repository;

import com.seal.hackathon.domain.entity.CalibrationScore;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;
import java.util.UUID;

public interface CalibrationScoreRepository extends JpaRepository<CalibrationScore, UUID> {
    List<CalibrationScore> findByCalibrationRoundId(UUID calibrationRoundId);
}
