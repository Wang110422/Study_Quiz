package quizlet.backend.repository;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;
import quizlet.backend.model.SchoolClass;

import java.util.List;
import java.util.Optional;

@Repository
public interface SchoolClassRepository extends JpaRepository<SchoolClass, Long> {
    List<SchoolClass> findByTeacherIdAndIsDelFalse(Long teacherId);
    List<SchoolClass> findByStudents_IdAndIsDelFalse(Long studentId);
    Optional<SchoolClass> findByJoinCodeAndIsDelFalse(String joinCode);
}
