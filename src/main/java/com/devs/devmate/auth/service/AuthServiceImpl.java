package com.devs.devmate.auth.service;

import com.devs.devmate.global.common.JwtProvider;
import com.devs.devmate.global.common.TokenHash;
import com.devs.devmate.auth.dto.LoginRequest;
import com.devs.devmate.auth.dto.LoginResponse;
import com.devs.devmate.global.exception.BusinessException;
import com.devs.devmate.global.exception.ErrorCode;
import com.devs.devmate.member.entity.Member;
import com.devs.devmate.auth.entity.RefreshToken;
import com.devs.devmate.member.repository.MemberRepository;
import com.devs.devmate.auth.repository.RefreshTokenRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.nio.charset.StandardCharsets;
import java.security.MessageDigest;
import java.time.LocalDateTime;
import java.time.ZoneId;
import java.util.HexFormat;

@Service
@RequiredArgsConstructor
@Transactional
public class AuthServiceImpl implements AuthService{

    private final MemberRepository memberRepository;
    private final RefreshTokenRepository refreshTokenRepository;
    private final PasswordEncoder passwordEncoder;
    private final JwtProvider jwtProvider;

    @Value("${jwt.refresh-exp-days}")
    private long refreshExpDays;

    @Override
    public LoginResponse login(LoginRequest request) {

        Member member = memberRepository.findByEmail(request.getEmail())
                .orElseThrow(() -> new BusinessException(ErrorCode.AUTH_FAILED));
        if (!passwordEncoder.matches(request.getPassword(), member.getPassword())){
            throw new BusinessException(ErrorCode.AUTH_FAILED);
        }

        String accessToken = jwtProvider.createAccessToken(member.getId(), member.getRole().name());
        String refreshToken = jwtProvider.createRefreshToken(member.getId());
        String refreshHash = TokenHash.sha256(refreshToken);

        refreshTokenRepository.deleteByMemberId(member.getId());

        RefreshToken entity = RefreshToken.builder()
                .member(member)
                .tokenHash(refreshHash)
                .expiresAt(LocalDateTime.now().plusDays(refreshExpDays))
                .build();

        refreshTokenRepository.save(entity);

        return LoginResponse.builder()
                .accessToken(accessToken)
                .refreshToken(refreshToken)
                .build();
    }

}
