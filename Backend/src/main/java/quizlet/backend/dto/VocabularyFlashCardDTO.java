package quizlet.backend.dto;

import lombok.Data;

@Data
public class VocabularyFlashCardDTO {
    private Long id;
    private String term;
    private String definition;
    private Boolean isDel;
}