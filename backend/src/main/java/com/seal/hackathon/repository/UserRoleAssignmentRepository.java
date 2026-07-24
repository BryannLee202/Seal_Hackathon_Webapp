package com.seal.hackathon.repository;

import com.seal.hackathon.domain.entity.UserRoleAssignment;
import com.seal.hackathon.domain.enums.RoleName;
import com.seal.hackathon.domain.enums.ScopeType;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;
import java.util.UUID;

public interface UserRoleAssignmentRepository extends JpaRepository<UserRoleAssignment, UUID> {
    List<UserRoleAssignment> findByUserId(UUID userId);
    List<UserRoleAssignment> findByRoleNameAndScopeTypeAndScopeId(RoleName roleName, ScopeType scopeType, UUID scopeId);
    boolean existsByUserIdAndRoleNameAndScopeTypeAndScopeId(UUID userId, RoleName roleName, ScopeType scopeType, UUID scopeId);
}
