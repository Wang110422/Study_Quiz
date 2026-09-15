package quizlet.backend.dto;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;
import quizlet.backend.enums.ExamType;
import quizlet.backend.enums.SkillType;

import java.util.List;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class StudyTipDTO {
    private Long id;
    private ExamType examType;
    private SkillType skill;
    private String partName;
    private Integer fromQuestion;
    private Integer toQuestion;
    private String title;
    private String content;
    private List<String> tips;
    private Integer orderIndex;
    private Boolean isActive;
    private Long examId;
    private String cta;
}
