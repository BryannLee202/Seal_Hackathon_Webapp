package com.seal.hackathon.controller;

import com.seal.hackathon.dto.team.TeamResponse;
import com.seal.hackathon.security.AuthenticatedPrincipal;
import com.seal.hackathon.service.MentorService;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RestController;

import java.util.List;

@RestController
public class MentorController {

    private final MentorService mentorService;

    public MentorController(MentorService mentorService) {
        this.mentorService = mentorService;
    }

    @GetMapping("/api/mentor/teams")
    @PreAuthorize("hasRole('MENTOR')")
    public List<TeamResponse> myTeams(@AuthenticationPrincipal AuthenticatedPrincipal principal) {
        return mentorService.listMyTeams(principal.userId());
    }
}
