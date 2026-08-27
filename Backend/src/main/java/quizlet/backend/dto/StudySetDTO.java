package quizlet.backend.dto;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDateTime;
import java.util.List;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class StudySetDTO {
    private Long id;
    private String titleName;
    private String description;
    private String slug;
    private Long folderId;
    private String folderSlug;
    private String folderName;
    private Long userId;
    private String authorName;
    private Boolean isDel;
    private LocalDateTime createdAt;
    private Integer vocabulariesCount;
    private List<VocabularyFlashCardDTO> vocabularies;
}
