package com.devs.devmate.admin.service;

import com.devs.devmate.admin.dto.inquiry.AdminInquiryDetailResponse;
import com.devs.devmate.admin.dto.inquiry.AdminInquiryListResponse;
import com.devs.devmate.global.exception.BusinessException;
import com.devs.devmate.global.exception.ErrorCode;
import com.devs.devmate.inquiry.entity.Inquiry;
import com.devs.devmate.inquiry.entity.InquiryStatus;
import com.devs.devmate.inquiry.repository.InquiryRepository;
import com.devs.devmate.member.entity.Member;
import com.devs.devmate.member.repository.MemberRepository;
import com.devs.devmate.notification.service.NotificationService;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;

@Service
@RequiredArgsConstructor
@Transactional(readOnly = true)
public class AdminInquiryServiceImpl implements AdminInquiryService{

    private final InquiryRepository inquiryRepository;
    private final MemberRepository memberRepository;
    private final NotificationService notificationService;

    @Override
    public List<AdminInquiryListResponse> findAll() {
        return inquiryRepository.findAllByOrderByCreatedAtDesc()
                .stream()
                .map(AdminInquiryListResponse::from)
                .toList();
    }

    @Override
    public AdminInquiryDetailResponse findDetail(Long inquiryId) {

        Inquiry inquiry = inquiryRepository.findById(inquiryId)
                .orElseThrow(() -> new BusinessException(ErrorCode.INQUIRY_NOT_FOUND));

        return AdminInquiryDetailResponse.from(inquiry);
    }

    @Override
    @Transactional
    public void updateStatus(Long adminId, Long inquiryId, InquiryStatus status) {

        Inquiry inquiry = inquiryRepository.findById(inquiryId)
                .orElseThrow(() -> new BusinessException(ErrorCode.INQUIRY_NOT_FOUND));

        Member admin = memberRepository.findById(adminId)
                .orElseThrow(() -> new BusinessException(ErrorCode.MEMBER_NOT_FOUND));

        if (status == null) {
            throw new BusinessException(ErrorCode.INVALID_INQUIRY_STATUS_CHANGE);
        }

        if (status == InquiryStatus.RECEIVED) {
            throw new BusinessException(ErrorCode.INVALID_INQUIRY_STATUS_CHANGE);
        }

        if (status == InquiryStatus.RESOLVED) {
            throw new BusinessException(ErrorCode.INVALID_INQUIRY_STATUS_CHANGE);
        }

        if (status == InquiryStatus.IN_PROGRESS) {
            inquiry.markInProgress(admin);
            return;
        }

        throw new BusinessException(ErrorCode.INVALID_INQUIRY_STATUS_CHANGE);
    }

    @Override
    @Transactional
    public void reply(Long adminId, Long inquiryId, String adminReply) {

        Inquiry inquiry = inquiryRepository.findById(inquiryId)
                .orElseThrow(() -> new BusinessException(ErrorCode.INQUIRY_NOT_FOUND));

        Member admin = memberRepository.findById(adminId)
                .orElseThrow(() -> new BusinessException(ErrorCode.MEMBER_NOT_FOUND));

        if (adminReply == null || adminReply.isBlank()) {
            throw new BusinessException(ErrorCode.INVALID_INQUIRY_REPLY);
        }

        inquiry.resolve(adminReply.trim(), admin);
        if (inquiry.getMember() != null) {
            notificationService.createInquiryAnswered(
                    inquiry.getMember().getId(),
                    inquiry.getId()
            );
        }
    }
}
