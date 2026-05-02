package com.devs.devmate.like.entity;


import com.devs.devmate.devlog.entity.DevLog;
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
        name = "dev_log_likes",
        uniqueConstraints = {
                @UniqueConstraint(name = "uk_dev_log_like_member_dev_log",
                        columnNames = {"dev_log_id", "member_id"})
        }
)
public class DevLogLike extends BaseEntity {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "devlog_id", nullable = false)
    private DevLog devLog;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "member_id", nullable = false)
    private Member member;
}
