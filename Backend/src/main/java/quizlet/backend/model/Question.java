package quizlet.backend.model;

import jakarta.persistence.*;
import lombok.Data;
import lombok.EqualsAndHashCode;
import lombok.ToString;

@Data
@Entity
@Table(name = "question")
public class Question {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Lob
    @Column(columnDefinition = "TEXT")
    private String content;

    @Column(columnDefinition = "JSON")
    private String answer;

    @Column(nullable = false)
    private String correctAnswer;

    @Lob
    @Column(columnDefinition = "TEXT")
    private String explanation;

    private Double score;

    private Integer orderIndex;

    @ManyToOne
    @JoinColumn(name = "section_id",nullable = false)
    @ToString.Exclude
    @EqualsAndHashCode.Exclude
    private Section section;

    @ManyToOne
    @JoinColumn(name = "passage_group_id")
    @ToString.Exclude
    @EqualsAndHashCode.Exclude
    private PassageGroup passageGroup;
}
