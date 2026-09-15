package quizlet.backend.repository;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;
import quizlet.backend.model.UserTaskProgress;

import java.util.List;
import java.util.Optional;

@Repository
public interface UserTaskProgressRepository extends JpaRepository<UserTaskProgress, Long> {
    Optional<UserTaskProgress> findByUserIdAndPhaseTaskId(Long userId, Long phaseTaskId);
    List<UserTaskProgress> findByUserId(Long userId);
    List<UserTaskProgress> findByUserIdAndPhaseTaskRoadmapPhaseRoadmapId(Long userId, Long roadmapId);
    List<UserTaskProgress> findByUserIdAndPhaseTaskRoadmapPhaseId(Long userId, Long phaseId);
    long countByUserIdAndPhaseTaskRoadmapPhaseRoadmapIdAndIsCompletedTrue(Long userId, Long roadmapId);
    long countByUserIdAndPhaseTaskRoadmapPhaseIdAndIsCompletedTrue(Long userId, Long phaseId);
}
