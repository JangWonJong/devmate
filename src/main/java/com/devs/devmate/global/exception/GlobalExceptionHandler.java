package com.devs.devmate.global.exception;

import com.devs.devmate.global.common.ApiError;
import com.devs.devmate.global.common.ApiResponse;
import jakarta.validation.ConstraintViolationException;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.MethodArgumentNotValidException;
import org.springframework.web.bind.annotation.ExceptionHandler;
import org.springframework.web.bind.annotation.RestControllerAdvice;

@RestControllerAdvice
public class GlobalExceptionHandler {

    @ExceptionHandler(BusinessException.class)
    public ResponseEntity<ApiResponse<Void>> handleBusiness(BusinessException e){
        ErrorCode errorCode = e.getErrorCode();
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
        ErrorCode errorcode = ErrorCode.INVALID_REQUEST;
        return ResponseEntity
                .status(errorcode.getStatus())
                .body(ApiResponse.fail(ApiError.builder()
                        .code(errorcode.getCode())
                        .message(errorcode.getMessage())
                        .build()));
    }

    @ExceptionHandler(ConstraintViolationException.class)
    public ResponseEntity<ApiResponse<Void>> handleConstraint(ConstraintViolationException e){

        ErrorCode errorCode = ErrorCode.INVALID_REQUEST;
        return ResponseEntity
                .status(errorCode.getStatus())
                .body(ApiResponse.fail(ApiError.builder()
                        .code(errorCode.getCode())
                        .message(errorCode.getMessage())
                        .build()));
    }

    @ExceptionHandler(Exception.class)
    public ResponseEntity<ApiResponse<Void>> handleUnknown(Exception e){
        ErrorCode errorCode = ErrorCode.INTERNAL_ERROR;
        return ResponseEntity
                .status(errorCode.getStatus())
                .body(ApiResponse.fail(ApiError.builder()
                        .code(errorCode.getCode()).message(errorCode.getMessage())
                        .build()));
    }

}
