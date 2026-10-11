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
import quizlet.backend.dto.PassageGroupDTO;
import quizlet.backend.dto.QuestionDTO;
import quizlet.backend.dto.SectionDTO;
import quizlet.backend.enums.SkillType;
import quizlet.backend.services.PassageGroupService;
import quizlet.backend.services.QuestionService;
import quizlet.backend.services.SectionService;

import java.util.List;

import static org.mockito.ArgumentMatchers.*;
import static org.mockito.Mockito.*;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.*;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.*;

@ExtendWith(MockitoExtension.class)
public class QuestionSectionPassageControllersTest {

    private MockMvc questionMockMvc;
    private MockMvc sectionMockMvc;
    private MockMvc passageMockMvc;

    @Mock
    private QuestionService questionService;

    @Mock
    private SectionService sectionService;

    @Mock
    private PassageGroupService passageGroupService;

    @InjectMocks
    private QuestionController questionController;

    @InjectMocks
    private SectionController sectionController;

    @InjectMocks
    private PassageGroupController passageGroupController;

    private ObjectMapper objectMapper = new ObjectMapper();

    @BeforeEach
    void setUp() {
        questionMockMvc = MockMvcBuilders.standaloneSetup(questionController)
                .setCustomArgumentResolvers(new org.springframework.security.web.method.annotation.AuthenticationPrincipalArgumentResolver())
                .build();
        sectionMockMvc = MockMvcBuilders.standaloneSetup(sectionController)
                .setCustomArgumentResolvers(new org.springframework.security.web.method.annotation.AuthenticationPrincipalArgumentResolver())
                .build();
        passageMockMvc = MockMvcBuilders.standaloneSetup(passageGroupController)
                .setCustomArgumentResolvers(new org.springframework.security.web.method.annotation.AuthenticationPrincipalArgumentResolver())
                .build();
    }

    // ==========================================
    // 1. QuestionController Tests (/api/questions)
    // ==========================================
    @Test
    @DisplayName("TC-QUES-001: Lấy chi tiết Question theo ID thành công")
    void testGetQuestionDetail_Found() throws Exception {
        QuestionDTO q = QuestionDTO.builder()
                .id(1L)
                .content("What is the main topic of the conversation?")
                .correctAnswer("A")
                .score(5.0)
                .build();

        when(questionService.getQuestionById(1L)).thenReturn(q);

        questionMockMvc.perform(get("/api/questions/1"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.status").value(200))
                .andExpect(jsonPath("$.result.content").value("What is the main topic of the conversation?"))
                .andExpect(jsonPath("$.result.correctAnswer").value("A"));
    }

    @Test
    @DisplayName("TC-QUES-002: Lấy Question không tồn tại trả về 404 Not Found")
    void testGetQuestionDetail_NotFound() throws Exception {
        when(questionService.getQuestionById(999L)).thenReturn(null);

        questionMockMvc.perform(get("/api/questions/999"))
                .andExpect(status().isNotFound())
                .andExpect(jsonPath("$.status").value(404));
    }

    @Test
    @DisplayName("TC-QUES-003: Tạo Question mới thành công")
    void testCreateQuestion() throws Exception {
        QuestionDTO req = QuestionDTO.builder()
                .content("New question?")
                .correctAnswer("B")
                .build();

        QuestionDTO created = QuestionDTO.builder()
                .id(10L)
                .content("New question?")
                .correctAnswer("B")
                .build();

        when(questionService.createQuestion(any(QuestionDTO.class))).thenReturn(created);

        questionMockMvc.perform(post("/api/questions")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(req)))
                .andExpect(status().isCreated())
                .andExpect(jsonPath("$.status").value(201))
                .andExpect(jsonPath("$.result.id").value(10));
    }

    @Test
    @DisplayName("TC-QUES-004: Xóa Question thành công")
    void testDeleteQuestion() throws Exception {
        doNothing().when(questionService).deleteQuestion(1L);

        questionMockMvc.perform(delete("/api/questions/1"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.status").value(200))
                .andExpect(jsonPath("$.message").value("Xóa Question thành công"));
    }

    // ==========================================
    // 2. SectionController Tests (/api/sections)
    // ==========================================
    @Test
    @DisplayName("TC-SEC-001: Lấy chi tiết Section theo ID thành công")
    void testGetSectionDetail_Found() throws Exception {
        SectionDTO s = SectionDTO.builder()
                .id(1)
                .title("Listening Part 1")
                .skill(SkillType.LISTENING)
                .build();

        when(sectionService.getSectionById(1)).thenReturn(s);

        sectionMockMvc.perform(get("/api/sections/1"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.status").value(200))
                .andExpect(jsonPath("$.result.title").value("Listening Part 1"));
    }

    @Test
    @DisplayName("TC-SEC-002: Lấy Section không tồn tại trả về 404")
    void testGetSectionDetail_NotFound() throws Exception {
        when(sectionService.getSectionById(99)).thenReturn(null);

        sectionMockMvc.perform(get("/api/sections/99"))
                .andExpect(status().isNotFound())
                .andExpect(jsonPath("$.status").value(404));
    }

    @Test
    @DisplayName("TC-SEC-003: Xóa Section thành công")
    void testDeleteSection() throws Exception {
        doNothing().when(sectionService).deleteSection(1);

        sectionMockMvc.perform(delete("/api/sections/1"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.status").value(200))
                .andExpect(jsonPath("$.message").value("Xóa Section thành công"));
    }

    // ==========================================
    // 3. PassageGroupController Tests (/api/passage-groups)
    // ==========================================
    @Test
    @DisplayName("TC-PASS-001: Lấy chi tiết PassageGroup theo ID thành công")
    void testGetPassageGroupDetail_Found() throws Exception {
        PassageGroupDTO pg = PassageGroupDTO.builder()
                .id(5L)
                .title("Photographs 1-6")
                .build();

        when(passageGroupService.getPassageGroupById(5L)).thenReturn(pg);

        passageMockMvc.perform(get("/api/passage-groups/5"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.status").value(200))
                .andExpect(jsonPath("$.result.title").value("Photographs 1-6"));
    }

    @Test
    @DisplayName("TC-PASS-002: Lấy PassageGroup không tồn tại trả về 404")
    void testGetPassageGroupDetail_NotFound() throws Exception {
        when(passageGroupService.getPassageGroupById(999L)).thenReturn(null);

        passageMockMvc.perform(get("/api/passage-groups/999"))
                .andExpect(status().isNotFound())
                .andExpect(jsonPath("$.status").value(404));
    }

    @Test
    @DisplayName("TC-PASS-003: Xóa PassageGroup thành công")
    void testDeletePassageGroup() throws Exception {
        doNothing().when(passageGroupService).deletePassageGroup(5L);

        passageMockMvc.perform(delete("/api/passage-groups/5"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.status").value(200))
                .andExpect(jsonPath("$.message").value("Xóa PassageGroup thành công"));
    }
}
