package com.devs.devmate.member.dto;


import jakarta.validation.constraints.Email;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Size;
import lombok.Getter;
import lombok.NoArgsConstructor;

@Getter
@NoArgsConstructor
public class MemberSignUpRequest {

    @Email(message = "올바른 이메일 형식을 입력해주세요.")
    @NotBlank(message = "이메일을 입력해주세요")
    private String email;

    @NotBlank(message = "비밀번호를 입력해주세요")
    @Size(min = 8,max = 20, message = "비밀번호는 8자 이상 20자 이하입니다")
    private String password;

    @NotBlank(message = "확인 비밀번호를 입력해주세요")
    private String confirmPassword;

    @NotBlank(message = "이름을 입력해주세요")
    @Size(max = 30, message = "이름은 30자 이하로 가능합니다")
    private String name;

    @NotBlank(message = "닉네임을 입력해주세요")
    @Size(max = 30, message = "닉네임은 30자 이하로 가능합니다")
    private String nickname;



}
