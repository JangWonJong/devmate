package com.devs.devmate.comment.service.devlog;

import com.devs.devmate.comment.dto.CommentCreateRequest;
import com.devs.devmate.comment.dto.CommentUpdateRequest;
import com.devs.devmate.comment.dto.devlog.DevLogCommentResponse;
import com.devs.devmate.comment.entity.devlog.DevLogComment;
import com.devs.devmate.comment.repository.devlog.DevLogCommentRepository;
import com.devs.devmate.devlog.entity.DevLog;
import com.devs.devmate.devlog.repository.DevLogRepository;
import com.devs.devmate.global.exception.BusinessException;
import com.devs.devmate.global.exception.ErrorCode;
import com.devs.devmate.like.repository.devlog.DevLogCommentLikeRepository;
import com.devs.devmate.member.entity.Member;
import com.devs.devmate.member.repository.MemberRepository;
import com.devs.devmate.notification.service.NotificationService;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.Collections;
import java.util.List;
import java.util.Set;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
@Transactional(readOnly = true)
public class DevLogCommentServiceImpl implements DevLogCommentService{

    private final DevLogCommentRepository devLogCommentRepository;
    private final DevLogRepository devLogRepository;
    private final MemberRepository memberRepository;
    private final NotificationService notificationService;
    private final DevLogCommentLikeRepository devLogCommentLikeRepository;

    @Override
    @Transactional
    public Long create(Long memberId, Long devLogId, CommentCreateRequest request) {

        DevLog devLog = devLogRepository.findById(devLogId)
                .orElseThrow(() -> new BusinessException(ErrorCode.DEVLOG_NOT_FOUND));

        Member member = memberRepository.findById(memberId)
                .orElseThrow(() -> new BusinessException(ErrorCode.MEMBER_NOT_FOUND));

        DevLogComment comment = DevLogComment.builder()
                .devLog(devLog)
                .member(member)
                .content(request.getContent())
                .build();

        DevLogComment saved = devLogCommentRepository.save(comment);

        notificationService.createDevLogCommentCreated(
                devLog.getMember(),
                member,
                devLog.getId(),
                saved.getId()
        );

        return saved.getId();
    }

    @Override
    public List<DevLogCommentResponse> list(Long devLogId, Long memberId) {

        if (!devLogRepository.existsById(devLogId)) {
            throw new BusinessException(ErrorCode.DEVLOG_NOT_FOUND);
        }

        List<DevLogComment> comments =
                devLogCommentRepository.findAllByDevLogIdOrderByCreatedAtAsc(devLogId);

        List<Long> commentIds = comments.stream()
                .map(DevLogComment::getId)
                .toList();

        Set<Long> likedCommentIds;
        if (memberId != null && !commentIds.isEmpty()) {
            likedCommentIds = devLogCommentLikeRepository.findAllByCommentIdInAndMemberId(commentIds, memberId)
                    .stream()
                    .map(commentLike -> commentLike.getComment().getId())
                    .collect(Collectors.toSet());
        } else {
            likedCommentIds = Collections.emptySet();
        }

        return comments.stream()
                .map(comment -> DevLogCommentResponse.from(
                        comment,
                        devLogCommentLikeRepository.countByCommentId(comment.getId()),
                        likedCommentIds.contains(comment.getId())
                ))
                .toList();
    }

    @Override
    public void update(Long memberId, Long commentId, CommentUpdateRequest request) {

        DevLogComment comment = devLogCommentRepository.findById(commentId)
                .orElseThrow(() -> new BusinessException(ErrorCode.COMMENT_NOT_FOUND));

        if (!comment.getMember().getId().equals(memberId)) {
            throw new BusinessException(ErrorCode.FORBIDDEN_COMMENT);
        }

        comment.updateContent(request.getContent());
    }

    @Override
    public void delete(Long memberId, Long commentId) {

        DevLogComment comment = devLogCommentRepository.findById(commentId)
                .orElseThrow(() -> new BusinessException(ErrorCode.COMMENT_NOT_FOUND));

        if (!comment.getMember().getId().equals(memberId)) {
            throw new BusinessException(ErrorCode.FORBIDDEN_COMMENT);
        }

        devLogCommentRepository.delete(comment);
    }
}
