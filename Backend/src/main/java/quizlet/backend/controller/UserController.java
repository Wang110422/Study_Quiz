package quizlet.backend.controller;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.*;
import quizlet.backend.base.APIResponse;
import quizlet.backend.dto.UserDTO;
import quizlet.backend.model.User;
import quizlet.backend.enums.Role;
import quizlet.backend.enums.ThemePreference;
import quizlet.backend.enums.LanguagePreference;
import quizlet.backend.repository.UserRepository;

@RestController
@RequestMapping("/api/user")
public class UserController {

    @Autowired
    private UserRepository userRepository;

    // 1. Lấy thông tin cá nhân & cài đặt hiện tại của User
    @GetMapping("/me")
    public ResponseEntity<APIResponse<UserDTO>> getCurrentUserProfile(@AuthenticationPrincipal User user) {
        APIResponse<UserDTO> response = new APIResponse<>();
        if (user == null) {
            response.setStatus(HttpStatus.UNAUTHORIZED.value());
            response.setMessage("Chưa đăng nhập");
            return ResponseEntity.status(HttpStatus.UNAUTHORIZED).body(response);
        }

        User currentUser = userRepository.findById(user.getId()).orElse(user);
        UserDTO dto = convertToDTO(currentUser);

        response.setStatus(HttpStatus.OK.value());
        response.setMessage("Lấy thông tin hồ sơ thành công");
        response.setResult(dto);
        return ResponseEntity.ok(response);
    }

    // 2. Cập nhật thông tin cá nhân, vai trò (Teacher/Student/Admin) & Cài đặt (Enum)
    @PutMapping("/profile")
    public ResponseEntity<APIResponse<UserDTO>> updateProfile(
            @AuthenticationPrincipal User user,
            @RequestBody UserDTO requestDTO
    ) {
        APIResponse<UserDTO> response = new APIResponse<>();
        if (user == null) {
            response.setStatus(HttpStatus.UNAUTHORIZED.value());
            response.setMessage("Chưa đăng nhập");
            return ResponseEntity.status(HttpStatus.UNAUTHORIZED).body(response);
        }

        User existingUser = userRepository.findById(user.getId()).orElse(null);
        if (existingUser == null) {
            response.setStatus(HttpStatus.NOT_FOUND.value());
            response.setMessage("Không tìm thấy người dùng");
            return ResponseEntity.status(HttpStatus.NOT_FOUND).body(response);
        }

        // Cập nhật thông tin cơ bản (Email là định danh tài khoản cố định, không được chỉnh sửa)
        if (requestDTO.getFirstName() != null) existingUser.setFirstName(requestDTO.getFirstName());
        if (requestDTO.getLastName() != null) existingUser.setLastName(requestDTO.getLastName());


        // Cập nhật Cài đặt giao diện & ngôn ngữ (Enum)
        if (requestDTO.getAvatarUrl() != null) existingUser.setAvatarUrl(requestDTO.getAvatarUrl());
        if (requestDTO.getBio() != null) existingUser.setBio(requestDTO.getBio());
        if (requestDTO.getThemePreference() != null) existingUser.setThemePreference(requestDTO.getThemePreference());
        if (requestDTO.getLanguagePreference() != null) existingUser.setLanguagePreference(requestDTO.getLanguagePreference());
        if (requestDTO.getReminderEnabled() != null) existingUser.setReminderEnabled(requestDTO.getReminderEnabled());
        if (requestDTO.getReminderTime() != null) existingUser.setReminderTime(requestDTO.getReminderTime());

        User savedUser = userRepository.save(existingUser);
        UserDTO resultDTO = convertToDTO(savedUser);

        response.setStatus(HttpStatus.OK.value());
        response.setMessage("Cập nhật thông tin hồ sơ & cài đặt thành công!");
        response.setResult(resultDTO);
        return ResponseEntity.ok(response);
    }

    private UserDTO convertToDTO(User u) {
        UserDTO dto = new UserDTO();
        dto.setId(u.getId());
        dto.setFirstName(u.getFirstName());
        dto.setLastName(u.getLastName());
        dto.setEmail(u.getEmail());
        dto.setRole(u.getRole() != null ? u.getRole() : Role.STUDENT);
        dto.setAvatarUrl(u.getAvatarUrl());
        dto.setBio(u.getBio());
        dto.setThemePreference(u.getThemePreference() != null ? u.getThemePreference() : ThemePreference.LIGHT);
        dto.setLanguagePreference(u.getLanguagePreference() != null ? u.getLanguagePreference() : LanguagePreference.VI);
        dto.setReminderEnabled(u.getReminderEnabled() != null ? u.getReminderEnabled() : false);
        dto.setReminderTime(u.getReminderTime() != null ? u.getReminderTime() : "20:00");
        return dto;
    }
}
