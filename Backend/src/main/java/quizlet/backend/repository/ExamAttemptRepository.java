package quizlet.backend.repository;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;
import quizlet.backend.model.ExamAttempt;

import java.util.List;

@Repository
public interface ExamAttemptRepository extends JpaRepository<ExamAttempt, Long> {
    List<ExamAttempt> findByUserIdOrderByStartTimeDesc(Long userId);
    List<ExamAttempt> findAllByOrderByStartTimeDesc();
    List<ExamAttempt> findByExamIdAndUserId(Long examId, Long userId);

    List<ExamAttempt> findByUserIdAndEndTimeIsNotNullOrderByStartTimeDesc(Long userId);
    List<ExamAttempt> findByEndTimeIsNotNullOrderByStartTimeDesc();

    @Query("SELECT COUNT(ea) FROM ExamAttempt ea WHERE ea.user.id = :userId AND ea.endTime IS NOT NULL")
    Long countSubmittedByUserId(@Param("userId") Long userId);

    @Query("SELECT AVG(ea.totalScore) FROM ExamAttempt ea WHERE ea.user.id = :userId AND ea.endTime IS NOT NULL")
    Double getAverageScoreByUserId(@Param("userId") Long userId);
}
