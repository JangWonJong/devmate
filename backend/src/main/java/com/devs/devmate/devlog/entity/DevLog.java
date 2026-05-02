package com.devs.devmate.devlog.entity;

import com.devs.devmate.global.entity.BaseEntity;
import com.devs.devmate.like.entity.DevLogLike;
import com.devs.devmate.member.entity.Member;
import jakarta.persistence.*;
import lombok.*;

import java.util.ArrayList;
import java.util.List;

@Entity
@Getter
@NoArgsConstructor(access = AccessLevel.PROTECTED)
@AllArgsConstructor(access = AccessLevel.PRIVATE)
@Builder
@Table(name = "dev_logs")
public class DevLog extends BaseEntity {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(nullable = false, length = 150)
    private String title;

    @Column(nullable = false, columnDefinition = "TEXT")
    private String problem;

    @Column(nullable = false, columnDefinition = "TEXT")
    private String solution;

    @Column(columnDefinition = "TEXT")
    private String reference;

    @Column(columnDefinition = "TEXT")
    private String retrospective;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "member_id", nullable = false)
    private Member member;

    @OneToMany(mappedBy = "devLog", cascade = CascadeType.ALL, orphanRemoval = true)
    @Builder.Default
    private List<DevLogAttachment> attachments = new ArrayList<>();

    @OneToMany(mappedBy = "devLog", cascade = CascadeType.ALL, orphanRemoval = true)
    @Builder.Default
    private List<DevLogLike> likes = new ArrayList<>();

    public void update(String title, String problem, String solution, String reference, String retrospective) {
        this.title = title;
        this.problem = problem;
        this.solution = solution;
        this.reference = reference;
        this.retrospective = retrospective;
    }
}
