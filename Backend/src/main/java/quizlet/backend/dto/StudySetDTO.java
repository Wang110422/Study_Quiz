package quizlet.backend.dto;

import lombok.Data;

@Data
public class StudySetDTO {
    private Long id;
    private String titleName;
    private String slug;
}
