package com.seal.hackathon.controller;

import com.seal.hackathon.dto.scoring.RankingResponse;
import com.seal.hackathon.security.AuthenticatedPrincipal;
import com.seal.hackathon.service.RankingService;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.UUID;

@RestController
@RequestMapping("/api/rounds/{roundId}/rankings")
public class RankingController {

    private final RankingService rankingService;

    public RankingController(RankingService rankingService) {
        this.rankingService = rankingService;
    }

    @PostMapping("/compute")
    @PreAuthorize("hasRole('COORDINATOR')")
    public List<RankingResponse> compute(@PathVariable UUID roundId, @AuthenticationPrincipal AuthenticatedPrincipal principal) {
        return rankingService.compute(roundId, principal.userId());
    }

    @GetMapping
    public List<RankingResponse> list(@PathVariable UUID roundId, @AuthenticationPrincipal AuthenticatedPrincipal principal) {
        return rankingService.list(roundId, principal);
    }
}
