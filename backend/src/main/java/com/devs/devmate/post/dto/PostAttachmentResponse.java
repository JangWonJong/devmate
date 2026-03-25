package com.devs.devmate.post.dto;

import lombok.AllArgsConstructor;
import lombok.Getter;

@Getter
@AllArgsConstructor
public class PostAttachmentResponse {
    private Long id;
    private String originalFileName;
    private String fileUrl;
    private String contentType;
    private Long fileSize;
    private Integer displayOrder;
}
