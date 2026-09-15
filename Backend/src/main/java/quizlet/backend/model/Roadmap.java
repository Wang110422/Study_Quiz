package quizlet.backend.model;

import jakarta.persistence.*;
import lombok.Data;
import lombok.EqualsAndHashCode;
import lombok.ToString;

import java.util.List;

@Data
@Entity
@Table(name = "roadmap")
public class Roadmap {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    private String title;

    private Integer targetScore; // điểm mục tiêu đạt được

    private Integer totalEstimatedDays; // ngày hoàn thành mục tiêu

    @OneToMany(mappedBy = "roadmap",cascade = CascadeType.ALL , orphanRemoval = true)
    @ToString.Exclude
    @EqualsAndHashCode.Exclude
    private List<RoadmapPhase> roadmapPhases;

}
