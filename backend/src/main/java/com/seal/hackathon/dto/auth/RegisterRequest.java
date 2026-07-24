package com.seal.hackathon.dto.auth;

import com.seal.hackathon.domain.enums.UserCategory;
import jakarta.validation.constraints.Email;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Size;

public record RegisterRequest(
        @NotBlank String fullName,
        @NotBlank @Email String email,
        @NotBlank @Size(min = 8, message = "Mật khẩu tối thiểu 8 ký tự") String password,
        @NotNull UserCategory userCategory,
        String studentCode,
        String schoolName
) {
}
