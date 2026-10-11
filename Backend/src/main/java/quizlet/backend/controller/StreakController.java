package quizlet.backend.controller;

import lombok.Builder;
import lombok.Data;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.*;
import quizlet.backend.dto.UserStreakDTO;
import quizlet.backend.dto.res.APIResponse;
import quizlet.backend.model.User;
import quizlet.backend.services.UserStreakService;

import java.util.ArrayList;
import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/streak")
@RequiredArgsConstructor
@Slf4j
public class StreakController {

    private final UserStreakService userStreakService;

    @Data
    @Builder
    public static class StreakMilestoneDTO {
        private int targetDays;
        private String title;
        private String badgeName;
        private boolean achieved;
        private int progressPercent;
    }

    /**
     * 1. Lấy thông tin Streak cá nhân của người dùng đang đăng nhập
     */
    @GetMapping("/me")
    @PreAuthorize("hasAnyRole('STUDENT', 'TEACHER', 'ADMIN')")
    public ResponseEntity<APIResponse<UserStreakDTO>> getMyStreak(@AuthenticationPrincipal User currentUser) {
        APIResponse<UserStreakDTO> response = new APIResponse<>();
        try {
            if (currentUser == null) {
                response.setStatus(HttpStatus.UNAUTHORIZED.value());
                response.setMessage("Vui lòng đăng nhập");
                return ResponseEntity.status(HttpStatus.UNAUTHORIZED).body(response);
            }

            UserStreakDTO streak = userStreakService.getStreakByUserId(currentUser.getId());
            response.setStatus(HttpStatus.OK.value());
            response.setMessage("Lấy thông tin streak thành công");
            response.setResult(streak);
            return ResponseEntity.ok(response);
        } catch (Exception ex) {
            log.error("Lỗi khi lấy thông tin streak cá nhân: ", ex);
            response.setStatus(HttpStatus.INTERNAL_SERVER_ERROR.value());
            response.setMessage("Lỗi lấy thông tin streak: " + ex.getMessage());
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).body(response);
        }
    }

    /**
     * 2. Lấy thông tin Streak công khai của một học viên bất kỳ theo userId
     */
    @GetMapping("/user/{userId}")
    public ResponseEntity<APIResponse<UserStreakDTO>> getUserStreak(@PathVariable Long userId) {
        APIResponse<UserStreakDTO> response = new APIResponse<>();
        try {
            UserStreakDTO streak = userStreakService.getStreakByUserId(userId);
            if (streak == null || streak.getUserId() == null) {
                response.setStatus(HttpStatus.NOT_FOUND.value());
                response.setMessage("Không tìm thấy thông tin streak cho học viên này");
                return ResponseEntity.status(HttpStatus.NOT_FOUND).body(response);
            }

            response.setStatus(HttpStatus.OK.value());
            response.setMessage("Lấy thông tin streak học viên thành công");
            response.setResult(streak);
            return ResponseEntity.ok(response);
        } catch (Exception ex) {
            log.error("Lỗi khi lấy streak học viên {}: ", userId, ex);
            response.setStatus(HttpStatus.INTERNAL_SERVER_ERROR.value());
            response.setMessage("Lỗi lấy streak: " + ex.getMessage());
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).body(response);
        }
    }

    /**
     * 3. Ghi nhận hoạt động học hôm nay (tự động cộng streak ngày liền kề)
     */
    @PostMapping("/record")
    @PreAuthorize("hasAnyRole('STUDENT', 'TEACHER', 'ADMIN')")
    public ResponseEntity<APIResponse<UserStreakDTO>> recordActivity(@AuthenticationPrincipal User currentUser) {
        APIResponse<UserStreakDTO> response = new APIResponse<>();
        try {
            if (currentUser == null) {
                response.setStatus(HttpStatus.UNAUTHORIZED.value());
                response.setMessage("Vui lòng đăng nhập");
                return ResponseEntity.status(HttpStatus.UNAUTHORIZED).body(response);
            }

            UserStreakDTO updatedStreak = userStreakService.recordActivity(currentUser);
            response.setStatus(HttpStatus.OK.value());
            response.setMessage("Ghi nhận chuỗi streak thành công");
            response.setResult(updatedStreak);
            return ResponseEntity.ok(response);
        } catch (Exception ex) {
            log.error("Lỗi khi ghi nhận streak: ", ex);
            response.setStatus(HttpStatus.INTERNAL_SERVER_ERROR.value());
            response.setMessage("Lỗi ghi nhận streak: " + ex.getMessage());
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).body(response);
        }
    }

    /**
     * 4. Cập nhật tiến độ số từ vựng đã học thuộc
     */
    @PostMapping("/vocab-progress")
    @PreAuthorize("hasAnyRole('STUDENT', 'TEACHER', 'ADMIN')")
    public ResponseEntity<APIResponse<UserStreakDTO>> updateVocabProgress(
            @RequestBody Map<String, Object> body,
            @AuthenticationPrincipal User currentUser
    ) {
        APIResponse<UserStreakDTO> response = new APIResponse<>();
        try {
            if (currentUser == null) {
                response.setStatus(HttpStatus.UNAUTHORIZED.value());
                response.setMessage("Vui lòng đăng nhập");
                return ResponseEntity.status(HttpStatus.UNAUTHORIZED).body(response);
            }

            int count = body.containsKey("count") ? ((Number) body.get("count")).intValue() : 1;
            boolean isIncrement = !body.containsKey("isIncrement") || (Boolean) body.get("isIncrement");

            UserStreakDTO updated = userStreakService.updateVocabLearned(currentUser.getId(), count, isIncrement);
            response.setStatus(HttpStatus.OK.value());
            response.setMessage("Cập nhật tiến độ từ vựng thành công");
            response.setResult(updated);
            return ResponseEntity.ok(response);
        } catch (Exception ex) {
            log.error("Lỗi khi cập nhật tiến độ từ vựng: ", ex);
            response.setStatus(HttpStatus.INTERNAL_SERVER_ERROR.value());
            response.setMessage("Lỗi cập nhật từ vựng: " + ex.getMessage());
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).body(response);
        }
    }

    /**
     * 5. Lấy danh sách cột mốc / huy hiệu Streak
     */
    @GetMapping("/milestones")
    @PreAuthorize("hasAnyRole('STUDENT', 'TEACHER', 'ADMIN')")
    public ResponseEntity<APIResponse<List<StreakMilestoneDTO>>> getStreakMilestones(@AuthenticationPrincipal User currentUser) {
        APIResponse<List<StreakMilestoneDTO>> response = new APIResponse<>();
        try {
            int currentStreak = 0;
            if (currentUser != null) {
                UserStreakDTO streak = userStreakService.getStreakByUserId(currentUser.getId());
                if (streak != null && streak.getCurrentStreak() != null) {
                    currentStreak = streak.getCurrentStreak();
                }
            }

            int[] targets = {3, 7, 14, 30, 60, 100};
            String[] titles = {
                    "Khởi đầu mạnh mẽ",
                    "Chiến binh kỷ luật",
                    "Thói quen vững chắc",
                    "Bậc thầy chăm chỉ",
                    "Bất khả chiến bại",
                    "Huyền thoại LingoMaster"
            };

            List<StreakMilestoneDTO> milestones = new ArrayList<>();
            for (int i = 0; i < targets.length; i++) {
                int target = targets[i];
                boolean achieved = currentStreak >= target;
                int percent = Math.min(100, (int) Math.round((currentStreak * 100.0) / target));

                milestones.add(StreakMilestoneDTO.builder()
                        .targetDays(target)
                        .title(titles[i])
                        .badgeName(target + "_DAYS")
                        .achieved(achieved)
                        .progressPercent(percent)
                        .build());
            }

            response.setStatus(HttpStatus.OK.value());
            response.setMessage("Lấy danh sách cột mốc streak thành công");
            response.setResult(milestones);
            return ResponseEntity.ok(response);
        } catch (Exception ex) {
            log.error("Lỗi khi lấy cột mốc streak: ", ex);
            response.setStatus(HttpStatus.INTERNAL_SERVER_ERROR.value());
            response.setMessage("Lỗi lấy cột mốc streak: " + ex.getMessage());
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).body(response);
        }
    }
}
