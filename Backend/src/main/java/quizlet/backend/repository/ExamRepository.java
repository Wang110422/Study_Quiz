package quizlet.backend.repository;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;
import quizlet.backend.enums.ExamFormat;
import quizlet.backend.enums.ExamType;
import quizlet.backend.model.Exam;

import java.util.List;

@Repository
public interface ExamRepository extends JpaRepository<Exam, Long> {
    List<Exam> findByFormat(ExamFormat format);
    List<Exam> findByType(ExamType type);
    List<Exam> findByFormatAndType(ExamFormat format, ExamType type);
}
