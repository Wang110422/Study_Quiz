package quizlet.backend.dto;

import lombok.Data;
import java.time.LocalDateTime;
import java.util.List;

@Data
public class StudyGroupDTO {
    private Long id;
    private String name;
    private String description;
    private String joinCode;
    private LocalDateTime createdAt;
    private Long creatorId;
    private String creatorName;
    private String creatorEmail;
    private Integer membersCount;
    private Integer setsCount;
    private Integer foldersCount;
    private List<UserDTO> members;
    private List<StudySetDTO> studySets;
    private List<FolderDTO> folders;
}
