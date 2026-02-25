package com.devs.devmate.auth.entity;

import com.devs.devmate.member.entity.Member;
import jakarta.persistence.*;
import lombok.*;

import java.time.LocalDateTime;

@Entity
@Getter
@NoArgsConstructor(access = AccessLevel.PROTECTED)
@AllArgsConstructor
@Builder
@Table(name = "refresh_tokens",
    indexes = {
        @Index(name = "idx_refresh_tokens_member_id", columnList = "member_id"),
        @Index(name = "uk_refresh_tokens_token_hash", columnList = "token_hash", unique = true)

})
public class RefreshToken {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(name = "token_hash", nullable = false, length = 64, unique = true)
    private String tokenHash;

    @Column(name = "expires_at", nullable = false)
    private LocalDateTime expiresAt;

    @Column(name = "revoked_at")
    private LocalDateTime revokedAt;

    @ManyToOne(fetch = FetchType.LAZY, optional = false)
    @JoinColumn(name = "member_id", nullable = false)
    private Member member;

    public void revoke(){
        this.revokedAt = LocalDateTime.now();
    }

    public boolean isRevoked(){
        return revokedAt != null;
    }

    public boolean isExpired(){
        return expiresAt.isBefore(LocalDateTime.now());
    }
}
