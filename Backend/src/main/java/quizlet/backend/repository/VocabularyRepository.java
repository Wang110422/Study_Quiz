package quizlet.backend.repository;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.web.bind.annotation.RequestMapping;
import quizlet.backend.model.Vocabulary;

import java.util.List;

@RequestMapping
public interface VocabularyRepository extends JpaRepository<Vocabulary,Long> {
    List<Vocabulary> findByStudySetSlug(String slug);
}
