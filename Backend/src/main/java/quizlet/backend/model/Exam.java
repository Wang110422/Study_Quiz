package quizlet.backend.model;

import com.fasterxml.jackson.annotation.JsonIgnore;
import jakarta.persistence.*;
import lombok.Data;
import lombok.EqualsAndHashCode;
import lombok.ToString;
import quizlet.backend.enums.ExamFormat;
import quizlet.backend.enums.ExamType;

import java.time.LocalDateTime;
import java.util.HashSet;
import java.util.List;
import java.util.Set;

@Data
@Entity
@Table(name = "exam")
public class Exam {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(nullable = false)
    private String title;

    @Column(name = "total_minutes", nullable = false)
    private Integer totalMinutes;

    @Column(name = "total_score", nullable = false)
    private Integer totalScore;

    @Column(name = "created_at", nullable = false)
    private LocalDateTime createdAt = LocalDateTime.now();

    @Enumerated(EnumType.STRING)
    @Column(name = "type", length = 50, columnDefinition = "VARCHAR(50)")
    private ExamType type;

    @Enumerated(EnumType.STRING)
    @Column(name = "format", length = 50, columnDefinition = "VARCHAR(50)")
    private ExamFormat format;

    @OneToMany(mappedBy = "exam", cascade = CascadeType.ALL, orphanRemoval = true)
    @ToString.Exclude
    @EqualsAndHashCode.Exclude
    private List<Section> sections;

    @ManyToOne
    @JoinColumn(name = "user_id")
    @ToString.Exclude
    @EqualsAndHashCode.Exclude
    private User user;

    @ManyToMany(mappedBy = "exams")
    @ToString.Exclude
    @EqualsAndHashCode.Exclude
    @JsonIgnore
    private Set<StudyTip> studyTips = new HashSet<>();
}
