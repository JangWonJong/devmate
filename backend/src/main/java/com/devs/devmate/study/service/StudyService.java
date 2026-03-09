package com.devs.devmate.study.service;

import com.devs.devmate.study.dto.StudyCreateRequest;
import com.devs.devmate.study.dto.StudyMemberResponse;
import com.devs.devmate.study.dto.StudyResponse;

import java.util.List;

public interface StudyService {

    Long create(Long memberId, StudyCreateRequest request);

    StudyResponse get(Long studyId);

    Long join(Long memberId, Long studyId);

    Long leave(Long memberId, Long studyId);

    Long close(Long memberId, Long studyId);

    Long delegateLeader(Long memberId, Long studyId, Long targetMemberId);

    List<StudyMemberResponse> getMembers(Long studyId);

    List<StudyResponse> getMyStudies(Long memberId);

}
