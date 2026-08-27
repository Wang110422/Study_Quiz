package quizlet.backend.dto;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;
import quizlet.backend.enums.Level;
import quizlet.backend.enums.Pos;

import java.time.LocalDateTime;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class VocabularyFlashCardDTO {
    private Long id;
    private String term;
    private String definition;
    private String baseForm;
    private String ipa;
    private String audioUrl;
    private Pos pos;
    private Level level;
    private String meaning;
    private String hint;
    private LocalDateTime createAt;
    private Boolean isDel;
    private Long studySetId;
}