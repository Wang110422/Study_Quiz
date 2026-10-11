package quizlet.backend.controller;

import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.*;
import quizlet.backend.dto.LeaderboardItemDTO;
import quizlet.backend.dto.LeaderboardResponseDTO;
import quizlet.backend.dto.UserStreakDTO;
import quizlet.backend.dto.res.APIResponse;
import quizlet.backend.model.User;
import quizlet.backend.services.LeaderboardService;
import quizlet.backend.services.UserStreakService;

import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/leaderboard")
@RequiredArgsConstructor
@Slf4j
public class LeaderboardController {

    private final LeaderboardService leaderboardService;
    private final UserStreakService userStreakService;

    /**
     * Lấy dữ liệu Bảng xếp hạng theo bộ lọc:
     * - filter: "vocab" (Từ vựng) | "exam" (Luyện đề) | "streak" (Chuỗi ngày học)
     * - subFilter (dành cho "exam"): "submitted" (Số đề đã nộp) | "latest_score" (Điểm gần nhất) | "avg_score" (Điểm trung bình)
     */
    @GetMapping
    public ResponseEntity<APIResponse<LeaderboardResponseDTO>> getLeaderboard(
            @RequestParam(defaultValue = "vocab") String filter,
            @RequestParam(defaultValue = "submitted") String subFilter,
            @RequestParam(defaultValue = "50") Integer limit,
            @AuthenticationPrincipal User currentUser
    ) {
        APIResponse<LeaderboardResponseDTO> response = new APIResponse<>();
        try {
            Long currentUserId = currentUser != null ? currentUser.getId() : null;
            LeaderboardResponseDTO result = leaderboardService.getLeaderboard(filter, subFilter, currentUserId, limit);

            response.setStatus(HttpStatus.OK.value());
            response.setMessage("Tải bảng xếp hạng thành công");
            response.setResult(result);
            return ResponseEntity.ok(response);
        } catch (Exception ex) {
            log.error("Lỗi khi tải bảng xếp hạng: ", ex);
            response.setStatus(HttpStatus.INTERNAL_SERVER_ERROR.value());
            response.setMessage("Lỗi tải bảng xếp hạng: " + ex.getMessage());
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).body(response);
        }
    }

    /**
     * Lấy Top 3 thí sinh cao nhất (Vàng, Bạc, Đồng) phục vụ bục vinh danh
     */
    @GetMapping("/podium")
    public ResponseEntity<APIResponse<List<LeaderboardItemDTO>>> getTopPodium(
            @RequestParam(defaultValue = "vocab") String filter,
            @RequestParam(defaultValue = "submitted") String subFilter,
            @AuthenticationPrincipal User currentUser
    ) {
        APIResponse<List<LeaderboardItemDTO>> response = new APIResponse<>();
        try {
            Long currentUserId = currentUser != null ? currentUser.getId() : null;
            List<LeaderboardItemDTO> podium = leaderboardService.getTopPodium(filter, subFilter, currentUserId);

            response.setStatus(HttpStatus.OK.value());
            response.setMessage("Lấy top 3 vinh danh thành công");
            response.setResult(podium);
            return ResponseEntity.ok(response);
        } catch (Exception ex) {
            log.error("Lỗi khi lấy podium: ", ex);
            response.setStatus(HttpStatus.INTERNAL_SERVER_ERROR.value());
            response.setMessage("Lỗi lấy top 3: " + ex.getMessage());
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).body(response);
        }
    }

    /**
     * Lấy thứ hạng của người dùng hiện tại kèm các đối thủ lân cận (±2 hạng)
     */
    @GetMapping("/my-rank")
    @PreAuthorize("hasAnyRole('STUDENT', 'TEACHER', 'ADMIN')")
    public ResponseEntity<APIResponse<Map<String, Object>>> getMyRankAndNeighbors(
            @RequestParam(defaultValue = "vocab") String filter,
            @RequestParam(defaultValue = "submitted") String subFilter,
            @AuthenticationPrincipal User currentUser
    ) {
        APIResponse<Map<String, Object>> response = new APIResponse<>();
        try {
            if (currentUser == null) {
                response.setStatus(HttpStatus.UNAUTHORIZED.value());
                response.setMessage("Vui lòng đăng nhập");
                return ResponseEntity.status(HttpStatus.UNAUTHORIZED).body(response);
            }

            Map<String, Object> result = leaderboardService.getMyRankAndNeighbors(filter, subFilter, currentUser.getId());
            response.setStatus(HttpStatus.OK.value());
            response.setMessage("Lấy thứ hạng cá nhân và đối thủ thành công");
            response.setResult(result);
            return ResponseEntity.ok(response);
        } catch (Exception ex) {
            log.error("Lỗi khi lấy thứ hạng cá nhân: ", ex);
            response.setStatus(HttpStatus.INTERNAL_SERVER_ERROR.value());
            response.setMessage("Lỗi lấy thứ hạng: " + ex.getMessage());
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).body(response);
        }
    }

    /**
     * Bảng xếp hạng nội bộ của Lớp học
     */
    @GetMapping("/class/{classId}")
    @PreAuthorize("hasAnyRole('STUDENT', 'TEACHER', 'ADMIN')")
    public ResponseEntity<APIResponse<LeaderboardResponseDTO>> getClassLeaderboard(
            @PathVariable Long classId,
            @RequestParam(defaultValue = "vocab") String filter,
            @RequestParam(defaultValue = "submitted") String subFilter,
            @AuthenticationPrincipal User currentUser
    ) {
        APIResponse<LeaderboardResponseDTO> response = new APIResponse<>();
        try {
            Long currentUserId = currentUser != null ? currentUser.getId() : null;
            LeaderboardResponseDTO result = leaderboardService.getClassLeaderboard(classId, filter, subFilter, currentUserId);

            response.setStatus(HttpStatus.OK.value());
            response.setMessage("Tải bảng xếp hạng lớp học thành công");
            response.setResult(result);
            return ResponseEntity.ok(response);
        } catch (Exception ex) {
            log.error("Lỗi khi tải bảng xếp hạng lớp học {}: ", classId, ex);
            response.setStatus(HttpStatus.INTERNAL_SERVER_ERROR.value());
            response.setMessage("Lỗi tải bảng xếp hạng lớp: " + ex.getMessage());
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).body(response);
        }
    }

    /**
     * Bảng xếp hạng nội bộ của Nhóm học
     */
    @GetMapping("/group/{groupId}")
    @PreAuthorize("hasAnyRole('STUDENT', 'TEACHER', 'ADMIN')")
    public ResponseEntity<APIResponse<LeaderboardResponseDTO>> getGroupLeaderboard(
            @PathVariable Long groupId,
            @RequestParam(defaultValue = "vocab") String filter,
            @RequestParam(defaultValue = "submitted") String subFilter,
            @AuthenticationPrincipal User currentUser
    ) {
        APIResponse<LeaderboardResponseDTO> response = new APIResponse<>();
        try {
            Long currentUserId = currentUser != null ? currentUser.getId() : null;
            LeaderboardResponseDTO result = leaderboardService.getGroupLeaderboard(groupId, filter, subFilter, currentUserId);

            response.setStatus(HttpStatus.OK.value());
            response.setMessage("Tải bảng xếp hạng nhóm học thành công");
            response.setResult(result);
            return ResponseEntity.ok(response);
        } catch (Exception ex) {
            log.error("Lỗi khi tải bảng xếp hạng nhóm học {}: ", groupId, ex);
            response.setStatus(HttpStatus.INTERNAL_SERVER_ERROR.value());
            response.setMessage("Lỗi tải bảng xếp hạng nhóm: " + ex.getMessage());
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).body(response);
        }
    }

    /**
     * Lấy thông tin Streak của cá nhân (người dùng đang đăng nhập)
     */
    @GetMapping("/streak/me")
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
            log.error("Lỗi khi lấy thông tin streak: ", ex);
            response.setStatus(HttpStatus.INTERNAL_SERVER_ERROR.value());
            response.setMessage("Lỗi lấy thông tin streak: " + ex.getMessage());
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).body(response);
        }
    }

    /**
     * Tự động ghi nhận hoạt động học (tăng streak của ngày hôm đó)
     * Gọi khi: học flashcard, vào học bài, tương tác bài học
     */
    @PostMapping("/streak/record")
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
     * Cập nhật tiến độ số từ vựng đã học thuộc
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
            boolean isIncrement = body.containsKey("isIncrement") ? (Boolean) body.get("isIncrement") : true;

            UserStreakDTO updated = userStreakService.updateVocabLearned(currentUser.getId(), count, isIncrement);
            response.setStatus(HttpStatus.OK.value());
            response.setMessage("Cập nhật tiến độ từ vựng thành công");
            response.setResult(updated);
            return ResponseEntity.ok(response);
        } catch (Exception ex) {
            log.error("Lỗi khi cập nhật từ vựng: ", ex);
            response.setStatus(HttpStatus.INTERNAL_SERVER_ERROR.value());
            response.setMessage("Lỗi cập nhật từ vựng: " + ex.getMessage());
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).body(response);
        }
    }
}
