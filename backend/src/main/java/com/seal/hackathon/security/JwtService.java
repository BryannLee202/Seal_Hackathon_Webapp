package com.seal.hackathon.security;

import com.seal.hackathon.domain.enums.JudgeType;
import com.seal.hackathon.domain.enums.RoleName;
import com.seal.hackathon.domain.enums.ScopeType;
import io.jsonwebtoken.Claims;
import io.jsonwebtoken.Jwts;
import io.jsonwebtoken.security.Keys;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;

import javax.crypto.SecretKey;
import java.util.ArrayList;
import java.util.Base64;
import java.util.Date;
import java.util.List;
import java.util.Map;
import java.util.UUID;
import java.util.stream.Collectors;

@Service
public class JwtService {

    private final SecretKey signingKey;
    private final long accessTokenExpirationMs;
    private final long refreshTokenExpirationMs;

    public JwtService(
            @Value("${app.jwt.secret}") String secret,
            @Value("${app.jwt.access-token-expiration-ms}") long accessTokenExpirationMs,
            @Value("${app.jwt.refresh-token-expiration-ms}") long refreshTokenExpirationMs
    ) {
        this.signingKey = Keys.hmacShaKeyFor(Base64.getDecoder().decode(secret));
        this.accessTokenExpirationMs = accessTokenExpirationMs;
        this.refreshTokenExpirationMs = refreshTokenExpirationMs;
    }

    public String generateAccessToken(AuthenticatedPrincipal principal) {
        List<Map<String, Object>> roleClaims = principal.roles().stream()
                .map(r -> {
                    Map<String, Object> m = new java.util.HashMap<>();
                    m.put("role", r.roleName().name());
                    m.put("scopeType", r.scopeType().name());
                    m.put("scopeId", r.scopeId() == null ? null : r.scopeId().toString());
                    m.put("judgeType", r.judgeType() == null ? null : r.judgeType().name());
                    return m;
                })
                .collect(Collectors.toList());

        Date now = new Date();
        return Jwts.builder()
                .subject(principal.userId().toString())
                .claim("email", principal.email())
                .claim("fullName", principal.fullName())
                .claim("roles", roleClaims)
                .claim("type", "access")
                .issuedAt(now)
                .expiration(new Date(now.getTime() + accessTokenExpirationMs))
                .signWith(signingKey)
                .compact();
    }

    public String generateRefreshToken(UUID userId) {
        Date now = new Date();
        return Jwts.builder()
                .subject(userId.toString())
                .claim("type", "refresh")
                .issuedAt(now)
                .expiration(new Date(now.getTime() + refreshTokenExpirationMs))
                .signWith(signingKey)
                .compact();
    }

    public Claims parseClaims(String token) {
        return Jwts.parser()
                .verifyWith(signingKey)
                .build()
                .parseSignedClaims(token)
                .getPayload();
    }

    @SuppressWarnings("unchecked")
    public AuthenticatedPrincipal toPrincipal(Claims claims) {
        UUID userId = UUID.fromString(claims.getSubject());
        String email = claims.get("email", String.class);
        String fullName = claims.get("fullName", String.class);
        List<Map<String, Object>> roleClaims = claims.get("roles", List.class);

        List<AuthenticatedPrincipal.RoleGrant> roles = new ArrayList<>();
        if (roleClaims != null) {
            for (Map<String, Object> rc : roleClaims) {
                RoleName roleName = RoleName.valueOf((String) rc.get("role"));
                ScopeType scopeType = ScopeType.valueOf((String) rc.get("scopeType"));
                String scopeIdStr = (String) rc.get("scopeId");
                UUID scopeId = scopeIdStr == null ? null : UUID.fromString(scopeIdStr);
                String judgeTypeStr = (String) rc.get("judgeType");
                JudgeType judgeType = judgeTypeStr == null ? null : JudgeType.valueOf(judgeTypeStr);
                roles.add(new AuthenticatedPrincipal.RoleGrant(roleName, scopeType, scopeId, judgeType));
            }
        }
        return new AuthenticatedPrincipal(userId, email, fullName, roles);
    }
}
