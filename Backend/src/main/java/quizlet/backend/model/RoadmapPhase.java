package quizlet.backend.enums;

import jakarta.persistence.*;
import lombok.Data;

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

}
