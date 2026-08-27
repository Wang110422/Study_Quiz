package quizlet.backend.repository;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;
import quizlet.backend.model.StudyPathItem;

import java.util.List;

@Repository
public interface StudyPathItemRepository extends JpaRepository<StudyPathItem, Long> {
    List<StudyPathItem> findByStudyPathIdOrderByStepOrderAsc(Long studyPathId);
}
