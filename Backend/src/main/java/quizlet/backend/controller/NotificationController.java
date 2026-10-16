package quizlet.backend.controller;

import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.*;
import quizlet.backend.dto.NotificationDTO;
import quizlet.backend.dto.req.CreateNotificationRequest;
import quizlet.backend.dto.res.APIResponse;
import quizlet.backend.model.User;
import quizlet.backend.services.NotificationService;

import java.util.List;

@RestController
@RequestMapping("/api/notifications")
@RequiredArgsConstructor
@Slf4j
public class NotificationController {

    private final NotificationService notificationService;

    /**
     * 1. Lấy danh sách thông báo của người dùng hiện tại (Mới nhất -> Cũ nhất)
     */
    @GetMapping
    @PreAuthorize("hasAnyRole('STUDENT', 'TEACHER', 'ADMIN')")
    public ResponseEntity<APIResponse<List<NotificationDTO>>> getNotifications(
            @AuthenticationPrincipal User currentUser
    ) {
        APIResponse<List<NotificationDTO>> response = new APIResponse<>();
        if (currentUser == null) {
            response.setStatus(HttpStatus.UNAUTHORIZED.value());
            response.setMessage("Chưa đăng nhập");
            return ResponseEntity.status(HttpStatus.UNAUTHORIZED).body(response);
        }

        List<NotificationDTO> list = notificationService.getUserNotifications(currentUser);
        response.setStatus(HttpStatus.OK.value());
        response.setMessage("Lấy danh sách thông báo thành công");
        response.setResult(list);
        return ResponseEntity.ok(response);
    }

    /**
     * 2. Lấy số lượng thông báo chưa đọc của người dùng hiện tại
     */
    @GetMapping("/unread-count")
    @PreAuthorize("hasAnyRole('STUDENT', 'TEACHER', 'ADMIN')")
    public ResponseEntity<APIResponse<Long>> getUnreadCount(
            @AuthenticationPrincipal User currentUser
    ) {
        APIResponse<Long> response = new APIResponse<>();
        if (currentUser == null) {
            response.setStatus(HttpStatus.UNAUTHORIZED.value());
            response.setMessage("Chưa đăng nhập");
            return ResponseEntity.status(HttpStatus.UNAUTHORIZED).body(response);
        }

        long count = notificationService.getUnreadCount(currentUser);
        response.setStatus(HttpStatus.OK.value());
        response.setMessage("Lấy số lượng thông báo chưa đọc thành công");
        response.setResult(count);
        return ResponseEntity.ok(response);
    }

    /**
     * 3. Đánh dấu 1 thông báo là đã đọc
     */
    @PutMapping("/{id}/read")
    @PreAuthorize("hasAnyRole('STUDENT', 'TEACHER', 'ADMIN')")
    public ResponseEntity<APIResponse<NotificationDTO>> markAsRead(
            @AuthenticationPrincipal User currentUser,
            @PathVariable Long id
    ) {
        APIResponse<NotificationDTO> response = new APIResponse<>();
        if (currentUser == null) {
            response.setStatus(HttpStatus.UNAUTHORIZED.value());
            response.setMessage("Chưa đăng nhập");
            return ResponseEntity.status(HttpStatus.UNAUTHORIZED).body(response);
        }

        NotificationDTO updated = notificationService.markAsRead(currentUser, id);
        if (updated == null) {
            response.setStatus(HttpStatus.NOT_FOUND.value());
            response.setMessage("Không tìm thấy thông báo hoặc bạn không có quyền");
            return ResponseEntity.status(HttpStatus.NOT_FOUND).body(response);
        }

        response.setStatus(HttpStatus.OK.value());
        response.setMessage("Đã đánh dấu thông báo là đã đọc");
        response.setResult(updated);
        return ResponseEntity.ok(response);
    }

    /**
     * 4. Đánh dấu tất cả thông báo là đã đọc
     */
    @PutMapping("/read-all")
    @PreAuthorize("hasAnyRole('STUDENT', 'TEACHER', 'ADMIN')")
    public ResponseEntity<APIResponse<String>> markAllAsRead(
            @AuthenticationPrincipal User currentUser
    ) {
        APIResponse<String> response = new APIResponse<>();
        if (currentUser == null) {
            response.setStatus(HttpStatus.UNAUTHORIZED.value());
            response.setMessage("Chưa đăng nhập");
            return ResponseEntity.status(HttpStatus.UNAUTHORIZED).body(response);
        }

        notificationService.markAllAsRead(currentUser);
        response.setStatus(HttpStatus.OK.value());
        response.setMessage("Đã đánh dấu tất cả thông báo là đã đọc");
        response.setResult("OK");
        return ResponseEntity.ok(response);
    }

    /**
     * 5. Xóa 1 thông báo
     */
    @DeleteMapping("/{id}")
    @PreAuthorize("hasAnyRole('STUDENT', 'TEACHER', 'ADMIN')")
    public ResponseEntity<APIResponse<String>> deleteNotification(
            @AuthenticationPrincipal User currentUser,
            @PathVariable Long id
    ) {
        APIResponse<String> response = new APIResponse<>();
        if (currentUser == null) {
            response.setStatus(HttpStatus.UNAUTHORIZED.value());
            response.setMessage("Chưa đăng nhập");
            return ResponseEntity.status(HttpStatus.UNAUTHORIZED).body(response);
        }

        boolean success = notificationService.deleteNotification(currentUser, id);
        if (!success) {
            response.setStatus(HttpStatus.NOT_FOUND.value());
            response.setMessage("Không tìm thấy thông báo để xóa");
            return ResponseEntity.status(HttpStatus.NOT_FOUND).body(response);
        }

        response.setStatus(HttpStatus.OK.value());
        response.setMessage("Đã xóa thông báo thành công");
        response.setResult("DELETED");
        return ResponseEntity.ok(response);
    }

    /**
     * 6. Tạo thông báo mới (Giảng viên gửi lời khuyên hoặc hệ thống gửi)
     */
    @PostMapping
    @PreAuthorize("hasAnyRole('TEACHER', 'ADMIN')")
    public ResponseEntity<APIResponse<NotificationDTO>> createNotification(
            @AuthenticationPrincipal User currentUser,
            @RequestBody CreateNotificationRequest request
    ) {
        APIResponse<NotificationDTO> response = new APIResponse<>();
        if (currentUser == null) {
            response.setStatus(HttpStatus.UNAUTHORIZED.value());
            response.setMessage("Chưa đăng nhập");
            return ResponseEntity.status(HttpStatus.UNAUTHORIZED).body(response);
        }

        NotificationDTO created = notificationService.createNotification(request);
        if (created == null) {
            response.setStatus(HttpStatus.BAD_REQUEST.value());
            response.setMessage("Không thể tạo thông báo: thiếu thông tin hoặc người nhận không tồn tại");
            return ResponseEntity.status(HttpStatus.BAD_REQUEST).body(response);
        }

        response.setStatus(HttpStatus.CREATED.value());
        response.setMessage("Đã tạo thông báo thành công");
        response.setResult(created);
        return ResponseEntity.status(HttpStatus.CREATED).body(response);
    }
}
