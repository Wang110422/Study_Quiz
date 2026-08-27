package quizlet.backend.model;

import jakarta.persistence.*;
import lombok.Data;
import lombok.EqualsAndHashCode;
import lombok.ToString;
import quizlet.backend.enums.Mode;

import java.time.LocalDateTime;

@Data
@Entity
@Table(name = "exam_attempt")
public class ExamAttempt {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Enumerated(EnumType.STRING)
    @Column(name = "mode", length = 50, nullable = false)
    private Mode mode;

    @Column(name = "total_score")
    private Double totalScore;

    @Column(name = "total_time")
    private Integer totalTime;

    @Column(columnDefinition = "JSON")
    private String answerDetail;

    @Column(name = "start_time")
    private LocalDateTime startTime;

    @Column(name = "end_time")
    private LocalDateTime endTime;

    @ManyToOne
    @JoinColumn(name = "user_id")
    @ToString.Exclude
    @EqualsAndHashCode.Exclude
    private User user;

    @ManyToOne
    @JoinColumn(name = "exam_id")
    @ToString.Exclude
    @EqualsAndHashCode.Exclude
    private Exam exam;
}