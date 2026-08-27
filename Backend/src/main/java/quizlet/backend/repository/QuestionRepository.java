package quizlet.backend.repository;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;
import quizlet.backend.model.Question;

import java.util.List;

@Repository
public interface QuestionRepository extends JpaRepository<Question, Long> {
    List<Question> findByPassageGroupIdOrderByOrderIndexAsc(Long passageGroupId);
    List<Question> findBySectionIdOrderByOrderIndexAsc(Integer sectionId);
}
