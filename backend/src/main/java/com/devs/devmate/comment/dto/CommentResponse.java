package com.devs.devmate.comment.dto;


import com.devs.devmate.comment.entity.Comment;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Getter;

import java.time.LocalDateTime;

@Getter
@Builder
public class CommentResponse {

    private Long id;
    private Long memberId;
    private String authorNickname;
    private String content;
    private LocalDateTime createdAt;
    private boolean adopted;

    public static CommentResponse from(Comment comment) {
        String authorNickname = comment.getMember().isDeleted()
                ? "탈퇴한 회원"
                : comment.getMember().getNickname();
        return  CommentResponse.builder()
                .id(comment.getId())
                .memberId(comment.getMember().getId())
                .authorNickname(authorNickname)
                .content(comment.getContent())
                .createdAt(comment.getCreatedAt())
                .adopted(comment.isAdopted())
                .build();
    }

}
