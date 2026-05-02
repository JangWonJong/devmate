package com.devs.devmate.comment.repository.devlog;

import com.devs.devmate.comment.entity.devlog.DevLogComment;
import org.springframework.data.jpa.repository.EntityGraph;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;

public interface DevLogCommentRepository extends JpaRepository<DevLogComment, Long> {

    @EntityGraph(attributePaths = {"member"})
    List<DevLogComment> findByDevLogIdOrderByIdAsc(Long devLogId);

    void deleteAllByDevLogId(Long devLogId);

    List<DevLogComment> findAllByDevLogIdOrderByCreatedAtAsc(Long devLogId);

    List<DevLogComment> findByMemberIdOrderByCreatedAtDesc(Long memberId);
}
