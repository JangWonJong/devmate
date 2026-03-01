package com.devs.devmate.auth.service;

import com.devs.devmate.auth.dto.ReissueResponse;
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

import java.time.LocalDateTime;

import static com.devs.devmate.global.common.TokenHash.sha256;

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
        String refreshHash = sha256(refreshToken);

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

    @Override
    @Transactional
    public ReissueResponse reissue(String refreshToken) {
        if (refreshToken == null || refreshToken.isBlank()) {
            throw new BusinessException(ErrorCode.TOKEN_INVALID);
        }

        Long memberId = jwtProvider.parseRefreshToken(refreshToken);

        RefreshToken saved = refreshTokenRepository.findByMemberId(memberId)
                .orElseThrow(() -> new BusinessException(ErrorCode.TOKEN_INVALID));

        if (saved.isRevoked()) {
            throw new BusinessException(ErrorCode.TOKEN_INVALID);
        }
        if (saved.isExpired()) {
            throw new BusinessException(ErrorCode.TOKEN_EXPIRED);
        }

        String incomingHash = sha256(refreshToken);
        if (!incomingHash.equals(saved.getTokenHash())) {
            throw new BusinessException(ErrorCode.TOKEN_INVALID);
        }

        String role = saved.getMember().getRole().name();
        String newAccessToken = jwtProvider.createAccessToken(memberId, role);
        return new ReissueResponse(newAccessToken);
    }

}
