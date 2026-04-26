package com.devs.devmate.member.entity;

import com.devs.devmate.global.entity.BaseEntity;
import jakarta.persistence.*;
import lombok.*;

import java.util.ArrayList;
import java.util.List;

@Entity
@Getter
@NoArgsConstructor(access = AccessLevel.PROTECTED)
@AllArgsConstructor
@Builder
@Table(name = "members")
public class Member extends BaseEntity {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(nullable = false, unique = true, length = 100)
    private String email;

    @Column(nullable = false, length = 80)
    private String password;

    @Column(nullable = false, length = 30)
    private String name;

    @Column(nullable = false, unique = true, length = 30)
    private String nickname;

    @Column(length = 30)
    private String phone;

    @Column(length = 30)
    private String bio;

    @Column(length = 500)
    private String profileImageUrl;

    @Enumerated(EnumType.STRING)
    @Column(nullable = false)
    @Builder.Default
    private Role role = Role.USER;

    @Enumerated(EnumType.STRING)
    @Column(nullable = false)
    @Builder.Default
    private MemberStatus status = MemberStatus.ACTIVE;

    @OneToMany(mappedBy = "member", cascade = CascadeType.ALL, orphanRemoval = true)
    private List<ProfileLink> profileLinks = new ArrayList<>();

    public void updateProfile(String name, String nickname, String phone, String bio) {
        this.name = name;
        this.nickname = nickname;
        this.phone = phone;
        this.bio = bio;
    }

    public void changePassword(String encodedPassword) {
        this.password = encodedPassword;
    }

    public void withdraw() {
        this.status = MemberStatus.DELETED;
    }

    public boolean isDeleted() {
        return this.status == MemberStatus.DELETED;
    }

    public void restore() { this.status = MemberStatus.ACTIVE; }

    public void changeRole(Role role) { this.role = role; }

    public void addProfileLink(ProfileLink profileLink) {
        this.profileLinks.add(profileLink);
    }

    public void updateProfileImage(String profileImageUrl) {
        this.profileImageUrl = profileImageUrl;
    }


}
