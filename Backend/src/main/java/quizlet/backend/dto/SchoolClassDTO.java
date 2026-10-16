package quizlet.backend.dto;

import lombok.Data;
import java.time.LocalDateTime;
import java.util.List;

@Data
public class SchoolClassDTO {
    private Long id;
    private String name;
    private String description;
    private String joinCode;
    private LocalDateTime createdAt;
    private Long teacherId;
    private String teacherName;
    private String teacherEmail;
    private Integer studentsCount;
    private Integer setsCount;
    private Integer foldersCount;
    private Integer examsCount;
    private Integer grammarSetsCount;
    private List<UserDTO> students;
    private List<StudySetDTO> studySets;
    private List<FolderDTO> folders;
    private List<ExamDTO> exams;
    private List<GrammarSetDTO> grammarSets;
}
