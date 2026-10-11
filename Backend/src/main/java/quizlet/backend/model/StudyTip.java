package quizlet.backend.model;

import jakarta.persistence.*;
import lombok.Data;
import lombok.EqualsAndHashCode;
import lombok.ToString;
import org.hibernate.annotations.CreationTimestamp;
import org.hibernate.annotations.UpdateTimestamp;
import quizlet.backend.enums.ExamType;
import quizlet.backend.enums.SkillType;

import java.time.LocalDateTime;
import java.util.HashSet;
import java.util.Set;

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

    // Quan hệ Many-to-Many với Exam (1 StudyTip có nhiều Exam, 1 Exam có thể thuộc nhiều StudyTip)
    @ManyToMany
    @JoinTable(
            name = "study_tip_exams",
            joinColumns = @JoinColumn(name = "study_tip_id"),
            inverseJoinColumns = @JoinColumn(name = "exam_id")
    )
    @ToString.Exclude
    @EqualsAndHashCode.Exclude
    private Set<Exam> exams = new java.util.HashSet<>();
}