package com.devs.devmate.devlog.service;

import com.devs.devmate.devlog.dto.DevLogCreateRequest;
import com.devs.devmate.devlog.dto.DevLogResponse;
import com.devs.devmate.devlog.dto.DevLogUpdateRequest;
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
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.multipart.MultipartFile;

import java.util.List;


@Service
@RequiredArgsConstructor
@Transactional
public class DevLogServiceImpl implements DevLogService{

    private final DevLogRepository devLogRepository;
    private final MemberRepository memberRepository;
    private final PostFileService postFileService;
    private final DevLogAttachmentRepository devLogAttachmentRepository;
    private final DevLogLikeRepository devLogLikeRepository;

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

    private boolean isLiked(DevLog devLog, Long memberId) {
        if (memberId == null) return false;
        return devLogLikeRepository.existsByDevLogIdAndMemberId(devLog.getId(), memberId);
    }

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
}
