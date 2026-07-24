package com.seal.hackathon.service;

import com.seal.hackathon.domain.entity.HackathonEvent;
import com.seal.hackathon.domain.entity.Prize;
import com.seal.hackathon.domain.entity.Ranking;
import com.seal.hackathon.domain.entity.Track;
import com.seal.hackathon.domain.enums.AuditAction;
import com.seal.hackathon.dto.prize.PrizeRequest;
import com.seal.hackathon.dto.prize.PrizeResponse;
import com.seal.hackathon.exception.ApiException;
import com.seal.hackathon.repository.PrizeRepository;
import com.seal.hackathon.repository.RankingRepository;
import com.seal.hackathon.repository.TrackRepository;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.UUID;
import java.util.stream.Collectors;

@Service
public class PrizeService {

    private final PrizeRepository prizeRepository;
    private final TrackRepository trackRepository;
    private final RankingRepository rankingRepository;
    private final EventService eventService;
    private final AuditService auditService;

    public PrizeService(
            PrizeRepository prizeRepository,
            TrackRepository trackRepository,
            RankingRepository rankingRepository,
            EventService eventService,
            AuditService auditService
    ) {
        this.prizeRepository = prizeRepository;
        this.trackRepository = trackRepository;
        this.rankingRepository = rankingRepository;
        this.eventService = eventService;
        this.auditService = auditService;
    }

    @Transactional
    public PrizeResponse create(UUID eventId, PrizeRequest request) {
        HackathonEvent event = eventService.findOrThrow(eventId);
        Track track = null;
        if (request.trackId() != null) {
            track = trackRepository.findById(request.trackId())
                    .orElseThrow(() -> ApiException.notFound("Không tìm thấy Hạng mục"));
        }
        Prize prize = Prize.builder()
                .event(event)
                .track(track)
                .name(request.name())
                .rankCondition(request.rankCondition())
                .revoked(false)
                .build();
        return PrizeResponse.from(prizeRepository.save(prize));
    }

    @Transactional(readOnly = true)
    public List<PrizeResponse> listByEvent(UUID eventId) {
        return prizeRepository.findByEventId(eventId).stream().map(PrizeResponse::from).collect(Collectors.toList());
    }

    @Transactional
    public List<PrizeResponse> autoAssign(UUID eventId, UUID finalRoundId, UUID actorId) {
        List<Prize> prizes = prizeRepository.findByEventId(eventId);
        for (Prize prize : prizes) {
            if (prize.isRevoked()) {
                continue;
            }
            var ranking = prize.getTrack() != null
                    ? rankingRepository.findByRoundIdAndTeam_Track_IdAndRankInTrack(finalRoundId, prize.getTrack().getId(), prize.getRankCondition())
                    : rankingRepository.findByRoundIdAndRankOverall(finalRoundId, prize.getRankCondition());
            ranking.ifPresent(r -> prize.setAwardedTeam(r.getTeam()));
            prizeRepository.save(prize);
            if (ranking.isPresent()) {
                auditService.record(actorId, AuditAction.PRIZE_AWARD, "Prize", prize.getId(), null, ranking.get().getTeam().getId());
            }
        }
        return prizes.stream().map(PrizeResponse::from).collect(Collectors.toList());
    }

    @Transactional
    public PrizeResponse revoke(UUID prizeId, UUID actorId) {
        Prize prize = prizeRepository.findById(prizeId)
                .orElseThrow(() -> ApiException.notFound("Không tìm thấy giải thưởng"));
        prize.setRevoked(true);
        prize = prizeRepository.save(prize);
        auditService.record(actorId, AuditAction.PRIZE_AWARD, "Prize", prizeId, "awarded", "revoked");
        return PrizeResponse.from(prize);
    }
}
