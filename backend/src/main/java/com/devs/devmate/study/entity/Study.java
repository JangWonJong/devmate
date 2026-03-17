package com.devs.devmate.study.entity;

import com.devs.devmate.global.entity.BaseEntity;
import com.devs.devmate.post.entity.Post;
import jakarta.persistence.*;
import lombok.*;

@Entity
@Getter
@NoArgsConstructor(access = AccessLevel.PROTECTED)
@AllArgsConstructor
@Builder
@Table(name = "studies")
public class Study extends BaseEntity {

    public enum Status {
        RECRUITING,
        CLOSED_BY_CAPACITY,
        CLOSED_BY_LEADER
    }

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @OneToOne(fetch = FetchType.LAZY, optional = false)
    @JoinColumn(name = "post_id", nullable = false, unique = true)
    private Post post;

    @Column(nullable = false)
    private Integer maxMembers;

    @Enumerated(EnumType.STRING)
    @Column(nullable = false, length = 20)
    @Builder.Default
    private Status status = Status.RECRUITING;

    public boolean isRecruiting() {
        return this.status == Status.RECRUITING;
    }

    public boolean isClosedByCapacity() {
        return this.status == Status.CLOSED_BY_CAPACITY;
    }

    public boolean isClosedByLeader() {
        return this.status == Status.CLOSED_BY_LEADER;
    }
    public void closeByCapacity() {
        this.status = Status.CLOSED_BY_CAPACITY;
    }

    public void closeByLeader() {
        this.status = Status.CLOSED_BY_LEADER;
    }

    public void reopen(){
        this.status = Status.RECRUITING;
    }
}
