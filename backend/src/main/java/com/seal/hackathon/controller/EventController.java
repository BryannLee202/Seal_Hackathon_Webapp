package com.seal.hackathon.controller;

import com.seal.hackathon.dto.event.EventRequest;
import com.seal.hackathon.dto.event.EventResponse;
import com.seal.hackathon.dto.event.StatusChangeRequest;
import com.seal.hackathon.service.EventService;
import jakarta.validation.Valid;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.UUID;

@RestController
@RequestMapping("/api/events")
public class EventController {

    private final EventService eventService;

    public EventController(EventService eventService) {
        this.eventService = eventService;
    }

    @PostMapping
    @PreAuthorize("hasRole('COORDINATOR')")
    public EventResponse create(@Valid @RequestBody EventRequest request) {
        return eventService.create(request);
    }

    @GetMapping
    public List<EventResponse> list() {
        return eventService.list();
    }

    @GetMapping("/{id}")
    public EventResponse get(@PathVariable UUID id) {
        return eventService.get(id);
    }

    @PutMapping("/{id}")
    @PreAuthorize("hasRole('COORDINATOR')")
    public EventResponse update(@PathVariable UUID id, @Valid @RequestBody EventRequest request) {
        return eventService.update(id, request);
    }

    @PatchMapping("/{id}/status")
    @PreAuthorize("hasRole('COORDINATOR')")
    public EventResponse changeStatus(@PathVariable UUID id, @Valid @RequestBody StatusChangeRequest request) {
        return eventService.changeStatus(id, request.status());
    }
}
