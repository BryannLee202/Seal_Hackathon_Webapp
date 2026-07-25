package com.seal.hackathon.service;

import com.seal.hackathon.domain.entity.User;
import com.seal.hackathon.domain.enums.AccountStatus;
import com.seal.hackathon.domain.enums.UserCategory;
import com.seal.hackathon.dto.auth.LoginRequest;
import com.seal.hackathon.dto.auth.RegisterRequest;
import com.seal.hackathon.dto.auth.UserSummaryResponse;
import com.seal.hackathon.exception.ApiException;
import com.seal.hackathon.repository.UserRepository;
import com.seal.hackathon.repository.UserRoleAssignmentRepository;
import com.seal.hackathon.security.JwtService;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;
import org.springframework.security.crypto.password.PasswordEncoder;

import java.time.Instant;
import java.util.List;
import java.util.UUID;

import static org.assertj.core.api.Assertions.assertThat;
import static org.assertj.core.api.Assertions.assertThatThrownBy;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.when;

@ExtendWith(MockitoExtension.class)
class AuthServiceTest {

    @Mock
    private UserRepository userRepository;
    @Mock
    private UserRoleAssignmentRepository roleAssignmentRepository;
    @Mock
    private PasswordEncoder passwordEncoder;
    @Mock
    private JwtService jwtService;
    @Mock
    private AuditService auditService;

    @InjectMocks
    private AuthService authService;

    private RegisterRequest registerRequest;

    @BeforeEach
    void setUp() {
        registerRequest = new RegisterRequest(
                "Nguyen Van A", "a@example.com", "password123",
                UserCategory.FPT_STUDENT, "SE123456", "FPT University");
    }

    @Test
    void register_shouldThrowConflict_whenEmailAlreadyExists() {
        when(userRepository.existsByEmailIgnoreCase(registerRequest.email())).thenReturn(true);

        assertThatThrownBy(() -> authService.register(registerRequest))
                .isInstanceOf(ApiException.class)
                .hasMessageContaining("Email đã được sử dụng");
    }

    @Test
    void register_shouldCreatePendingUser_whenEmailIsNew() {
        when(userRepository.existsByEmailIgnoreCase(registerRequest.email())).thenReturn(false);
        when(passwordEncoder.encode(registerRequest.password())).thenReturn("hashed-password");
        when(userRepository.save(any(User.class))).thenAnswer(invocation -> {
            User user = invocation.getArgument(0);
            user.setId(UUID.randomUUID());
            return user;
        });

        UserSummaryResponse response = authService.register(registerRequest);

        assertThat(response.email()).isEqualTo(registerRequest.email());
        assertThat(response.accountStatus()).isEqualTo(AccountStatus.PENDING);
    }

    @Test
    void login_shouldThrowUnauthorized_whenEmailNotFound() {
        LoginRequest request = new LoginRequest("missing@example.com", "password123");
        when(userRepository.findByEmailIgnoreCase(request.email())).thenReturn(java.util.Optional.empty());

        assertThatThrownBy(() -> authService.login(request))
                .isInstanceOf(ApiException.class)
                .hasMessageContaining("Email hoặc mật khẩu không đúng");
    }

    @Test
    void login_shouldThrowUnauthorized_whenPasswordDoesNotMatch() {
        LoginRequest request = new LoginRequest("a@example.com", "wrongpassword");
        User user = User.builder()
                .email("a@example.com")
                .passwordHash("hashed-password")
                .accountStatus(AccountStatus.APPROVED)
                .build();
        when(userRepository.findByEmailIgnoreCase(request.email())).thenReturn(java.util.Optional.of(user));
        when(passwordEncoder.matches(request.password(), user.getPasswordHash())).thenReturn(false);

        assertThatThrownBy(() -> authService.login(request))
                .isInstanceOf(ApiException.class)
                .hasMessageContaining("Email hoặc mật khẩu không đúng");
    }

    @Test
    void login_shouldThrowForbidden_whenAccountNotApproved() {
        LoginRequest request = new LoginRequest("a@example.com", "password123");
        User user = User.builder()
                .email("a@example.com")
                .passwordHash("hashed-password")
                .accountStatus(AccountStatus.PENDING)
                .build();
        when(userRepository.findByEmailIgnoreCase(request.email())).thenReturn(java.util.Optional.of(user));
        when(passwordEncoder.matches(request.password(), user.getPasswordHash())).thenReturn(true);

        assertThatThrownBy(() -> authService.login(request))
                .isInstanceOf(ApiException.class)
                .hasMessageContaining("chưa được Ban tổ chức phê duyệt");
    }

    @Test
    void login_shouldThrowForbidden_whenGuestJudgeAccessExpired() {
        LoginRequest request = new LoginRequest("guest@example.com", "password123");
        User user = User.builder()
                .email("guest@example.com")
                .passwordHash("hashed-password")
                .accountStatus(AccountStatus.APPROVED)
                .guestJudge(true)
                .guestAccessExpiresAt(Instant.now().minusSeconds(3600))
                .build();
        when(userRepository.findByEmailIgnoreCase(request.email())).thenReturn(java.util.Optional.of(user));
        when(passwordEncoder.matches(request.password(), user.getPasswordHash())).thenReturn(true);

        assertThatThrownBy(() -> authService.login(request))
                .isInstanceOf(ApiException.class)
                .hasMessageContaining("đã hết hạn truy cập");
    }

    @Test
    void login_shouldSucceed_whenCredentialsValidAndAccountApproved() {
        LoginRequest request = new LoginRequest("a@example.com", "password123");
        UUID userId = UUID.randomUUID();
        User user = User.builder()
                .email("a@example.com")
                .fullName("Nguyen Van A")
                .passwordHash("hashed-password")
                .accountStatus(AccountStatus.APPROVED)
                .build();
        user.setId(userId);
        when(userRepository.findByEmailIgnoreCase(request.email())).thenReturn(java.util.Optional.of(user));
        when(passwordEncoder.matches(request.password(), user.getPasswordHash())).thenReturn(true);
        when(roleAssignmentRepository.findByUserId(userId)).thenReturn(List.of());
        when(jwtService.generateAccessToken(any())).thenReturn("access-token");
        when(jwtService.generateRefreshToken(userId)).thenReturn("refresh-token");

        var response = authService.login(request);

        assertThat(response.accessToken()).isEqualTo("access-token");
        assertThat(response.refreshToken()).isEqualTo("refresh-token");
        assertThat(response.userId()).isEqualTo(userId);
    }
}
