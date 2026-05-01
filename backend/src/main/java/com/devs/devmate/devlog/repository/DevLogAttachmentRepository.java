package com.devs.devmate.devlog.repository;

import com.devs.devmate.devlog.entity.DevLogAttachment;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;

public interface DevLogAttachmentRepository extends JpaRepository<DevLogAttachment, Long> {

    List<DevLogAttachment> findByDevLogIdOrderByDisplayOrderAsc(Long devLogId);

    List<DevLogAttachment> findAllByIdIn(List<Long> ids);
}
