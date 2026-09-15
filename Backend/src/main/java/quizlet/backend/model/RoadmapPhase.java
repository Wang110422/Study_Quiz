package quizlet.backend.model;

import jakarta.persistence.*;
import lombok.Data;
import lombok.EqualsAndHashCode;
import lombok.ToString;

import java.util.List;

@Data
@Entity
@Table(name = "roadmap_phase")
public class RoadmapPhase {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    private String title;

    private Double minAvgScoreToPass; // điểm toi thiểu để pass trong phần cuối

    private Double minAccuracyRace ; // tỉ lệ làm đúng bài

    @ManyToOne
    @JoinColumn(name = "roadmap_id")
    @ToString.Exclude
    @EqualsAndHashCode.Exclude
    private Roadmap roadmap;


    @OneToMany(mappedBy = "roadmapPhase", cascade = CascadeType.ALL, orphanRemoval = true)
    @ToString.Exclude
    @EqualsAndHashCode.Exclude
    private List<PhaseTask> phaseTasks;

}
