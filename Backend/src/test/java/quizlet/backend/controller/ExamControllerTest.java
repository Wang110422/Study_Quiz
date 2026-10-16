package quizlet.backend.controller;

import com.fasterxml.jackson.databind.ObjectMapper;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;
import org.springframework.test.web.servlet.MockMvc;
import org.springframework.test.web.servlet.setup.MockMvcBuilders;
import quizlet.backend.dto.ExamAttemptDTO;
import quizlet.backend.dto.ExamDTO;
import quizlet.backend.enums.ExamFormat;
import quizlet.backend.enums.ExamType;
import quizlet.backend.enums.Mode;
import quizlet.backend.services.ExamService;

import java.util.List;

import static org.mockito.ArgumentMatchers.*;
import static org.mockito.Mockito.*;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.*;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.*;

@ExtendWith(MockitoExtension.class)
public class ExamControllerTest {

    private MockMvc mockMvc;

    @Mock
    private ExamService examService;

    @InjectMocks
    private ExamController examController;

    private ObjectMapper objectMapper = new ObjectMapper();

    @BeforeEach
    void setUp() {
        mockMvc = MockMvcBuilders.standaloneSetup(examController).build();
    }

    @Test
    @DisplayName("TC-EXAM-001: Lấy danh sách đề luyện tập (/practice)")
    void testGetPracticeExams() throws Exception {
        ExamDTO dto = ExamDTO.builder()
                .id(1L)
                .title("TOEIC Practice 1")
                .format(ExamFormat.PRACTICE)
                .type(ExamType.TOEIC)
                .build();

        when(examService.getExams(eq(ExamFormat.PRACTICE), any())).thenReturn(List.of(dto));

        mockMvc.perform(get("/api/exams/practice"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.status").value(200))
                .andExpect(jsonPath("$.result[0].title").value("TOEIC Practice 1"));
    }

    @Test
    @DisplayName("TC-EXAM-002: Lấy danh sách đề thi thử đầy đủ (/mock)")
    void testGetMockExams() throws Exception {
        ExamDTO dto = ExamDTO.builder()
                .id(2L)
                .title("Full Mock Test 1")
                .format(ExamFormat.FULL_TEST)
                .build();

        when(examService.getExams(eq(ExamFormat.FULL_TEST), any())).thenReturn(List.of(dto));

        mockMvc.perform(get("/api/exams/mock"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.status").value(200))
                .andExpect(jsonPath("$.result[0].title").value("Full Mock Test 1"));
    }

    @Test
    @DisplayName("TC-EXAM-002B: Lấy danh sách bài tập thực hành StudyTip (/drills)")
    void testGetLessonDrills() throws Exception {
        ExamDTO dto = ExamDTO.builder()
                .id(3L)
                .title("Part 1 Drill 1")
                .format(ExamFormat.LESSON_DRILL)
                .build();

        when(examService.getExams(eq(ExamFormat.LESSON_DRILL), any())).thenReturn(List.of(dto));

        mockMvc.perform(get("/api/exams/drills"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.status").value(200))
                .andExpect(jsonPath("$.result[0].title").value("Part 1 Drill 1"));
    }

    @Test
    @DisplayName("TC-EXAM-003: Lấy chi tiết đề thi theo ID hợp lệ")
    void testGetExamDetail_Found() throws Exception {
        ExamDTO dto = ExamDTO.builder()
                .id(1L)
                .title("TOEIC Reading Exam")
                .totalScore(50)
                .build();

        when(examService.getExamById(1L)).thenReturn(dto);

        mockMvc.perform(get("/api/exams/1"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.status").value(200))
                .andExpect(jsonPath("$.result.id").value(1));
    }

    @Test
    @DisplayName("TC-EXAM-004: Lấy chi tiết đề thi khi ID không tồn tại trả về 404")
    void testGetExamDetail_NotFound() throws Exception {
        when(examService.getExamById(9999L)).thenReturn(null);

        mockMvc.perform(get("/api/exams/9999"))
                .andExpect(status().isNotFound())
                .andExpect(jsonPath("$.status").value(404))
                .andExpect(jsonPath("$.message").value("Không tìm thấy đề thi với ID: 9999"));
    }

    @Test
    @DisplayName("TC-EXAM-006: Nộp bài thi (/submit) thành công")
    void testSubmitExamAttempt() throws Exception {
        ExamAttemptDTO res = ExamAttemptDTO.builder()
                .id(100L)
                .examId(1L)
                .totalScore(45.0)
                .build();

        when(examService.submitExamAttempt(eq(100L), any(), any(), any())).thenReturn(res);

        mockMvc.perform(post("/api/exams/attempt/100/submit")
                        .contentType(org.springframework.http.MediaType.APPLICATION_JSON)
                        .content("{}"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.status").value(200))
                .andExpect(jsonPath("$.result.totalScore").value(45.0));
    }
}
