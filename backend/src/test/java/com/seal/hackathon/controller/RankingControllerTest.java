package com.seal.hackathon.controller;

import com.seal.hackathon.config.MethodSecurityTestConfig;
import com.seal.hackathon.domain.enums.RoleName;
import com.seal.hackathon.dto.scoring.RankingResponse;
import com.seal.hackathon.exception.ApiException;
import com.seal.hackathon.security.AuthenticatedPrincipal;
import com.seal.hackathon.security.JwtService;
import com.seal.hackathon.service.RankingService;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.webmvc.test.autoconfigure.WebMvcTest;
import org.springframework.context.annotation.Import;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.GrantedAuthority;
import org.springframework.security.core.authority.SimpleGrantedAuthority;
import org.springframework.test.context.bean.override.mockito.MockitoBean;
import org.springframework.test.web.servlet.MockMvc;

import java.math.BigDecimal;
import java.util.List;
import java.util.UUID;

import static org.mockito.ArgumentMatchers.any;
import static org.mockito.ArgumentMatchers.eq;
import static org.mockito.Mockito.never;
import static org.mockito.Mockito.verify;
import static org.mockito.Mockito.verifyNoInteractions;
import static org.mockito.Mockito.when;
import static org.springframework.security.test.web.servlet.request.SecurityMockMvcRequestPostProcessors.authentication;
import static org.springframework.security.test.web.servlet.request.SecurityMockMvcRequestPostProcessors.csrf;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.get;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.post;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.content;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.jsonPath;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.status;

/**
 * First {@code @WebMvcTest} in this codebase. Proves the IDOR fix end-to-end: a non-coordinator
 * cannot see rankings the service deems not-yet-visible, and {@code compute()}'s
 * {@code @PreAuthorize("hasRole('COORDINATOR')")} actually runs (blocks non-coordinators before the
 * service method is ever invoked).
 */
@WebMvcTest(RankingController.class)
@Import(MethodSecurityTestConfig.class)
class RankingControllerTest {

    @Autowired
    private MockMvc mockMvc;

    @MockitoBean
    private RankingService rankingService;

    // JwtAuthFilter is a @Component implementing Filter, so @WebMvcTest picks it up automatically;
    // it needs a JwtService bean to construct even though these tests never exercise it (no
    // Authorization header is ever sent - the Authentication is injected directly via
    // SecurityMockMvcRequestPostProcessors.authentication(...)).
    @MockitoBean
    private JwtService jwtService;

    private Authentication authenticationFor(RoleName roleName) {
        AuthenticatedPrincipal principal = new AuthenticatedPrincipal(UUID.randomUUID(), "user@example.com", "User",
                List.of(new AuthenticatedPrincipal.RoleGrant(roleName, null, null, null)));
        List<GrantedAuthority> authorities = List.of(new SimpleGrantedAuthority("ROLE_" + roleName.name()));
        return new UsernamePasswordAuthenticationToken(principal, null, authorities);
    }

    @Test
    void list_shouldReturn403_whenServiceThrowsForbidden_forNonCoordinator() throws Exception {
        UUID roundId = UUID.randomUUID();
        when(rankingService.list(eq(roundId), any()))
                .thenThrow(ApiException.forbidden("Bảng xếp hạng của vòng thi này chưa được công bố"));

        mockMvc.perform(get("/api/rounds/{roundId}/rankings", roundId)
                        .with(authentication(authenticationFor(RoleName.TEAM_MEMBER))))
                .andExpect(status().isForbidden())
                .andExpect(jsonPath("$.message").exists());
    }

    @Test
    void list_shouldReturn200WithEmptyBody_whenServiceReturnsEmptyList_forNonCoordinator() throws Exception {
        UUID roundId = UUID.randomUUID();
        when(rankingService.list(eq(roundId), any())).thenReturn(List.of());

        mockMvc.perform(get("/api/rounds/{roundId}/rankings", roundId)
                        .with(authentication(authenticationFor(RoleName.TEAM_MEMBER))))
                .andExpect(status().isOk())
                .andExpect(content().json("[]"));
    }

    @Test
    void list_shouldRejectRequest_whenNotAuthenticatedAtAll() throws Exception {
        // Empirically 401: with no custom SecurityFilterChain loaded in this @WebMvcTest slice,
        // Spring Boot's default fallback security auto-config enables HTTP Basic, whose
        // BasicAuthenticationEntryPoint returns 401 for unauthenticated requests (the real app's
        // SecurityConfig never installs a formLogin/httpBasic entry point, but that config class
        // isn't part of a @WebMvcTest slice).
        UUID roundId = UUID.randomUUID();

        mockMvc.perform(get("/api/rounds/{roundId}/rankings", roundId))
                .andExpect(status().isUnauthorized());

        verifyNoInteractions(rankingService);
    }

    @Test
    void compute_shouldReturn403_andNeverInvokeService_whenNonCoordinator() throws Exception {
        UUID roundId = UUID.randomUUID();

        mockMvc.perform(post("/api/rounds/{roundId}/rankings/compute", roundId)
                        .with(authentication(authenticationFor(RoleName.TEAM_MEMBER)))
                        .with(csrf()))
                .andExpect(status().isForbidden());

        verify(rankingService, never()).compute(any(), any());
    }

    @Test
    void compute_shouldReturn200_whenCoordinator() throws Exception {
        UUID roundId = UUID.randomUUID();
        RankingResponse response = new RankingResponse(
                UUID.randomUUID(), "Team A", null, null, roundId, BigDecimal.valueOf(90), null, 1, false);
        when(rankingService.compute(eq(roundId), any())).thenReturn(List.of(response));

        mockMvc.perform(post("/api/rounds/{roundId}/rankings/compute", roundId)
                        .with(authentication(authenticationFor(RoleName.COORDINATOR)))
                        .with(csrf()))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$[0].teamName").value("Team A"));
    }
}
