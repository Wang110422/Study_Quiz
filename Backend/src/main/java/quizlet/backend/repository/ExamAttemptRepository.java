package quizlet.backend.repository;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;
import quizlet.backend.model.ExamAttempt;

import java.util.List;

@Repository
public interface ExamAttemptRepository extends JpaRepository<ExamAttempt, Long> {
    List<ExamAttempt> findByUserIdOrderByStartTimeDesc(Long userId);
    List<ExamAttempt> findAllByOrderByStartTimeDesc();
    List<ExamAttempt> findByExamIdAndUserId(Long examId, Long userId);
}
