package quizlet.backend.repository;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;
import quizlet.backend.model.Grammar;

import java.util.List;

@Repository
public interface GrammarRepository extends JpaRepository<Grammar, Long> {
    List<Grammar> findByGrammarSetId(Long grammarSetId);
}
