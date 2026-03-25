package com.devs.devmate.post.service;

import com.devs.devmate.global.exception.BusinessException;
import com.devs.devmate.global.exception.ErrorCode;
import com.devs.devmate.post.dto.StoredFileInfo;
import org.springframework.stereotype.Service;
import org.springframework.web.multipart.MultipartFile;

import java.io.File;
import java.io.IOException;
import java.util.ArrayList;
import java.util.List;
import java.util.UUID;

@Service
public class PostFileServiceImpl implements PostFileService{

    private static final long MAX_FILE_SIZE = 5 * 1024 * 1024;
    private static final List<String> ALLOWED_CONTENT_TYPES = List.of(
            "image/png",
            "image/jpeg",
            "image/jpg",
            "image/webp"
    );
    private final String uploadDir = "C:/WJ/devmate/uploads";

    private void validateFile(MultipartFile file) {
        String contentType = file.getContentType();

        if (contentType == null || !ALLOWED_CONTENT_TYPES.contains(contentType)){
            throw new BusinessException(ErrorCode.INVALID_FILE_TYPE);
        }

        if (file.getSize() > MAX_FILE_SIZE) {
            throw new BusinessException(ErrorCode.FILE_SIZE_EXCEEDED);
        }
    }

    private String extractExtension(String originalName) {
        if (originalName == null || !originalName.contains(".")) {
            return "";
        }
        return originalName.substring(originalName.lastIndexOf("."));
    }

    @Override
    public List<StoredFileInfo> saveFiles(List<MultipartFile> files) {
        if (files == null || files.isEmpty()) {
            return List.of();
        }

        List<StoredFileInfo> result = new ArrayList<>();

        File dir = new File(uploadDir);
        if (!dir.exists() && !dir.mkdirs()) {
            throw new BusinessException(ErrorCode.FILE_UPLOAD_FAILED);
        }

        for (MultipartFile file : files) {
            if (file == null || file.isEmpty()) {
                continue;
            }

            validateFile(file);

            String originalName = file.getOriginalFilename();
            String ext = extractExtension(originalName);
            String storedName = UUID.randomUUID() + ext;
            File dest = new File(dir, storedName);

            try {
                file.transferTo(dest);
            } catch (IOException e) {
                throw new BusinessException(ErrorCode.FILE_UPLOAD_FAILED);
            }

            result.add(new StoredFileInfo(
                    originalName,
                    storedName,
                    "/uploads/" + storedName,
                    file.getContentType(),
                    file.getSize()
            ));
        }

        return result;
    }
}
