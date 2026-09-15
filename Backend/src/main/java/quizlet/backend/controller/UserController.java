package quizlet.backend.controller;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.*;
import quizlet.backend.dto.res.APIResponse;
import quizlet.backend.dto.UserDTO;
import quizlet.backend.model.User;
import quizlet.backend.enums.Role;
import quizlet.backend.enums.ThemePreference;
import quizlet.backend.enums.LanguagePreference;
import quizlet.backend.repository.UserRepository;

import java.util.HashMap;
import java.util.List;
import java.util.Map;
import java.util.stream.Collectors;

@RestController
@RequestMapping("/api/user")
public class UserController {

    @Autowired
    private UserRepository userRepository;

    // 1. Lấy thông tin cá nhân & cài đặt hiện tại của User
    @GetMapping("/me")
    @PreAuthorize("hasAnyRole('STUDENT', 'TEACHER', 'ADMIN')")
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

    // 2. Cập nhật thông tin cá nhân & Cài đặt (Enum)
    @PutMapping("/profile")
    @PreAuthorize("hasAnyRole('STUDENT', 'TEACHER', 'ADMIN')")
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

        // Cập nhật thông tin cơ bản
        if (requestDTO.getFirstName() != null) existingUser.setFirstName(requestDTO.getFirstName());
        if (requestDTO.getLastName() != null) existingUser.setLastName(requestDTO.getLastName());
        if (requestDTO.getRole() != null) existingUser.setRole(requestDTO.getRole());

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

    // 3. Chuyển đổi vai trò người dùng (STUDENT <-> TEACHER)
    @PostMapping("/switch-role")
    @PreAuthorize("hasAnyRole('STUDENT', 'TEACHER', 'ADMIN')")
    public ResponseEntity<APIResponse<UserDTO>> switchRole(
            @AuthenticationPrincipal User user,
            @RequestParam Role role
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

        existingUser.setRole(role);
        User savedUser = userRepository.save(existingUser);
        UserDTO resultDTO = convertToDTO(savedUser);

        response.setStatus(HttpStatus.OK.value());
        response.setMessage("Chuyển đổi vai trò thành công sang: " + role);
        response.setResult(resultDTO);
        return ResponseEntity.ok(response);
    }

    // ==========================================
    // CÁC API ENDPOINTS DÀNH RIÊNG CHO ROLE ADMIN
    // (Admin không có giao diện, chỉ thao tác qua API endpoint)
    // ==========================================

    // Admin API 1: Lấy danh sách toàn bộ người dùng trong hệ thống
    @GetMapping("/admin/users")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<APIResponse<List<UserDTO>>> getAllUsersForAdmin() {
        List<User> users = userRepository.findAll();
        List<UserDTO> dtoList = users.stream().map(this::convertToDTO).collect(Collectors.toList());

        APIResponse<List<UserDTO>> response = new APIResponse<>();
        response.setStatus(HttpStatus.OK.value());
        response.setMessage("Admin: Lấy danh sách người dùng thành công");
        response.setResult(dtoList);
        return ResponseEntity.ok(response);
    }

    // Admin API 2: Gán quyền Role cho bất kỳ user nào
    @PutMapping("/admin/users/{userId}/role")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<APIResponse<UserDTO>> updateUserRoleByAdmin(
            @PathVariable Long userId,
            @RequestParam Role role
    ) {
        APIResponse<UserDTO> response = new APIResponse<>();
        User targetUser = userRepository.findById(userId).orElse(null);
        if (targetUser == null) {
            response.setStatus(HttpStatus.NOT_FOUND.value());
            response.setMessage("Không tìm thấy người dùng với ID: " + userId);
            return ResponseEntity.status(HttpStatus.NOT_FOUND).body(response);
        }

        targetUser.setRole(role);
        User savedUser = userRepository.save(targetUser);

        response.setStatus(HttpStatus.OK.value());
        response.setMessage("Admin: Cập nhật quyền thành công cho người dùng ID " + userId + " thành " + role);
        response.setResult(convertToDTO(savedUser));
        return ResponseEntity.ok(response);
    }

    // Admin API 3: Xóa người dùng theo ID
    @DeleteMapping("/admin/users/{userId}")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<APIResponse<Void>> deleteUserByAdmin(@PathVariable Long userId) {
        APIResponse<Void> response = new APIResponse<>();
        if (!userRepository.existsById(userId)) {
            response.setStatus(HttpStatus.NOT_FOUND.value());
            response.setMessage("Không tìm thấy người dùng với ID: " + userId);
            return ResponseEntity.status(HttpStatus.NOT_FOUND).body(response);
        }

        userRepository.deleteById(userId);
        response.setStatus(HttpStatus.OK.value());
        response.setMessage("Admin: Đã xóa người dùng ID " + userId + " thành công");
        return ResponseEntity.ok(response);
    }

    // Admin API 4: Thống kê tổng quan hệ thống (User counts, roles)
    @GetMapping("/admin/stats")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<APIResponse<Map<String, Object>>> getSystemStatsForAdmin() {
        List<User> users = userRepository.findAll();
        long totalUsers = users.size();
        long studentCount = users.stream().filter(u -> u.getRole() == Role.STUDENT).count();
        long teacherCount = users.stream().filter(u -> u.getRole() == Role.TEACHER).count();
        long adminCount = users.stream().filter(u -> u.getRole() == Role.ADMIN).count();

        Map<String, Object> stats = new HashMap<>();
        stats.put("totalUsers", totalUsers);
        stats.put("totalStudents", studentCount);
        stats.put("totalTeachers", teacherCount);
        stats.put("totalAdmins", adminCount);

        APIResponse<Map<String, Object>> response = new APIResponse<>();
        response.setStatus(HttpStatus.OK.value());
        response.setMessage("Admin: Lấy thống kê hệ thống thành công");
        response.setResult(stats);
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
