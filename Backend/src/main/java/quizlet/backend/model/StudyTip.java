package quizlet.backend.model;

import jakarta.persistence.*;
import lombok.Data;
import org.hibernate.annotations.CreationTimestamp;
import org.hibernate.annotations.UpdateTimestamp;
import quizlet.backend.enums.ExamType;
import quizlet.backend.enums.SkillType;

import java.time.LocalDateTime;

@Data
@Entity
@Table(name = "study_tips")
public class StudyTip {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Enumerated(EnumType.STRING)
    @Column(name = "exam_type", nullable = false, length = 50)
    private ExamType examType;

    @Enumerated(EnumType.STRING)
    @Column(name = "skill", nullable = false, length = 50)
    private SkillType skill;

    @Column(name = "part_name", nullable = false, length = 100)
    private String partName;

    @Column(name = "from_question")
    private Integer fromQuestion;

    @Column(name = "to_question")
    private Integer toQuestion;
    
    @Column(name = "title", nullable = false)
    private String title;

    @Lob
    @Column(name = "content", columnDefinition = "LONGTEXT", nullable = false)
    private String content;

    @Column(name = "order_index")
    private Integer orderIndex;

    @Column(name = "is_active", nullable = false)
    private Boolean isActive = true;

    @Column(name = "created_by")
    private Long createdBy;

    @Column(name = "updated_by")
    private Long updatedBy;

    @CreationTimestamp
    @Column(name = "created_at", updatable = false)
    private LocalDateTime createdAt;

    @UpdateTimestamp
    @Column(name = "updated_at")
    private LocalDateTime updatedAt;
}