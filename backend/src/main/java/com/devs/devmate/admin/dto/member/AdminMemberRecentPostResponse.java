package com.devs.devmate.admin.dto.member;

import com.devs.devmate.post.entity.Post;
import lombok.Builder;
import lombok.Getter;

import java.time.LocalDateTime;

@Getter
@Builder
public class AdminMemberRecentPostResponse {

    private Long id;
    private String title;
    private LocalDateTime createdAt;

    public static AdminMemberRecentPostResponse from(Post post) {
        return AdminMemberRecentPostResponse.builder()
                .id(post.getId())
                .title(post.getTitle())
                .createdAt(post.getCreatedAt())
                .build();
    }
}
