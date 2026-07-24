package com.seal.hackathon.repository;

import com.seal.hackathon.domain.entity.Criterion;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;
import java.util.UUID;

public interface CriterionRepository extends JpaRepository<Criterion, UUID> {
    List<Criterion> findByTemplateId(UUID templateId);
    List<Criterion> findByRoundId(UUID roundId);
}
