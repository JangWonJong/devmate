package com.devs.devmate.post.dto;

import lombok.AllArgsConstructor;
import lombok.Getter;

@Getter
@AllArgsConstructor
public class StoredFileInfo {

    private String originalFilename;
    private String storedFilename;
    private String fileUrl;
    private String contentType;
    private Long fileSize;

}
