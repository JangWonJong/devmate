package com.devs.devmate.study.repository;

import com.devs.devmate.study.entity.Study;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.Optional;

public interface StudyRepository extends JpaRepository<Study, Long> {

    boolean existsByPostId(Long postId);

    Optional<Study> findByPostId(Long postId);

}
