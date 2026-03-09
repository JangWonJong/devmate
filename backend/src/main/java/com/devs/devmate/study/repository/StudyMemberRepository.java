package com.devs.devmate.study.repository;

import com.devs.devmate.study.entity.StudyMember;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;
import java.util.Optional;

public interface StudyMemberRepository extends JpaRepository<StudyMember, Long> {

    long countByStudyIdAndStatus(Long studyId, StudyMember.Status status);

        Optional<StudyMember> findByStudyIdAndMemberIdAndStatus(
            Long studyId, Long memberId, StudyMember.Status status
    );

    List<StudyMember> findByStudyIdAndStatus(Long studyId, StudyMember.Status status);

    List<StudyMember> findByMemberIdAndStatus(Long memberId, StudyMember.Status status);

    void deleteByStudyId(Long studyId);
}
