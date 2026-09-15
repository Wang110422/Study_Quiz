package quizlet.backend.repository;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;
import quizlet.backend.model.PhaseTask;

import java.util.List;

@Repository
public interface PhaseTaskRepository extends JpaRepository<PhaseTask, Long> {
    List<PhaseTask> findByRoadmapPhaseIdOrderByOrderIndexAsc(Long roadmapPhaseId);
    List<PhaseTask> findByRoadmapPhaseRoadmapIdOrderByRoadmapPhaseIdAscOrderIndexAsc(Long roadmapId);
}
