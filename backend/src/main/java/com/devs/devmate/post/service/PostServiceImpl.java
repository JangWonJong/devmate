package com.devs.devmate.post.service;

import com.devs.devmate.bookmark.repository.PostBookmarkRepository;
import com.devs.devmate.comment.repository.CommentRepository;
import com.devs.devmate.global.exception.BusinessException;
import com.devs.devmate.global.exception.ErrorCode;
import com.devs.devmate.like.repository.CommentLikeRepository;
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
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageImpl;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.multipart.MultipartFile;

import java.time.LocalDateTime;
import java.util.Comparator;
import java.util.List;

@Service
@RequiredArgsConstructor
@Transactional
public class PostServiceImpl implements PostService {

    private static final int POPULAR_POST_CANDIDATE_SIZE = 50;

    private final PostRepository postRepository;
    private final MemberRepository memberRepository;
    private final StudyRepository studyRepository;
    private final StudyMemberRepository studyMemberRepository;
    private final CommentRepository commentRepository;
    private final ReservationRepository reservationRepository;
    private final PostFileService postFileService;
    private final PostAttachmentRepository postAttachmentRepository;
    private final PostLikeRepository postLikeRepository;
    private final CommentLikeRepository commentLikeRepository;
    private final PostBookmarkRepository postBookmarkRepository;


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

    private boolean isLikeSort(Pageable pageable) {
        return pageable.getSort().stream()
                .anyMatch(order -> order.getProperty().equals("likes"));
    }

    private Pageable withoutSort(Pageable pageable) {
        return PageRequest.of(pageable.getPageNumber(), pageable.getPageSize());
    }

    private Long countPostLike(Post post) {
        return postLikeRepository.countByPostId(post.getId());
    }

    private Long countComment(Post post) {
        return commentRepository.countByPostId(post.getId());
    }

    private long calculatePopularityScore(Post post) {
        long likeCount = countPostLike(post);
        long commentCount = countComment(post);

        long score = 0L;
        score += likeCount * 3L;
        score += commentCount * 2L;

        if (post.isSolved()) {
            score += 5L;
        }

        LocalDateTime createdAt = post.getCreatedAt();
        if (createdAt != null) {
            LocalDateTime now = LocalDateTime.now();

            if (createdAt.isAfter(now.minusDays(1))) {
                score += 4L;
            } else if (createdAt.isAfter(now.minusDays(3))) {
                score += 3L;
            } else if (createdAt.isAfter(now.minusDays(7))) {
                score += 2L;
            } else if (createdAt.isAfter(now.minusDays(14))) {
                score += 1L;
            }
        }

        return score;
    }

    private Post.PostType normalizeType(String type) {
        if (type == null || type.isBlank()) {
            return null;
        }

        try {
            return Post.PostType.valueOf(type.trim().toUpperCase());
        } catch (IllegalArgumentException e) {
            throw new BusinessException(ErrorCode.INVALID_POST_TYPE);
        }
    }

    private boolean isBookmarked(Post post, Long memberId) {
        if (memberId == null) return false;
        return postBookmarkRepository.existsByPostIdAndMemberId(post.getId(), memberId);
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
    public Page<PostResponse> list(Long memberId, String keyword, Boolean solved, String type, Pageable pageable) {
        String k = normalize(keyword);
        Post.PostType postType = normalizeType(type);

        if (isLikeSort(pageable)) {
            Pageable unsorted = withoutSort(pageable);

            if (postType == null) {
                if (k == null && solved == null) {
                    return postRepository.findAllOrderByLikeCountDesc(unsorted)
                            .map(post -> PostResponse.from(post, countPostLike(post), countComment(post), isBookmarked(post, memberId)));
                }
                if (k != null && solved == null) {
                    return postRepository.searchAllOrderByLikeCountDesc(k, unsorted)
                            .map(post -> PostResponse.from(post, countPostLike(post), countComment(post), isBookmarked(post, memberId)));
                }
                if (k == null) {
                    return postRepository.findBySolvedOrderByLikeCountDesc(solved, unsorted)
                            .map(post -> PostResponse.from(post, countPostLike(post), countComment(post), isBookmarked(post, memberId)));
                }
                return postRepository.searchAllWithSolvedOrderByLikeCountDesc(k, solved, unsorted)
                        .map(post -> PostResponse.from(post, countPostLike(post), countComment(post), isBookmarked(post, memberId)));
            }

            if (k == null && solved == null) {
                return postRepository.findByTypeOrderByLikeCountDesc(postType, unsorted)
                        .map(post -> PostResponse.from(post, countPostLike(post), countComment(post), isBookmarked(post, memberId)));
            }
            if (k != null && solved == null) {
                return postRepository.searchAllWithTypeOrderByLikeCountDesc(k, postType, unsorted)
                        .map(post -> PostResponse.from(post, countPostLike(post), countComment(post), isBookmarked(post, memberId)));
            }
            if (k == null) {
                return postRepository.findBySolvedAndTypeOrderByLikeCountDesc(solved, postType, unsorted)
                        .map(post -> PostResponse.from(post, countPostLike(post), countComment(post), isBookmarked(post, memberId)));
            }
            return postRepository.searchAllWithSolvedAndTypeOrderByLikeCountDesc(k, solved, postType, unsorted)
                    .map(post -> PostResponse.from(post, countPostLike(post), countComment(post), isBookmarked(post, memberId)));
        }

        if (postType == null) {
            if (k == null && solved == null) {
                return postRepository.findAll(pageable)
                        .map(post -> PostResponse.from(post, countPostLike(post), countComment(post), isBookmarked(post, memberId)));
            }
            if (k != null && solved == null) {
                return postRepository.searchAll(k, pageable)
                        .map(post -> PostResponse.from(post, countPostLike(post), countComment(post), isBookmarked(post, memberId)));
            }
            if (k == null) {
                return postRepository.findBySolved(solved, pageable)
                        .map(post -> PostResponse.from(post, countPostLike(post), countComment(post), isBookmarked(post, memberId)));
            }
            return postRepository.searchAllWithSolved(k, solved, pageable)
                    .map(post -> PostResponse.from(post, countPostLike(post), countComment(post), isBookmarked(post, memberId)));
        }

        if (k == null && solved == null) {
            return postRepository.findByType(postType, pageable)
                    .map(post -> PostResponse.from(post, countPostLike(post), countComment(post), isBookmarked(post, memberId)));
        }
        if (k != null && solved == null) {
            return postRepository.searchAllWithType(k, postType, pageable)
                    .map(post -> PostResponse.from(post, countPostLike(post), countComment(post), isBookmarked(post, memberId)));
        }
        if (k == null) {
            return postRepository.findBySolvedAndType(solved, postType, pageable)
                    .map(post -> PostResponse.from(post, countPostLike(post), countComment(post), isBookmarked(post, memberId)));
        }

        return postRepository.searchAllWithSolvedAndType(k, solved, postType, pageable)
                .map(post -> PostResponse.from(post, countPostLike(post), countComment(post), isBookmarked(post, memberId)));
    }

    @Override
    @Transactional(readOnly = true)
    public Page<PostResponse> listMine(Long memberId, String keyword, Boolean solved, String type, Pageable pageable) {
        String k = normalize(keyword);
        Post.PostType postType = normalizeType(type);

        if (isLikeSort(pageable)) {
            Pageable unsorted = withoutSort(pageable);

            if (postType == null) {
                if (k == null && solved == null) {
                    return postRepository.findMineOrderByLikeCountDesc(memberId, unsorted)
                            .map(post -> PostResponse.from(post, countPostLike(post), countComment(post), isBookmarked(post, memberId)));
                }
                if (k != null && solved == null) {
                    return postRepository.searchMineOrderByLikeCountDesc(memberId, k, unsorted)
                            .map(post -> PostResponse.from(post, countPostLike(post), countComment(post), isBookmarked(post, memberId)));
                }
                if (k == null) {
                    return postRepository.findMineBySolvedOrderByLikeCountDesc(memberId, solved, unsorted)
                            .map(post -> PostResponse.from(post, countPostLike(post), countComment(post), isBookmarked(post, memberId)));
                }
                return postRepository.searchMineWithSolvedOrderByLikeCountDesc(memberId, k, solved, unsorted)
                        .map(post -> PostResponse.from(post, countPostLike(post), countComment(post), isBookmarked(post, memberId)));
            }

            if (k == null && solved == null) {
                return postRepository.findMineByTypeOrderByLikeCountDesc(memberId, postType, unsorted)
                        .map(post -> PostResponse.from(post, countPostLike(post), countComment(post), isBookmarked(post, memberId)));
            }
            if (k != null && solved == null) {
                return postRepository.searchMineWithTypeOrderByLikeCountDesc(memberId, k, postType, unsorted)
                        .map(post -> PostResponse.from(post, countPostLike(post), countComment(post), isBookmarked(post, memberId)));
            }
            if (k == null) {
                return postRepository.findMineBySolvedAndTypeOrderByLikeCountDesc(memberId, solved, postType, unsorted)
                        .map(post -> PostResponse.from(post, countPostLike(post), countComment(post), isBookmarked(post, memberId)));
            }
            return postRepository.searchMineWithSolvedAndTypeOrderByLikeCountDesc(memberId, k, solved, postType, unsorted)
                    .map(post -> PostResponse.from(post, countPostLike(post), countComment(post), isBookmarked(post, memberId)));
        }

        if (postType == null) {
            if (k == null && solved == null) {
                return postRepository.findByMemberId(memberId, pageable)
                        .map(post -> PostResponse.from(post, countPostLike(post), countComment(post), isBookmarked(post, memberId)));
            }
            if (k != null && solved == null) {
                return postRepository.searchMine(memberId, k, pageable)
                        .map(post -> PostResponse.from(post, countPostLike(post), countComment(post), isBookmarked(post, memberId)));
            }
            if (k == null) {
                return postRepository.findByMemberIdAndSolved(memberId, solved, pageable)
                        .map(post -> PostResponse.from(post, countPostLike(post), countComment(post), isBookmarked(post, memberId)));
            }
            return postRepository.searchMineWithSolved(memberId, k, solved, pageable)
                    .map(post -> PostResponse.from(post, countPostLike(post), countComment(post), isBookmarked(post, memberId)));
        }

        if (k == null && solved == null) {
            return postRepository.findByMemberIdAndType(memberId, postType, pageable)
                    .map(post -> PostResponse.from(post, countPostLike(post), countComment(post), isBookmarked(post, memberId)));
        }
        if (k != null && solved == null) {
            return postRepository.searchMineWithType(memberId, k, postType, pageable)
                    .map(post -> PostResponse.from(post, countPostLike(post), countComment(post), isBookmarked(post, memberId)));
        }
        if (k == null) {
            return postRepository.findByMemberIdAndSolvedAndType(memberId, solved, postType, pageable)
                    .map(post -> PostResponse.from(post, countPostLike(post), countComment(post), isBookmarked(post, memberId)));
        }

        return postRepository.searchMineWithSolvedAndType(memberId, k, solved, postType, pageable)
                .map(post -> PostResponse.from(post, countPostLike(post), countComment(post), isBookmarked(post, memberId)));
    }

    @Override
    @Transactional(readOnly = true)
    public Page<PostResponse> listBookmarked(Long memberId, String keyword, Boolean solved, String type, Pageable pageable) {

        String k = normalize(keyword);
        Post.PostType postType = normalizeType(type);

        Page<Post> page;

        if (isLikeSort(pageable)) {
            Pageable unsorted = withoutSort(pageable);
            page = postRepository.findBookmarkedPostsOrderByLikeCountDesc(
                    memberId,
                    k,
                    solved,
                    postType,
                    unsorted
            );
        } else {
            page = postRepository.findBookmarkedPosts(
                    memberId,
                    k,
                    solved,
                    postType,
                    pageable
            );
        }

        return page.map(post ->
                PostResponse.from(
                        post,
                        countPostLike(post),
                        countComment(post),
                        true
                )
        );

    }

    @Override
    @Transactional(readOnly = true)
    public PostResponse get(Long memberId, Long postId) {
        Post post = postRepository.findById(postId)
                .orElseThrow(() -> new BusinessException(ErrorCode.POST_NOT_FOUND));

        return PostResponse.from(post, countPostLike(post), countComment(post), isBookmarked(post, memberId));
    }

    @Override
    public void update(Long memberId, Long postId, PostUpdateRequest request, List<MultipartFile> files) {
        Post post = postRepository.findById(postId)
                .orElseThrow(() -> new BusinessException(ErrorCode.POST_NOT_FOUND));

        if (!post.getMember().getId().equals(memberId)) {
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
                .orElseThrow(() -> new BusinessException(ErrorCode.POST_NOT_FOUND));

        if (!post.getMember().getId().equals(memberId)) {
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

        List<Long> commentIds = commentRepository.findIdsByPostId(postId);
        if (!commentIds.isEmpty()) {
            commentLikeRepository.deleteAllByCommentIdIn(commentIds);
        }

        postLikeRepository.deleteAllByPostId(postId);
        commentRepository.deleteAllByPostId(postId);
        postRepository.delete(post);
    }

    @Override
    public void solve(Long memberId, Long postId) {
        Post post = postRepository.findById(postId)
                .orElseThrow(() -> new BusinessException(ErrorCode.POST_NOT_FOUND));

        if (!post.getMember().getId().equals(memberId)) {
            throw new BusinessException(ErrorCode.FORBIDDEN_POST);
        }

        post.markSolved();
    }

    @Override
    @Transactional(readOnly = true)
    public List<PostResponse> listLikedPosts(Long memberId) {
        return postRepository.findLikedPostsByMemberId(memberId).stream()
                .map(post -> PostResponse.from(post, countPostLike(post), countComment(post), isBookmarked(post, memberId)))
                .toList();
    }

    @Override
    @Transactional(readOnly = true)
    public List<PostResponse> listPopular(Long memberId, int limit) {
        int safeLimit = Math.max(1, Math.min(limit, 20));

        List<Post> candidates = postRepository.findRecentQuestionPosts(
                PageRequest.of(0, POPULAR_POST_CANDIDATE_SIZE)
        );

        return candidates.stream()
                .sorted(
                        Comparator
                                .comparingLong(this::calculatePopularityScore)
                                .reversed()
                                .thenComparing(Post::getId, Comparator.reverseOrder())
                )
                .limit(safeLimit)
                .map(post -> PostResponse.from(post, countPostLike(post), countComment(post), isBookmarked(post, memberId)))
                .toList();
    }
}