package com.devs.devmate.study.repository;

import com.devs.devmate.study.entity.StudyMember;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;
import java.util.Optional;

public interface StudyMemberRepository extends JpaRepository<StudyMember, Long> {

    Optional<StudyMember> findByStudyIdAndMemberIdAndStatus(
            Long studyId, Long memberId, StudyMember.Status status
    );

    Optional<StudyMember> findByStudyIdAndMemberId(Long studyId, Long memberId);

    Optional<StudyMember> findByStudyIdAndRoleAndStatus(Long studyId, StudyMember.Role role, StudyMember.Status status);

    List<StudyMember> findByStudyIdAndStatus(Long studyId, StudyMember.Status status);

    List<StudyMember> findByMemberIdAndStatus(Long memberId, StudyMember.Status status);

    long countByStudyIdAndStatus(Long studyId, StudyMember.Status status);

    boolean existsByMemberIdAndRoleAndStatus(Long memberId, StudyMember.Role role, StudyMember.Status status);

    void deleteAllByStudyId(Long studyId);

    void deleteByStudyId(Long studyId);

    boolean existsByStudyIdAndMemberIdAndStatus(Long studyId, Long memberId, StudyMember.Status status);
}
