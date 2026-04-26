package com.devs.devmate.admin.entity;

import com.devs.devmate.member.entity.Member;
import jakarta.persistence.*;
import lombok.*;

@Entity
@Getter
@NoArgsConstructor(access = AccessLevel.PROTECTED)
@AllArgsConstructor
@Builder
@Table(name = "admin_member_management")
public class AdminMemberManagement {

    @Id @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @OneToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "member_id", nullable = false, unique = true)
    private Member member;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "admin_id")
    private Member admin;

    @Column(columnDefinition = "TEXT")
    private String memo;

    public void updateAdminMemo(String adminMemo, Member admin) {
        this.memo = adminMemo;
        this.admin = admin;
    }
}
