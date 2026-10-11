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
import quizlet.backend.dto.FolderDTO;
import quizlet.backend.dto.GrammarSetDTO;
import quizlet.backend.dto.SchoolClassDTO;
import quizlet.backend.dto.StudySetDTO;
import quizlet.backend.dto.VocabularyFlashCardDTO;
import quizlet.backend.services.FolderService;
import quizlet.backend.services.GrammarSetService;
import quizlet.backend.services.SchoolClassService;
import quizlet.backend.services.StudySetService;
import quizlet.backend.services.VocabularyService;

import java.util.List;

import static org.mockito.ArgumentMatchers.*;
import static org.mockito.Mockito.*;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.*;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.*;

@ExtendWith(MockitoExtension.class)
public class ContentManagementControllersTest {

    private MockMvc vocabMockMvc;
    private MockMvc grammarMockMvc;
    private MockMvc folderMockMvc;
    private MockMvc studySetMockMvc;
    private MockMvc classMockMvc;

    @Mock
    private VocabularyService vocabularyService;

    @Mock
    private GrammarSetService grammarSetService;

    @Mock
    private FolderService folderService;

    @Mock
    private StudySetService studySetService;

    @Mock
    private SchoolClassService schoolClassService;

    @InjectMocks
    private VocabularyController vocabularyController;

    @InjectMocks
    private GrammarSetController grammarSetController;

    @InjectMocks
    private FolderController folderController;

    @InjectMocks
    private StudySetController studySetController;

    @InjectMocks
    private SchoolClassController schoolClassController;

    private ObjectMapper objectMapper = new ObjectMapper();

    @BeforeEach
    void setUp() {
        vocabMockMvc = MockMvcBuilders.standaloneSetup(vocabularyController).build();
        grammarMockMvc = MockMvcBuilders.standaloneSetup(grammarSetController).build();
        folderMockMvc = MockMvcBuilders.standaloneSetup(folderController).build();
        studySetMockMvc = MockMvcBuilders.standaloneSetup(studySetController).build();
        classMockMvc = MockMvcBuilders.standaloneSetup(schoolClassController).build();
    }

    // 1. VocabularyController Tests
    @Test
    @DisplayName("TC-VOCAB-001: Lấy danh sách từ vựng theo slug thành công")
    void testGetVocabulariesBySlug() throws Exception {
        VocabularyFlashCardDTO dto = VocabularyFlashCardDTO.builder()
                .id(1L)
                .term("Eloquent")
                .definition("Hùng biện, lưu loát")
                .build();

        when(vocabularyService.getVocabulary("toeic-vocab")).thenReturn(List.of(dto));

        vocabMockMvc.perform(get("/api/vocabularies/toeic-vocab"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.status").value(200))
                .andExpect(jsonPath("$.result[0].term").value("Eloquent"));
    }

    @Test
    @DisplayName("TC-VOCAB-002: Xóa mềm từ vựng thành công")
    void testDeleteVocabulary_Success() throws Exception {
        when(vocabularyService.softDeleteVocabulary(1L)).thenReturn(true);

        vocabMockMvc.perform(delete("/api/vocabularies/1"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.status").value(200))
                .andExpect(jsonPath("$.result").value(true));
    }

    // 2. GrammarSetController Tests
    @Test
    @DisplayName("TC-GRAM-001: Lấy danh sách bộ ngữ pháp thành công")
    void testGetAllGrammarSets() throws Exception {
        GrammarSetDTO g = GrammarSetDTO.builder()
                .id(1L)
                .title("Thì Hiện Tại Hoàn Thành")
                .slug("present-perfect")
                .build();

        when(grammarSetService.getAllGrammarSets()).thenReturn(List.of(g));

        grammarMockMvc.perform(get("/api/grammar-sets"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.status").value(200))
                .andExpect(jsonPath("$.result[0].title").value("Thì Hiện Tại Hoàn Thành"));
    }

    @Test
    @DisplayName("TC-GRAM-002: Tìm bộ ngữ pháp theo slug không tồn tại trả về 404")
    void testGetGrammarSetBySlug_NotFound() throws Exception {
        when(grammarSetService.getGrammarSetBySlug("invalid-slug")).thenReturn(null);

        grammarMockMvc.perform(get("/api/grammar-sets/invalid-slug"))
                .andExpect(status().isNotFound())
                .andExpect(jsonPath("$.status").value(404));
    }

    @Test
    @DisplayName("TC-GRAM-003: Tạo bộ ngữ pháp mới thành công")
    void testCreateGrammarSet_Success() throws Exception {
        quizlet.backend.dto.req.CreateGrammarSetRequest req = quizlet.backend.dto.req.CreateGrammarSetRequest.builder()
                .title("Câu điều kiện")
                .description("Loại 1, 2, 3")
                .level("B1 - B2")
                .build();

        GrammarSetDTO created = GrammarSetDTO.builder()
                .id(10L)
                .title("Câu điều kiện")
                .slug("cau-dieu-kien")
                .description("Loại 1, 2, 3")
                .level("B1 - B2")
                .build();

        when(grammarSetService.createGrammarSet(any(), any())).thenReturn(created);

        grammarMockMvc.perform(post("/api/grammar-sets")
                .contentType(MediaType.APPLICATION_JSON)
                .content(objectMapper.writeValueAsString(req)))
                .andExpect(status().isCreated())
                .andExpect(jsonPath("$.status").value(201))
                .andExpect(jsonPath("$.result.title").value("Câu điều kiện"));
    }

    // 3. FolderController Tests
    @Test
    @DisplayName("TC-FOLD-001: Lấy chi tiết thư mục theo slug thành công")
    void testGetFolderBySlug_Success() throws Exception {
        FolderDTO f = new FolderDTO();
        f.setId(1L);
        f.setName("IELTS Band 7+");
        f.setSlug("ielts-band-7");

        when(folderService.getFolderBySlug("ielts-band-7")).thenReturn(f);

        folderMockMvc.perform(get("/api/folders/ielts-band-7"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.status").value(200))
                .andExpect(jsonPath("$.result.name").value("IELTS Band 7+"));
    }

    @Test
    @DisplayName("TC-FOLD-002: Lấy thư mục theo slug không tồn tại trả về 404")
    void testGetFolderBySlug_NotFound() throws Exception {
        when(folderService.getFolderBySlug("non-existent")).thenReturn(null);

        folderMockMvc.perform(get("/api/folders/non-existent"))
                .andExpect(status().isNotFound())
                .andExpect(jsonPath("$.status").value(404));
    }

    // 4. StudySetController Tests
    @Test
    @DisplayName("TC-SET-001: Lấy tất cả bộ thẻ thành công (/api/studyset)")
    void testGetAllStudySets() throws Exception {
        StudySetDTO s = StudySetDTO.builder()
                .id(1L)
                .titleName("500 Từ Vựng TOEIC Căn Bản")
                .build();

        when(studySetService.getAllStudySets()).thenReturn(List.of(s));

        studySetMockMvc.perform(get("/api/studyset"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.status").value(200))
                .andExpect(jsonPath("$.result[0].titleName").value("500 Từ Vựng TOEIC Căn Bản"));
    }

    // 5. SchoolClassController Tests
    @Test
    @DisplayName("TC-CLS-001: Lấy chi tiết lớp học theo ID thành công")
    void testGetClassById() throws Exception {
        SchoolClassDTO c = new SchoolClassDTO();
        c.setId(10L);
        c.setName("Lớp Tiếng Anh K45");
        c.setJoinCode("123456");

        when(schoolClassService.getClassById(10L)).thenReturn(c);

        classMockMvc.perform(get("/api/classes/10"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.status").value(200))
                .andExpect(jsonPath("$.result.name").value("Lớp Tiếng Anh K45"));
    }
}
