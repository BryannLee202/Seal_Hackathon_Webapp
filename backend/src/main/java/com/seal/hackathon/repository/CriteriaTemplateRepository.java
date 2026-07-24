package com.seal.hackathon.repository;

import com.seal.hackathon.domain.entity.CriteriaTemplate;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.UUID;

public interface CriteriaTemplateRepository extends JpaRepository<CriteriaTemplate, UUID> {
}
