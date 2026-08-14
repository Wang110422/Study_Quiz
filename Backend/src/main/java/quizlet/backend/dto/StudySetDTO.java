package quizlet.backend.dto;

import lombok.Data;
import java.util.List;

@Data
public class StudySetDTO {
    private Long id;
    private String titleName;
    private String description;
    private String slug;
    private Long folderId;
    private String folderSlug;
    private Boolean isDel;
    private List<VocabularyFlashCardDTO> vocabularies;
}
