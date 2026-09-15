package quizlet.backend.repository;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;
import quizlet.backend.model.RoadmapPhase;

import java.util.List;

@Repository
public interface RoadmapPhaseRepository extends JpaRepository<RoadmapPhase, Long> {
    List<RoadmapPhase> findByRoadmapIdOrderByIdAsc(Long roadmapId);
}
