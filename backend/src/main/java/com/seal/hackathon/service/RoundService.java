package com.seal.hackathon.service;

import com.seal.hackathon.domain.entity.CriteriaTemplate;
import com.seal.hackathon.domain.entity.Criterion;
import com.seal.hackathon.domain.entity.HackathonEvent;
import com.seal.hackathon.domain.entity.Round;
import com.seal.hackathon.domain.enums.AuditAction;
import com.seal.hackathon.dto.event.RoundRequest;
import com.seal.hackathon.dto.event.RoundResponse;
import com.seal.hackathon.exception.ApiException;
import com.seal.hackathon.repository.CriterionRepository;
import com.seal.hackathon.repository.RoundRepository;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.UUID;
import java.util.stream.Collectors;

@Service
public class RoundService {

    private final RoundRepository roundRepository;
    private final CriterionRepository criterionRepository;
    private final EventService eventService;
    private final AuditService auditService;

    public RoundService(RoundRepository roundRepository, CriterionRepository criterionRepository, EventService eventService, AuditService auditService) {
        this.roundRepository = roundRepository;
        this.criterionRepository = criterionRepository;
        this.eventService = eventService;
        this.auditService = auditService;
    }

    @Transactional
    public RoundResponse create(UUID eventId, RoundRequest request) {
        HackathonEvent event = eventService.findOrThrow(eventId);
        Round round = Round.builder()
                .event(event)
                .name(request.name())
                .orderIndex(request.orderIndex())
                .submissionDeadline(request.submissionDeadline())
                .promotionTopN(request.promotionTopN())
                .resultsPublished(false)
                .build();
        round = roundRepository.save(round);

        // Seed round criteria by copying from the event's base criteria template, if any.
        CriteriaTemplate baseTemplate = event.getBaseCriteriaTemplate();
        if (baseTemplate != null) {
            List<Criterion> templateCriteria = criterionRepository.findByTemplateId(baseTemplate.getId());
            Round finalRound = round;
            List<Criterion> copies = templateCriteria.stream()
                    .map(tc -> Criterion.builder()
                            .round(finalRound)
                            .name(tc.getName())
                            .description(tc.getDescription())
                            .weight(tc.getWeight())
                            .maxScore(tc.getMaxScore())
                            .build())
                    .collect(Collectors.toList());
            criterionRepository.saveAll(copies);
        }
        return RoundResponse.from(round);
    }

    @Transactional(readOnly = true)
    public List<RoundResponse> listByEvent(UUID eventId) {
        return roundRepository.findByEventIdOrderByOrderIndexAsc(eventId).stream()
                .map(RoundResponse::from).collect(Collectors.toList());
    }

    @Transactional(readOnly = true)
    public RoundResponse get(UUID roundId) {
        return RoundResponse.from(findOrThrow(roundId));
    }

    @Transactional
    public RoundResponse update(UUID roundId, RoundRequest request) {
        Round round = findOrThrow(roundId);
        round.setName(request.name());
        round.setOrderIndex(request.orderIndex());
        round.setSubmissionDeadline(request.submissionDeadline());
        round.setPromotionTopN(request.promotionTopN());
        return RoundResponse.from(roundRepository.save(round));
    }

    @Transactional
    public RoundResponse publishResults(UUID roundId, UUID actorId) {
        Round round = findOrThrow(roundId);
        round.setResultsPublished(true);
        round = roundRepository.save(round);
        auditService.record(actorId, AuditAction.RESULT_PUBLISH, "Round", roundId, false, true);
        return RoundResponse.from(round);
    }

    Round findOrThrow(UUID roundId) {
        return roundRepository.findById(roundId)
                .orElseThrow(() -> ApiException.notFound("Không tìm thấy vòng thi"));
    }
}
