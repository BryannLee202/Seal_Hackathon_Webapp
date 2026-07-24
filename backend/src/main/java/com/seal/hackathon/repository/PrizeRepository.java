package com.seal.hackathon.repository;

import com.seal.hackathon.domain.entity.Prize;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;
import java.util.UUID;

public interface PrizeRepository extends JpaRepository<Prize, UUID> {
    List<Prize> findByEventId(UUID eventId);
}
