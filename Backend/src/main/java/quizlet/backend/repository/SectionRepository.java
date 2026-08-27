package quizlet.backend.repository;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;
import quizlet.backend.model.Section;

import java.util.List;

@Repository
public interface SectionRepository extends JpaRepository<Section, Integer> {
    List<Section> findByExamIdOrderByOrderIndexAsc(Long examId);
}
