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
import java.time.Instant;

/**
 * Most granular scoring record: one (submission x judge x criterion) triple.
 * Never aggregated in place - Ranking holds the computed rollup.
 */
@Getter
@Setter
@Entity
@Table(name = "score", uniqueConstraints = @UniqueConstraint(columnNames = {"submission_id", "judge_id", "criterion_id"}))
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class Score extends BaseEntity {

    @ManyToOne(fetch = FetchType.LAZY, optional = false)
    @JoinColumn(name = "submission_id", nullable = false)
    private Submission submission;

    @ManyToOne(fetch = FetchType.LAZY, optional = false)
    @JoinColumn(name = "judge_id", nullable = false)
    private User judge;

    @ManyToOne(fetch = FetchType.LAZY, optional = false)
    @JoinColumn(name = "criterion_id", nullable = false)
    private Criterion criterion;

    @Column(nullable = false, precision = 5, scale = 2)
    private BigDecimal scoreValue;

    @Column(columnDefinition = "TEXT")
    private String comment;

    @Column(nullable = false)
    private boolean finalized;

    private Instant scoredAt;

    /** True when this judge had already completed the calibration round for this event before scoring. */
    @Column(nullable = false)
    private boolean judgeCalibrated;
}
