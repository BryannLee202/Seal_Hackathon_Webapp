package com.seal.hackathon.repository;

import com.seal.hackathon.domain.entity.HackathonEvent;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.UUID;

public interface HackathonEventRepository extends JpaRepository<HackathonEvent, UUID> {
}
