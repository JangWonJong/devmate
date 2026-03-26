package com.devs.devmate.post.dto;


import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Size;
import lombok.Getter;

import java.util.List;

@Getter
public class PostUpdateRequest {

    @NotBlank(message = "제목을 입력해주세요")
    @Size(max = 150)
    private String title;

    @NotBlank(message = "내용을 입력해주세요")
    private String content;

    private boolean solved;

    private List<Long> removedFileIds;
}
