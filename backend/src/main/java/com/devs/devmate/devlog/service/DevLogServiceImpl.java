package com.devs.devmate.devlog.service;

import com.devs.devmate.comment.repository.devlog.DevLogCommentRepository;
import com.devs.devmate.devlog.dto.DevLogCreateRequest;
import com.devs.devmate.devlog.dto.DevLogResponse;
import com.devs.devmate.devlog.dto.DevLogUpdateRequest;
import com.devs.devmate.devlog.dto.DevLoggerSummaryResponse;
import com.devs.devmate.devlog.entity.DevLog;
import com.devs.devmate.devlog.entity.DevLogAttachment;
import com.devs.devmate.devlog.repository.DevLogAttachmentRepository;
import com.devs.devmate.devlog.repository.DevLogRepository;
import com.devs.devmate.global.exception.BusinessException;
import com.devs.devmate.global.exception.ErrorCode;
import com.devs.devmate.like.repository.devlog.DevLogLikeRepository;
import com.devs.devmate.member.entity.Member;
import com.devs.devmate.member.entity.MemberStatus;
import com.devs.devmate.member.repository.MemberRepository;
import com.devs.devmate.post.dto.StoredFileInfo;
import com.devs.devmate.post.service.PostFileService;
import com.fasterxml.jackson.databind.ObjectMapper;
import com.fasterxml.jackson.databind.SerializationFeature;
import com.fasterxml.jackson.datatype.jsr310.JavaTimeModule;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
import org.springframework.data.redis.core.StringRedisTemplate;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.multipart.MultipartFile;
import com.fasterxml.jackson.core.type.TypeReference;


import java.time.Duration;
import java.time.LocalDateTime;
import java.util.Comparator;
import java.util.HashSet;
import java.util.List;
import java.util.Set;
import java.util.function.Predicate;


@Service
@RequiredArgsConstructor
@Transactional
public class DevLogServiceImpl implements DevLogService{

    private static final int POPULAR_DEVLOG_CANDIDATE_SIZE = 50;
    private static final Duration POPULAR_DEVLOG_TTL = Duration.ofSeconds(60);
    private static final String POPULAR_DEVLOG_KEY = "popular:devlogs:limit:";

    private final DevLogRepository devLogRepository;
    private final MemberRepository memberRepository;
    private final PostFileService postFileService;
    private final DevLogAttachmentRepository devLogAttachmentRepository;
    private final DevLogLikeRepository devLogLikeRepository;
    private final DevLogCommentRepository devLogCommentRepository;
    private final StringRedisTemplate stringRedisTemplate;

    private Member getActiveMember(Long memberId) {
        Member member = memberRepository.findById(memberId)
                .orElseThrow(() -> new BusinessException(ErrorCode.MEMBER_NOT_FOUND));

        if (member.getStatus() == MemberStatus.SUSPENDED) {
            throw new BusinessException(ErrorCode.SUSPENDED_MEMBER);
        }

        if (member.getStatus() == MemberStatus.DELETED) {
            throw new BusinessException(ErrorCode.DELETED_MEMBER);
        }

        return member;
    }

    private void validateOwner(DevLog devLog, Long memberId) {
        if (!devLog.getMember().getId().equals(memberId)) {
            throw new BusinessException(ErrorCode.FORBIDDEN_DEVLOG);
        }
    }

    private void addAttachments(DevLog devLog, List<StoredFileInfo> storedFiles) {
        int order = devLog.getAttachments().size();

        for (StoredFileInfo file : storedFiles) {
            devLog.getAttachments().add(
                    DevLogAttachment.builder()
                            .devLog(devLog)
                            .originalFileName(file.getOriginalFilename())
                            .storedFileName(file.getStoredFilename())
                            .fileUrl(file.getFileUrl())
                            .contentType(file.getContentType())
                            .fileSize(file.getFileSize())
                            .displayOrder(order++)
                            .build()
            );
        }
    }

    private List<String> getStoredFilenames(DevLog devLog) {
        return devLog.getAttachments().stream()
                .map(DevLogAttachment::getStoredFileName)
                .toList();
    }

    private long countLike(DevLog devLog) {
        return devLogLikeRepository.countByDevLogId(devLog.getId());
    }

    private long countComment(DevLog devLog) {
        return devLogCommentRepository.countByDevLogId(devLog.getId());
    }

    private boolean isLiked(DevLog devLog, Long memberId) {
        if (memberId == null) return false;
        return devLogLikeRepository.existsByDevLogIdAndMemberId(devLog.getId(), memberId);
    }

    private long calculateDevLogPopularityScore(DevLog devLog) {
        long likeCount = countLike(devLog);
        long commentCount = countComment(devLog);

        long score = 0L;

        score += likeCount * 3L;
        score += commentCount * 2L;

        LocalDateTime createdAt = devLog.getCreatedAt();
        if (createdAt != null) {
            LocalDateTime now = LocalDateTime.now();

            if (createdAt.isAfter(now.minusDays(1))) {
                score += 5L;
            } else if (createdAt.isAfter(now.minusDays(3))) {
                score += 3L;
            } else if (createdAt.isAfter(now.minusDays(7))) {
                score += 1L;
            }
        }

        return score;
    }

    private Predicate<DevLog> distinctByMemberId() {
        Set<Long> seen = new HashSet<>();

        return devLog -> seen.add(devLog.getMember().getId());
    }

    private final ObjectMapper objectMapper = new ObjectMapper()
            .registerModule(new JavaTimeModule())
            .disable(SerializationFeature.WRITE_DATES_AS_TIMESTAMPS);

    @Override
    public Long create(Long memberId, DevLogCreateRequest request, List<MultipartFile> files) {

        Member member = getActiveMember(memberId);

        DevLog devLog = DevLog.builder()
                .title(request.getTitle())
                .problem(request.getProblem())
                .solution(request.getSolution())
                .reference(request.getReference())
                .retrospective(request.getRetrospective())
                .member(member)
                .build();

        List<StoredFileInfo> storedFiles = postFileService.saveFiles(files, "devlog");

        if (storedFiles != null && !storedFiles.isEmpty()) {
            addAttachments(devLog, storedFiles);
        }

        return devLogRepository.save(devLog).getId();
    }

    @Override
    @Transactional(readOnly = true)
    public Page<DevLogResponse> listMine(Long memberId, String keyword, Pageable pageable) {

        Page<DevLog> devLogs;

        if (keyword != null && !keyword.trim().isEmpty()) {
            devLogs = devLogRepository.searchMine(memberId, keyword.trim(), pageable);
        } else {
            devLogs = devLogRepository.findByMemberId(memberId, pageable);
        }

        return devLogs.map(devLog -> DevLogResponse.from(
                devLog,
                countLike(devLog),
                isLiked(devLog, memberId)
        ));
    }

    @Override
    @Transactional(readOnly = true)
    public Page<DevLogResponse> listByMember(Long memberId, String keyword, Pageable pageable) {

        if (!memberRepository.existsById(memberId)) {
            throw new BusinessException(ErrorCode.MEMBER_NOT_FOUND);
        }

        Page<DevLog> devLogs;

        if (keyword != null && !keyword.trim().isEmpty()) {
            devLogs = devLogRepository.searchByMember(memberId, keyword.trim(), pageable);
        } else {
            devLogs = devLogRepository.findByMemberId(memberId, pageable);
        }

        return devLogs.map(devLog -> DevLogResponse.from(
                devLog,
                countLike(devLog),
                isLiked(devLog, memberId)
        ));
    }

    @Override
    @Transactional(readOnly = true)
    public DevLogResponse get(Long memberId, Long devLogId) {

        DevLog devLog = devLogRepository.findById(devLogId)
                .orElseThrow(() -> new BusinessException(ErrorCode.DEVLOG_NOT_FOUND));

        return DevLogResponse.from(
                devLog,
                countLike(devLog),
                isLiked(devLog, memberId)
        );
    }

    @Override
    public void update(Long memberId, Long devLogId, DevLogUpdateRequest request, List<MultipartFile> files) {
        DevLog devLog = devLogRepository.findById(devLogId)
                .orElseThrow(() -> new BusinessException(ErrorCode.DEVLOG_NOT_FOUND));

        validateOwner(devLog, memberId);

        devLog.update(
                request.getTitle(),
                request.getProblem(),
                request.getSolution(),
                request.getReference(),
                request.getRetrospective()
        );

        if (request.getRemovedFileIds() != null && !request.getRemovedFileIds().isEmpty()) {
            List<DevLogAttachment> attachmentsToRemove =
                    devLogAttachmentRepository.findAllByIdIn(request.getRemovedFileIds());

            List<DevLogAttachment> ownedAttachments = attachmentsToRemove.stream()
                    .filter(attachment -> attachment.getDevLog().getId().equals(devLog.getId()))
                    .toList();

            List<String> storedFileNames = ownedAttachments.stream()
                    .map(DevLogAttachment::getStoredFileName)
                    .toList();

            postFileService.deleteFiles(storedFileNames, "devlog");

            devLog.getAttachments().removeIf(attachment ->
                    request.getRemovedFileIds().contains(attachment.getId()));
        }

        if (files != null && !files.isEmpty()) {
            List<StoredFileInfo> storedFiles = postFileService.saveFiles(files, "devlog");
            addAttachments(devLog, storedFiles);
        }
    }

    @Override
    public void delete(Long memberId, Long devLogId) {

        DevLog devLog = devLogRepository.findById(devLogId)
                .orElseThrow(() -> new BusinessException(ErrorCode.DEVLOG_NOT_FOUND));

        validateOwner(devLog, memberId);

        List<String> storedFileNames = getStoredFilenames(devLog);

        postFileService.deleteFiles(storedFileNames, "devlog");

        devLogRepository.delete(devLog);
    }

    @Override
    @Transactional(readOnly = true)
    public List<DevLogResponse> listPopular(int limit) {

        int safeLimit = Math.max(1, Math.min(limit, 10));
        String key = POPULAR_DEVLOG_KEY + safeLimit;

        try {
            String cached = stringRedisTemplate.opsForValue().get(key);

            if (cached != null && !cached.isBlank()) {
                return objectMapper.readValue(
                        cached,
                        new TypeReference<List<DevLogResponse>>() {}
                );
            }
        } catch (Exception e) {
            // 캐시 실패 → 무시
        }

        List<DevLog> candidates = devLogRepository.findRecentDevLogs(
                PageRequest.of(0, POPULAR_DEVLOG_CANDIDATE_SIZE)
        );

        List<DevLogResponse> result = candidates.stream()
                .sorted(
                        Comparator
                                .comparingLong(this::calculateDevLogPopularityScore)
                                .reversed()
                                .thenComparing(DevLog::getId, Comparator.reverseOrder())
                )
                .limit(safeLimit)
                .map(devLog -> DevLogResponse.from(
                        devLog,
                        countLike(devLog),
                        false
                ))
                .toList();

        try {
            String json = objectMapper.writeValueAsString(result);
            stringRedisTemplate.opsForValue().set(key, json, POPULAR_DEVLOG_TTL);
        } catch (Exception e) {
            // 캐시 실패 무시
        }

        return result;
    }

    @Override
    @Transactional(readOnly = true)
    public List<DevLogResponse> listPopularByMember(Long memberId, int limit) {

        if (!memberRepository.existsById(memberId)) {
            throw new BusinessException(ErrorCode.MEMBER_NOT_FOUND);
        }

        int safeLimit = Math.max(1, Math.min(limit, 10));

        List<DevLog> candidates = devLogRepository.findByMemberId(
                memberId,
                PageRequest.of(0, POPULAR_DEVLOG_CANDIDATE_SIZE)
        ).getContent();

        return candidates.stream()
                .sorted(
                        Comparator
                                .comparingLong(this::calculateDevLogPopularityScore)
                                .reversed()
                                .thenComparing(DevLog::getId, Comparator.reverseOrder())
                )
                .limit(safeLimit)
                .map(devLog -> DevLogResponse.from(
                        devLog,
                        countLike(devLog),
                        false
                ))
                .toList();
    }

    @Override
    @Transactional(readOnly = true)
    public List<DevLoggerSummaryResponse> listRecentDevLoggers(int limit) {

        int safeLimit = Math.max(1, Math.min(limit, 10));

        List<DevLog> recent = devLogRepository.findRecentDevLogs(
                PageRequest.of(0, 30)
        );

        return recent.stream()
                .filter(devLog -> devLog.getMember() != null)
                .filter(devLog -> !devLog.getMember().isDeleted())
                .filter(distinctByMemberId())
                .limit(safeLimit)
                .map(devLog -> {
                    Member member = devLog.getMember();

                    return DevLoggerSummaryResponse.builder()
                            .memberId(member.getId())
                            .nickname(member.getNickname())
                            .bio(member.getBio())
                            .profileImageUrl(member.getProfileImageUrl())
                            .devLogCount(devLogRepository.countByMemberId(member.getId()))
                            .latestDevLogCreatedAt(devLog.getCreatedAt())
                            .build();
                })
                .toList();
    }
}
