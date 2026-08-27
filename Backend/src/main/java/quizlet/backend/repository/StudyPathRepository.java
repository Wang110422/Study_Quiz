package quizlet.backend.repository;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;
import quizlet.backend.model.StudyPath;

import java.util.List;

@Repository
public interface StudyPathRepository extends JpaRepository<StudyPath, Long> {
    List<StudyPath> findByUserIdOrderByCreatedAtDesc(Long userId);
}
