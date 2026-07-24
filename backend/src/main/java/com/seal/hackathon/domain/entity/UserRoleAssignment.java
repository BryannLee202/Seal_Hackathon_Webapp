package com.seal.hackathon.domain.entity;

import com.seal.hackathon.domain.enums.JudgeType;
import com.seal.hackathon.domain.enums.RoleName;
import com.seal.hackathon.domain.enums.ScopeType;
import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.EnumType;
import jakarta.persistence.Enumerated;
import jakarta.persistence.FetchType;
import jakarta.persistence.JoinColumn;
import jakarta.persistence.ManyToOne;
import jakarta.persistence.Table;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

import java.util.UUID;

/**
 * A role granted to a user, scoped to GLOBAL / a specific Event / Track / Round.
 * Example: (userId=X, role=JUDGE, scopeType=ROUND, scopeId=roundId, judgeType=GUEST)
 */
@Getter
@Setter
@Entity
@Table(name = "user_role_assignment")
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class UserRoleAssignment extends BaseEntity {

    @ManyToOne(fetch = FetchType.LAZY, optional = false)
    @JoinColumn(name = "user_id", nullable = false)
    private User user;

    @Enumerated(EnumType.STRING)
    @Column(nullable = false)
    private RoleName roleName;

    @Enumerated(EnumType.STRING)
    @Column(nullable = false)
    private ScopeType scopeType;

    /** Nullable when scopeType = GLOBAL. Points to Event/Track/Round id depending on scopeType. */
    private UUID scopeId;

    @Enumerated(EnumType.STRING)
    private JudgeType judgeType;
}
