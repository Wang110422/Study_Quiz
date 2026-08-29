package quizlet.backend.dto.req;

import lombok.Data;
import java.util.List;

@Data
public class CreatePathRequest {
    private String title;
    private String description;
    private String level = "Trung bình";
    private Integer durationDays = 30;
    private String icon = "🎓";
    private List<ItemRequest> items;

    @Data
    public static class ItemRequest {
        private Long studySetId;
        private String title;
        private Integer targetLearnCount = 1;
        private Integer targetTestCount = 3;
    }
}
