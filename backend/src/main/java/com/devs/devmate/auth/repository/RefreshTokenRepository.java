package com.devs.devmate.auth.repository;

import com.devs.devmate.auth.entity.RefreshToken;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.Optional;

public interface RefreshTokenRepository extends JpaRepository<RefreshToken, Long> {

    Optional<RefreshToken> findByTokenHash(String tokenHash);

    void deleteByMemberId(Long memberId);

    Optional<RefreshToken> findByMemberId(Long memberId);
}
