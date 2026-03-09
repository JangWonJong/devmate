package com.devs.devmate.study.service;

import com.devs.devmate.global.exception.BusinessException;
import com.devs.devmate.global.exception.ErrorCode;
import com.devs.devmate.member.entity.Member;
import com.devs.devmate.member.repository.MemberRepository;
import com.devs.devmate.post.entity.Post;
import com.devs.devmate.post.repository.PostRepository;
import com.devs.devmate.study.dto.StudyCreateRequest;
import com.devs.devmate.study.dto.StudyMemberResponse;
import com.devs.devmate.study.dto.StudyResponse;
import com.devs.devmate.study.entity.Study;
import com.devs.devmate.study.entity.StudyMember;
import com.devs.devmate.study.repository.StudyMemberRepository;
import com.devs.devmate.study.repository.StudyRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.Optional;


@Service
@RequiredArgsConstructor
@Transactional
public class StudyServiceImpl implements StudyService{

    private final StudyRepository studyRepository;
    private final StudyMemberRepository studyMemberRepository;
    private final PostRepository postRepository;
    private final MemberRepository memberRepository;

    // 게시글 작성자만 해당 Study post로 study 생성 가능
    @Override
    public Long create(Long memberId, StudyCreateRequest request) {
        Member member = memberRepository.findById(memberId)
                .orElseThrow(() -> new BusinessException(ErrorCode.MEMBER_NOT_FOUND));

        Post post = postRepository.findById(request.postId())
                .orElseThrow(() -> new BusinessException(ErrorCode.POST_NOT_FOUND));

        if (post.getType() != Post.PostType.STUDY) {
            throw new BusinessException(ErrorCode.INVALID_STUDY_POST_TYPE);
        }

        if (!post.getMember().getId().equals(member.getId())) {
            throw new BusinessException(ErrorCode.FORBIDDEN_STUDY_CREATE);
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

    @Override
    public Long join(Long memberId, Long studyId) {
        Member member = memberRepository.findById(memberId)
                .orElseThrow(() -> new BusinessException(ErrorCode.MEMBER_NOT_FOUND));

        Study study = studyRepository.findById(studyId)
                .orElseThrow(() -> new BusinessException(ErrorCode.STUDY_NOT_FOUND));

        if (!study.isRecruiting()) {
            throw new BusinessException(ErrorCode.STUDY_CLOSED);
        }


        Optional<StudyMember> existing = studyMemberRepository
                .findByStudyIdAndMemberIdAndStatus(
                        studyId, memberId, StudyMember.Status.JOINED);

        if (existing.isPresent()) {
            throw new BusinessException(ErrorCode.ALREADY_JOINED_STUDY);
        }

        long currentMembers = studyMemberRepository.countByStudyIdAndStatus(
                studyId, StudyMember.Status.JOINED
        );

        if (currentMembers >= study.getMaxMembers()) {
            throw new BusinessException(ErrorCode.STUDY_FULL);
        }

        StudyMember studyMember = StudyMember.builder()
                .study(study)
                .member(member)
                .role(StudyMember.Role.MEMBER)
                .build();

        studyMemberRepository.save(studyMember);

        return study.getId();
    }

    @Override
    public Long leave(Long memberId, Long studyId) {
        Study study = studyRepository.findById(studyId)
                .orElseThrow(() -> new BusinessException(ErrorCode.STUDY_NOT_FOUND));

        StudyMember studyMember = studyMemberRepository
                .findByStudyIdAndMemberIdAndStatus(
                        studyId, memberId, StudyMember.Status.JOINED
                )
                .orElseThrow(() -> new BusinessException(ErrorCode.STUDY_MEMBER_NOT_FOUND));

        if (studyMember.getRole() == StudyMember.Role.LEADER) {
            throw new BusinessException(ErrorCode.LEADER_CANNOT_LEAVE);
        }

        studyMember.cancel();

        return study.getId();
    }

    @Override
    public Long close(Long memberId, Long studyId) {
        Study study = studyRepository.findById(studyId)
                .orElseThrow(() -> new BusinessException(ErrorCode.STUDY_NOT_FOUND));

        StudyMember studyMember = studyMemberRepository
                .findByStudyIdAndMemberIdAndStatus(
                        studyId, memberId, StudyMember.Status.JOINED
                )
                .orElseThrow(()-> new BusinessException(ErrorCode.STUDY_MEMBER_NOT_FOUND));

        if (studyMember.getRole() != StudyMember.Role.LEADER) {
            throw new BusinessException(ErrorCode.FORBIDDEN_STUDY_CLOSE);
        }

        if (!study.isRecruiting()) {
            throw new BusinessException(ErrorCode.STUDY_ALREADY_CLOSED);
        }

        study.close();

        return study.getId();
    }

    @Override
    public Long delegateLeader(Long memberId, Long studyId, Long targetMemberId) {
        Study study = studyRepository.findById(studyId)
                .orElseThrow(() -> new BusinessException(ErrorCode.STUDY_NOT_FOUND));

        StudyMember currentLeader = studyMemberRepository
                .findByStudyIdAndMemberIdAndStatus(
                        studyId, memberId, StudyMember.Status.JOINED
                )
                .orElseThrow(() -> new BusinessException(ErrorCode.STUDY_MEMBER_NOT_FOUND));

        if (currentLeader.getRole() != StudyMember.Role.LEADER) {
            throw new BusinessException(ErrorCode.FORBIDDEN_STUDY_LEADER_DELEGATE);
        }

        if (memberId.equals(targetMemberId)) {
            throw new BusinessException(ErrorCode.INVALID_STUDY_LEADER_TARGET);
        }

        StudyMember targetMember = studyMemberRepository
                .findByStudyIdAndMemberIdAndStatus(
                        studyId, targetMemberId, StudyMember.Status.JOINED
                )
                .orElseThrow(() -> new BusinessException(ErrorCode.STUDY_MEMBER_NOT_FOUND));

        currentLeader.changeRoleToMember();
        targetMember.changeRoleToLeader();

        return study.getId();
    }

    @Override
    @Transactional(readOnly = true)
    public List<StudyMemberResponse> getMembers(Long studyId) {
        Study study = studyRepository.findById(studyId)
                .orElseThrow(() -> new BusinessException(ErrorCode.STUDY_NOT_FOUND));

        List<StudyMember> studyMembers = studyMemberRepository.findByStudyIdAndStatus(
                study.getId(),
                StudyMember.Status.JOINED
        );

        return studyMembers.stream()
                .sorted((a, b) -> {
                    if (a.getRole() == b.getRole()) return 0;
                    return a.getRole() == StudyMember.Role.LEADER ? -1 : 1;
                })
                .map(StudyMemberResponse::from)
                .toList();
    }

    @Override
    @Transactional
    public List<StudyResponse> getMyStudies(Long memberId) {
        List<StudyMember> studyMembers = studyMemberRepository.findByMemberIdAndStatus(
                memberId, StudyMember.Status.JOINED
        );

        return studyMembers.stream()
                .sorted((a,b) -> b.getCreatedAt().compareTo(a.getCreatedAt()))
                .map(StudyMember::getStudy)
                .map(study -> {
                    long currentMembers = studyMemberRepository.countByStudyIdAndStatus(
                            study.getId(),
                            StudyMember.Status.JOINED
                    );
                    return StudyResponse.from(study, currentMembers);
                })
                .toList();
    }
}
