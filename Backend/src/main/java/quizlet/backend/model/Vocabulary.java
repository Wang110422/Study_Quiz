package quizlet.backend.model;

import com.fasterxml.jackson.annotation.JsonIgnore;
import jakarta.persistence.*;
import lombok.Data;
import lombok.EqualsAndHashCode;
import lombok.ToString;
import quizlet.backend.enums.Level;
import quizlet.backend.enums.Pos;

import java.time.LocalDateTime;

@Entity
@Data
@Table(name = "vocabulary")
public class Vocabulary {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(nullable = false)
    private String term;

    @Column(nullable = false)
    private String definition;

    @Column(name = "base_form")
    private String baseForm;

    private String ipa;

    @Column(name = "audio_url")
    private String audioUrl;

    @Enumerated(EnumType.STRING)
    @Column(name = "pos")
    private Pos pos;

    @Enumerated(EnumType.STRING)
    @Column(name = "level")
    private Level level;

    @Column(columnDefinition = "TEXT")
    private String meaning;

    @Column(columnDefinition = "TEXT")
    private String hint;

    @Column(name = "create_at")
    private LocalDateTime createAt = LocalDateTime.now();

    @Column(name = "is_del")
    private Boolean isDel = false;

    @ManyToOne
    @JoinColumn(name = "studyset_id")
    @JsonIgnore
    @ToString.Exclude
    @EqualsAndHashCode.Exclude
    private StudySet studySet;


}

