package com.devs.devmate.global.exception;

import com.devs.devmate.global.common.ApiError;
import com.devs.devmate.global.common.ApiResponse;
import jakarta.validation.ConstraintViolationException;
import lombok.extern.slf4j.Slf4j;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.MethodArgumentNotValidException;
import org.springframework.web.bind.annotation.ExceptionHandler;
import org.springframework.web.bind.annotation.RestControllerAdvice;

@Slf4j
@RestControllerAdvice
public class GlobalExceptionHandler {

    @ExceptionHandler(BusinessException.class)
    public ResponseEntity<ApiResponse<Void>> handleBusiness(BusinessException e){
        ErrorCode errorCode = e.getErrorCode();
        log.warn("BusinessException: code={}, message={}", errorCode.getCode(), e.getMessage(), e);
        return ResponseEntity
                .status(errorCode.getStatus())
                .body(ApiResponse.fail(ApiError.builder()
                        .code(errorCode.getCode())
                        .message(errorCode.getMessage())
                        .build()));
    }

    @ExceptionHandler(MethodArgumentNotValidException.class)
    public ResponseEntity<ApiResponse<Void>> handleValid(MethodArgumentNotValidException e){
        String msg = e.getBindingResult().getFieldErrors().stream()
                .findFirst()
                .map(fe -> fe.getField() + ": " + fe.getDefaultMessage())
                .orElse(ErrorCode.INVALID_REQUEST.getMessage());

        ErrorCode errorCode = ErrorCode.INVALID_REQUEST;
        log.warn("MethodArgumentNotValidException: {}", msg, e);
        return ResponseEntity
                .status(errorCode.getStatus())
                .body(ApiResponse.fail(ApiError.builder()
                        .code(errorCode.getCode())
                        .message(msg)
                        .build()));
    }

    @ExceptionHandler(ConstraintViolationException.class)
    public ResponseEntity<ApiResponse<Void>> handleConstraint(ConstraintViolationException e){
        String msg = e.getConstraintViolations().stream()
                .findFirst()
                .map(v -> v.getMessage())
                .orElse(ErrorCode.INVALID_REQUEST.getMessage());

        ErrorCode errorCode = ErrorCode.INVALID_REQUEST;
        log.warn("ConstraintViolationException: {}", msg, e);
        return ResponseEntity
                .status(errorCode.getStatus())
                .body(ApiResponse.fail(ApiError.builder()
                        .code(errorCode.getCode())
                        .message(msg)
                        .build()));
    }

    @ExceptionHandler(Exception.class)
    public ResponseEntity<ApiResponse<Void>> handleUnknown(Exception e){
        ErrorCode errorCode = ErrorCode.INTERNAL_ERROR;
        log.error("Unhandled exception", e);
        return ResponseEntity
                .status(errorCode.getStatus())
                .body(ApiResponse.fail(ApiError.builder()
                        .code(errorCode.getCode())
                        .message(errorCode.getMessage())
                        .build()));
    }

}
