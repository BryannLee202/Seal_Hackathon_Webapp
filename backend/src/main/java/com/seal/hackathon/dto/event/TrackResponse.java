package com.seal.hackathon.dto.event;

import com.seal.hackathon.domain.entity.Track;

import java.util.UUID;

public record TrackResponse(
        UUID id,
        UUID eventId,
        String name,
        String description,
        Integer maxTeams
) {
    public static TrackResponse from(Track track) {
        return new TrackResponse(
                track.getId(),
                track.getEvent().getId(),
                track.getName(),
                track.getDescription(),
                track.getMaxTeams()
        );
    }
}
