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

import java.math.BigDecimal;

/**
 * Either belongs to a CriteriaTemplate (reusable master definition) OR to a Round
 * (the actual scoring criteria applied when judges score submissions) - exactly one is set.
 */
@Getter
@Setter
@Entity
@Table(name = "criterion")
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class Criterion extends BaseEntity {

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "template_id")
    private CriteriaTemplate template;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "round_id")
    private Round round;

    @Column(nullable = false)
    private String name;

    private String description;

    /** Percentage weight, all criteria within the same set (template or round) must sum to 100. */
    @Column(nullable = false, precision = 5, scale = 2)
    private BigDecimal weight;

    @Column(nullable = false, precision = 5, scale = 2)
    private BigDecimal maxScore;
}
