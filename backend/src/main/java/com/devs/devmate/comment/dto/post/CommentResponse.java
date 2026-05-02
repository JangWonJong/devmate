package com.devs.devmate.comment.dto.post;


import com.devs.devmate.comment.entity.post.Comment;
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
    private long likeCount;
    private boolean likedByMe;

    public static CommentResponse from(Comment comment, long likeCount, boolean likedByMe) {
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
                .likeCount(likeCount)
                .likedByMe(likedByMe)
                .build();
    }

}
