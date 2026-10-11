package quizlet.backend.repository;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;
import quizlet.backend.model.Vocabulary;

import java.util.List;

@Repository
public interface VocabularyRepository extends JpaRepository<Vocabulary, Long> {
    List<Vocabulary> findByStudySetSlug(String slug);
    List<Vocabulary> findByStudySetSlugAndIsDelFalse(String slug);
    List<Vocabulary> findByStudySetFolderUserIdAndIsDelTrue(Long userId);

    @Query("SELECT COUNT(v) FROM Vocabulary v WHERE v.studySet.user.id = :userId AND (v.isDel IS NULL OR v.isDel = false)")
    Long countByUserId(@Param("userId") Long userId);
}
