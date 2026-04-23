package com.devs.devmate.inquiry.repository;

import com.devs.devmate.inquiry.entity.Inquiry;
import com.devs.devmate.inquiry.entity.InquiryStatus;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;

public interface InquiryRepository extends JpaRepository<Inquiry, Long> {

    List<Inquiry> findByMemberIdOrderByCreatedAtDesc(Long memberId);

    List<Inquiry> findAllByOrderByCreatedAtDesc();

    long countByStatus(InquiryStatus status);

    long countByMemberId(Long memberId);

    List<Inquiry> findAllByOrderByCreatedAtDesc(Pageable pageable);
}
