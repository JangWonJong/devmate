package com.devs.devmate.inquiry.repository;

import com.devs.devmate.inquiry.dto.InquiryResponse;
import com.devs.devmate.inquiry.entity.Inquiry;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;

public interface InquiryRepository extends JpaRepository<Inquiry, Long> {

    List<Inquiry> findByMemberIdOrderByCreatedAtDesc(Long memberId);

}
