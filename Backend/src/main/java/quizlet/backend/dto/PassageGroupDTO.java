package quizlet.backend.dto;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;
import quizlet.backend.enums.ToeicPart;

import java.util.List;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class PassageGroupDTO {
    private Long id;
    private String title;
    private String passageText;
    private String mediaUrl;
    private Integer orderIndex;
    private ToeicPart toeicPart;
    private List<QuestionDTO> questions;
}
