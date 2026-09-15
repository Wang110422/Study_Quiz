package quizlet.backend.repository;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;
import quizlet.backend.enums.ExamType;
import quizlet.backend.enums.SkillType;
import quizlet.backend.model.StudyTip;

import java.util.List;

@Repository
public interface StudyTipRepository extends JpaRepository<StudyTip, Long> {
    List<StudyTip> findByIsActiveTrueOrderByOrderIndexAsc();
    List<StudyTip> findBySkillAndIsActiveTrueOrderByOrderIndexAsc(SkillType skill);
    List<StudyTip> findByExamTypeAndIsActiveTrueOrderByOrderIndexAsc(ExamType examType);
    List<StudyTip> findByExamTypeAndSkillAndIsActiveTrueOrderByOrderIndexAsc(ExamType examType, SkillType skill);
}
