package com.devs.devmate.admin.service;

import com.devs.devmate.admin.dto.log.AdminActionLogResponse;
import com.devs.devmate.admin.dto.member.*;
import com.devs.devmate.admin.entity.ActionType;
import com.devs.devmate.admin.entity.AdminMemberManagement;
import com.devs.devmate.admin.repository.AdminActionLogRepository;
import com.devs.devmate.admin.repository.AdminMemberManagementRepository;
import com.devs.devmate.admin.repository.AdminMemberQueryRepository;
import com.devs.devmate.admin.repository.AdminMemberRepository;
import com.devs.devmate.comment.repository.CommentRepository;
import com.devs.devmate.global.exception.BusinessException;
import com.devs.devmate.global.exception.ErrorCode;
import com.devs.devmate.inquiry.repository.InquiryRepository;
import com.devs.devmate.member.entity.Member;
import com.devs.devmate.member.entity.MemberStatus;
import com.devs.devmate.member.entity.Role;
import com.devs.devmate.post.repository.PostRepository;
import com.devs.devmate.reservation.repository.ReservationRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
import org.springframework.data.domain.Sort;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;


@Service
@RequiredArgsConstructor
@Transactional(readOnly = true)
public class AdminMemberServiceImpl implements AdminMemberService{

    private final AdminMemberQueryRepository adminMemberQueryRepository;
    private final AdminMemberRepository adminMemberRepository;
    private final AdminMemberManagementRepository adminMemberManagementRepository;
    private final AdminActionLogRepository adminActionLogRepository;
    private final PostRepository postRepository;
    private final CommentRepository commentRepository;
    private final ReservationRepository reservationRepository;
    private final InquiryRepository inquiryRepository;
    private final AdminActionLogService adminActionLogService;

    private Member findAdminId(Long adminId){
        Member admin = adminMemberRepository.findById(adminId)
                .orElseThrow(() -> new BusinessException(ErrorCode.MEMBER_NOT_FOUND));
        if (admin.getRole() != Role.ADMIN) {
            throw new BusinessException(ErrorCode.ADMIN_FORBIDDEN);
        }
        return  admin;
    }

    private Member findMemberId(Long memberId){
        return adminMemberRepository.findById(memberId)
                .orElseThrow(() -> new BusinessException(ErrorCode.MEMBER_NOT_FOUND));
    }

    @Override
    public Page<AdminMemberResponse> getMembers(MemberStatus status, String keyword, Pageable pageable) {
        return adminMemberQueryRepository.searchMembers(status, keyword, pageable);
    }

    @Override
    public AdminMemberDetailResponse getMemberDetail(Long memberId) {

        Member member = adminMemberRepository.findById(memberId)
                .orElseThrow(() -> new BusinessException(ErrorCode.MEMBER_NOT_FOUND));
        long postCount = postRepository.countByMemberId(memberId);
        long commentCount = commentRepository.countByMemberId(memberId);
        long inquiryCount = inquiryRepository.countByMemberId(memberId);
        long reservationCount = reservationRepository.countByMemberId(memberId);

        String adminMemo = adminMemberManagementRepository.findByMemberId(memberId)
                .map(AdminMemberManagement::getMemo)
                .orElse("");

        PageRequest recentLimit = PageRequest.of(0, 3);

        PageRequest logLimit = PageRequest.of(
                0,
                10,
                Sort.by(Sort.Direction.DESC, "createdAt")
        );

        List<AdminActionLogResponse> actionLogs = adminActionLogRepository
                .findByTargetMemberId(memberId, logLimit)
                .stream()
                .map(AdminActionLogResponse::from)
                .toList();

        List<AdminMemberRecentPostResponse> recentPosts = postRepository
                .findAllByMemberIdOrderByCreatedAtDesc(memberId, recentLimit)
                .stream()
                .map(AdminMemberRecentPostResponse::from)
                .toList();

        List<AdminMemberRecentInquiryResponse> recentInquiries = inquiryRepository
                .findAllByMemberIdOrderByCreatedAtDesc(memberId, recentLimit)
                .stream()
                .map(AdminMemberRecentInquiryResponse::from)
                .toList();

        List<AdminMemberRecentReservationResponse> recentReservations = reservationRepository
                .findAllByMemberIdOrderByCreatedAtDesc(memberId, recentLimit)
                .stream()
                .map(AdminMemberRecentReservationResponse::from)
                .toList();

        return AdminMemberDetailResponse.from(
                member,
                adminMemo,
                postCount,
                commentCount,
                inquiryCount,
                reservationCount,
                recentPosts,
                recentInquiries,
                recentReservations,
                actionLogs
                );
    }

    @Override
    @Transactional
    public void updateMemberStatus(Long adminId, Long memberId, MemberStatus status) {

        Member admin = findAdminId(adminId);

        Member member = findMemberId(memberId);

        MemberStatus beforeStatus = member.getStatus();

        if (status == null || beforeStatus == status) {
            throw new BusinessException(ErrorCode.INVALID_MEMBER_STATUS_CHANGE);
        }

        if (status == MemberStatus.DELETED && member.isDeleted()) {
            throw new BusinessException(ErrorCode.MEMBER_ALREADY_DELETED);
        }

        if (status == MemberStatus.ACTIVE) {
            member.restore();
        } else if (status == MemberStatus.DELETED) {
            member.withdraw();
        } else {
            throw new BusinessException(ErrorCode.INVALID_MEMBER_STATUS_CHANGE);
        }

        adminActionLogService.save(
                admin,
                member,
                ActionType.MEMBER_STATUS_CHANGE,
                "회원 상태 변경: " + beforeStatus.name() + " → " + status);

    }

    @Override
    @Transactional
    public void updateMemberRole(Long actorMemberId, Long targetMemberId, Role role) {

        Member admin = findAdminId(actorMemberId);

        Member member = findMemberId(targetMemberId);

        if (member.isDeleted()) {
            throw new BusinessException(ErrorCode.DELETED_MEMBER_ROLE_CHANGE_NOT_ALLOWED);
        }

        if (role == null || member.getRole() == role) {
            throw new BusinessException(ErrorCode.INVALID_MEMBER_ROLE_CHANGE);
        }

        if (actorMemberId.equals(targetMemberId) && role == Role.USER) {
            throw new BusinessException(ErrorCode.SELF_ROLE_CHANGE_NOT_ALLOWED);
        }

        Role beforeRole = member.getRole();

        member.changeRole(role);

        adminActionLogService.save(
                admin,
                member,
                ActionType.MEMBER_ROLE_CHANGE,
                "회원 권한 변경: " + beforeRole + " → " + role
        );

    }

    @Override
    @Transactional
    public void updateAdminMemo(Long adminId, Long memberId, String adminMemo) {

        Member admin = findAdminId(adminId);

        Member member = findMemberId(memberId);

        String memo = adminMemo == null ? "" : adminMemo.trim();

        if (memo.length() > 500) {
            throw new BusinessException(ErrorCode.INVALID_ADMIN_MEMO_LENGTH);
        }

        AdminMemberManagement management = adminMemberManagementRepository
                .findByMemberId(memberId)
                .orElseGet(() -> AdminMemberManagement.builder()
                        .member(member)
                        .admin(admin)
                        .memo("")
                        .build());

        management.updateAdminMemo(memo, admin);

        adminActionLogService.save(
                admin,
                member,
                ActionType.ADMIN_MEMO_UPDATE,
                "관리자 메모 수정"
        );

        adminMemberManagementRepository.save(management);
    }
}
