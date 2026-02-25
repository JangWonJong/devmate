package com.devs.devmate.member.service;


import com.devs.devmate.member.dto.MemberSignupResponse;
import com.devs.devmate.member.dto.MemberSignUpRequest;
import com.devs.devmate.member.entity.Member;
import com.devs.devmate.member.repository.MemberRepository;
import jakarta.transaction.Transactional;
import lombok.RequiredArgsConstructor;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;

@Service
@RequiredArgsConstructor
@Transactional
public class MemberServiceImpl implements MemberService{

    private final MemberRepository memberRepository;
    private final PasswordEncoder passwordEncoder;

    @Override
    public MemberSignupResponse signup(MemberSignUpRequest request){
        if (memberRepository.existsByEmail(request.getEmail())){
            throw new IllegalArgumentException("Already exist email");
        }
        if (memberRepository.existsByNickname(request.getNickname())){
            throw new IllegalArgumentException("Already exist nickname");

        }
        String encodedPassword = passwordEncoder.encode(request.getPassword());
        Member member = Member.builder()
                .email(request.getEmail())
                .password(encodedPassword)
                .nickname(request.getNickname())
                .build();

        Member saveMember = memberRepository.save(member);
        return MemberSignupResponse.builder()
                .id(saveMember.getId())
                .email(saveMember.getEmail())
                .nickname(saveMember.getNickname())
                .role(saveMember.getRole())
                .build();
    }

}
