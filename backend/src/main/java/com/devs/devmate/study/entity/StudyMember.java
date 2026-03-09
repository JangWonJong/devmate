package com.devs.devmate.study.entity;


import com.devs.devmate.global.entity.BaseEntity;
import com.devs.devmate.member.entity.Member;
import jakarta.persistence.*;
import lombok.*;

@Entity
@Getter
@NoArgsConstructor(access = AccessLevel.PROTECTED)
@AllArgsConstructor
@Builder
@Table(name = "study_members",
        uniqueConstraints = {
        @UniqueConstraint(name = "uk_study_member", columnNames = {"study_id", "member_id"})
        }
)
public class StudyMember extends BaseEntity {

    public enum Role {
        LEADER,
        MEMBER
    }

    public enum Status {
        JOINED,
        CANCELED
    }

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne(fetch = FetchType.LAZY, optional = false)
    @JoinColumn(name = "study_id", nullable = false)
    private Study study;

    @ManyToOne(fetch = FetchType.LAZY, optional = false)
    @JoinColumn(name = "member_id", nullable = false)
    private Member member;

    @Enumerated(EnumType.STRING)
    @Column(nullable = false, length = 20)
    @Builder.Default
    private Role role = Role.MEMBER;

    @Enumerated(EnumType.STRING)
    @Column(nullable = false, length = 20)
    @Builder.Default
    private Status status = Status.JOINED;

    public void cancel() {
        this.status = Status.CANCELED;
    }

    public boolean isJoined() {
        return this.status == Status.JOINED;
    }

    public void changeRoleToLeader() {
        this.role = Role.LEADER;
    }

    public void changeRoleToMember() {
        this.role = Role.MEMBER;
    }
}
