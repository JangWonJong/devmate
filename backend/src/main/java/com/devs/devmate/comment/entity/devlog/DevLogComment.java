package com.devs.devmate.comment.entity.devlog;

import com.devs.devmate.devlog.entity.DevLog;
import com.devs.devmate.global.entity.BaseEntity;
import com.devs.devmate.member.entity.Member;
import jakarta.persistence.*;
import lombok.*;

@Entity
@Getter
@NoArgsConstructor(access = AccessLevel.PROTECTED)
@AllArgsConstructor
@Builder
@Table(name = "dev_log_comments",
        indexes = {
                @Index(name = "idx_dev_log_comments_dev_log_id", columnList = "dev_log_id"),
                @Index(name = "idx_dev_log_comments_member_id", columnList = "member_id")
        })
public class DevLogComment extends BaseEntity {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne(fetch = FetchType.LAZY, optional = false)
    @JoinColumn(name = "dev_log_id", nullable = false)
    private DevLog devLog;

    @ManyToOne(fetch = FetchType.LAZY, optional = false)
    @JoinColumn(name = "member_id", nullable = false)
    private Member member;

    @Column(nullable = false, length = 1000)
    private String content;

    public void updateContent(String content) {
        this.content = content;
    }
}
