package com.devs.devmate.post.entity;

import com.devs.devmate.global.entity.BaseEntity;
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
@Table(name = "posts")
public class Post extends BaseEntity {

    public enum PostType {
        QUESTION,
        STUDY
    }

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(nullable = false, length = 150)
    private String title;

    @Column(nullable = false, columnDefinition = "TEXT")
    private String content;

    @Column(nullable = false)
    @Builder.Default
    private boolean solved = false;

    @OneToMany(mappedBy = "post", cascade = CascadeType.ALL, orphanRemoval = true)
    @Builder.Default
    private List<PostAttachment> attachments = new ArrayList<>();

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "member_id", nullable = false)
    private Member member;

    @Enumerated(EnumType.STRING)
    @Column(nullable = false, length = 20)
    @Builder.Default
    private PostType type = PostType.QUESTION;

    public void update(String title, String content, boolean solved){
        this.title = title;
        this.content = content;
        this.solved = solved;
    }
    public void markSolved(){
        this.solved = true;
    }

    public void markUnsolved(){
        this.solved = false;
    }

    public void addAttachment(PostAttachment attachment) {
        this.attachments.add(attachment);
    }

}
