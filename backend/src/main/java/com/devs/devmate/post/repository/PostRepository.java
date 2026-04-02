    package com.devs.devmate.post.repository;

    import com.devs.devmate.post.entity.Post;
    import org.springframework.data.domain.Page;
    import org.springframework.data.domain.Pageable;
    import org.springframework.data.jpa.repository.JpaRepository;
    import org.springframework.data.jpa.repository.Query;
    import org.springframework.data.repository.query.Param;

    import java.util.List;


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

        @Query("""
        SELECT p
        FROM Post p
        LEFT JOIN PostLike pl ON pl.post = p
        GROUP BY p
        ORDER BY COUNT(pl.id) DESC, p.id DESC
        """)
        Page<Post> findAllOrderByLikeCountDesc(Pageable pageable);

        @Query("""
        SELECT p
        FROM Post p
        LEFT JOIN PostLike pl ON pl.post = p
        WHERE p.member.id = :memberId
        GROUP BY p
        ORDER BY COUNT(pl.id) DESC, p.id DESC
        """)
        Page<Post> findMineOrderByLikeCountDesc(@Param("memberId") Long memberId, Pageable pageable);

        @Query("""
        SELECT p
        FROM Post p
        LEFT JOIN PostLike pl ON pl.post = p
        WHERE (
            lower(p.title) like lower(concat('%', :keyword, '%'))
            or lower(p.content) like lower(concat('%', :keyword, '%'))
        )
        GROUP BY p
        ORDER BY COUNT(pl.id) DESC, p.id DESC
    """)
        Page<Post> searchAllOrderByLikeCountDesc(@Param("keyword") String keyword, Pageable pageable);

        @Query("""
        SELECT p
        FROM Post p
        LEFT JOIN PostLike pl ON pl.post = p
        WHERE p.member.id = :memberId
          AND (
              lower(p.title) like lower(concat('%', :keyword, '%'))
              or lower(p.content) like lower(concat('%', :keyword, '%'))
          )
        GROUP BY p
        ORDER BY COUNT(pl.id) DESC, p.id DESC
    """)
        Page<Post> searchMineOrderByLikeCountDesc(
                @Param("memberId") Long memberId,
                @Param("keyword") String keyword,
                Pageable pageable
        );

        @Query("""
        SELECT p
        FROM Post p
        LEFT JOIN PostLike pl ON pl.post = p
        WHERE p.solved = :solved
        GROUP BY p
        ORDER BY COUNT(pl.id) DESC, p.id DESC
    """)
        Page<Post> findBySolvedOrderByLikeCountDesc(@Param("solved") boolean solved, Pageable pageable);

        @Query("""
        SELECT p
        FROM Post p
        LEFT JOIN PostLike pl ON pl.post = p
        WHERE p.member.id = :memberId
          AND p.solved = :solved
        GROUP BY p
        ORDER BY COUNT(pl.id) DESC, p.id DESC
    """)
        Page<Post> findMineBySolvedOrderByLikeCountDesc(
                @Param("memberId") Long memberId,
                @Param("solved") boolean solved,
                Pageable pageable
        );

        @Query("""
        SELECT p
        FROM Post p
        LEFT JOIN PostLike pl ON pl.post = p
        WHERE (
            lower(p.title) like lower(concat('%', :keyword, '%'))
            or lower(p.content) like lower(concat('%', :keyword, '%'))
        )
          AND p.solved = :solved
        GROUP BY p
        ORDER BY COUNT(pl.id) DESC, p.id DESC
    """)
        Page<Post> searchAllWithSolvedOrderByLikeCountDesc(
                @Param("keyword") String keyword,
                @Param("solved") boolean solved,
                Pageable pageable
        );

        @Query("""
        SELECT p
        FROM Post p
        LEFT JOIN PostLike pl ON pl.post = p
        WHERE p.member.id = :memberId
          AND (
              lower(p.title) like lower(concat('%', :keyword, '%'))
              or lower(p.content) like lower(concat('%', :keyword, '%'))
          )
          AND p.solved = :solved
        GROUP BY p
        ORDER BY COUNT(pl.id) DESC, p.id DESC
    """)
        Page<Post> searchMineWithSolvedOrderByLikeCountDesc(
                @Param("memberId") Long memberId,
                @Param("keyword") String keyword,
                @Param("solved") boolean solved,
                Pageable pageable
        );

        @Query("""
        SELECT pl.post
        FROM PostLike pl
        WHERE pl.member.id = :memberId
        ORDER BY pl.id DESC
    """)
        List<Post> findLikedPostsByMemberId(@Param("memberId") Long memberId);



    }


