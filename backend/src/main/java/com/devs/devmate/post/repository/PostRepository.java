package com.devs.devmate.post.repository;

import com.devs.devmate.post.entity.Post;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;


public interface PostRepository extends JpaRepository<Post, Long> {

    Page<Post> findByMemberId(Long memberId, Pageable pageable);
    Page<Post> findBySolved(boolean solved, Pageable pageable);
    Page<Post> findByMemberIdAndSolved(Long memberId, boolean solved, Pageable pageable);

    @Query("""
        select p from Post p
            where lower(p.title) like lower(concat('%', :keyword, '%'))
                or lower(p.content) like lower(concat('%', :keyword, '%'))
    """)
    Page<Post> searchAll(@Param("keyword") String keyword, Pageable pageable);

    @Query("""
        select p from Post p
            where p.member.id = :memberId
                and (
                    lower(p.title) like lower(concat('%', :keyword, '%'))
                        or lower(p.content) like lower(concat('%', :keyword, '%'))
                    )
    """)
    Page<Post> searchMine(
            @Param("memberId") Long memberId,
            @Param("keyword") String keyword,
            Pageable pageable
    );

    @Query("""
        select p from Post p
            where (lower(p.title) like lower(concat('%', :keyword, '%'))
                or  lower(p.content) like lower(concat('%', :keyword, '%')))
                    and p.solved = :solved
    """)
    Page<Post> searchAllWithSolved(@Param("keyword") String keyword,
                                   @Param("solved") boolean solved,
                                   Pageable pageable);


    @Query("""
    select p from Post p
        where p.member.id = :memberId
              and (
                    lower(p.title) like lower(concat('%', :keyword, '%'))
                 or lower(p.content) like lower(concat('%', :keyword, '%'))
              )
              and p.solved = :solved
    """)
    Page<Post> searchMineWithSolved(@Param("memberId") Long memberId,
                                    @Param("keyword") String keyword,
                                    @Param("solved") boolean solved,
                                    Pageable pageable);


}
