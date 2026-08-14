package quizlet.backend.repository;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;
import quizlet.backend.model.Folder;

import java.util.List;
import java.util.Optional;

@Repository
public interface FolderRepository extends JpaRepository<Folder, Long> {
    List<Folder> findByUserId(Long userId);
    List<Folder> findByUserIdAndIsDelFalse(Long userId);
    List<Folder> findByUserIdAndIsDelTrue(Long userId);
    Optional<Folder> findBySlug(String slug);
    Boolean existsBySlug(String slug);
    Boolean existsByName(String name);
}
