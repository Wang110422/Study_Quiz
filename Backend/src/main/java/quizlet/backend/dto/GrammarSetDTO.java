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
public class GrammarSetDTO {
    private Long id;
    private String title;
    private String description;
    private String slug;
    private String emoji;
    private Integer grammarCount;
    private String level;
    private Boolean isDel;
    private LocalDateTime createdAt;
    private Long folderId;
    private String folderName;
    private String folderSlug;
    private Long userId;
    private String authorName;
    private List<GrammarDTO> grammars;
}
