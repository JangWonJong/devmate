package com.devs.devmate.study.service;

import com.devs.devmate.study.dto.StudyCreateRequest;
import com.devs.devmate.study.dto.StudyResponse;

public interface StudyService {

    Long create(Long memberId, StudyCreateRequest request);

    StudyResponse get(Long studyId);

}
