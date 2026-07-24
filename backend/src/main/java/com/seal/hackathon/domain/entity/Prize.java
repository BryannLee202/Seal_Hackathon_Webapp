package com.seal.hackathon.domain.entity;

import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.FetchType;
import jakarta.persistence.JoinColumn;
import jakarta.persistence.ManyToOne;
import jakarta.persistence.Table;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

@Getter
@Setter
@Entity
@Table(name = "prize")
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class Prize extends BaseEntity {

    @ManyToOne(fetch = FetchType.LAZY, optional = false)
    @JoinColumn(name = "event_id", nullable = false)
    private HackathonEvent event;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "track_id")
    private Track track;

    @Column(nullable = false)
    private String name;

    @Column(nullable = false)
    private Integer rankCondition;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "awarded_team_id")
    private Team awardedTeam;

    @Column(nullable = false)
    private boolean revoked;
}
