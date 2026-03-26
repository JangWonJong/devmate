package com.devs.devmate.member.service;


import com.devs.devmate.auth.repository.RefreshTokenRepository;
import com.devs.devmate.global.exception.BusinessException;
import com.devs.devmate.global.exception.ErrorCode;
import com.devs.devmate.member.dto.*;
import com.devs.devmate.member.entity.Member;
import com.devs.devmate.member.entity.ProfileLink;
import com.devs.devmate.member.entity.ProfileLinkType;
import com.devs.devmate.member.repository.MemberRepository;
import com.devs.devmate.post.dto.StoredFileInfo;
import com.devs.devmate.post.service.PostFileService;
import com.devs.devmate.reservation.entity.Reservation;
import com.devs.devmate.reservation.repository.ReservationRepository;
import com.devs.devmate.study.entity.Study;
import com.devs.devmate.study.entity.StudyMember;
import com.devs.devmate.study.repository.StudyMemberRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.multipart.MultipartFile;

import java.util.Comparator;
import java.util.List;
import java.util.ArrayList;


@Service
@RequiredArgsConstructor
@Transactional
public class MemberServiceImpl implements MemberService{

    private final MemberRepository memberRepository;
    private final PasswordEncoder passwordEncoder;
    private final StudyMemberRepository studyMemberRepository;
    private final ReservationRepository reservationRepository;
    private final RefreshTokenRepository refreshTokenRepository;
    private final PostFileService postFileService;

    private Member findActiveMember(Long memberId) {
        Member member = memberRepository.findById(memberId)
                .orElseThrow(() -> new BusinessException(ErrorCode.MEMBER_NOT_FOUND));

        if (member.isDeleted()) {
            throw new BusinessException(ErrorCode.MEMBER_ALREADY_DELETED);
        }

        return member;
    }

    private List<ProfileLinkResponse> toProfileLinkResponses(Member member) {
        return  member.getProfileLinks() == null
                ? List.of()
                : member.getProfileLinks().stream()
                .sorted(Comparator.comparing(ProfileLink::getDisplayOrder))
                .map(link -> new ProfileLinkResponse(
                        link.getId(),
                        link.getType().name(),
                        link.getLabel(),
                        link.getUrl(),
                        link.getDisplayOrder()
                ))
                .toList();
    }

    private String normalize(String value) {
        if (value == null) return null;
        String trimmed = value.trim();
        return trimmed.isBlank() ? null : trimmed;
    }

    private String extractStoredFileName(String fileUrl) {
        if (fileUrl == null || fileUrl.isBlank()) {
            return null;
        }
        int idx = fileUrl.lastIndexOf("/");
        return idx >= 0 ? fileUrl.substring(idx + 1) : fileUrl;
    }

    @Override
    public MemberSignupResponse signup(MemberSignUpRequest request, MultipartFile profileImage){
        String email = request.getEmail().trim().toLowerCase();
        String name = request.getName().trim();
        String nickname = request.getNickname().trim();
        String phone = normalize(request.getPhone());
        String bio = normalize(request.getBio());

        if (!request.getPassword().equals(request.getConfirmPassword())) {
            throw new BusinessException(ErrorCode.PASSWORD_CONFIRM_MISMATCH);
        }

        if (memberRepository.existsByEmail(email)){
            throw new BusinessException(ErrorCode.EMAIL_ALREADY_EXISTS);
        }
        if (memberRepository.existsByNickname(nickname)){
            throw new BusinessException(ErrorCode.NICKNAME_ALREADY_EXISTS);
        }

        String encodedPassword = passwordEncoder.encode(request.getPassword());

        String profileImageUrl = null;
    if (profileImage != null && !profileImage.isEmpty()) {
            List<StoredFileInfo> storedFiles = postFileService.saveFiles(List.of(profileImage), "profiles");
            profileImageUrl = storedFiles.get(0).getFileUrl();
        }

        Member member = Member.builder()
                .email(email)
                .password(encodedPassword)
                .name(name)
                .nickname(nickname)
                .phone(phone)
                .bio(bio)
                .profileImageUrl(profileImageUrl)
                .build();

        List<ProfileLink> profileLinks = toProfileLinks(member, request.getLinks());
        profileLinks.forEach(member::addProfileLink);

        Member savedMember = memberRepository.save(member);

        return MemberSignupResponse.builder()
                .id(savedMember.getId())
                .email(savedMember.getEmail())
                .name(savedMember.getName())
                .nickname(savedMember.getNickname())
                .phone(savedMember.getPhone())
                .bio(savedMember.getBio())
                .profileImageUrl(savedMember.getProfileImageUrl())
                .role(savedMember.getRole())
                .build();
    }

    @Override
    @Transactional(readOnly = true)
    public MeResponse getMe(Long memberId) {
        Member member = findActiveMember(memberId);

        return new MeResponse(
                member.getId(),
                member.getEmail(),
                member.getName(),
                member.getNickname(),
                member.getPhone(),
                member.getBio(),
                member.getProfileImageUrl(),
                member.getStatus(),
                toProfileLinkResponses(member)
        );
    }

    @Override
    public MeResponse updateProfile(Long memberId, MemberUpdateRequest request, MultipartFile profileImage) {

        Member member = findActiveMember(memberId);

        String name = request.getName().trim();
        String nickname = request.getNickname().trim();
        String phone = normalize(request.getPhone());
        String bio = normalize(request.getBio());

        if (!member.getNickname().equals(nickname)
                && memberRepository.existsByNickname(nickname)) {
            throw new BusinessException(ErrorCode.NICKNAME_ALREADY_EXISTS);
        }

        member.updateProfile(name, nickname, phone, bio);

        member.getProfileLinks().clear();
        List<ProfileLink> newLinks = toProfileLinks(member, request.getLinks());
        newLinks.forEach(member::addProfileLink);

        if (request.getRemoveProfileImage() != null && request.getRemoveProfileImage()) {

            String oldUrl = member.getProfileImageUrl();

            if (oldUrl != null && !oldUrl.isBlank()) {
                String storedImageName = extractStoredFileName(oldUrl);
                postFileService.deleteFiles(List.of(storedImageName), "profiles");
            }
            member.updateProfileImage(null);
        }

        if (profileImage != null && !profileImage.isEmpty()) {

            String oldUrl = member.getProfileImageUrl();

            if (oldUrl != null && !oldUrl.isBlank()) {
                String storedImageName = extractStoredFileName(oldUrl);
                postFileService.deleteFiles(List.of(storedImageName), "profiles");
            }

            List<StoredFileInfo> storedImages =
                    postFileService.saveFiles(List.of(profileImage), "profiles");

            if (!storedImages.isEmpty()) {
                member.updateProfileImage(storedImages.get(0).getFileUrl());
            }
        }

        return new MeResponse(
                member.getId(),
                member.getEmail(),
                member.getName(),
                member.getNickname(),
                member.getPhone(),
                member.getBio(),
                member.getProfileImageUrl(),
                member.getStatus(),
                toProfileLinkResponses(member)
        );
    }

    private List<ProfileLink> toProfileLinks(Member member, List<ProfileLinkRequest> links) {
        if (links == null || links.isEmpty()) {
            return List.of();

        }

        List<ProfileLink> result = new ArrayList<>();
        int order = 0;

        for (ProfileLinkRequest link : links) {
            String type = link.getType() == null ? null : link.getType().trim();
            String label = link.getLabel() == null ? null : link.getLabel().trim();
            String url = link.getUrl() == null ? null : link.getUrl().trim();

            if (type == null || type.isBlank()) continue;
            if (label == null || label.isBlank()) continue;
            if (url == null || url.isBlank()) continue;

            result.add(
                    ProfileLink.builder()
                            .member(member)
                            .type(ProfileLinkType.valueOf(type))
                            .label(label)
                            .url(url)
                            .displayOrder(
                                    link.getDisplayOrder() != null ? link.getDisplayOrder() : order
                            )
                            .build()
            );
            order++;
        }

        return result;
    }

    @Override
    public void changePassword(Long memberId, PasswordChangeRequest request) {
        Member member = findActiveMember(memberId);

        if (!passwordEncoder.matches(request.getCurrentPassword(), member.getPassword())) {
            throw new BusinessException(ErrorCode.INVALID_PASSWORD);
       }
        if (!request.getNewPassword().equals(request.getConfirmPassword())) {
            throw new BusinessException(ErrorCode.PASSWORD_CONFIRM_MISMATCH);
        }
        if (passwordEncoder.matches(request.getNewPassword(), member.getPassword())) {
            throw new BusinessException(ErrorCode.SAME_AS_OLD_PASSWORD);
        }

        member.changePassword(passwordEncoder.encode(request.getNewPassword()));
    }

    @Override
    public void withdraw(Long memberId, WithdrawRequest request) {
        Member member = findActiveMember(memberId);

        if (!passwordEncoder.matches(request.getPassword(), member.getPassword())) {
            throw new BusinessException(ErrorCode.INVALID_PASSWORD);
        }

        boolean isLeader = studyMemberRepository.existsByMemberIdAndRoleAndStatus(
                memberId, StudyMember.Role.LEADER, StudyMember.Status.JOINED
        );

        if (isLeader) {
            throw new BusinessException(ErrorCode.STUDY_LEADER_WITHDRAW_NOT_ALLOWED);
        }

        var joinedStudyMembers = studyMemberRepository.findByMemberIdAndStatus(
                memberId, StudyMember.Status.JOINED
        );
        for (StudyMember studyMember : joinedStudyMembers) {
            Study study = studyMember.getStudy();
            studyMember.cancel();

            long currentMembers = studyMemberRepository.countByStudyIdAndStatus(
                    study.getId(), StudyMember.Status.JOINED
            );

            if (study.getStatus() == Study.Status.CLOSED_BY_CAPACITY
                    && currentMembers < study.getMaxMembers()) {
                study.reopen();
            }
        }

        var activeReservations = reservationRepository.findByMemberIdAndStatus(
                memberId, Reservation.Status.ACTIVE
        );

        for (Reservation reservation : activeReservations) {
            reservation.cancel();
        }
        refreshTokenRepository.deleteByMemberId(memberId);

        String profileImageUrl = member.getProfileImageUrl();

        if (profileImageUrl != null && !profileImageUrl.isBlank()) {
            String storedFileName = extractStoredFileName(profileImageUrl);
            postFileService.deleteFiles(List.of(storedFileName), "profiles");
        }

        member.withdraw();
    }

}
