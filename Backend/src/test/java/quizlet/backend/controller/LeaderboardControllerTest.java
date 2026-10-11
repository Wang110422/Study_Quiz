package quizlet.backend.controller;

import com.fasterxml.jackson.databind.ObjectMapper;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;
import org.springframework.http.MediaType;
import org.springframework.test.web.servlet.MockMvc;
import org.springframework.test.web.servlet.setup.MockMvcBuilders;
import quizlet.backend.dto.LeaderboardItemDTO;
import quizlet.backend.dto.LeaderboardResponseDTO;
import quizlet.backend.dto.UserStreakDTO;
import quizlet.backend.model.User;
import quizlet.backend.services.LeaderboardService;
import quizlet.backend.services.UserStreakService;

import java.util.List;
import java.util.Map;

import static org.mockito.ArgumentMatchers.*;
import static org.mockito.Mockito.*;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.*;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.*;

@ExtendWith(MockitoExtension.class)
public class LeaderboardControllerTest {

    private MockMvc mockMvc;

    @Mock
    private LeaderboardService leaderboardService;

    @Mock
    private UserStreakService userStreakService;

    @InjectMocks
    private LeaderboardController leaderboardController;

    private ObjectMapper objectMapper = new ObjectMapper();

    @BeforeEach
    void setUp() {
        mockMvc = MockMvcBuilders.standaloneSetup(leaderboardController)
                .setCustomArgumentResolvers(new org.springframework.security.web.method.annotation.AuthenticationPrincipalArgumentResolver())
                .build();
    }

    @Test
    @DisplayName("TC-LEAD-001: Lấy BXH từ vựng thành công")
    void testGetLeaderboard_VocabFilter() throws Exception {
        LeaderboardResponseDTO res = LeaderboardResponseDTO.builder()
                .filter("vocab")
                .subFilter("submitted")
                .totalParticipants(1)
                .rankings(List.of(
                        LeaderboardItemDTO.builder()
                                .userId(1L)
                                .name("Nguyễn Văn A")
                                .vocabLearned(500)
                                .rank(1)
                                .build()
                ))
                .build();

        when(leaderboardService.getLeaderboard(eq("vocab"), eq("submitted"), any(), anyInt()))
                .thenReturn(res);

        mockMvc.perform(get("/api/leaderboard?filter=vocab"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.status").value(200))
                .andExpect(jsonPath("$.message").value("Tải bảng xếp hạng thành công"))
                .andExpect(jsonPath("$.result.filter").value("vocab"))
                .andExpect(jsonPath("$.result.rankings[0].name").value("Nguyễn Văn A"))
                .andExpect(jsonPath("$.result.rankings[0].vocabLearned").value(500));
    }

    @Test
    @DisplayName("TC-LEAD-002: Lấy BXH đề thi theo điểm gần nhất")
    void testGetLeaderboard_ExamFilter() throws Exception {
        LeaderboardResponseDTO res = LeaderboardResponseDTO.builder()
                .filter("exam")
                .subFilter("latest_score")
                .totalParticipants(1)
                .rankings(List.of(
                        LeaderboardItemDTO.builder()
                                .userId(2L)
                                .name("Trần Thị B")
                                .latestExamScore(290.0)
                                .rank(1)
                                .build()
                ))
                .build();

        when(leaderboardService.getLeaderboard(eq("exam"), eq("latest_score"), any(), anyInt()))
                .thenReturn(res);

        mockMvc.perform(get("/api/leaderboard?filter=exam&subFilter=latest_score"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.status").value(200))
                .andExpect(jsonPath("$.result.rankings[0].latestExamScore").value(290.0));
    }

    @Test
    @DisplayName("TC-LEAD-005: Xem Streak cá nhân khi chưa đăng nhập (user null)")
    void testGetMyStreak_Unauthenticated() throws Exception {
        mockMvc.perform(get("/api/leaderboard/streak/me"))
                .andExpect(status().isUnauthorized())
                .andExpect(jsonPath("$.status").value(401))
                .andExpect(jsonPath("$.message").value("Vui lòng đăng nhập"));
    }

    @Test
    @DisplayName("TC-LEAD-007: Cập nhật tiến độ từ vựng khi chưa đăng nhập")
    void testUpdateVocabProgress_Unauthenticated() throws Exception {
        mockMvc.perform(post("/api/leaderboard/vocab-progress")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(Map.of("count", 5))))
                .andExpect(status().isUnauthorized())
                .andExpect(jsonPath("$.status").value(401));
    }

    @Test
    @DisplayName("TC-LEAD-008: Lấy Top 3 Podium thành công")
    void testGetTopPodium() throws Exception {
        List<LeaderboardItemDTO> podium = List.of(
                LeaderboardItemDTO.builder().userId(1L).name("Quán Quân").rank(1).expPoints(1500).build(),
                LeaderboardItemDTO.builder().userId(2L).name("Á Quân").rank(2).expPoints(1200).build(),
                LeaderboardItemDTO.builder().userId(3L).name("Quý Quân").rank(3).expPoints(1000).build()
        );

        when(leaderboardService.getTopPodium(eq("vocab"), eq("submitted"), any())).thenReturn(podium);

        mockMvc.perform(get("/api/leaderboard/podium?filter=vocab"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.status").value(200))
                .andExpect(jsonPath("$.message").value("Lấy top 3 vinh danh thành công"))
                .andExpect(jsonPath("$.result").isArray())
                .andExpect(jsonPath("$.result[0].name").value("Quán Quân"))
                .andExpect(jsonPath("$.result[0].rank").value(1));
    }

    @Test
    @DisplayName("TC-LEAD-009: Lấy thứ hạng cá nhân khi chưa đăng nhập trả về 401")
    void testGetMyRank_Unauthenticated() throws Exception {
        mockMvc.perform(get("/api/leaderboard/my-rank"))
                .andExpect(status().isUnauthorized())
                .andExpect(jsonPath("$.status").value(401))
                .andExpect(jsonPath("$.message").value("Vui lòng đăng nhập"));
    }

    @Test
    @DisplayName("TC-LEAD-010: Lấy bảng xếp hạng theo Lớp học thành công")
    void testGetClassLeaderboard() throws Exception {
        LeaderboardResponseDTO classBoard = LeaderboardResponseDTO.builder()
                .filter("vocab")
                .subFilter("submitted")
                .totalParticipants(2)
                .rankings(List.of(
                        LeaderboardItemDTO.builder().userId(10L).name("Học sinh 1").rank(1).build(),
                        LeaderboardItemDTO.builder().userId(11L).name("Học sinh 2").rank(2).build()
                ))
                .build();

        when(leaderboardService.getClassLeaderboard(eq(101L), eq("vocab"), eq("submitted"), any()))
                .thenReturn(classBoard);

        mockMvc.perform(get("/api/leaderboard/class/101?filter=vocab"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.status").value(200))
                .andExpect(jsonPath("$.message").value("Tải bảng xếp hạng lớp học thành công"))
                .andExpect(jsonPath("$.result.totalParticipants").value(2))
                .andExpect(jsonPath("$.result.rankings[0].name").value("Học sinh 1"));
    }

    @Test
    @DisplayName("TC-LEAD-011: Lấy bảng xếp hạng theo Nhóm học thành công")
    void testGetGroupLeaderboard() throws Exception {
        LeaderboardResponseDTO groupBoard = LeaderboardResponseDTO.builder()
                .filter("streak")
                .subFilter("submitted")
                .totalParticipants(1)
                .rankings(List.of(
                        LeaderboardItemDTO.builder().userId(20L).name("Thành viên nhóm").rank(1).streakDays(15).build()
                ))
                .build();

        when(leaderboardService.getGroupLeaderboard(eq(501L), eq("streak"), eq("submitted"), any()))
                .thenReturn(groupBoard);

        mockMvc.perform(get("/api/leaderboard/group/501?filter=streak"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.status").value(200))
                .andExpect(jsonPath("$.message").value("Tải bảng xếp hạng nhóm học thành công"))
                .andExpect(jsonPath("$.result.rankings[0].streakDays").value(15));
    }
}
