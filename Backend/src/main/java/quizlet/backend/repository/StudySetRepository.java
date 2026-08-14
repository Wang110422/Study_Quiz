package quizlet.backend.repository;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;
import quizlet.backend.model.StudySet;

import java.util.List;
import java.util.Optional;

@Repository
public interface StudySetRepository extends JpaRepository<StudySet, Long> {
    Boolean existsBySlug(String slug);
    Optional<StudySet> findBySlug(String slug);
    List<StudySet> findByFolderId(Long folderId);
    List<StudySet> findByFolderIdAndIsDelFalse(Long folderId);
    List<StudySet> findByFolderUserIdAndIsDelTrue(Long userId);
    List<StudySet> findByFolderSlug(String folderSlug);
    List<StudySet> findByFolderName(String folderName);
    List<StudySet> findByFolderNameContainingIgnoreCase(String folderName);
    void deleteByFolderId(Long folderId);
}
