package com.seal.hackathon.security;

import com.seal.hackathon.domain.enums.JudgeType;
import com.seal.hackathon.domain.enums.RoleName;
import com.seal.hackathon.domain.enums.ScopeType;

import java.util.List;
import java.util.UUID;

/** Principal carried in the SecurityContext for every authenticated request; built from JWT claims. */
public record AuthenticatedPrincipal(
        UUID userId,
        String email,
        String fullName,
        List<RoleGrant> roles
) {
    public record RoleGrant(RoleName roleName, ScopeType scopeType, UUID scopeId, JudgeType judgeType) {
    }

    public boolean hasRole(RoleName roleName) {
        return roles.stream().anyMatch(r -> r.roleName() == roleName);
    }

    public boolean hasRoleInScope(RoleName roleName, ScopeType scopeType, UUID scopeId) {
        return roles.stream().anyMatch(r ->
                r.roleName() == roleName
                        && r.scopeType() == scopeType
                        && scopeId.equals(r.scopeId()));
    }

    public boolean isCoordinator() {
        return hasRole(RoleName.COORDINATOR);
    }
}
