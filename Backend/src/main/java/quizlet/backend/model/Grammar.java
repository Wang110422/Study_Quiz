package quizlet.backend.model;

import jakarta.persistence.*;
import lombok.Data;

import java.time.LocalDateTime;

@Data
@Entity
@Table(name = "grammar")
public class Grammar {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(nullable = false)
    private String title;

    @Column(columnDefinition = "TEXT")
    private String description;

    @Column(columnDefinition = "TEXT")
    private String structure;

    @Column(columnDefinition = "TEXT")
    private String example;

    @Column(columnDefinition = "TEXT")
    private String explanation;

    private LocalDateTime createdAt;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "grammar_set_id")
    private GrammarSet grammarSet;
}
