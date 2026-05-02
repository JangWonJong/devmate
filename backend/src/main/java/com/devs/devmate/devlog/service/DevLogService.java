package com.devs.devmate.devlog.service;

import com.devs.devmate.devlog.dto.DevLogCreateRequest;
import com.devs.devmate.devlog.dto.DevLogResponse;
import com.devs.devmate.devlog.dto.DevLogUpdateRequest;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.web.multipart.MultipartFile;

import java.util.List;

public interface DevLogService {

    Long create(Long memberId, DevLogCreateRequest request, List<MultipartFile> files);

    Page<DevLogResponse> listMine(Long memberId, String keyword, Pageable pageable);

    Page<DevLogResponse> listByMember(Long memberId, String keyword, Pageable pageable);

    DevLogResponse get(Long memberId, Long devLogId);

    void update(Long memberId, Long devLogId, DevLogUpdateRequest request, List<MultipartFile> files);

    void delete(Long memberId, Long devLogId);

}
