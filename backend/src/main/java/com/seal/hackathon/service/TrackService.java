package com.seal.hackathon.service;

import com.seal.hackathon.domain.entity.HackathonEvent;
import com.seal.hackathon.domain.entity.Track;
import com.seal.hackathon.dto.event.TrackRequest;
import com.seal.hackathon.dto.event.TrackResponse;
import com.seal.hackathon.exception.ApiException;
import com.seal.hackathon.repository.TeamRepository;
import com.seal.hackathon.repository.TrackRepository;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.UUID;
import java.util.stream.Collectors;

@Service
public class TrackService {

    private final TrackRepository trackRepository;
    private final TeamRepository teamRepository;
    private final EventService eventService;

    public TrackService(TrackRepository trackRepository, TeamRepository teamRepository, EventService eventService) {
        this.trackRepository = trackRepository;
        this.teamRepository = teamRepository;
        this.eventService = eventService;
    }

    @Transactional
    public TrackResponse create(UUID eventId, TrackRequest request) {
        HackathonEvent event = eventService.findOrThrow(eventId);
        Track track = Track.builder()
                .event(event)
                .name(request.name())
                .description(request.description())
                .maxTeams(request.maxTeams())
                .build();
        return TrackResponse.from(trackRepository.save(track));
    }

    @Transactional(readOnly = true)
    public List<TrackResponse> listByEvent(UUID eventId) {
        return trackRepository.findByEventId(eventId).stream().map(TrackResponse::from).collect(Collectors.toList());
    }

    @Transactional(readOnly = true)
    public TrackResponse get(UUID trackId) {
        return TrackResponse.from(findOrThrow(trackId));
    }

    @Transactional
    public TrackResponse update(UUID trackId, TrackRequest request) {
        Track track = findOrThrow(trackId);
        track.setName(request.name());
        track.setDescription(request.description());
        track.setMaxTeams(request.maxTeams());
        return TrackResponse.from(trackRepository.save(track));
    }

    @Transactional
    public void delete(UUID trackId) {
        Track track = findOrThrow(trackId);
        if (!teamRepository.findByTrackId(trackId).isEmpty()) {
            throw ApiException.conflict("Không thể xoá Hạng mục đã có đội đăng ký");
        }
        trackRepository.delete(track);
    }

    Track findOrThrow(UUID trackId) {
        return trackRepository.findById(trackId)
                .orElseThrow(() -> ApiException.notFound("Không tìm thấy Hạng mục"));
    }
}
