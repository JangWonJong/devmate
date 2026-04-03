package com.devs.devmate.inquiry.service;

import com.devs.devmate.inquiry.dto.InquiryCreateRequest;
import com.devs.devmate.inquiry.dto.InquiryResponse;

import java.util.List;

public interface InquiryService {

    void create(Long memberId, InquiryCreateRequest request);

    List<InquiryResponse> findMyInquiries(Long memberId);
}
