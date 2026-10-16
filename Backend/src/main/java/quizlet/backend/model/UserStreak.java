package quizlet.backend.model;

import com.fasterxml.jackson.annotation.JsonIgnore;
import jakarta.persistence.*;
import lombok.AllArgsConstructor;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

import java.time.LocalDate;
import java.time.LocalDateTime;

@Entity
@Table(name = "user_streaks")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
public class UserStreak {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @OneToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "user_id", nullable = false, unique = true)
    @JsonIgnore
    private User user;

    @Column(name = "current_streak", nullable = false)
    private Integer currentStreak = 0;

    @Column(name = "longest_streak", nullable = false)
    private Integer longestStreak = 0;

    @Column(name = "total_active_days", nullable = false)
    private Integer totalActiveDays = 0;

    @Column(name = "vocab_learned", nullable = false)
    private Integer vocabLearned = 0;

    @Column(name = "last_activity_date")
    private LocalDate lastActivityDate;

    @Column(name = "updated_at")
    private LocalDateTime updatedAt;

    /**
     * Factory method thay thế Builder pattern.
     * Tạo UserStreak mới với giá trị mặc định an toàn.
     */
    public static UserStreak createDefault(User user) {
        UserStreak streak = new UserStreak();
        streak.setUser(user);
        streak.setCurrentStreak(0);
        streak.setLongestStreak(0);
        streak.setTotalActiveDays(0);
        streak.setVocabLearned(0);
        return streak;
    }

    @PrePersist
    protected void onCreate() {
        if (this.currentStreak == null) this.currentStreak = 0;
        if (this.longestStreak == null) this.longestStreak = 0;
        if (this.totalActiveDays == null) this.totalActiveDays = 0;
        if (this.vocabLearned == null) this.vocabLearned = 0;
    }
}