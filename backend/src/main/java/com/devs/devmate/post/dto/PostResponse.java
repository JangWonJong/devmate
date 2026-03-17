package com.devs.devmate.post.dto;

import com.devs.devmate.post.entity.Post;
import lombok.Builder;
import lombok.Getter;

import java.time.LocalDateTime;

@Getter
@Builder
public class PostResponse {

    private Long id;
    private String title;
    private String content;
    private boolean solved;
    private Long authorId;
    private String authorNickname;
    private String type;
    private LocalDateTime createdAt;
    private LocalDateTime updatedAt;

    public static PostResponse from(Post post){
        String authorNickname = post.getMember().isDeleted()
                ? "탈퇴한 회원"
                : post.getMember().getNickname();
        return PostResponse.builder()
                .id(post.getId())
                .title(post.getTitle())
                .content(post.getContent())
                .solved(post.isSolved())
                .authorId(post.getMember().getId())
                .authorNickname(authorNickname)
                .type(post.getType().name())
                .createdAt(post.getCreatedAt())
                .updatedAt(post.getUpdatedAt())
                .build();
    }


}
