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
import quizlet.backend.dto.RoadmapDTO;
import quizlet.backend.dto.StudyGroupDTO;
import quizlet.backend.dto.StudySetDTO;
import quizlet.backend.dto.VocabularyFlashCardDTO;
import quizlet.backend.model.User;
import quizlet.backend.repository.UserRepository;
import quizlet.backend.services.*;

import java.util.List;

import static org.mockito.ArgumentMatchers.*;
import static org.mockito.Mockito.*;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.*;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.*;

@ExtendWith(MockitoExtension.class)
public class RoadmapGroupTrashGoogleControllersTest {

        private MockMvc roadmapMockMvc;
        private MockMvc groupMockMvc;
        private MockMvc trashMockMvc;
        private MockMvc googleMockMvc;

        @Mock
        private RoadmapService roadmapService;

        @Mock
        private StudyGroupService studyGroupService;

        @Mock
        private FolderService folderService;

        @Mock
        private StudySetService studySetService;

        @Mock
        private VocabularyService vocabularyService;

        @Mock
        private GoogleSheetService googleSheetService;

        @Mock
        private UserRepository userRepository;

        @InjectMocks
        private RoadmapController roadmapController;

        @InjectMocks
        private StudyGroupController studyGroupController;

        @InjectMocks
        private TrashController trashController;

        @InjectMocks
        private GoogleController googleController;

        private ObjectMapper objectMapper = new ObjectMapper();

        @BeforeEach
        void setUp() {
                roadmapMockMvc = MockMvcBuilders.standaloneSetup(roadmapController)
                                .setCustomArgumentResolvers(
                                                new org.springframework.security.web.method.annotation.AuthenticationPrincipalArgumentResolver())
                                .build();
                groupMockMvc = MockMvcBuilders.standaloneSetup(studyGroupController)
                                .setCustomArgumentResolvers(
                                                new org.springframework.security.web.method.annotation.AuthenticationPrincipalArgumentResolver())
                                .build();
                trashMockMvc = MockMvcBuilders.standaloneSetup(trashController)
                                .setCustomArgumentResolvers(
                                                new org.springframework.security.web.method.annotation.AuthenticationPrincipalArgumentResolver())
                                .build();
                googleMockMvc = MockMvcBuilders.standaloneSetup(googleController)
                                .setCustomArgumentResolvers(
                                                new org.springframework.security.web.method.annotation.AuthenticationPrincipalArgumentResolver())
                                .build();
        }

        // ==========================================
        // 1. RoadmapController Tests (/api/roadmaps)
        // ==========================================
        @Test
        @DisplayName("TC-ROAD-001: Lấy danh sách lộ trình học thành công")
        void testGetAllRoadmaps() throws Exception {
                RoadmapDTO r = RoadmapDTO.builder()
                                .id(1L)
                                .title("Lộ trình TOEIC 750+")
                                .targetScore(750)
                                .build();

                when(roadmapService.getAllRoadmaps(any())).thenReturn(List.of(r));

                roadmapMockMvc.perform(get("/api/roadmaps"))
                                .andExpect(status().isOk())
                                .andExpect(jsonPath("$.status").value(200))
                                .andExpect(jsonPath("$.result[0].title").value("Lộ trình TOEIC 750+"));
        }

        @Test
        @DisplayName("TC-ROAD-002: Lấy chi tiết lộ trình học không tồn tại trả về 404")
        void testGetRoadmapById_NotFound() throws Exception {
                when(roadmapService.getRoadmapById(eq(999L), any())).thenReturn(null);

                roadmapMockMvc.perform(get("/api/roadmaps/999"))
                                .andExpect(status().isNotFound())
                                .andExpect(jsonPath("$.status").value(404));
        }

        // ==========================================
        // 2. StudyGroupController Tests (/api/study-groups)
        // ==========================================
        @Test
        @DisplayName("TC-GRP-001: Lấy chi tiết nhóm học theo ID thành công")
        void testGetGroupById() throws Exception {
                StudyGroupDTO g = new StudyGroupDTO();
                g.setId(10L);
                g.setName("Nhóm Luyện Nghe Aptis");
                g.setJoinCode("GRP123");

                when(studyGroupService.getGroupById(10L)).thenReturn(g);

                groupMockMvc.perform(get("/api/study-groups/10"))
                                .andExpect(status().isOk())
                                .andExpect(jsonPath("$.status").value(200))
                                .andExpect(jsonPath("$.result.name").value("Nhóm Luyện Nghe Aptis"));
        }

        @Test
        @DisplayName("TC-GRP-002: Lấy danh sách nhóm khi chưa đăng nhập trả về 401")
        void testGetUserGroups_Unauthenticated() throws Exception {
                groupMockMvc.perform(get("/api/study-groups"))
                                .andExpect(status().isUnauthorized())
                                .andExpect(jsonPath("$.status").value(401))
                                .andExpect(jsonPath("$.message").value("Chưa đăng nhập"));
        }

        // ==========================================
        // 3. TrashController Tests (/api/trash)
        // ==========================================
        @Test
        @DisplayName("TC-TRASH-001: Lấy toàn bộ thùng rác khi chưa đăng nhập trả về 401")
        void testGetAllTrashItems_Unauthenticated() throws Exception {
                trashMockMvc.perform(get("/api/trash/all"))
                                .andExpect(status().isUnauthorized())
                                .andExpect(jsonPath("$.status").value(401))
                                .andExpect(jsonPath("$.message").value("Chưa đăng nhập"));
        }

        // ==========================================
        // 4. GoogleController Tests (/api/google)
        // ==========================================
        @Test
        @DisplayName("TC-GOOG-001: Đồng bộ Google Sheet khi chưa đăng nhập trả về 401")
        void testSyncToGoogleSheet_Unauthenticated() throws Exception {
                googleMockMvc.perform(post("/api/google/create_sheet"))
                                .andExpect(status().isUnauthorized())
                                .andExpect(jsonPath("$.status").value(401))
                                .andExpect(jsonPath("$.message").value("Chưa đăng nhập"));
        }
}
