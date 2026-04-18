package com.devs.devmate.admin.service;

import com.devs.devmate.admin.dto.AdminInquiryDetailResponse;
import com.devs.devmate.admin.dto.AdminInquiryListResponse;
import com.devs.devmate.inquiry.entity.InquiryStatus;

import java.util.List;

public interface AdminInquiryService {

    List<AdminInquiryListResponse> findAll();

    AdminInquiryDetailResponse findDetail(Long inquiryId);

    void updateStatus(Long adminId, Long inquiryId, InquiryStatus status);

    void reply(Long adminId, Long inquiryId, String adminReply);
}
