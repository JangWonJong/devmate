package com.devs.devmate.post.service;

import com.devs.devmate.comment.repository.CommentRepository;
import com.devs.devmate.global.exception.BusinessException;
import com.devs.devmate.global.exception.ErrorCode;
import com.devs.devmate.like.repository.PostLikeRepository;
import com.devs.devmate.member.entity.Member;
import com.devs.devmate.member.repository.MemberRepository;
import com.devs.devmate.post.dto.PostCreateRequest;
import com.devs.devmate.post.dto.PostResponse;
import com.devs.devmate.post.dto.PostUpdateRequest;
import com.devs.devmate.post.dto.StoredFileInfo;
import com.devs.devmate.post.entity.Post;
import com.devs.devmate.post.entity.PostAttachment;
import com.devs.devmate.post.repository.PostAttachmentRepository;
import com.devs.devmate.post.repository.PostRepository;
import com.devs.devmate.reservation.repository.ReservationRepository;
import com.devs.devmate.study.repository.StudyMemberRepository;
import com.devs.devmate.study.repository.StudyRepository;
import lombok.*;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.multipart.MultipartFile;

import java.util.List;


@Service
@RequiredArgsConstructor
@Transactional
public class PostServiceImpl implements PostService{

    private final PostRepository postRepository;
    private final MemberRepository memberRepository;
    private final StudyRepository studyRepository;
    private final StudyMemberRepository studyMemberRepository;
    private final CommentRepository commentRepository;
    private final ReservationRepository reservationRepository;
    private final PostFileService postFileService;
    private final PostAttachmentRepository postAttachmentRepository;
    private final PostLikeRepository postLikeRepository;

    private String normalize(String keyword) {
        if (keyword == null) return null;
        String k = keyword.trim();
        return k.isEmpty() ? null : k;
    }

    private void addAttachments(Post post, List<StoredFileInfo> storedFiles) {
        int order = post.getAttachments().size();

        for (StoredFileInfo file : storedFiles) {
            post.addAttachment(
                    PostAttachment.builder()
                            .post(post)
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

    private List<String> getStoredFilenames(Post post) {

        return post.getAttachments().stream()
                .map(PostAttachment::getStoredFileName)
                .toList();
    }

    private Long countPost(Post post) {
        return postLikeRepository.countByPostId(post.getId());
    }

    private boolean isLikeSort(Pageable pageable) {
        return pageable.getSort().stream()
                .anyMatch(order -> order.getProperty().equals("likes"));
    }

    private Pageable withoutSort(Pageable pageable) {
        return PageRequest.of(pageable.getPageNumber(), pageable.getPageSize());
    }

    @Override
    public Long create(Long memberId, PostCreateRequest request, List<MultipartFile> files) {
        Member member = memberRepository.findById(memberId)
                .orElseThrow(() -> new BusinessException(ErrorCode.MEMBER_NOT_FOUND));

        Post post = Post.builder()
                .title(request.getTitle())
                .content(request.getContent())
                .member(member)
                .type(request.getType())
                .build();

        List<StoredFileInfo> storedFiles = postFileService.saveFiles(files, "posts");

        if (storedFiles != null && !storedFiles.isEmpty()) {

            addAttachments(post, storedFiles);
        }

        return postRepository.save(post).getId();
    }

    @Override
    @Transactional(readOnly = true)
    public Page<PostResponse> list( String keyword, Boolean solved, Pageable pageable) {
        String k = normalize(keyword);

        if (isLikeSort(pageable) && k == null && solved == null) {
            return postRepository.findAllOrderByLikeCountDesc(withoutSort(pageable))
                    .map(post -> PostResponse.from(post, countPost(post)));
        }
        if (k == null && solved == null) {
            return postRepository.findAll(pageable).map(post -> PostResponse.from(post, countPost(post)));
        }
        if (k != null && solved == null) {
            return postRepository.searchAll(k, pageable).map(post -> PostResponse.from(post, countPost(post)));
        }
        if (k == null) {
            return postRepository.findBySolved(solved, pageable).map(post -> PostResponse.from(post, countPost(post)));
        }

        return postRepository.searchAllWithSolved(k, solved, pageable).map(post -> PostResponse.from(post, countPost(post)));
    }

    @Override
    @Transactional(readOnly = true)
    public Page<PostResponse> listMine(Long memberId, String keyword, Boolean solved, Pageable pageable) {
        String k = normalize(keyword);

        if (isLikeSort(pageable) && k == null && solved == null) {
            return postRepository.findMineOrderByLikeCountDesc(memberId, withoutSort(pageable))
                    .map(post -> PostResponse.from(post, countPost(post)));
        }

        if (k == null && solved == null) {
            return postRepository.findByMemberId(memberId, pageable).map(post -> PostResponse.from(post, countPost(post)));
        }
        if (k != null && solved == null) {
            return postRepository.searchMine(memberId, k, pageable).map(post -> PostResponse.from(post, countPost(post)));
        }
        if (k == null) { // solved != null
            return postRepository.findByMemberIdAndSolved(memberId, solved, pageable).map(post -> PostResponse.from(post, countPost(post)));
        }
        return postRepository.searchMineWithSolved(memberId, k, solved, pageable).map(post -> PostResponse.from(post, countPost(post)));
    }

    @Override
    @Transactional(readOnly = true)
    public PostResponse get(Long postId) {

        Post post = postRepository.findById(postId)
                .orElseThrow(()-> new BusinessException(ErrorCode.POST_NOT_FOUND));

        return PostResponse.from(post, countPost(post));
    }

    @Override
    public void update(Long memberId, Long postId, PostUpdateRequest request, List<MultipartFile> files) {

        Post post = postRepository.findById(postId)
                .orElseThrow(()-> new BusinessException(ErrorCode.POST_NOT_FOUND));

        if (!post.getMember().getId().equals(memberId)){
            throw new BusinessException(ErrorCode.FORBIDDEN_POST);
        }

        post.update(request.getTitle(), request.getContent(), request.isSolved());

        if (request.getRemovedFileIds() != null && !request.getRemovedFileIds().isEmpty()) {

            List<PostAttachment> attachmentsToRemove =
                    postAttachmentRepository.findAllByIdIn(request.getRemovedFileIds());

            List<PostAttachment> ownedAttachments = attachmentsToRemove.stream()
                    .filter(attachment -> attachment.getPost().getId().equals(post.getId()))
                    .toList();

            List<String> storedFileName = ownedAttachments.stream()
                    .map(PostAttachment::getStoredFileName)
                    .toList();

            postFileService.deleteFiles(storedFileName, "posts");

            post.getAttachments().removeIf(attachment ->
                    request.getRemovedFileIds().contains(attachment.getId()));
        }

        if (files != null && !files.isEmpty()) {

            List<StoredFileInfo> storedFiles = postFileService.saveFiles(files, "posts");

            addAttachments(post, storedFiles);
        }

    }

    @Override
    public void delete(Long memberId, Long postId) {

        Post post = postRepository.findById(postId)
                .orElseThrow(()-> new BusinessException(ErrorCode.POST_NOT_FOUND));

        if (!post.getMember().getId().equals(memberId)){
            throw new BusinessException(ErrorCode.FORBIDDEN_POST);
        }

        List<String> storedFileNames = getStoredFilenames(post);

        postFileService.deleteFiles(storedFileNames, "posts");

        if (post.getType() == Post.PostType.STUDY) {
            studyRepository.findByPostId(postId).ifPresent(study -> {
                reservationRepository.deleteAllByStudyId(study.getId());
                studyMemberRepository.deleteAllByStudyId(study.getId());
                studyRepository.delete(study);
            });
        }

        commentRepository.deleteAllByPostId(postId);
        postRepository.delete(post);
    }

    @Override
    public void solve(Long memberId, Long postId) {
        Post post = postRepository.findById(postId)
                .orElseThrow(()->new BusinessException(ErrorCode.POST_NOT_FOUND));
        if (!post.getMember().getId().equals(memberId)){
            throw new BusinessException(ErrorCode.FORBIDDEN_POST);
        }
        post.markSolved();

    }

    @Override
    @Transactional(readOnly = true)
    public List<PostResponse> listLikedPosts(Long memberId) {
        return postRepository.findLikedPostsByMemberId(memberId).stream()
                .map(post -> PostResponse.from(post, countPost(post)))
                .toList();
    }


}
