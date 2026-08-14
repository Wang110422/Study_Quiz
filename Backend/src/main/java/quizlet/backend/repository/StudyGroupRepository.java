package quizlet.backend.repository;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;
import quizlet.backend.model.StudyGroup;

import java.util.List;
import java.util.Optional;

@Repository
public interface StudyGroupRepository extends JpaRepository<StudyGroup, Long> {
    List<StudyGroup> findByCreatorIdAndIsDelFalse(Long creatorId);
    List<StudyGroup> findByMembers_IdAndIsDelFalse(Long memberId);
    Optional<StudyGroup> findByJoinCodeAndIsDelFalse(String joinCode);
}
