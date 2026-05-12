package com.devs.devmate.study.service;

import com.devs.devmate.global.exception.BusinessException;
import com.devs.devmate.global.exception.ErrorCode;
import com.devs.devmate.member.entity.Member;
import com.devs.devmate.member.repository.MemberRepository;
import com.devs.devmate.notification.service.NotificationService;
import com.devs.devmate.post.entity.Post;
import com.devs.devmate.post.repository.PostRepository;
import com.devs.devmate.reservation.command.entity.Reservation;
import com.devs.devmate.reservation.command.repository.ReservationRepository;
import com.devs.devmate.reservation.space.dto.ReservationSpaceCreateRequest;
import com.devs.devmate.reservation.space.dto.ReservationSpaceResponse;
import com.devs.devmate.reservation.space.entity.ReservationSpace;
import com.devs.devmate.reservation.space.repository.ReservationSpaceRepository;
import com.devs.devmate.reservation.space.service.ReservationSpaceService;
import com.devs.devmate.study.dto.StudyCreateRequest;
import com.devs.devmate.study.dto.StudyMemberResponse;
import com.devs.devmate.study.dto.StudyPlaceUpdateRequest;
import com.devs.devmate.study.dto.StudyResponse;
import com.devs.devmate.study.entity.Study;
import com.devs.devmate.study.entity.StudyMember;
import com.devs.devmate.study.repository.StudyMemberRepository;
import com.devs.devmate.study.repository.StudyRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.PageRequest;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;
import java.util.Comparator;
import java.util.List;
import java.util.Optional;


@Service
@RequiredArgsConstructor
@Transactional
public class StudyServiceImpl implements StudyService{

    private static final int POPULAR_STUDY_CANDIDATE_SIZE = 30;

    private final StudyRepository studyRepository;
    private final StudyMemberRepository studyMemberRepository;
    private final PostRepository postRepository;
    private final MemberRepository memberRepository;
    private final ReservationRepository reservationRepository;
    private final NotificationService notificationService;
    private final ReservationSpaceRepository reservationSpaceRepository;
    private final ReservationSpaceService reservationSpaceService;

    private String findLeaderNickname(Long studyId) {
        return studyMemberRepository.findByStudyIdAndStatus(studyId, StudyMember.Status.JOINED)
                .stream()
                .filter(member -> member.getRole() == StudyMember.Role.LEADER)
                .findFirst()
                .map(member -> member.getMember().getNickname())
                .orElse(null);
    }

    private void validateStudyJoinReservationConflict(Long memberId, Long studyId) {
        List<Reservation> studyReservations = reservationRepository.findAllByStudyIdAndStatus(
                studyId, Reservation.Status.ACTIVE
        );

        for (Reservation studyReservation : studyReservations) {
            if (studyReservation.getMember().getId().equals(memberId)) {
                continue;
            }

            boolean overlap = reservationRepository.existsMemberOverlap(
                    memberId,
                    studyReservation.getDate(),
                    studyReservation.getStartTime(),
                    studyReservation.getEndTime(),
                    Reservation.Status.ACTIVE
            );

            if (overlap) {
                throw new BusinessException(ErrorCode.STUDY_JOIN_RESERVATION_CONFLICT);
            }
        }
    }

    private void closeStudyIfCapacityFull(Study study) {
        long currentMembers = studyMemberRepository.countByStudyIdAndStatus(
                study.getId(),
                StudyMember.Status.JOINED
        );

        if (currentMembers >= study.getMaxMembers()) {
            study.closeByCapacity();
        }
    }

    private void reopenStudyIfNeeded(Study study) {
        long currentMembers = studyMemberRepository.countByStudyIdAndStatus(
                study.getId(),
                StudyMember.Status.JOINED
        );
        if (study.isClosedByCapacity() && currentMembers < study.getMaxMembers()) {
            study.reopen();
        }
    }

    // 공지 수정 알림용
    private void notifyStudyNoticeUpdated(Study study, Member actor) {
        List<StudyMember> studyMembers = studyMemberRepository.findByStudyIdAndStatus(
                study.getId(), StudyMember.Status.JOINED
        );

        for (StudyMember studyMember : studyMembers) {
            notificationService.createStudyNoticeUpdated(
                    studyMember.getMember(),
                    actor,
                    study.getPost().getId(),
                    study.getPost().getTitle()
            );
        }
    }

    private Member findStudyLeader(Long studyId) {
        return studyMemberRepository.findByStudyIdAndRoleAndStatus(
                        studyId,
                        StudyMember.Role.LEADER,
                        StudyMember.Status.JOINED
                )
                .orElseThrow(() -> new BusinessException(ErrorCode.STUDY_LEADER_NOT_FOUND))
                .getMember();
    }

    private void notifyStudyJoined(Study study, Member actor) {
        notificationService.createStudyJoined(
                findStudyLeader(study.getId()),
                actor,
                study.getPost().getId(),
                study.getPost().getTitle()
        );
    }

    private long calculateStudyPopularityScore(Study study) {
        long currentMembers = studyMemberRepository.countByStudyIdAndStatus(
                study.getId(),
                StudyMember.Status.JOINED
        );

        long score = 0L;
        score += currentMembers * 3L;

        if (study.isRecruiting()) {
            score += 5L;
        }

        if (study.getCreatedAt() != null) {
            LocalDateTime now = LocalDateTime.now();

            if (study.getCreatedAt().isAfter(now.minusDays(1))) {
                score += 8L;
            } else if (study.getCreatedAt().isAfter(now.minusDays(3))) {
                score += 5L;
            } else if (study.getCreatedAt().isAfter(now.minusDays(7))) {
                score += 3L;
            }
        }

        return score;
    }

    private boolean isJoinedByMe(Long viewerMemberId, Long studyId) {
        if (viewerMemberId == null) {
            return false;
        }

        return studyMemberRepository.existsByStudyIdAndMemberIdAndStatus(
                studyId,
                viewerMemberId,
                StudyMember.Status.JOINED
        );
    }

    private StudyResponse toStudyResponse(Study study, Long viewerMemberId) {
        long currentMembers = studyMemberRepository.countByStudyIdAndStatus(
                study.getId(),
                StudyMember.Status.JOINED
        );
        String leaderNickname = findLeaderNickname(study.getId());
        boolean joinedByMe = isJoinedByMe(viewerMemberId, study.getId());

        return StudyResponse.from(study, currentMembers, leaderNickname, joinedByMe);
    }

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
                .notice(request.notice() != null ? request.notice().trim() : null)
                .placeName(request.placeName())
                .address(request.address())
                .latitude(request.latitude())
                .longitude(request.longitude())
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
    public StudyResponse get(Long viewerMemberId, Long studyId) {
        Study study = studyRepository.findById(studyId)
                .orElseThrow(() -> new BusinessException(ErrorCode.STUDY_NOT_FOUND));

        long currentMembers = studyMemberRepository.countByStudyIdAndStatus(
                study.getId(),
                StudyMember.Status.JOINED
        );
        String leaderNickname = findLeaderNickname(study.getId());

        boolean joinedByMe = isJoinedByMe(viewerMemberId, study.getId());

        return StudyResponse.from(study, currentMembers, leaderNickname, joinedByMe);
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

        Optional<StudyMember> joined = studyMemberRepository
                .findByStudyIdAndMemberIdAndStatus(
                        studyId, memberId, StudyMember.Status.JOINED);

        if (joined.isPresent()) {
            throw new BusinessException(ErrorCode.ALREADY_JOINED_STUDY);
        }

        validateStudyJoinReservationConflict(memberId, studyId);

        long currentMembers = studyMemberRepository.countByStudyIdAndStatus(
                studyId, StudyMember.Status.JOINED
        );

        if (currentMembers >= study.getMaxMembers()) {
            throw new BusinessException(ErrorCode.STUDY_FULL);
        }

        Optional<StudyMember> existing = studyMemberRepository
                .findByStudyIdAndMemberId(studyId, memberId);

        if (existing.isPresent()) {
            StudyMember studyMember = existing.get();
            studyMember.reJoin();
            notifyStudyJoined(study, member);
            closeStudyIfCapacityFull(study);

            return study.getId();
        }

        StudyMember studyMember = StudyMember.builder()
                .study(study)
                .member(member)
                .role(StudyMember.Role.MEMBER)
                .build();

        studyMemberRepository.save(studyMember);

        notifyStudyJoined(study, member);

        closeStudyIfCapacityFull(study);

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
        Member actor = studyMember.getMember();
        Member leader = findStudyLeader(studyId);
        studyMember.cancel();

        List<Reservation> myStudyReservations =
                reservationRepository.findByStudyIdAndMemberIdAndStatus(
                        studyId, memberId, Reservation.Status.ACTIVE
                );
        for (Reservation reservation : myStudyReservations) {
            reservation.cancel();
        }

        reopenStudyIfNeeded(study);

        notificationService.createStudyLeave(
                leader, actor, study.getPost().getId(), study.getPost().getTitle()
        );

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

        if (study.isClosedByLeader()) {
            throw new BusinessException(ErrorCode.STUDY_ALREADY_CLOSED);
        }

        study.closeByLeader();

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

        notificationService.createStudyLeaderDelegated(
                targetMember.getMember(),
                currentLeader.getMember(),
                study.getPost().getId(),
                study.getPost().getTitle()
        );

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
    @Transactional(readOnly = true)
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
                    String leaderNickname = findLeaderNickname(study.getId());
                    boolean joinedByMe = isJoinedByMe(memberId, study.getId());

                    return StudyResponse.from(study, currentMembers, leaderNickname, joinedByMe);
                })
                .toList();
    }

    @Override
    @Transactional(readOnly = true)
    public StudyResponse getByPostId(Long viewerMemberId, Long postId) {

        Study study = studyRepository.findByPostId(postId)
                .orElseThrow(() -> new BusinessException(ErrorCode.STUDY_NOT_FOUND));

        long currentMembers =
                studyMemberRepository.countByStudyIdAndStatus(
                        study.getId(),
                        StudyMember.Status.JOINED
                );

        String leaderNickname = findLeaderNickname(study.getId());

        boolean joinedByMe = isJoinedByMe(viewerMemberId, study.getId());

        return StudyResponse.from(study, currentMembers, leaderNickname, joinedByMe);
    }

    @Override
    public Long updateCapacity(Long memberId, Long studyId, Integer maxMembers) {
        Study study = studyRepository.findById(studyId)
                .orElseThrow(() -> new BusinessException(ErrorCode.STUDY_NOT_FOUND));

        StudyMember studyMember = studyMemberRepository
                .findByStudyIdAndMemberIdAndStatus(
                        studyId, memberId, StudyMember.Status.JOINED
                )
                .orElseThrow(() -> new BusinessException(ErrorCode.STUDY_MEMBER_NOT_FOUND));

        if (studyMember.getRole() != StudyMember.Role.LEADER) {
            throw new BusinessException(ErrorCode.FORBIDDEN_STUDY_UPDATE);
        }

        long currentMembers = studyMemberRepository.countByStudyIdAndStatus(
                studyId, StudyMember.Status.JOINED
        );

        if (maxMembers < currentMembers) {
            throw new BusinessException(ErrorCode.INVALID_STUDY_CAPACITY);
        }

        study.updateMaxMembers(maxMembers);

        if (study.isRecruiting() && currentMembers >= study.getMaxMembers()) {
            study.closeByCapacity();
        } else {
            reopenStudyIfNeeded(study);
        }

        return study.getId();
    }

    @Override
    public Long updateNotice(Long memberId, Long studyId, String notice) {
        Study study = studyRepository.findById(studyId)
                .orElseThrow(() -> new BusinessException(ErrorCode.STUDY_NOT_FOUND));

        StudyMember studyMember = studyMemberRepository
                .findByStudyIdAndMemberIdAndStatus(
                        studyId, memberId, StudyMember.Status.JOINED
                )
                .orElseThrow(() -> new BusinessException(ErrorCode.STUDY_MEMBER_NOT_FOUND));

        if (studyMember.getRole() != StudyMember.Role.LEADER) {
            throw new BusinessException(ErrorCode.FORBIDDEN_STUDY_NOTICE_UPDATE);
        }

        study.updateNotice(notice.trim());

        notifyStudyNoticeUpdated(study, studyMember.getMember());

        return study.getId();
    }

    @Override
    @Transactional(readOnly = true)
    public List<StudyResponse> listPopular(Long viewerMemberId, int limit) {
        int safeLimit = Math.max(1, Math.min(limit, 10));

        List<Study> candidates = studyRepository.findRecentStudies(
                PageRequest.of(0, POPULAR_STUDY_CANDIDATE_SIZE)
        );

        return candidates.stream()
                .sorted(
                        Comparator
                                .comparingLong(this::calculateStudyPopularityScore)
                                .reversed()
                                .thenComparing(Study::getId, Comparator.reverseOrder())
                )
                .limit(safeLimit)
                .map(study -> toStudyResponse(study, viewerMemberId))
                .toList();
    }

    @Override
    public Long updatePlace(Long memberId, Long studyId, StudyPlaceUpdateRequest request) {
        Study study = studyRepository.findById(studyId)
                .orElseThrow(() -> new BusinessException(ErrorCode.STUDY_NOT_FOUND));

        StudyMember studyMember = studyMemberRepository
                .findByStudyIdAndMemberIdAndStatus(
                        studyId,
                        memberId,
                        StudyMember.Status.JOINED
                )
                .orElseThrow(() -> new BusinessException(ErrorCode.STUDY_MEMBER_NOT_FOUND));

        if (studyMember.getRole() != StudyMember.Role.LEADER) {
            throw new BusinessException(ErrorCode.FORBIDDEN_STUDY_UPDATE);
        }

        String placeName =
                request.placeName() != null ? request.placeName().trim() : null;

        String address =
                request.address() != null ? request.address().trim() : null;

        study.updatePlace(
                request.placeName() != null ? request.placeName().trim() : null,
                request.address() != null ? request.address().trim() : null,
                request.latitude(),
                request.longitude()
        );

        List<Reservation> studyReservations =
                reservationRepository.findAllByStudyIdAndStatus(
                        studyId,
                        Reservation.Status.ACTIVE
                );

        if (placeName != null && !placeName.isBlank()) {
            ReservationSpace nextReservationSpace;

            boolean externalPlace = address != null && !address.isBlank();

            if (externalPlace) {
                ReservationSpaceResponse spaceResponse =
                        reservationSpaceService.createUserInputSpace(
                                new ReservationSpaceCreateRequest(
                                        placeName,
                                        address,
                                        request.latitude(),
                                        request.longitude(),
                                        request.externalPlaceId() != null
                                                ? request.externalPlaceId()
                                                : placeName + "-" + address
                                )
                        );

                nextReservationSpace = reservationSpaceRepository.findById(spaceResponse.id())
                        .orElseThrow(() -> new BusinessException(ErrorCode.RESERVATION_SPACE_NOT_FOUND));
            } else {
                nextReservationSpace = reservationSpaceRepository.findByName(placeName)
                        .orElseThrow(() -> new BusinessException(ErrorCode.RESERVATION_SPACE_NOT_FOUND));
            }

            for (Reservation reservation : studyReservations) {
                reservation.updatePlace(
                        nextReservationSpace,
                        null
                );
            }
        }

        return study.getId();
    }
}
