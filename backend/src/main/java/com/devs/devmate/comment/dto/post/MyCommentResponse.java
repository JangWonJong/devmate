package com.devs.devmate.comment.dto.post;

import com.devs.devmate.comment.entity.post.Comment;
import lombok.Builder;
import lombok.Getter;

import java.time.LocalDateTime;

@Getter
@Builder
public class MyCommentResponse {

    private Long commentId;
    private Long postId;
    private String postTitle;
    private String content;
    private boolean adopted;
    private LocalDateTime createdAt;

    public static MyCommentResponse from(Comment comment) {
        return MyCommentResponse.builder()
                .commentId(comment.getId())
                .postId(comment.getPost().getId())
                .postTitle(comment.getPost().getTitle())
                .content(comment.getContent())
                .adopted(comment.isAdopted())
                .createdAt(comment.getCreatedAt())
                .build();
    }

}
