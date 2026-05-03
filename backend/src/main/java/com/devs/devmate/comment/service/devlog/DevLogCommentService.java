package com.devs.devmate.comment.service.devlog;

import com.devs.devmate.comment.dto.CommentCreateRequest;
import com.devs.devmate.comment.dto.CommentUpdateRequest;
import com.devs.devmate.comment.dto.devlog.DevLogCommentResponse;

import java.util.List;

public interface DevLogCommentService {

    Long create(Long memberId, Long devLogId, CommentCreateRequest request);

    List<DevLogCommentResponse> list(Long devLogId, Long memberId);

    void update(Long memberId, Long devLogId, Long commentId, CommentUpdateRequest request);

    void delete(Long memberId, Long devLogId, Long commentId);
}
