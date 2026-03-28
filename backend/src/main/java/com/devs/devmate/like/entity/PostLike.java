package com.devs.devmate.like.entity;


import com.devs.devmate.global.entity.BaseEntity;
import com.devs.devmate.member.entity.Member;
import com.devs.devmate.post.entity.Post;
import jakarta.persistence.*;
import lombok.*;

@Entity
@Getter
@NoArgsConstructor(access = AccessLevel.PROTECTED)
@AllArgsConstructor(access = AccessLevel.PRIVATE)
@Builder
@Table(
        name = "post_likes",
        uniqueConstraints = {
                @UniqueConstraint(name = "uk_post_like_post_member",
                        columnNames = {"post_id", "member_id"})
        }
)
public class PostLike extends BaseEntity {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "post_id", nullable = false)
    private Post post;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "member_id", nullable = false)
    private Member member;
}
