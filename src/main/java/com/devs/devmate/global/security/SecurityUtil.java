package com.devs.devmate.global.security;

import com.devs.devmate.global.common.JwtPrincipal;
import com.devs.devmate.global.exception.BusinessException;
import com.devs.devmate.global.exception.ErrorCode;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;

public class SecurityUtil {

    private SecurityUtil(){ }

    public static Long currentMemberId(){
        Authentication auth = SecurityContextHolder.getContext().getAuthentication();
        if (auth == null || !auth.isAuthenticated()){
            throw new BusinessException(ErrorCode.AUTH_FAILED);
        }
        Object principal = auth.getPrincipal();
        if (principal instanceof JwtPrincipal p ){
            return p.memberId();
        }
        throw new BusinessException(ErrorCode.AUTH_FAILED);
    }

}
