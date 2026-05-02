package com.devs.devmate.like.entity.devlog;


import com.devs.devmate.comment.entity.devlog.DevLogComment;
import com.devs.devmate.global.entity.BaseEntity;
import com.devs.devmate.member.entity.Member;
import jakarta.persistence.*;
import lombok.*;


@Entity
@Getter
@NoArgsConstructor(access = AccessLevel.PROTECTED)
@AllArgsConstructor(access = AccessLevel.PRIVATE)
@Builder
@Table(
        name = "dev_log_comment_likes",
        uniqueConstraints = {
                @UniqueConstraint(
                        name = "uk_dev_log_comment_like_comment_member",
                        columnNames = {"comment_id", "member_id"}
                )
        }
)
public class DevLogCommentLike extends BaseEntity {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    Long id;

    @ManyToOne(fetch = FetchType.LAZY, optional = false)
    @JoinColumn(name = "comment_id", nullable = false)
    private DevLogComment comment;

    @ManyToOne(fetch = FetchType.LAZY, optional = false)
    @JoinColumn(name = "member_id", nullable = false)
    private Member member;
}
