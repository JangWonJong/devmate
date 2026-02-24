package com.devs.devmate.global.common;

import com.fasterxml.jackson.annotation.JsonInclude;
import lombok.Getter;

@Getter
public class ApiResponse<T> {

    private final boolean success;

    @JsonInclude(JsonInclude.Include.NON_NULL)
    private final T data;

    @JsonInclude(JsonInclude.Include.NON_NULL)
    private final ApiError error;

    private ApiResponse(boolean success, T data, ApiError error){
        this.success = success;
        this.data = data;
        this.error = error;
    }

    public static <T> ApiResponse<T> ok(T data){
        return new ApiResponse<>(true, data, null);
    }

    public static ApiResponse<Void> ok(){
        return new ApiResponse<>(true, null, null);
    }

    public static ApiResponse<Void> fail(ApiError error){
        return new ApiResponse<>(false, null, error);
    }

}
