package quizlet.backend.model;

import jakarta.persistence.*;
import lombok.Data;
import lombok.EqualsAndHashCode;
import lombok.ToString;
import quizlet.backend.enums.SkillType;

import java.util.List;

@Data
@Entity
@Table(name = "section")
public class Section {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Integer id;

    @Enumerated(EnumType.STRING)
    @Column(nullable = false)
    private SkillType skill;

    @Column(nullable = false)
    private String title;

    private Integer orderIndex;


    @ManyToOne
    @JoinColumn(name = "exam_id")
    @ToString.Exclude
    @EqualsAndHashCode.Exclude
    private Exam exam;

    @OneToMany(mappedBy = "section", cascade = CascadeType.ALL, orphanRemoval = true)
    @ToString.Exclude
    @EqualsAndHashCode.Exclude
    private List<PassageGroup> passageGroups;
}
