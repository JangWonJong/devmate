package com.devs.devmate.devlog.dto;


import com.devs.devmate.devlog.entity.DevLog;
import com.devs.devmate.devlog.entity.DevLogAttachment;
import lombok.Builder;
import lombok.Getter;

import java.time.LocalDateTime;
import java.util.Comparator;
import java.util.List;

@Getter
@Builder
public class DevLogResponse {

    private Long id;
    private String title;
    private String problem;
    private String solution;
    private String reference;
    private String retrospective;
    private List<DevLogAttachmentResponse> attachments;
    private Long authorId;
    private String authorNickname;
    private LocalDateTime createdAt;
    private LocalDateTime updatedAt;

    public static DevLogResponse from(DevLog devLog) {
        String authorNickname = devLog.getMember().isDeleted()
                ? "탈퇴한 회원"
                : devLog.getMember().getNickname();

        List<DevLogAttachmentResponse> attachments = devLog.getAttachments().stream()
                .sorted(Comparator.comparing(DevLogAttachment::getDisplayOrder))
                .map(attachment -> new DevLogAttachmentResponse(
                        attachment.getId(),
                        attachment.getOriginalFileName(),
                        attachment.getFileUrl(),
                        attachment.getContentType(),
                        attachment.getFileSize(),
                        attachment.getDisplayOrder()
                ))
                .toList();

        return DevLogResponse.builder()
                .id(devLog.getId())
                .title(devLog.getTitle())
                .problem(devLog.getProblem())
                .solution(devLog.getSolution())
                .reference(devLog.getReference())
                .retrospective(devLog.getRetrospective())
                .attachments(attachments)
                .authorId(devLog.getMember().getId())
                .authorNickname(authorNickname)
                .createdAt(devLog.getCreatedAt())
                .updatedAt(devLog.getUpdatedAt())
                .build();
    }

}
