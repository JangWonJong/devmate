package com.devs.devmate.post.dto;

import com.devs.devmate.post.entity.Post;
import com.devs.devmate.post.entity.PostAttachment;
import lombok.Builder;
import lombok.Getter;

import java.time.LocalDateTime;
import java.util.Comparator;
import java.util.List;

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
    private List<PostAttachmentResponse> attachments;
    private long likeCount;
    private LocalDateTime createdAt;
    private LocalDateTime updatedAt;
    private long commentCount;
    private boolean bookmarkedByMe;

    public static PostResponse from(Post post, long likeCount, long commentCount, boolean bookmarkedByMe){
        String authorNickname = post.getMember().isDeleted()
                ? "탈퇴한 회원"
                : post.getMember().getNickname();
        List<PostAttachmentResponse> attachments = post.getAttachments().stream()
                .sorted(Comparator.comparing(PostAttachment::getDisplayOrder))
                .map(attachment -> new PostAttachmentResponse(
                        attachment.getId(),
                        attachment.getOriginalFileName(),
                        attachment.getFileUrl(),
                        attachment.getContentType(),
                        attachment.getFileSize(),
                        attachment.getDisplayOrder()
                ))
                .toList();

        return PostResponse.builder()
                .id(post.getId())
                .title(post.getTitle())
                .content(post.getContent())
                .solved(post.isSolved())
                .authorId(post.getMember().getId())
                .authorNickname(authorNickname)
                .type(post.getType().name())
                .attachments(attachments)
                .likeCount(likeCount)
                .commentCount(commentCount)
                .createdAt(post.getCreatedAt())
                .updatedAt(post.getUpdatedAt())
                .bookmarkedByMe(bookmarkedByMe)
                .build();
    }


}
