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
import quizlet.backend.dto.ExamDTO;
import quizlet.backend.dto.StudyTipDTO;
import quizlet.backend.enums.ExamType;
import quizlet.backend.enums.SkillType;
import quizlet.backend.services.StudyTipService;

import java.util.List;

import static org.mockito.ArgumentMatchers.*;
import static org.mockito.Mockito.*;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.*;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.*;

@ExtendWith(MockitoExtension.class)
public class StudyTipControllerTest {

    private MockMvc mockMvc;

    @Mock
    private StudyTipService studyTipService;

    @InjectMocks
    private StudyTipController studyTipController;

    private ObjectMapper objectMapper = new ObjectMapper();

    @BeforeEach
    void setUp() {
        mockMvc = MockMvcBuilders.standaloneSetup(studyTipController).build();
    }

    @Test
    @DisplayName("TC-TIP-001: Lấy danh sách mẹo học tập thành công")
    void testGetStudyTips() throws Exception {
        StudyTipDTO dto = StudyTipDTO.builder()
                .id(1L)
                .title("Mẹo làm bài Reading Part 1")
                .skill(SkillType.READING)
                .examType(ExamType.TOEIC)
                .build();

        when(studyTipService.getStudyTips(any(), any())).thenReturn(List.of(dto));

        mockMvc.perform(get("/api/study-tips"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.status").value(200))
                .andExpect(jsonPath("$.result[0].title").value("Mẹo làm bài Reading Part 1"));
    }

    @Test
    @DisplayName("TC-TIP-002: Lấy chi tiết mẹo học thành công")
    void testGetStudyTipById_Success() throws Exception {
        StudyTipDTO dto = StudyTipDTO.builder()
                .id(1L)
                .title("Mẹo làm bài Reading Part 1")
                .build();

        when(studyTipService.getStudyTipById(1L)).thenReturn(dto);

        mockMvc.perform(get("/api/study-tips/1"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.status").value(200))
                .andExpect(jsonPath("$.result.id").value(1));
    }

    @Test
    @DisplayName("TC-TIP-003: Lấy chi tiết mẹo học không tồn tại trả về 404")
    void testGetStudyTipById_NotFound() throws Exception {
        when(studyTipService.getStudyTipById(9999L)).thenReturn(null);

        mockMvc.perform(get("/api/study-tips/9999"))
                .andExpect(status().isNotFound())
                .andExpect(jsonPath("$.status").value(404));
    }

    @Test
    @DisplayName("TC-TIP-004: Tạo mẹo học mới thành công")
    void testCreateStudyTip() throws Exception {
        StudyTipDTO req = StudyTipDTO.builder()
                .title("Mẹo mới")
                .skill(SkillType.LISTENING)
                .build();

        StudyTipDTO created = StudyTipDTO.builder()
                .id(10L)
                .title("Mẹo mới")
                .skill(SkillType.LISTENING)
                .build();

        when(studyTipService.createStudyTip(any(StudyTipDTO.class))).thenReturn(created);

        mockMvc.perform(post("/api/study-tips")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(req)))
                .andExpect(status().isCreated())
                .andExpect(jsonPath("$.status").value(201))
                .andExpect(jsonPath("$.result.id").value(10));
    }

    @Test
    @DisplayName("TC-TIP-006: Thêm bài thi vào mẹo học thành công")
    void testAddExamToStudyTip() throws Exception {
        StudyTipDTO updated = StudyTipDTO.builder()
                .id(1L)
                .title("Mẹo có bài thi")
                .examIds(List.of(2L))
                .examsCount(1)
                .build();

        when(studyTipService.addExamToStudyTip(1L, 2L)).thenReturn(updated);

        mockMvc.perform(post("/api/study-tips/1/exams/2"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.status").value(200))
                .andExpect(jsonPath("$.result.examsCount").value(1));
    }

    @Test
    @DisplayName("TC-TIP-007: Xóa bài thi khỏi mẹo học thành công")
    void testRemoveExamFromStudyTip() throws Exception {
        StudyTipDTO updated = StudyTipDTO.builder()
                .id(1L)
                .title("Mẹo sau khi xóa bài thi")
                .examsCount(0)
                .build();

        when(studyTipService.removeExamFromStudyTip(1L, 2L)).thenReturn(updated);

        mockMvc.perform(delete("/api/study-tips/1/exams/2"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.status").value(200))
                .andExpect(jsonPath("$.result.examsCount").value(0));
    }
}
