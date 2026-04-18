package com.devs.devmate.global.entity;

import jakarta.persistence.Column;
import jakarta.persistence.MappedSuperclass;
import lombok.Getter;

import java.time.LocalDateTime;

@Getter
@MappedSuperclass
public abstract class ProcessableEntity extends BaseEntity {

    @Column(name = "processed_at")
    private LocalDateTime processedAt;

    protected void markProcessed() {
        this.processedAt = LocalDateTime.now();
    }
}
