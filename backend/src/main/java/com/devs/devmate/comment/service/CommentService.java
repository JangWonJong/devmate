package com.devs.devmate.comment.service;

import com.devs.devmate.comment.dto.CommentCreateRequest;
import com.devs.devmate.comment.dto.CommentResponse;
import com.devs.devmate.comment.entity.CommentUpdateRequest;

import java.util.List;

public interface CommentService {

    Long create(Long memberId, Long postId, CommentCreateRequest request);

    List<CommentResponse> list(Long postId);

    void delete(Long memberId, Long commentId);

    void update(Long memberId, Long commentId, CommentUpdateRequest request);

    void adopt(Long memberId, Long commentId);

}
