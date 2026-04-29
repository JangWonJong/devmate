package com.devs.devmate.inquiry.entity;

import com.devs.devmate.global.entity.BaseEntity;
import com.devs.devmate.global.entity.ProcessableEntity;
import com.devs.devmate.member.entity.Member;
import jakarta.persistence.*;
import lombok.*;

@Entity
@Getter
@NoArgsConstructor(access = AccessLevel.PROTECTED)
@AllArgsConstructor(access = AccessLevel.PRIVATE)
@Builder
@Table(name = "inquiries")
public class Inquiry extends ProcessableEntity {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne(fetch = FetchType.LAZY, optional = false)
    @JoinColumn(name = "member_id", nullable = true)
    private Member member;

    @Enumerated(EnumType.STRING)
    @Column(nullable = false, length = 20)
    private InquiryType type;

    @Enumerated(EnumType.STRING)
    @Column(nullable = false, length = 20)
    @Builder.Default
    private InquiryStatus status = InquiryStatus.RECEIVED;

    @Column(nullable = false, length = 2000)
    private String content;

    @Column(length = 2000)
    private String adminReply;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "processed_by")
    private Member processedBy;

    private String guestName;
    private String guestEmail;

    public void markInProgress(Member admin) {
        this.status = InquiryStatus.IN_PROGRESS;
        this.processedBy = admin;
    }

    public void resolve(String adminReply, Member admin) {
        this.status = InquiryStatus.RESOLVED;
        this.adminReply = adminReply;
        this.processedBy = admin;
        markProcessed();
    }


}
