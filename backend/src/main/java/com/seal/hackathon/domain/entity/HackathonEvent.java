package com.seal.hackathon.domain.entity;

import com.seal.hackathon.domain.enums.EventStatus;
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

import java.time.LocalDate;

@Getter
@Setter
@Entity
@Table(name = "hackathon_event")
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class HackathonEvent extends BaseEntity {

    @Column(nullable = false)
    private String name;

    @Column(columnDefinition = "TEXT")
    private String description;

    private LocalDate startDate;

    private LocalDate endDate;

    @Enumerated(EnumType.STRING)
    @Column(nullable = false)
    private EventStatus status;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "base_criteria_template_id")
    private CriteriaTemplate baseCriteriaTemplate;

    /** Enables the Research-Based Learning data-collection module (calibration, anonymized export, variance dashboard). */
    @Column(nullable = false)
    private boolean rblEnabled;
}
