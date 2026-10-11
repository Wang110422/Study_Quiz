package quizlet.backend.repository;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;
import quizlet.backend.model.UserStreak;

import java.util.List;
import java.util.Optional;

@Repository
public interface UserStreakRepository extends JpaRepository<UserStreak, Long> {
    Optional<UserStreak> findByUserId(Long userId);

    boolean existsByUserId(Long userId);

    List<UserStreak> findAllByOrderByCurrentStreakDesc();

    List<UserStreak> findAllByOrderByTotalActiveDaysDesc();

    List<UserStreak> findAllByOrderByVocabLearnedDesc();

    List<UserStreak> findByUserIdIn(List<Long> userIds);
}
