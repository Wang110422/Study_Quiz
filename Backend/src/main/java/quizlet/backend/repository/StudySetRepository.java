package quizlet.backend.repository;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
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
    List<StudySet> findByFolderUserIdAndIsDelFalse(Long userId);
    List<StudySet> findByFolderUserIdAndIsDelTrue(Long userId);
    List<StudySet> findByFolderSlug(String folderSlug);
    List<StudySet> findByFolderName(String folderName);
    List<StudySet> findByFolderNameContainingIgnoreCase(String folderName);
    void deleteByFolderId(Long folderId);

    @Query("SELECT s FROM StudySet s WHERE (s.user.id = :userId OR (s.folder IS NOT NULL AND s.folder.user.id = :userId) OR s.folder IS NULL) AND (s.isDel IS NULL OR s.isDel = false) ORDER BY s.id DESC")
    List<StudySet> findAllByUserIdIncludingIndependent(@Param("userId") Long userId);
}
