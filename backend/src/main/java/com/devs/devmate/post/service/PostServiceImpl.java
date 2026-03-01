package com.devs.devmate.post.service;

import com.devs.devmate.global.exception.BusinessException;
import com.devs.devmate.global.exception.ErrorCode;
import com.devs.devmate.member.entity.Member;
import com.devs.devmate.member.repository.MemberRepository;
import com.devs.devmate.post.dto.PostCreateRequest;
import com.devs.devmate.post.dto.PostResponse;
import com.devs.devmate.post.dto.PostUpdateRequest;
import com.devs.devmate.post.entity.Post;
import com.devs.devmate.post.repository.PostRepository;
import lombok.*;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;


@Service
@RequiredArgsConstructor
@Transactional
public class PostServiceImpl implements PostService{

    private final PostRepository postRepository;
    private final MemberRepository memberRepository;

    private String normalize(String keyword) {
        if (keyword == null) return null;
        String k = keyword.trim();
        return k.isEmpty() ? null : k;
    }

    @Override
    public Long create(Long memberId, PostCreateRequest request) {
        Member member = memberRepository.findById(memberId)
                .orElseThrow(() -> new BusinessException(ErrorCode.MEMBER_NOT_FOUND));

        Post post = Post.builder()
                .title(request.getTitle())
                .content(request.getContent())
                .member(member)
                .build();
        return postRepository.save(post).getId();
    }

    @Override
    @Transactional(readOnly = true)
    public Page<PostResponse> list( String keyword, Boolean solved, Pageable pageable) {
        String k = normalize(keyword);
        if (k == null && solved == null) {
            return postRepository.findAll(pageable).map(PostResponse::from);
        }
        if (k != null && solved == null) {
            return postRepository.searchAll(k, pageable).map(PostResponse::from);
        }
        if (k == null) {
            return postRepository.findBySolved(solved, pageable).map(PostResponse::from);
        }
        return postRepository.searchAllWithSolved(k, solved, pageable).map(PostResponse::from);
    }

    @Override
    @Transactional(readOnly = true)
    public Page<PostResponse> listMine(Long memberId, String keyword, Boolean solved, Pageable pageable) {
        String k = normalize(keyword);

        if (k == null && solved == null) {
            return postRepository.findByMemberId(memberId, pageable).map(PostResponse::from);
        }
        if (k != null && solved == null) {
            return postRepository.searchMine(memberId, k, pageable).map(PostResponse::from);
        }
        if (k == null) { // solved != null
            return postRepository.findByMemberIdAndSolved(memberId, solved, pageable).map(PostResponse::from);
        }
        return postRepository.searchMineWithSolved(memberId, k, solved, pageable).map(PostResponse::from);
    }

    @Override
    @Transactional(readOnly = true)
    public PostResponse get(Long postId) {

        Post post = postRepository.findById(postId)
                .orElseThrow(()-> new BusinessException(ErrorCode.POST_NOT_FOUND));

        return PostResponse.from(post);
    }

    @Override
    public void update(Long memberId, Long postId, PostUpdateRequest request) {

        Post post = postRepository.findById(postId)
                .orElseThrow(()-> new BusinessException(ErrorCode.POST_NOT_FOUND));
        if (!post.getMember().getId().equals(memberId)){
            throw new BusinessException(ErrorCode.FORBIDDEN_POST);
        }

        post.update(request.getTitle(), request.getContent(), request.isSolved());

    }

    @Override
    public void delete(Long memberId, Long postId) {

        Post post = postRepository.findById(postId)
                .orElseThrow(()-> new BusinessException(ErrorCode.POST_NOT_FOUND));
        if (!post.getMember().getId().equals(memberId)){
            throw new BusinessException(ErrorCode.FORBIDDEN_POST);
        }
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
}
