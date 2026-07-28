package com.seal.hackathon.controller;

import com.seal.hackathon.config.MethodSecurityTestConfig;
import com.seal.hackathon.domain.enums.RoleName;
import com.seal.hackathon.exception.ApiException;
import com.seal.hackathon.security.AuthenticatedPrincipal;
import com.seal.hackathon.security.JwtService;
import com.seal.hackathon.service.ReportExportService;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.webmvc.test.autoconfigure.WebMvcTest;
import org.springframework.context.annotation.Import;
import org.springframework.http.HttpHeaders;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.GrantedAuthority;
import org.springframework.security.core.authority.SimpleGrantedAuthority;
import org.springframework.test.context.bean.override.mockito.MockitoBean;
import org.springframework.test.web.servlet.MockMvc;

import java.nio.charset.StandardCharsets;
import java.util.List;
import java.util.UUID;

import static org.mockito.ArgumentMatchers.any;
import static org.mockito.ArgumentMatchers.eq;
import static org.mockito.Mockito.when;
import static org.springframework.security.test.web.servlet.request.SecurityMockMvcRequestPostProcessors.authentication;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.get;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.header;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.jsonPath;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.status;

/**
 * The Excel export endpoint has no {@code @PreAuthorize} - visibility is enforced entirely inside
 * {@code ReportExportService.exportRankingExcel(...)} via {@code RoundService.findOrThrowVisibleForRankings}.
 * These tests only prove the controller correctly surfaces whatever the (mocked) service throws or
 * returns; the underlying authorization logic is unit-tested in RoundServiceTest.
 */
@WebMvcTest(ReportExportController.class)
@Import(MethodSecurityTestConfig.class)
class ReportExportControllerTest {

    @Autowired
    private MockMvc mockMvc;

    @MockitoBean
    private ReportExportService reportExportService;

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
    void exportRankingExcel_shouldReturn403_whenServiceThrowsForbidden_forNonCoordinator() throws Exception {
        UUID roundId = UUID.randomUUID();
        when(reportExportService.exportRankingExcel(eq(roundId), any()))
                .thenThrow(ApiException.forbidden("Bảng xếp hạng của vòng thi này chưa được công bố"));

        mockMvc.perform(get("/api/rounds/{roundId}/rankings/export.xlsx", roundId)
                        .with(authentication(authenticationFor(RoleName.TEAM_MEMBER))))
                .andExpect(status().isForbidden())
                .andExpect(jsonPath("$.message").exists());
    }

    @Test
    void exportRankingExcel_shouldReturn200WithExcelHeaders_whenServiceReturnsBytes() throws Exception {
        UUID roundId = UUID.randomUUID();
        byte[] fakeWorkbook = "fake-xlsx-content".getBytes(StandardCharsets.UTF_8);
        when(reportExportService.exportRankingExcel(eq(roundId), any())).thenReturn(fakeWorkbook);

        mockMvc.perform(get("/api/rounds/{roundId}/rankings/export.xlsx", roundId)
                        .with(authentication(authenticationFor(RoleName.COORDINATOR))))
                .andExpect(status().isOk())
                .andExpect(header().string(HttpHeaders.CONTENT_TYPE,
                        org.hamcrest.Matchers.startsWith("application/vnd.openxmlformats-officedocument.spreadsheetml.sheet")))
                .andExpect(header().string(HttpHeaders.CONTENT_DISPOSITION,
                        org.hamcrest.Matchers.containsString("attachment")));
    }
}
