package com.devs.devmate.post.dto;


import com.devs.devmate.post.entity.Post;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Size;
import lombok.Getter;

@Getter
public class PostCreateRequest {

    @NotBlank
    @Size(max = 150)
    private String title;

    @NotBlank
    private String content;

    @NotNull
    private Post.PostType type;

}
