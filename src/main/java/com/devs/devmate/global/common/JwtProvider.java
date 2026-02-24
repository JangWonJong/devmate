package com.devs.devmate.global.common;

import io.jsonwebtoken.Jwts;
import io.jsonwebtoken.security.Keys;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Component;

import javax.crypto.SecretKey;
import java.nio.charset.StandardCharsets;
import java.time.Instant;
import java.time.temporal.ChronoUnit;
import java.util.Date;

@Component
public class JwtProvider {

    private final SecretKey key;
    private final int accessExpMin;
    private final int refreshExpDays;


    public JwtProvider(
            @Value("${jwt.secret}") String secret,
            @Value("${jwt.access-exp-min}") int accessExpMin,
            @Value("${jwt.refresh-exp-days}") int refreshExpDays
    ) {
        this.key = Keys.hmacShaKeyFor(secret.getBytes(StandardCharsets.UTF_8));
        this.accessExpMin = accessExpMin;
        this.refreshExpDays = refreshExpDays;
    }

    public String createAccessToken(Long memberId, String role){
        Instant now = Instant.now();
        return Jwts.builder()
                .subject(String.valueOf(memberId))
                .claim("role", role)
                .issuedAt(Date.from(now))
                .expiration(Date.from(now.plus(accessExpMin, ChronoUnit.MINUTES)))
                .signWith(key)
                .compact();
    }

    public String createRefreshToken(Long memberId){

        Instant now = Instant.now();
        return Jwts.builder()
                .subject(String.valueOf(memberId))
                .issuedAt(Date.from(now))
                .expiration(Date.from(now.plus(refreshExpDays, ChronoUnit.DAYS)))
                .signWith(key)
                .compact();
    }

    public Instant getRefreshExpiryInstant(){

        return Instant.now().plus(refreshExpDays, ChronoUnit.DAYS);
    }

}
