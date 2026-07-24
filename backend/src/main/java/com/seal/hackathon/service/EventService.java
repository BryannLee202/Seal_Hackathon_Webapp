package com.seal.hackathon.service;

import com.seal.hackathon.domain.entity.CriteriaTemplate;
import com.seal.hackathon.domain.entity.HackathonEvent;
import com.seal.hackathon.domain.enums.EventStatus;
import com.seal.hackathon.dto.event.EventRequest;
import com.seal.hackathon.dto.event.EventResponse;
import com.seal.hackathon.exception.ApiException;
import com.seal.hackathon.repository.CriteriaTemplateRepository;
import com.seal.hackathon.repository.HackathonEventRepository;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.UUID;
import java.util.stream.Collectors;

@Service
public class EventService {

    private final HackathonEventRepository eventRepository;
    private final CriteriaTemplateRepository criteriaTemplateRepository;

    public EventService(HackathonEventRepository eventRepository, CriteriaTemplateRepository criteriaTemplateRepository) {
        this.eventRepository = eventRepository;
        this.criteriaTemplateRepository = criteriaTemplateRepository;
    }

    @Transactional
    public EventResponse create(EventRequest request) {
        CriteriaTemplate template = null;
        if (request.baseCriteriaTemplateId() != null) {
            template = criteriaTemplateRepository.findById(request.baseCriteriaTemplateId())
                    .orElseThrow(() -> ApiException.notFound("Không tìm thấy mẫu tiêu chí"));
        }
        HackathonEvent event = HackathonEvent.builder()
                .name(request.name())
                .description(request.description())
                .startDate(request.startDate())
                .endDate(request.endDate())
                .status(EventStatus.DRAFT)
                .baseCriteriaTemplate(template)
                .rblEnabled(request.rblEnabled())
                .build();
        return EventResponse.from(eventRepository.save(event));
    }

    @Transactional(readOnly = true)
    public List<EventResponse> list() {
        return eventRepository.findAll().stream().map(EventResponse::from).collect(Collectors.toList());
    }

    @Transactional(readOnly = true)
    public EventResponse get(UUID id) {
        return EventResponse.from(findOrThrow(id));
    }

    @Transactional
    public EventResponse update(UUID id, EventRequest request) {
        HackathonEvent event = findOrThrow(id);
        CriteriaTemplate template = event.getBaseCriteriaTemplate();
        if (request.baseCriteriaTemplateId() != null) {
            template = criteriaTemplateRepository.findById(request.baseCriteriaTemplateId())
                    .orElseThrow(() -> ApiException.notFound("Không tìm thấy mẫu tiêu chí"));
        }
        event.setName(request.name());
        event.setDescription(request.description());
        event.setStartDate(request.startDate());
        event.setEndDate(request.endDate());
        event.setBaseCriteriaTemplate(template);
        event.setRblEnabled(request.rblEnabled());
        return EventResponse.from(eventRepository.save(event));
    }

    @Transactional
    public EventResponse changeStatus(UUID id, EventStatus status) {
        HackathonEvent event = findOrThrow(id);
        event.setStatus(status);
        return EventResponse.from(eventRepository.save(event));
    }

    HackathonEvent findOrThrow(UUID id) {
        return eventRepository.findById(id)
                .orElseThrow(() -> ApiException.notFound("Không tìm thấy sự kiện"));
    }
}
