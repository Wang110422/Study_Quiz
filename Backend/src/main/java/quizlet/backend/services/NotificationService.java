package quizlet.backend.services;

import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import quizlet.backend.dto.NotificationDTO;
import quizlet.backend.dto.req.CreateNotificationRequest;
import quizlet.backend.enums.NotificationType;
import quizlet.backend.model.Notification;
import quizlet.backend.model.User;
import quizlet.backend.repository.NotificationRepository;
import quizlet.backend.repository.UserRepository;

import java.time.LocalDateTime;
import java.util.Collections;
import java.util.List;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
@Slf4j
public class NotificationService {

    private final NotificationRepository notificationRepository;
    private final UserRepository userRepository;

    @Transactional(readOnly = true)
    public List<NotificationDTO> getUserNotifications(User user) {
        if (user == null || user.getId() == null) {
            return Collections.emptyList();
        }
        return notificationRepository.findByUserIdOrderByCreatedAtDesc(user.getId())
                .stream()
                .map(this::mapToDTO)
                .collect(Collectors.toList());
    }

    @Transactional(readOnly = true)
    public long getUnreadCount(User user) {
        if (user == null || user.getId() == null) {
            return 0;
        }
        return notificationRepository.countByUserIdAndIsReadFalse(user.getId());
    }

    @Transactional
    public NotificationDTO markAsRead(User user, Long notificationId) {
        if (user == null || user.getId() == null || notificationId == null) {
            return null;
        }
        Notification notification = notificationRepository.findByIdAndUserId(notificationId, user.getId())
                .orElse(null);
        if (notification != null) {
            notification.setIsRead(true);
            notification = notificationRepository.save(notification);
            return mapToDTO(notification);
        }
        return null;
    }

    @Transactional
    public void markAllAsRead(User user) {
        if (user == null || user.getId() == null) {
            return;
        }
        notificationRepository.markAllAsReadByUserId(user.getId());
    }

    @Transactional
    public boolean deleteNotification(User user, Long notificationId) {
        if (user == null || user.getId() == null || notificationId == null) {
            return false;
        }
        Notification notification = notificationRepository.findByIdAndUserId(notificationId, user.getId())
                .orElse(null);
        if (notification != null) {
            notificationRepository.delete(notification);
            return true;
        }
        return false;
    }

    @Transactional
    public NotificationDTO createNotification(CreateNotificationRequest request) {
        if (request == null || request.getTargetUserId() == null) {
            return null;
        }
        return createNotification(
                request.getTargetUserId(),
                request.getTitle(),
                request.getContent(),
                request.getType() != null ? request.getType() : NotificationType.SYSTEM,
                request.getReferenceId(),
                request.getReferenceUrl()
        );
    }

    @Transactional
    public NotificationDTO createNotification(Long targetUserId, String title, String content, NotificationType type, Long referenceId, String referenceUrl) {
        if (targetUserId == null) {
            return null;
        }
        User targetUser = userRepository.findById(targetUserId).orElse(null);
        if (targetUser == null) {
            log.warn("Cannot create notification: Target user with ID {} not found", targetUserId);
            return null;
        }

        Notification notification = Notification.create(
                targetUser,
                title != null ? title : "Thông báo mới",
                content != null ? content : "",
                type != null ? type : NotificationType.SYSTEM,
                referenceId,
                referenceUrl
        );

        Notification saved = notificationRepository.save(notification);
        log.info("Created notification ID {} for user {}: {}", saved.getId(), targetUserId, title);
        return mapToDTO(saved);
    }

    private NotificationDTO mapToDTO(Notification n) {
        if (n == null) return null;
        return NotificationDTO.builder()
                .id(n.getId())
                .userId(n.getUser() != null ? n.getUser().getId() : null)
                .title(n.getTitle())
                .content(n.getContent())
                .type(n.getType())
                .referenceId(n.getReferenceId())
                .referenceUrl(n.getReferenceUrl())
                .isRead(n.getIsRead() != null ? n.getIsRead() : false)
                .createdAt(n.getCreatedAt())
                .build();
    }
}
