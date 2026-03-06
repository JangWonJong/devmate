package com.devs.devmate.global.exception;


import lombok.Getter;
import org.springframework.http.HttpStatus;

@Getter
public enum ErrorCode {

    // COMMON
    INVALID_REQUEST(HttpStatus.BAD_REQUEST, "COMMON_400", "잘못된 요청입니다."),
    INTERNAL_ERROR(HttpStatus.INTERNAL_SERVER_ERROR, "COMMON_500", "서버 오류가 발생했습니다."),

    // AUTH
    AUTH_FAILED(HttpStatus.UNAUTHORIZED, "AUTH_401_1", "이메일 또는 비밀번호가 올바르지 않습니다."),
    TOKEN_EXPIRED(HttpStatus.UNAUTHORIZED, "AUTH_401_2", "로그인이 만료되었습니다."),
    TOKEN_INVALID(HttpStatus.UNAUTHORIZED, "AUTH_401_3", "유효하지 않은 토큰입니다."),

    // MEMBER
    DUPLICATE_EMAIL(HttpStatus.CONFLICT, "MEMBER_409_1", "이미 사용 중인 이메일입니다."),
    DUPLICATE_NICKNAME(HttpStatus.CONFLICT, "MEMBER_409_2", "이미 사용 중인 닉네임입니다."),
    MEMBER_NOT_FOUND(HttpStatus.NOT_FOUND, "MEMBER_404", "회원 정보를 찾을 수 없습니다."),

    // POST
    POST_NOT_FOUND(HttpStatus.NOT_FOUND, "POST_404", "게시글을 찾을 수 없습니다."),
    FORBIDDEN_POST(HttpStatus.FORBIDDEN, "POST_403", "게시글에 대한 권한이 없습니다."),

    // ROOM
    ROOM_NOT_FOUND(HttpStatus.NOT_FOUND, "ROOM_404", "스터디룸을 찾을 수 없습니다."),

    // RESERVATION
    RESERVATION_NOT_FOUND(HttpStatus.NOT_FOUND, "RESERVATION_404", "예약을 찾을 수 없습니다."),
    RESERVATION_TIME_INVALID(HttpStatus.BAD_REQUEST, "RESERVATION_400", "예약 시간을 확인해주세요."),
    RESERVATION_OVERLAP(HttpStatus.CONFLICT, "RESERVATION_409", "이미 예약된 시간대입니다."),
    FORBIDDEN_RESERVATION(HttpStatus.FORBIDDEN, "RESERVATION_403", "예약에 대한 권한이 없습니다."),

    // COMMENT
    COMMENT_NOT_FOUND(HttpStatus.NOT_FOUND, "COMMENT_404", "댓글을 찾을 수 없습니다."),
    FORBIDDEN_COMMENT(HttpStatus.FORBIDDEN, "COMMENT_403", "댓글에 대한 권한이 없습니다.");




    private final HttpStatus status;
    private final String code;
    private final String message;

    ErrorCode(HttpStatus status, String code, String message){
        this.status = status;
        this.code = code;
        this.message = message;
    }

}
