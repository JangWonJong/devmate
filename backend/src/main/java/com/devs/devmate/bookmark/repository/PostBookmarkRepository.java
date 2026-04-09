package com.devs.devmate.bookmark.repository;

import com.devs.devmate.bookmark.entity.PostBookmark;
import com.devs.devmate.post.entity.Post;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import java.util.List;
import java.util.Optional;

public interface PostBookmarkRepository extends JpaRepository<PostBookmark, Long> {

    boolean existsByPostIdAndMemberId(Long postId, Long memberId);

    Optional<PostBookmark> findByPostIdAndMemberId(Long postId, Long memberId);

    long countByPostId(Long postId);

    @Query("""
            select pb.post
                        from PostBookmark pb
                        where pb.member.id = :memberId
                        order by pb.createdAt desc
            """)
    List<Post> findBookmarkedPostsByMemberId(@Param("memberId") Long memberId);
}
