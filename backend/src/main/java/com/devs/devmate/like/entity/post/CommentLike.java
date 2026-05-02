package com.devs.devmate.like.entity.post;


import com.devs.devmate.comment.entity.post.Comment;
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
        name = "comment_likes",
        uniqueConstraints = {
                @UniqueConstraint(
                        name = "uk_comment_like_comment_member",
                        columnNames = {"comment_id", "member_id"}
                )
        }
)
public class CommentLike extends BaseEntity {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    Long id;

    @ManyToOne(fetch = FetchType.LAZY, optional = false)
    @JoinColumn(name = "comment_id", nullable = false)
    private Comment comment;

    @ManyToOne(fetch = FetchType.LAZY, optional = false)
    @JoinColumn(name = "member_id", nullable = false)
    private Member member;
}
