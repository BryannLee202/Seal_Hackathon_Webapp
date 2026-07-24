package com.seal.hackathon.domain.entity;

import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.FetchType;
import jakarta.persistence.JoinColumn;
import jakarta.persistence.ManyToOne;
import jakarta.persistence.Table;
import jakarta.persistence.UniqueConstraint;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

import java.math.BigDecimal;

@Getter
@Setter
@Entity
@Table(name = "ranking", uniqueConstraints = @UniqueConstraint(columnNames = {"team_id", "round_id"}))
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class Ranking extends BaseEntity {

    @ManyToOne(fetch = FetchType.LAZY, optional = false)
    @JoinColumn(name = "team_id", nullable = false)
    private Team team;

    @ManyToOne(fetch = FetchType.LAZY, optional = false)
    @JoinColumn(name = "round_id", nullable = false)
    private Round round;

    @Column(nullable = false, precision = 6, scale = 2)
    private BigDecimal totalWeightedScore;

    private Integer rankInTrack;

    private Integer rankOverall;

    @Column(nullable = false)
    private boolean promoted;
}
