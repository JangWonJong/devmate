package com.devs.devmate.post.service;

import com.devs.devmate.post.dto.StoredFileInfo;
import org.springframework.web.multipart.MultipartFile;

import java.util.List;

public interface PostFileService {

    List<StoredFileInfo> saveFiles(List<MultipartFile> files);

    void deleteFiles(List<String> storedFileNames);
}
