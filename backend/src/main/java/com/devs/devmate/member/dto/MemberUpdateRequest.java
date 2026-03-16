package com.devs.devmate.member.dto;


import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Size;
import lombok.Getter;
import lombok.NoArgsConstructor;

@Getter
@NoArgsConstructor
public class MemberUpdateRequest {

    @NotBlank(message = "이름을 입력해주세요")
    @Size(max = 30, message = "이름은 30자 이하로 가능합니다")
    private String name;

    @NotBlank(message = "닉네임을 입력해주세요")
    @Size(max = 30, message = "닉네임은 30자 이하로 가능합니다")
    private String nickname;

    @Size(max = 30, message = "전화번호는 30자 이하로 가능합니다")
    private String phone;

    @Size(max = 255, message = "한줄 소개는 255자 이하로 가능합니다")
    private String bio;

}

