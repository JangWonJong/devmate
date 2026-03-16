package com.devs.devmate.member.service;


import com.devs.devmate.global.exception.BusinessException;
import com.devs.devmate.global.exception.ErrorCode;
import com.devs.devmate.member.dto.*;
import com.devs.devmate.member.entity.Member;
import com.devs.devmate.member.repository.MemberRepository;
import com.devs.devmate.study.entity.StudyMember;
import com.devs.devmate.study.repository.StudyMemberRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

@Service
@RequiredArgsConstructor
@Transactional
public class MemberServiceImpl implements MemberService{

    private final MemberRepository memberRepository;
    private final PasswordEncoder passwordEncoder;
    private final StudyMemberRepository studyMemberRepository;

    private Member findActiveMember(Long memberId) {
        Member member = memberRepository.findById(memberId)
                .orElseThrow(() -> new BusinessException(ErrorCode.MEMBER_NOT_FOUND));

        if (member.isDeleted()) {
            throw new BusinessException(ErrorCode.MEMBER_ALREADY_DELETED);
        }

        return member;
    }

    @Override
    public MemberSignupResponse signup(MemberSignUpRequest request){
        String email = request.getEmail().trim();
        String name = request.getName().trim();
        String nickname = request.getNickname().trim();

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

        Member member = Member.builder()
                .email(email)
                .password(encodedPassword)
                .name(name)
                .nickname(nickname)
                .build();

        Member savedMember = memberRepository.save(member);

        return MemberSignupResponse.builder()
                .id(savedMember.getId())
                .email(savedMember.getEmail())
                .name(savedMember.getName())
                .nickname(savedMember.getNickname())
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
                member.getStatus()
        );
    }

    @Override
    public MeResponse updateProfile(Long memberId, MemberUpdateRequest request) {
        Member member = findActiveMember(memberId);

        String name = request.getName().trim();
        String nickname = request.getNickname().trim();
        String phone = request.getPhone() == null ? null : request.getPhone().trim();
        String bio = request.getBio() == null ? null : request.getBio().trim();

        if (!member.getNickname().equals(nickname)
                && memberRepository.existsByNickname(nickname)) {
            throw new BusinessException(ErrorCode.NICKNAME_ALREADY_EXISTS);
        }

        member.updateProfile(name, nickname, phone, bio);

        return new MeResponse(
                member.getId(),
                member.getEmail(),
                member.getName(),
                member.getNickname(),
                member.getPhone(),
                member.getBio(),
                member.getStatus()
        );
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
            studyMember.cancel();
        }

        member.withdraw();
    }

}
