package quizlet.backend.dto.req;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;
import quizlet.backend.enums.NotificationType;

@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class CreateNotificationRequest {
    private Long targetUserId;
    private String title;
    private String content;
    private NotificationType type;
    private Long referenceId;
    private String referenceUrl;
}
