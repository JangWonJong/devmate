package com.devs.devmate.inquiry.service;

import com.devs.devmate.inquiry.dto.InquiryCreateRequest;
import com.devs.devmate.inquiry.dto.InquiryResponse;
import com.devs.devmate.inquiry.entity.InquiryStatus;

import java.util.List;

public interface InquiryService {

    void create(Long memberId, InquiryCreateRequest request);

    List<InquiryResponse> findMyInquiries(Long memberId);

    void updateStatus(Long inquiryId, InquiryStatus status);

    void delete(Long memberId, Long inquiryId);
}
