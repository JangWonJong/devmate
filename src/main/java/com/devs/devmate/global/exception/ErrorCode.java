package com.devs.devmate.global.exception;


import lombok.Getter;
import org.springframework.http.HttpStatus;

@Getter
public enum ErrorCode {

    // Common
    INVALID_REQUEST(HttpStatus.BAD_REQUEST, "COMMON_400", "Invalid request"),
    INTERNAL_ERROR(HttpStatus.INTERNAL_SERVER_ERROR, "COMMON_500", "Internal server error"),

    // Auth
    AUTH_FAILED(HttpStatus.UNAUTHORIZED, "AUTH_401", "Wrong email or password"),
    TOKEN_EXPIRED(HttpStatus.UNAUTHORIZED, "AUTH_402", "Token expired"),
    TOKEN_INVALID(HttpStatus.UNAUTHORIZED, "AUTH_403", "Invalid token"),

    // Member
    DUPLICATE_EMAIL(HttpStatus.CONFLICT, "MEMBER_409_1", "Email already exists"),
    DUPLICATE_NICKNAME(HttpStatus.CONFLICT, "MEMBER_409_2", "Nickname already exists"),
    MEMBER_NOT_FOUND(HttpStatus.NOT_FOUND, "MEMBER_404", "Member not found");

    private final HttpStatus status;
    private final String code;
    private final String message;

    ErrorCode(HttpStatus status, String code, String message){
        this.status = status;
        this.code = code;
        this.message = message;
    }

}
