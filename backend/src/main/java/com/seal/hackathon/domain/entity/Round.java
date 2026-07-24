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

import java.time.Instant;

@Getter
@Setter
@Entity
@Table(name = "round")
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class Round extends BaseEntity {

    @ManyToOne(fetch = FetchType.LAZY, optional = false)
    @JoinColumn(name = "event_id", nullable = false)
    private HackathonEvent event;

    @Column(nullable = false)
    private String name;

    @Column(nullable = false)
    private Integer orderIndex;

    @Column(nullable = false)
    private Instant submissionDeadline;

    /** Top N teams per Track promoted to the next round. Null/0 on the final round. */
    @Column(name = "promotion_top_n")
    private Integer promotionTopN;

    @Column(nullable = false)
    private boolean resultsPublished;
}
