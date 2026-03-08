package com.devs.devmate.study.service;

import com.devs.devmate.global.exception.BusinessException;
import com.devs.devmate.global.exception.ErrorCode;
import com.devs.devmate.member.entity.Member;
import com.devs.devmate.member.repository.MemberRepository;
import com.devs.devmate.post.entity.Post;
import com.devs.devmate.post.repository.PostRepository;
import com.devs.devmate.study.dto.StudyCreateRequest;
import com.devs.devmate.study.dto.StudyResponse;
import com.devs.devmate.study.entity.Study;
import com.devs.devmate.study.entity.StudyMember;
import com.devs.devmate.study.repository.StudyMemberRepository;
import com.devs.devmate.study.repository.StudyRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;


@Service
@RequiredArgsConstructor
@Transactional
public class StudyServiceImpl implements StudyService{

    private final StudyRepository studyRepository;
    private final StudyMemberRepository studyMemberRepository;
    private final PostRepository postRepository;
    private final MemberRepository memberRepository;


    @Override
    public Long create(Long memberId, StudyCreateRequest request) {
        Member member = memberRepository.findById(memberId)
                .orElseThrow(() -> new BusinessException(ErrorCode.MEMBER_NOT_FOUND));

        Post post = postRepository.findById(request.postId())
                .orElseThrow(() -> new BusinessException(ErrorCode.POST_NOT_FOUND));

        if (post.getType() != Post.PostType.STUDY) {
            throw new BusinessException(ErrorCode.INVALID_STUDY_POST_TYPE);
        }

        if (studyRepository.existsByPostId(post.getId())) {
            throw new BusinessException(ErrorCode.STUDY_ALREADY_EXISTS);
        }

        Study study = Study.builder()
                .post(post)
                .maxMembers(request.maxMembers())
                .build();

        Study savedStudy = studyRepository.save(study);

        StudyMember leader = StudyMember.builder()
                .study(savedStudy)
                .member(member)
                .role(StudyMember.Role.LEADER)
                .build();

        studyMemberRepository.save(leader);

        return savedStudy.getId();
    }

    @Override
    @Transactional(readOnly = true)
    public StudyResponse get(Long studyId) {
        Study study = studyRepository.findById(studyId)
                .orElseThrow(() -> new BusinessException(ErrorCode.STUDY_NOT_FOUND));

        long currentMembers = studyMemberRepository.countByStudyIdAndStatus(
                study.getId(),
                StudyMember.Status.JOINED
        );

        return StudyResponse.from(study, currentMembers);
    }
}
