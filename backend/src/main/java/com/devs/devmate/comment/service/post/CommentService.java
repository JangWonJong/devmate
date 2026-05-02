package com.devs.devmate.comment.service.post;

import com.devs.devmate.comment.dto.CommentCreateRequest;
import com.devs.devmate.comment.dto.post.CommentResponse;
import com.devs.devmate.comment.dto.post.MyCommentResponse;
import com.devs.devmate.comment.dto.CommentUpdateRequest;

import java.util.List;

public interface CommentService {

    Long create(Long memberId, Long postId, CommentCreateRequest request);

    List<CommentResponse> list(Long postId, Long memberId);

    void delete(Long memberId, Long commentId);

    void update(Long memberId, Long commentId, CommentUpdateRequest request);

    void adopt(Long memberId, Long commentId);

    List<MyCommentResponse> getMyComments(Long memberId);

}
