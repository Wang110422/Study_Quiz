package quizlet.backend.dto;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDateTime;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class GrammarDTO {
    private Long id;
    private String title;
    private String description;
    private String structure;
    private String example;
    private String explanation;
    private LocalDateTime createdAt;
    private Long grammarSetId;
}
