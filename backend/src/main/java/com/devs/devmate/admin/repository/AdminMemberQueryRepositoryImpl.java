package com.devs.devmate.admin.repository;

import com.devs.devmate.admin.dto.AdminMemberResponse;
import com.devs.devmate.member.entity.Member;
import com.devs.devmate.member.entity.MemberStatus;
import jakarta.persistence.EntityManager;
import jakarta.persistence.PersistenceContext;
import jakarta.persistence.TypedQuery;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageImpl;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Repository;
import org.springframework.util.StringUtils;

import java.util.HashMap;
import java.util.List;
import java.util.Map;

@Repository
public class AdminMemberQueryRepositoryImpl implements AdminMemberQueryRepository{

    @PersistenceContext
    private EntityManager entityManager;

    @Override
    public Page<AdminMemberResponse> searchMembers(MemberStatus status, String keyword, Pageable pageable) {

        StringBuilder contentJpql = new StringBuilder("select m from Member m where 1=1");
        StringBuilder countJpql = new StringBuilder("select count(m) from Member m where 1=1");

        Map<String, Object> params = new HashMap<>();

        if (status != null) {
            contentJpql.append(" and m.status = :status");
            countJpql.append(" and m.status = :status");
            params.put("status", status);
        }

        if (StringUtils.hasText(keyword)) {
            contentJpql.append(" and (lower(m.nickname) like :keyword or lower(m.email) like :keyword)");
            countJpql.append(" and (lower(m.nickname) like :keyword or lower(m.email) like :keyword)");
            params.put("keyword", "%" + keyword.trim().toLowerCase() + "%");
        }

        contentJpql.append(" order by m.createdAt desc");

        TypedQuery<Member> contentQuery = entityManager.createQuery(contentJpql.toString(), Member.class);
        TypedQuery<Long> countQuery = entityManager.createQuery(countJpql.toString(), Long.class);

        for (Map.Entry<String, Object> entry : params.entrySet()) {
            contentQuery.setParameter(entry.getKey(), entry.getValue());
            countQuery.setParameter(entry.getKey(), entry.getValue());
        }

        contentQuery.setFirstResult((int) pageable.getOffset());
        contentQuery.setMaxResults(pageable.getPageSize());

        List<AdminMemberResponse> content = contentQuery.getResultList()
                .stream()
                .map(AdminMemberResponse::from)
                .toList();

        Long total = countQuery.getSingleResult();

        return new PageImpl<>(content, pageable, total);
    }
}
