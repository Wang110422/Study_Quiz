package quizlet.backend.services;

import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import quizlet.backend.dto.LeaderboardItemDTO;
import quizlet.backend.dto.LeaderboardResponseDTO;
import quizlet.backend.dto.UserStreakDTO;
import quizlet.backend.model.ExamAttempt;
import quizlet.backend.model.SchoolClass;
import quizlet.backend.model.StudyGroup;
import quizlet.backend.model.User;
import quizlet.backend.model.UserStreak;
import quizlet.backend.repository.*;

import java.time.format.DateTimeFormatter;
import java.util.*;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
@Slf4j
public class LeaderboardService {

    private final UserRepository userRepository;
    private final UserStreakRepository userStreakRepository;
    private final ExamAttemptRepository examAttemptRepository;
    private final VocabularyRepository vocabularyRepository;
    private final StudySetRepository studySetRepository;
    private final UserStreakService userStreakService;
    private final SchoolClassRepository schoolClassRepository;
    private final StudyGroupRepository studyGroupRepository;

    private static final DateTimeFormatter DATE_FORMATTER = DateTimeFormatter.ofPattern("dd/MM/yyyy");

    /**
     * Lấy Bảng xếp hạng theo bộ lọc:
     * @param filter: "vocab" (Từ vựng), "exam" (Luyện đề), "streak" (Chuỗi ngày học)
     * @param subFilter: Đối với "exam" gồm "submitted" (Số lượng đề đã nộp), "latest_score" (Điểm bài thi gần nhất), "avg_score" (Trung bình điểm các bài thi)
     * @param currentUserId: ID của người dùng đang đăng nhập để highlight và lấy rank cá nhân
     * @param limit: Giới hạn số lượng hiển thị (mặc định 50)
     */
    @Transactional(readOnly = true)
    public LeaderboardResponseDTO getLeaderboard(String filter, String subFilter, Long currentUserId, Integer limit) {
        String mainFilter = (filter != null && !filter.isBlank()) ? filter.toLowerCase() : "vocab";
        String secondaryFilter = (subFilter != null && !subFilter.isBlank()) ? subFilter.toLowerCase() : "submitted";
        int maxResults = (limit != null && limit > 0) ? limit : 50;

        List<LeaderboardItemDTO> items = new ArrayList<>();

        // 1. Lấy toàn bộ users thực tế trong Database
        List<User> users = userRepository.findAll();
        Map<Long, UserStreak> streakMap = userStreakRepository.findAll().stream()
                .filter(s -> s.getUser() != null && s.getUser().getId() != null)
                .collect(Collectors.toMap(s -> s.getUser().getId(), s -> s, (s1, s2) -> s1));

        for (User user : users) {
            items.add(buildLeaderboardItemForUser(user, streakMap.get(user.getId()), currentUserId));
        }

        // 2. Sắp xếp danh sách theo Filter tương ứng 100% từ dữ liệu thực Database
        sortLeaderboardItems(items, mainFilter, secondaryFilter);

        // 4. Đánh số thứ hạng (Rank) và gán cờ isCurrentUser
        LeaderboardItemDTO currentUserRanking = null;
        for (int i = 0; i < items.size(); i++) {
            LeaderboardItemDTO item = items.get(i);
            item.setRank(i + 1);
            if (currentUserId != null && currentUserId.equals(item.getUserId())) {
                item.setIsCurrentUser(true);
                currentUserRanking = item;
            }
        }

        // 5. Cắt danh sách theo limit
        List<LeaderboardItemDTO> rankedList = items.stream().limit(maxResults).collect(Collectors.toList());

        // 6. Lấy Streak Summary của user hiện tại
        UserStreakDTO streakSummary = userStreakService.getStreakByUserId(currentUserId);

        return LeaderboardResponseDTO.builder()
                .filter(mainFilter)
                .subFilter(secondaryFilter)
                .totalParticipants(items.size())
                .rankings(rankedList)
                .currentUserRanking(currentUserRanking)
                .streakSummary(streakSummary)
                .build();
    }

    /**
     * Xây dựng LeaderboardItemDTO từ dữ liệu thực của 1 User
     */
    private LeaderboardItemDTO buildLeaderboardItemForUser(User user, UserStreak streak, Long currentUserId) {
        Long userId = user.getId();

        // Tên hiển thị và Avatar
        String fullName = ((user.getFirstName() != null ? user.getFirstName() : "") + " " +
                (user.getLastName() != null ? user.getLastName() : "")).trim();
        if (fullName.isEmpty()) {
            fullName = user.getEmail() != null ? user.getEmail().split("@")[0] : "Thí sinh";
        }
        String initial = !fullName.isEmpty() ? fullName.substring(0, 1).toUpperCase() : "U";

        // Thống kê Từ vựng & Bộ từ
        Long rawVocabCount = vocabularyRepository.countByUserId(userId);
        int vocabCount = rawVocabCount != null ? rawVocabCount.intValue() : 0;
        int vocabLearnedFromStreak = (streak != null && streak.getVocabLearned() != null) ? streak.getVocabLearned() : 0;
        int vocabLearned = Math.max(vocabCount, vocabLearnedFromStreak);

        Long rawSetsCount = studySetRepository.countByUserId(userId);
        int studySetsCount = rawSetsCount != null ? rawSetsCount.intValue() : 0;

        // Thống kê Luyện đề (Exam Attempts)
        Long rawExamsCount = examAttemptRepository.countSubmittedByUserId(userId);
        int examsSubmitted = rawExamsCount != null ? rawExamsCount.intValue() : 0;

        Double rawAvgScore = examAttemptRepository.getAverageScoreByUserId(userId);
        double avgExamScore = rawAvgScore != null ? Math.round(rawAvgScore * 10.0) / 10.0 : 0.0;

        List<ExamAttempt> recentAttempts = examAttemptRepository.findByUserIdAndEndTimeIsNotNullOrderByStartTimeDesc(userId);
        double latestExamScore = 0.0;
        String lastExamDate = null;
        if (!recentAttempts.isEmpty()) {
            ExamAttempt latest = recentAttempts.get(0);
            latestExamScore = latest.getTotalScore() != null ? latest.getTotalScore() : 0.0;
            if (latest.getStartTime() != null) {
                lastExamDate = latest.getStartTime().format(DATE_FORMATTER);
            }
        }

        // Thống kê Streak
        int streakDays = streak != null && streak.getCurrentStreak() != null ? streak.getCurrentStreak() : 0;
        int totalActiveDays = streak != null && streak.getTotalActiveDays() != null ? streak.getTotalActiveDays() : (streakDays > 0 ? streakDays : 0);
        String lastActiveDate = (streak != null && streak.getLastActivityDate() != null)
                ? streak.getLastActivityDate().format(DATE_FORMATTER)
                : null;

        boolean isCurrent = currentUserId != null && currentUserId.equals(userId);
        int expPoints = (vocabLearned * 10) + (examsSubmitted * 50) + (streakDays * 20) + (int) (avgExamScore * 2);

        return LeaderboardItemDTO.builder()
                .userId(userId)
                .name(fullName)
                .email(user.getEmail())
                .avatarUrl(user.getAvatarUrl())
                .avatarInitial(initial)
                .isCurrentUser(isCurrent)
                .vocabLearned(vocabLearned)
                .studySetsCount(studySetsCount)
                .examsSubmitted(examsSubmitted)
                .latestExamScore(latestExamScore)
                .avgExamScore(avgExamScore)
                .lastExamDate(lastExamDate)
                .streakDays(streakDays)
                .totalActiveDays(totalActiveDays)
                .lastActiveDate(lastActiveDate)
                .expPoints(expPoints)
                .build();
    }

    /**
     * Sắp xếp danh sách bảng xếp hạng tương ứng với từng filter
     */
    private void sortLeaderboardItems(List<LeaderboardItemDTO> items, String mainFilter, String subFilter) {
        switch (mainFilter) {
            case "vocab":
            case "vocabulary":
                // Sắp xếp theo số từ vựng học thuộc giảm dần
                items.sort(Comparator
                        .comparing((LeaderboardItemDTO i) -> i.getVocabLearned() != null ? i.getVocabLearned() : 0, Comparator.reverseOrder())
                        .thenComparing(i -> i.getStudySetsCount() != null ? i.getStudySetsCount() : 0, Comparator.reverseOrder())
                        .thenComparing(i -> i.getStreakDays() != null ? i.getStreakDays() : 0, Comparator.reverseOrder())
                );
                break;

            case "exam":
                if ("latest_score".equalsIgnoreCase(subFilter)) {
                    // Sắp xếp theo Điểm bài thi gần nhất giảm dần
                    items.sort(Comparator
                            .comparing((LeaderboardItemDTO i) -> i.getLatestExamScore() != null ? i.getLatestExamScore() : 0.0, Comparator.reverseOrder())
                            .thenComparing(i -> i.getExamsSubmitted() != null ? i.getExamsSubmitted() : 0, Comparator.reverseOrder())
                    );
                } else if ("avg_score".equalsIgnoreCase(subFilter)) {
                    // Sắp xếp theo Trung bình điểm các bài thi giảm dần
                    items.sort(Comparator
                            .comparing((LeaderboardItemDTO i) -> i.getAvgExamScore() != null ? i.getAvgExamScore() : 0.0, Comparator.reverseOrder())
                            .thenComparing(i -> i.getExamsSubmitted() != null ? i.getExamsSubmitted() : 0, Comparator.reverseOrder())
                    );
                } else {
                    // Mặc định "submitted": Sắp xếp theo Số lượng đề đã nộp giảm dần
                    items.sort(Comparator
                            .comparing((LeaderboardItemDTO i) -> i.getExamsSubmitted() != null ? i.getExamsSubmitted() : 0, Comparator.reverseOrder())
                            .thenComparing(i -> i.getAvgExamScore() != null ? i.getAvgExamScore() : 0.0, Comparator.reverseOrder())
                    );
                }
                break;

            case "streak":
                // Sắp xếp theo số lượng streak giảm dần (số ngày online liên tiếp vào học)
                items.sort(Comparator
                        .comparing((LeaderboardItemDTO i) -> i.getStreakDays() != null ? i.getStreakDays() : 0, Comparator.reverseOrder())
                        .thenComparing(i -> i.getTotalActiveDays() != null ? i.getTotalActiveDays() : 0, Comparator.reverseOrder())
                        .thenComparing(i -> i.getExamsSubmitted() != null ? i.getExamsSubmitted() : 0, Comparator.reverseOrder())
                );
                break;

            case "exp":
            case "points":
                items.sort(Comparator
                        .comparing((LeaderboardItemDTO i) -> i.getExpPoints() != null ? i.getExpPoints() : 0, Comparator.reverseOrder())
                        .thenComparing(i -> i.getStreakDays() != null ? i.getStreakDays() : 0, Comparator.reverseOrder())
                        .thenComparing(i -> i.getVocabLearned() != null ? i.getVocabLearned() : 0, Comparator.reverseOrder())
                );
                break;

            default:
                items.sort(Comparator.comparing((LeaderboardItemDTO i) -> i.getVocabLearned() != null ? i.getVocabLearned() : 0, Comparator.reverseOrder()));
        }
    }

    /**
     * Lấy Top 3 học viên cao nhất (Vàng, Bạc, Đồng)
     */
    @Transactional(readOnly = true)
    public List<LeaderboardItemDTO> getTopPodium(String filter, String subFilter, Long currentUserId) {
        LeaderboardResponseDTO board = getLeaderboard(filter, subFilter, currentUserId, 3);
        return board != null && board.getRankings() != null ? board.getRankings() : Collections.emptyList();
    }

    /**
     * Lấy thứ hạng của tôi kèm các thí sinh xếp lân cận
     */
    @Transactional(readOnly = true)
    public Map<String, Object> getMyRankAndNeighbors(String filter, String subFilter, Long currentUserId) {
        LeaderboardResponseDTO board = getLeaderboard(filter, subFilter, currentUserId, 500);
        List<LeaderboardItemDTO> all = board != null ? board.getRankings() : Collections.emptyList();
        LeaderboardItemDTO myItem = board != null ? board.getCurrentUserRanking() : null;

        List<LeaderboardItemDTO> neighbors = new ArrayList<>();
        if (myItem != null && all != null) {
            int myIndex = -1;
            for (int i = 0; i < all.size(); i++) {
                if (all.get(i).getUserId() != null && all.get(i).getUserId().equals(currentUserId)) {
                    myIndex = i;
                    break;
                }
            }

            if (myIndex >= 0) {
                int start = Math.max(0, myIndex - 2);
                int end = Math.min(all.size(), myIndex + 3);
                neighbors = new ArrayList<>(all.subList(start, end));
            }
        }

        Map<String, Object> result = new HashMap<>();
        result.put("myRank", myItem);
        result.put("neighbors", neighbors);
        result.put("totalParticipants", board != null ? board.getTotalParticipants() : 0);
        return result;
    }

    /**
     * Bảng xếp hạng theo Lớp học
     */
    @Transactional(readOnly = true)
    public LeaderboardResponseDTO getClassLeaderboard(Long classId, String filter, String subFilter, Long currentUserId) {
        SchoolClass schoolClass = schoolClassRepository.findById(classId).orElse(null);
        if (schoolClass == null) {
            return LeaderboardResponseDTO.builder()
                    .filter(filter)
                    .subFilter(subFilter)
                    .totalParticipants(0)
                    .rankings(Collections.emptyList())
                    .build();
        }

        List<User> students = new ArrayList<>(schoolClass.getStudents());
        return buildCustomGroupLeaderboard(students, filter, subFilter, currentUserId);
    }

    /**
     * Bảng xếp hạng theo Nhóm học
     */
    @Transactional(readOnly = true)
    public LeaderboardResponseDTO getGroupLeaderboard(Long groupId, String filter, String subFilter, Long currentUserId) {
        StudyGroup group = studyGroupRepository.findById(groupId).orElse(null);
        if (group == null) {
            return LeaderboardResponseDTO.builder()
                    .filter(filter)
                    .subFilter(subFilter)
                    .totalParticipants(0)
                    .rankings(Collections.emptyList())
                    .build();
        }

        List<User> members = new ArrayList<>(group.getMembers());
        return buildCustomGroupLeaderboard(members, filter, subFilter, currentUserId);
    }

    private LeaderboardResponseDTO buildCustomGroupLeaderboard(List<User> users, String filter, String subFilter, Long currentUserId) {
        String mainFilter = (filter != null && !filter.isBlank()) ? filter.toLowerCase() : "vocab";
        String secondaryFilter = (subFilter != null && !subFilter.isBlank()) ? subFilter.toLowerCase() : "submitted";

        List<Long> userIds = users.stream().map(User::getId).collect(Collectors.toList());
        Map<Long, UserStreak> streakMap = userStreakRepository.findByUserIdIn(userIds).stream()
                .filter(s -> s.getUser() != null && s.getUser().getId() != null)
                .collect(Collectors.toMap(s -> s.getUser().getId(), s -> s, (s1, s2) -> s1));

        List<LeaderboardItemDTO> items = new ArrayList<>();
        for (User user : users) {
            items.add(buildLeaderboardItemForUser(user, streakMap.get(user.getId()), currentUserId));
        }

        sortLeaderboardItems(items, mainFilter, secondaryFilter);

        LeaderboardItemDTO currentUserRanking = null;
        for (int i = 0; i < items.size(); i++) {
            LeaderboardItemDTO item = items.get(i);
            item.setRank(i + 1);
            if (currentUserId != null && currentUserId.equals(item.getUserId())) {
                item.setIsCurrentUser(true);
                currentUserRanking = item;
            }
        }

        return LeaderboardResponseDTO.builder()
                .filter(mainFilter)
                .subFilter(secondaryFilter)
                .totalParticipants(items.size())
                .rankings(items)
                .currentUserRanking(currentUserRanking)
                .streakSummary(userStreakService.getStreakByUserId(currentUserId))
                .build();
    }
}
