package com.devs.devmate.study.repository;

import com.devs.devmate.study.entity.Study;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;

import java.util.List;
import java.util.Optional;

public interface StudyRepository extends JpaRepository<Study, Long> {

    boolean existsByPostId(Long postId);

    Optional<Study> findByPostId(Long postId);

    @Query("""
            select s
            from Study s
            join fetch s.post p
            join fetch p.member
            order by s.id desc
            """)
    List<Study> findRecentStudies(Pageable pageable);

}
