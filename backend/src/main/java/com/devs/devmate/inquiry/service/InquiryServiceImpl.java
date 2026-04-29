package com.devs.devmate.inquiry.service;

import com.devs.devmate.global.exception.BusinessException;
import com.devs.devmate.global.exception.ErrorCode;
import com.devs.devmate.inquiry.dto.InquiryCreateRequest;
import com.devs.devmate.inquiry.dto.InquiryResponse;
import com.devs.devmate.inquiry.entity.Inquiry;
import com.devs.devmate.inquiry.entity.InquiryStatus;
import com.devs.devmate.inquiry.repository.InquiryRepository;
import com.devs.devmate.member.entity.Member;
import com.devs.devmate.member.repository.MemberRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;


@Service
@RequiredArgsConstructor
@Transactional(readOnly = true)
public class InquiryServiceImpl implements InquiryService{

    private final InquiryRepository inquiryRepository;
    private final MemberRepository memberRepository;

    @Override
    @Transactional
    public void create(Long memberId, InquiryCreateRequest request) {

        Inquiry inquiry;

        if (memberId != null) {

            Member member = memberRepository.findById(memberId)
                    .orElseThrow(() -> new BusinessException(ErrorCode.MEMBER_NOT_FOUND));

            inquiry = Inquiry.builder()
                    .member(member)
                    .type(request.getType())
                    .content(request.getContent().trim())
                    .build();
        } else {
            if (request.getGuestName() == null || request.getGuestName().isBlank()) {
                throw new BusinessException(ErrorCode.INVALID_GUEST_INQUIRY_NAME);
            }

            if (request.getGuestEmail() == null || request.getGuestEmail().isBlank()) {
                throw new BusinessException(ErrorCode.INVALID_GUEST_INQUIRY_EMAIL);
            }
            inquiry = Inquiry.builder()
                    .guestName(request.getGuestName())
                    .guestEmail(request.getGuestEmail())
                    .type(request.getType())
                    .content(request.getContent().trim())
                    .build();
        }

        inquiryRepository.save(inquiry);
    }

    @Override
    public List<InquiryResponse> findMyInquiries(Long memberId) {
        return inquiryRepository.findByMemberIdOrderByCreatedAtDesc(memberId)
                .stream()
                .map(InquiryResponse::from)
                .toList();
    }

    @Override
    @Transactional
    public void delete(Long memberId, Long inquiryId) {
        Inquiry inquiry = inquiryRepository.findById(inquiryId)
                .orElseThrow(() -> new BusinessException(ErrorCode.INQUIRY_NOT_FOUND));

        if (inquiry.getMember() == null || !inquiry.getMember().getId().equals(memberId)) {
            throw new BusinessException(ErrorCode.FORBIDDEN_INQUIRY);
        }

        if (inquiry.getStatus() != InquiryStatus.RECEIVED) {
            throw new BusinessException(ErrorCode.INQUIRY_CANCEL_NOT_ALLOWED);
        }

        inquiryRepository.delete(inquiry);
    }
}
