package quizlet.backend.dto;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;
import quizlet.backend.enums.SkillType;

import java.util.List;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class SectionDTO {
    private Integer id;
    private SkillType skill;
    private String title;
    private Integer orderIndex;
    private Integer minutes;
    private Integer questionCount;
    private List<PassageGroupDTO> passageGroups;
}
