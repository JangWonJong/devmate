package com.devs.devmate.member.dto;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Size;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

@Getter
@NoArgsConstructor
public class ProfileLinkRequest {

    @NotBlank(message = "링크 타입을 입력해주세요")
    private String type;

    @NotBlank(message = "링크 이름을 입력해주세요")
    @Size(max = 30, message = "링크 이름은 30자 이하로 가능합니다")
    private String label;

    @NotBlank(message = "링크 주소를 입력해주세요")
    @Size(max = 255, message = "링크 주소는 255자 이하로 가능합니다")
    private String url;

    private Integer displayOrder;
}
