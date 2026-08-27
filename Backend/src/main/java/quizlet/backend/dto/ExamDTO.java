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
public class ExamDTO {
    private Long id;
    private String title;
    private String description;
    private Integer totalMinutes;
    private Integer totalScore;
    private ExamType type;
    private SkillType primarySkill; // Dùng cho PRACTICE exam
    private Integer sectionCount;
    private Integer totalQuestions;
    private List<SectionDTO> sections;
}
