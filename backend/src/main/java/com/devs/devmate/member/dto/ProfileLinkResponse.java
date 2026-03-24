package com.devs.devmate.member.dto;

import lombok.AllArgsConstructor;
import lombok.Getter;

@Getter
@AllArgsConstructor
public class ProfileLinkResponse {
    private Long id;
    private String type;
    private String label;
    private String url;
    private Integer displayOrder;
}
