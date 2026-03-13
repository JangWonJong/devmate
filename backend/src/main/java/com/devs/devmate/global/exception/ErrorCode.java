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
    INVALID_RESERVATION_DURATION(HttpStatus.BAD_REQUEST, "RESERVATION_400_2","예약은 1시간 이상 3시간 이하만 가능합니다."),
    PAST_RESERVATION_NOT_ALLOWED(HttpStatus.BAD_REQUEST, "RESERVATION_400_3", "지난 시간으로는 예약할 수 없습니다."),
    RESERVATION_CANCEL_NOT_ALLOWED(HttpStatus.BAD_REQUEST, "RESERVATION_400_4", "예약 시작 1시간 전까지만 취소할 수 있습니다."),
    RESERVATION_DAILY_LIMIT_EXCEEDED(HttpStatus.BAD_REQUEST, "RESERVATION_400_5", "하루 최대 3개의 예약만 가능합니다."),
    RESERVATION_DAILY_HOURS_EXCEEDED(HttpStatus.BAD_REQUEST, "RESERVATION_400_6", "하루 총 예약 가능 시간은 최대 5시간입니다."),

    // COMMENT
    COMMENT_NOT_FOUND(HttpStatus.NOT_FOUND, "COMMENT_404", "댓글을 찾을 수 없습니다."),
    FORBIDDEN_COMMENT(HttpStatus.FORBIDDEN, "COMMENT_403", "댓글에 대한 권한이 없습니다."),

    // STUDY
    STUDY_NOT_FOUND(HttpStatus.NOT_FOUND, "STUDY_404", "스터디를 찾을 수 없습니다."),
    INVALID_STUDY_POST_TYPE(HttpStatus.BAD_REQUEST, "STUDY_400", "스터디 타입 게시글만 스터디를 생성할 수 있습니다."),
    STUDY_ALREADY_EXISTS(HttpStatus.CONFLICT, "STUDY_409", "이미 스터디가 생성된 게시글입니다."),
    FORBIDDEN_STUDY_CREATE(HttpStatus.FORBIDDEN, "STUDY_403", "해당 게시글의 작성자만 스터디를 생성할 수 있습니다."),
    STUDY_CLOSED(HttpStatus.BAD_REQUEST, "STUDY_400_2", "모집이 마감된 스터디입니다."),
    STUDY_FULL(HttpStatus.BAD_REQUEST, "STUDY_400_3", "스터디 정원이 가득 찼습니다."),
    ALREADY_JOINED_STUDY(HttpStatus.CONFLICT, "STUDY_409_2", "이미 참가 중인 스터디입니다."),
    STUDY_MEMBER_NOT_FOUND(HttpStatus.NOT_FOUND, "STUDY_404_2", "스터디 참가 정보를 찾을 수 없습니다."),
    LEADER_CANNOT_LEAVE(HttpStatus.BAD_REQUEST, "STUDY_400_4", "스터디 리더는 탈퇴할 수 없습니다."),
    FORBIDDEN_STUDY_CLOSE(HttpStatus.FORBIDDEN, "STUDY_403_2", "스터디 리더만 모집을 마감할 수 있습니다."),
    STUDY_ALREADY_CLOSED(HttpStatus.BAD_REQUEST, "STUDY_400_5", "이미 모집이 마감된 스터디입니다."),
    FORBIDDEN_STUDY_LEADER_DELEGATE(HttpStatus.FORBIDDEN, "STUDY_403_3", "스터디 리더만 리더를 위임할 수 있습니다."),
    INVALID_STUDY_LEADER_TARGET(HttpStatus.BAD_REQUEST, "STUDY_400_6", "리더 위임 대상이 올바르지 않습니다."),
    STUDY_LEAVE_NOT_ALLOWED_AFTER_CLOSE(HttpStatus.BAD_REQUEST, "STUDY_400_8", "모집 마감된 스터디는 직접 탈퇴할 수 없습니다."),
    FORBIDDEN_STUDY_RESERVATION(HttpStatus.FORBIDDEN, "STUDY_403_4", "해당 스터디의 멤버만 예약할 수 있습니다.");

    private final HttpStatus status;
    private final String code;
    private final String message;

    ErrorCode(HttpStatus status, String code, String message){
        this.status = status;
        this.code = code;
        this.message = message;
    }

}
