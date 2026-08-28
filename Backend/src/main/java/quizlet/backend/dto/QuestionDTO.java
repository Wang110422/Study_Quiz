package quizlet.backend.dto;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class QuestionDTO {
    private Long id;
    private Long passageGroupId;
    private Integer sectionId;
    private String content;
    private String answer; // JSON options
    private String correctAnswer;
    private String explanation;
    private Double score;
    private Integer orderIndex;
}
