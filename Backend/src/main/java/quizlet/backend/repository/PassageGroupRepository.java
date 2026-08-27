package quizlet.backend.repository;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;
import quizlet.backend.enums.ToeicPart;
import quizlet.backend.model.PassageGroup;

import java.util.List;

@Repository
public interface PassageGroupRepository extends JpaRepository<PassageGroup, Long> {
    List<PassageGroup> findBySectionIdOrderByOrderIndexAsc(Integer sectionId);
    List<PassageGroup> findByToeicPart(ToeicPart toeicPart);
}
