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
import quizlet.backend.dto.UserDTO;
import quizlet.backend.enums.Role;
import quizlet.backend.model.User;
import quizlet.backend.repository.UserRepository;

import java.util.List;
import java.util.Optional;

import static org.mockito.ArgumentMatchers.*;
import static org.mockito.Mockito.*;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.*;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.*;

@ExtendWith(MockitoExtension.class)
public class UserControllerTest {

    private MockMvc mockMvc;

    @Mock
    private UserRepository userRepository;

    @InjectMocks
    private UserController userController;

    private ObjectMapper objectMapper = new ObjectMapper();

    @BeforeEach
    void setUp() {
        mockMvc = MockMvcBuilders.standaloneSetup(userController)
                .setCustomArgumentResolvers(new org.springframework.security.web.method.annotation.AuthenticationPrincipalArgumentResolver())
                .build();
    }

    @Test
    @DisplayName("TC-USER-001: Lấy thông tin cá nhân khi chưa đăng nhập trả về 401")
    void testGetCurrentUserProfile_Unauthenticated() throws Exception {
        mockMvc.perform(get("/api/user/me"))
                .andExpect(status().isUnauthorized())
                .andExpect(jsonPath("$.status").value(401))
                .andExpect(jsonPath("$.message").value("Chưa đăng nhập"));
    }

    @Test
    @DisplayName("TC-USER-002: Lấy danh sách toàn bộ người dùng (Admin)")
    void testGetAllUsers() throws Exception {
        User u1 = new User();
        u1.setId(1L);
        u1.setEmail("u1@gmail.com");
        u1.setRole(Role.STUDENT);

        when(userRepository.findAll()).thenReturn(List.of(u1));

        mockMvc.perform(get("/api/user/admin/users"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.status").value(200))
                .andExpect(jsonPath("$.result[0].email").value("u1@gmail.com"));
    }

    @Test
    @DisplayName("TC-USER-003: Xóa người dùng theo ID thành công")
    void testDeleteUser_Success() throws Exception {
        when(userRepository.existsById(1L)).thenReturn(true);
        doNothing().when(userRepository).deleteById(1L);

        mockMvc.perform(delete("/api/user/admin/users/1"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.status").value(200))
                .andExpect(jsonPath("$.message").value("Admin: Đã xóa người dùng ID 1 thành công"));
    }

    @Test
    @DisplayName("TC-USER-004: Xóa người dùng không tồn tại trả về 404")
    void testDeleteUser_NotFound() throws Exception {
        when(userRepository.existsById(999L)).thenReturn(false);

        mockMvc.perform(delete("/api/user/admin/users/999"))
                .andExpect(status().isNotFound())
                .andExpect(jsonPath("$.status").value(404));
    }
}
