package quizlet.backend.dto;

import lombok.Data;
import java.time.LocalDateTime;
import java.util.List;

@Data
public class FolderDTO {
    private Long id;
    private String name;
    private String description;
    private String slug;
    private String icon;
    private String driveFolderId;
    private String sheetUrl;
    private Boolean isDel;
    private LocalDateTime createdAt;
    private int setsCount;
    private int termsCount;
    private List<StudySetDTO> studySets;
}
