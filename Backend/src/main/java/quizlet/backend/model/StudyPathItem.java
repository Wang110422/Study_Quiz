package quizlet.backend.model;

import com.fasterxml.jackson.annotation.JsonIgnore;
import jakarta.persistence.*;
import lombok.Data;
import lombok.EqualsAndHashCode;
import lombok.ToString;

@Entity
@Data
@Table(name = "study_path_item")
public class StudyPathItem {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    private String title;

    private Integer stepOrder = 1;

    private Integer targetLearnCount = 1;

    private Integer targetTestCount = 3;

    private Integer completedLearnCount = 0;

    private Integer completedTestCount = 0;

    private Boolean isCompleted = false;

    private Boolean isLocked = false;

    @ManyToOne
    @JoinColumn(name = "study_path_id")
    @JsonIgnore
    @ToString.Exclude
    @EqualsAndHashCode.Exclude
    private StudyPath studyPath;

    @ManyToOne
    @JoinColumn(name = "study_set_id")
    private StudySet studySet;
}
