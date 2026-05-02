package com.devs.devmate.comment.dto.devlog;


import com.devs.devmate.comment.entity.devlog.DevLogComment;
import lombok.Builder;
import lombok.Getter;

import java.time.LocalDateTime;

@Getter
@Builder
public class DevLogCommentResponse {

    private Long id;
    private Long memberId;
    private String authorNickname;
    private String content;
    private LocalDateTime createdAt;
    private long likeCount;
    private boolean likedByMe;

    public static DevLogCommentResponse from(DevLogComment devLogComment, long likeCount, boolean likedByMe) {
        String authorNickname = devLogComment.getMember().isDeleted()
                ? "탈퇴한 회원"
                : devLogComment.getMember().getNickname();

        return DevLogCommentResponse.builder()
                .id(devLogComment.getId())
                .memberId(devLogComment.getMember().getId())
                .authorNickname(authorNickname)
                .content(devLogComment.getContent())
                .createdAt(devLogComment.getCreatedAt())
                .likeCount(likeCount)
                .likedByMe(likedByMe)
                .build();
    }
}
