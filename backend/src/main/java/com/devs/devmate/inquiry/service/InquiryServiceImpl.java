package com.devs.devmate.inquiry.service;

import com.devs.devmate.global.exception.BusinessException;
import com.devs.devmate.global.exception.ErrorCode;
import com.devs.devmate.inquiry.dto.InquiryCreateRequest;
import com.devs.devmate.inquiry.dto.InquiryResponse;
import com.devs.devmate.inquiry.entity.Inquiry;
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
        Member member = memberRepository.findById(memberId)
                .orElseThrow(() -> new BusinessException(ErrorCode.MEMBER_NOT_FOUND));

        Inquiry inquiry = Inquiry.builder()
                .member(member)
                .type(request.getType())
                .content(request.getContent().trim())
                .build();

        inquiryRepository.save(inquiry);
    }

    @Override
    public List<InquiryResponse> findMyInquiries(Long memberId) {
        return inquiryRepository.findByMemberIdOrderByCreatedAtDesc(memberId)
                .stream()
                .map(InquiryResponse::from)
                .toList();
    }
}
