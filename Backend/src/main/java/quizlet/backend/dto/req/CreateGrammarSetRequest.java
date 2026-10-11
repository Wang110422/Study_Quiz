package quizlet.backend.dto.req;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class CreateGrammarSetRequest {

    private String title;

    private String description;

    private String level;

    private Long folderId;
}
