package quizlet.backend.repository;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;
import quizlet.backend.model.StudySet;

import java.util.List;

@Repository
public interface StudySetRepository extends JpaRepository<StudySet,Long> {
    Boolean existsBySlug(String slug);
    StudySet findBySlug(String slug);
}
