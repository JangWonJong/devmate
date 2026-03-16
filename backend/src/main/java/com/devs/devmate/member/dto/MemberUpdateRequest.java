package com.devs.devmate.member.dto;


import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Size;
import lombok.Getter;
import lombok.NoArgsConstructor;

@Getter
@NoArgsConstructor
public class MemberUpdateRequest {

    @NotBlank
    @Size(max = 30)
    private String name;

    @NotBlank
    @Size(max = 30)
    private String nickname;

    @Size(max = 30)
    private String phone;

    @Size(max = 255)
    private String bio;

}

