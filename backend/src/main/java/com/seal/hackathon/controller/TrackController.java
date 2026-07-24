package com.seal.hackathon.controller;

import com.seal.hackathon.dto.event.TrackRequest;
import com.seal.hackathon.dto.event.TrackResponse;
import com.seal.hackathon.service.TrackService;
import jakarta.validation.Valid;
import org.springframework.http.HttpStatus;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.UUID;

@RestController
public class TrackController {

    private final TrackService trackService;

    public TrackController(TrackService trackService) {
        this.trackService = trackService;
    }

    @PostMapping("/api/events/{eventId}/tracks")
    @PreAuthorize("hasRole('COORDINATOR')")
    public TrackResponse create(@PathVariable UUID eventId, @Valid @RequestBody TrackRequest request) {
        return trackService.create(eventId, request);
    }

    @GetMapping("/api/events/{eventId}/tracks")
    public List<TrackResponse> list(@PathVariable UUID eventId) {
        return trackService.listByEvent(eventId);
    }

    @PutMapping("/api/tracks/{trackId}")
    @PreAuthorize("hasRole('COORDINATOR')")
    public TrackResponse update(@PathVariable UUID trackId, @Valid @RequestBody TrackRequest request) {
        return trackService.update(trackId, request);
    }

    @DeleteMapping("/api/tracks/{trackId}")
    @PreAuthorize("hasRole('COORDINATOR')")
    @ResponseStatus(HttpStatus.NO_CONTENT)
    public void delete(@PathVariable UUID trackId) {
        trackService.delete(trackId);
    }
}
