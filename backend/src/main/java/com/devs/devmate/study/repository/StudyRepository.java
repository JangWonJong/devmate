package com.devs.devmate.study.repository;

import com.devs.devmate.study.entity.Study;
import org.springframework.data.jpa.repository.JpaRepository;

public interface StudyRepository extends JpaRepository<Study, Long> {

    boolean existsByPostId(Long postid);

}
