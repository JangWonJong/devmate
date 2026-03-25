package com.devs.devmate.post.repository;

import com.devs.devmate.post.entity.PostAttachment;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;

public interface PostAttachmentRepository extends JpaRepository<PostAttachment, Long> {

    List<PostAttachment> findByPostIdOrderByDisplayOrderAsc(Long postId);
}
