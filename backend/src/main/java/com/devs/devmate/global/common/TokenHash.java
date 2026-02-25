package com.devs.devmate.global.common;


import java.nio.charset.StandardCharsets;
import java.security.MessageDigest;
import java.security.NoSuchAlgorithmException;

public class TokenHash {

    private TokenHash(){}

    public static String sha256(String raw){
        try {
            MessageDigest md = MessageDigest.getInstance("SHA-256");
            byte[] hashed = md.digest(raw.getBytes(StandardCharsets.UTF_8));
            return toHex(hashed);
        } catch (NoSuchAlgorithmException e){
            throw new IllegalStateException("SHA-256 algorithm not available", e);

        }
    }

    private static String toHex(byte[] bytes){
        StringBuilder sb = new StringBuilder(bytes.length*2);
        for(byte b : bytes) sb.append(String.format("%02x", b));
        return sb.toString();
    }
}
