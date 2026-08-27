package quizlet.backend.repository;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;
import quizlet.backend.model.GrammarSet;

import java.util.List;
import java.util.Optional;

@Repository
public interface GrammarSetRepository extends JpaRepository<GrammarSet, Long> {
    List<GrammarSet> findAllByIsDelFalse();
    Optional<GrammarSet> findBySlugAndIsDelFalse(String slug);
    List<GrammarSet> findByUserIdAndIsDelFalse(Long userId);
    List<GrammarSet> findByFolderIdAndIsDelFalse(Long folderId);
}
