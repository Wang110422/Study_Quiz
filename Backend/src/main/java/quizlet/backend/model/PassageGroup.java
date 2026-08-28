package quizlet.backend.model;


import jakarta.persistence.*;
import lombok.Data;
import lombok.EqualsAndHashCode;
import lombok.ToString;
import quizlet.backend.enums.ToeicPart;

import java.util.List;

@Data
@Entity
@Table(name = "passage_group")
public class PassageGroup {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(nullable = false)
    private String title;

    // Nếu bài đọc với nghe
    @Lob
    @Column(columnDefinition = "LONGTEXT")
    private String passageText;

    // Nếu bài đọc với nghe
    private String imageUrl;

    // Nếu là bài nghe
    private String audioUrl;

    private Integer orderIndex;

    @Enumerated(EnumType.STRING)
    private ToeicPart toeicPart;

    @ManyToOne
    @JoinColumn(name = "section_id")
    @ToString.Exclude
    @EqualsAndHashCode.Exclude
    private Section section;

    @OneToMany(mappedBy = "passageGroup" ,cascade = CascadeType.ALL , orphanRemoval = true)
    @ToString.Exclude
    @EqualsAndHashCode.Exclude
    private List<Question> questions;

}
