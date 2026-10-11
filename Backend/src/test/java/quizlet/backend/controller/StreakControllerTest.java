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
import quizlet.backend.dto.UserStreakDTO;
import quizlet.backend.model.User;
import quizlet.backend.services.UserStreakService;

import java.util.Map;

import static org.mockito.ArgumentMatchers.*;
import static org.mockito.Mockito.*;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.*;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.*;

@ExtendWith(MockitoExtension.class)
public class StreakControllerTest {

    private MockMvc mockMvc;

    @Mock
    private UserStreakService userStreakService;

    @InjectMocks
    private StreakController streakController;

    private ObjectMapper objectMapper = new ObjectMapper();

    @BeforeEach
    void setUp() {
        mockMvc = MockMvcBuilders.standaloneSetup(streakController)
                .setCustomArgumentResolvers(new org.springframework.security.web.method.annotation.AuthenticationPrincipalArgumentResolver())
                .build();
    }

    @Test
    @DisplayName("TC-STREAK-001: Lấy streak cá nhân khi chưa đăng nhập trả về 401")
    void testGetMyStreak_Unauthenticated() throws Exception {
        mockMvc.perform(get("/api/streak/me"))
                .andExpect(status().isUnauthorized())
                .andExpect(jsonPath("$.status").value(401))
                .andExpect(jsonPath("$.message").value("Vui lòng đăng nhập"));
    }

    @Test
    @DisplayName("TC-STREAK-002: Lấy streak học viên công khai thành công")
    void testGetUserStreak_Success() throws Exception {
        UserStreakDTO dto = UserStreakDTO.builder()
                .userId(100L)
                .currentStreak(7)
                .longestStreak(14)
                .totalActiveDays(20)
                .vocabLearned(150)
                .avatarUrl("http://example.com/avatar.jpg")
                .build();

        when(userStreakService.getStreakByUserId(100L)).thenReturn(dto);

        mockMvc.perform(get("/api/streak/user/100"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.status").value(200))
                .andExpect(jsonPath("$.result.userId").value(100))
                .andExpect(jsonPath("$.result.currentStreak").value(7))
                .andExpect(jsonPath("$.result.avatarUrl").value("http://example.com/avatar.jpg"));
    }

    @Test
    @DisplayName("TC-STREAK-003: Lấy streak học viên không tồn tại trả về 404")
    void testGetUserStreak_NotFound() throws Exception {
        when(userStreakService.getStreakByUserId(999L)).thenReturn(null);

        mockMvc.perform(get("/api/streak/user/999"))
                .andExpect(status().isNotFound())
                .andExpect(jsonPath("$.status").value(404));
    }

    @Test
    @DisplayName("TC-STREAK-004: Ghi nhận streak khi chưa đăng nhập trả về 401")
    void testRecordActivity_Unauthenticated() throws Exception {
        mockMvc.perform(post("/api/streak/record"))
                .andExpect(status().isUnauthorized())
                .andExpect(jsonPath("$.status").value(401));
    }

    @Test
    @DisplayName("TC-STREAK-005: Cập nhật tiến độ từ vựng khi chưa đăng nhập trả về 401")
    void testUpdateVocabProgress_Unauthenticated() throws Exception {
        mockMvc.perform(post("/api/streak/vocab-progress")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(Map.of("count", 10, "isIncrement", true))))
                .andExpect(status().isUnauthorized())
                .andExpect(jsonPath("$.status").value(401));
    }

    @Test
    @DisplayName("TC-STREAK-006: Lấy danh sách cột mốc / huy hiệu streak thành công")
    void testGetStreakMilestones_Success() throws Exception {
        mockMvc.perform(get("/api/streak/milestones"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.status").value(200))
                .andExpect(jsonPath("$.result").isArray())
                .andExpect(jsonPath("$.result[0].targetDays").value(3))
                .andExpect(jsonPath("$.result[1].targetDays").value(7));
    }
}
