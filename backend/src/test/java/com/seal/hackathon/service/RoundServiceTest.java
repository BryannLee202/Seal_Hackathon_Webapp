package com.seal.hackathon.service;

import com.seal.hackathon.domain.entity.Round;
import com.seal.hackathon.domain.enums.RoleName;
import com.seal.hackathon.exception.ApiException;
import com.seal.hackathon.repository.CriterionRepository;
import com.seal.hackathon.repository.RoundRepository;
import com.seal.hackathon.security.AuthenticatedPrincipal;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;
import org.springframework.http.HttpStatus;

import java.util.List;
import java.util.Optional;
import java.util.UUID;

import static org.assertj.core.api.Assertions.assertThat;
import static org.assertj.core.api.Assertions.assertThatThrownBy;
import static org.mockito.Mockito.when;

@ExtendWith(MockitoExtension.class)
class RoundServiceTest {

    @Mock
    private RoundRepository roundRepository;
    @Mock
    private CriterionRepository criterionRepository;
    @Mock
    private EventService eventService;
    @Mock
    private AuditService auditService;

    @InjectMocks
    private RoundService roundService;

    private UUID roundId;
    private AuthenticatedPrincipal coordinator;
    private AuthenticatedPrincipal nonCoordinator;

    @BeforeEach
    void setUp() {
        roundId = UUID.randomUUID();
        coordinator = new AuthenticatedPrincipal(UUID.randomUUID(), "coordinator@example.com", "Coordinator A",
                List.of(new AuthenticatedPrincipal.RoleGrant(RoleName.COORDINATOR, null, null, null)));
        nonCoordinator = new AuthenticatedPrincipal(UUID.randomUUID(), "member@example.com", "Member A",
                List.of(new AuthenticatedPrincipal.RoleGrant(RoleName.TEAM_MEMBER, null, null, null)));
    }

    @Test
    void findOrThrowVisibleForRankings_shouldReturnRound_whenPrincipalIsCoordinator_evenIfResultsNotPublished() {
        Round round = Round.builder().resultsPublished(false).build();
        round.setId(roundId);
        when(roundRepository.findById(roundId)).thenReturn(Optional.of(round));

        Round result = roundService.findOrThrowVisibleForRankings(roundId, coordinator);

        assertThat(result).isSameAs(round);
    }

    @Test
    void findOrThrowVisibleForRankings_shouldReturnRound_whenNonCoordinatorAndResultsPublished() {
        Round round = Round.builder().resultsPublished(true).build();
        round.setId(roundId);
        when(roundRepository.findById(roundId)).thenReturn(Optional.of(round));

        Round result = roundService.findOrThrowVisibleForRankings(roundId, nonCoordinator);

        assertThat(result).isSameAs(round);
    }

    @Test
    void findOrThrowVisibleForRankings_shouldThrowForbidden_whenNonCoordinatorAndResultsNotPublished() {
        Round round = Round.builder().resultsPublished(false).build();
        round.setId(roundId);
        when(roundRepository.findById(roundId)).thenReturn(Optional.of(round));

        assertThatThrownBy(() -> roundService.findOrThrowVisibleForRankings(roundId, nonCoordinator))
                .isInstanceOf(ApiException.class)
                .hasFieldOrPropertyWithValue("status", HttpStatus.FORBIDDEN)
                .hasMessageContaining("chưa được công bố");
    }

    @Test
    void findOrThrowVisibleForRankings_shouldThrowNotFound_whenRoundDoesNotExist() {
        when(roundRepository.findById(roundId)).thenReturn(Optional.empty());

        assertThatThrownBy(() -> roundService.findOrThrowVisibleForRankings(roundId, nonCoordinator))
                .isInstanceOf(ApiException.class)
                .hasFieldOrPropertyWithValue("status", HttpStatus.NOT_FOUND);
    }
}
