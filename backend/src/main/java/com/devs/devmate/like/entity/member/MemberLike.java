package com.devs.devmate.like.entity.member;


import com.devs.devmate.global.entity.BaseEntity;
import com.devs.devmate.member.entity.Member;
import jakarta.persistence.*;
import lombok.*;

@Entity
@Getter
@NoArgsConstructor(access = AccessLevel.PROTECTED)
@AllArgsConstructor(access = AccessLevel.PRIVATE)
@Builder
@Table(name = "member_likes",
        uniqueConstraints = {
        @UniqueConstraint(
                name = "uk_member_like_target_actor",
                columnNames = {"target_member_id", "actor_member_id"}
        )
        })
public class MemberLike extends BaseEntity {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "target_member_id", nullable = false)
    private Member targetMember;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "actor_member_id", nullable = false)
    private Member actorMember;
}
