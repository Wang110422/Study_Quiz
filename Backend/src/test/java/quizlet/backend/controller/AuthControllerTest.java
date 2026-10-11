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
import org.springframework.http.ResponseCookie;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.test.web.servlet.MockMvc;
import org.springframework.test.web.servlet.setup.MockMvcBuilders;
import quizlet.backend.dto.req.LoginRequest;
import quizlet.backend.dto.req.RegisterRequest;
import quizlet.backend.dto.res.AuthResponse;
import quizlet.backend.dto.UserDTO;
import quizlet.backend.model.User;
import quizlet.backend.security.jwt.JwtTokenProvider;
import quizlet.backend.services.JwtCacheService;
import quizlet.backend.services.UserService;

import java.util.Optional;

import static org.mockito.ArgumentMatchers.any;
import static org.mockito.ArgumentMatchers.eq;
import static org.mockito.Mockito.*;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.*;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.*;
import static org.springframework.test.web.servlet.result.MockMvcResultHandlers.print;
@ExtendWith(MockitoExtension.class)
public class AuthControllerTest {

    private MockMvc mockMvc;

    @Mock
    private UserService userService;

    @Mock
    private PasswordEncoder passwordEncoder;

    @Mock
    private JwtTokenProvider jwtTokenProvider;

    @Mock
    private JwtCacheService jwtCacheService;

    @InjectMocks
    private AuthController authController;

    private ObjectMapper objectMapper = new ObjectMapper();

    @BeforeEach
    void setUp() {
        mockMvc = MockMvcBuilders.standaloneSetup(authController).build();
    }

    @Test
    @DisplayName("TC-AUTH-001: Đăng ký thành công trả về 200 và JWT cookie")
    void testRegister_Success() throws Exception {
        RegisterRequest req = new RegisterRequest();
        req.setEmail("test@gmail.com");
        req.setPassword("Password123!");
        req.setFirstName("Anh");
        req.setLastName("Nguyen");

        AuthResponse res = AuthResponse.builder()
                .token("jwt-test-token")
                .email("test@gmail.com")
                .firstName("Anh")
                .lastName("Nguyen")
                .build();

        ResponseCookie cookie = ResponseCookie.from("auth_token", "jwt-test-token").build();

        when(userService.register(any(RegisterRequest.class), any())).thenReturn(res);
        when(userService.generateCookie(eq("jwt-test-token"))).thenReturn(cookie);

        mockMvc.perform(post("/api/auth/register")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(req)))
                .andDo(print())
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.status").value(200))
                .andExpect(jsonPath("$.message").value("Đăng ký thành công"))
                .andExpect(jsonPath("$.result.email").value("test@gmail.com"));
    }

    @Test
    @DisplayName("TC-AUTH-002: Đăng ký với email trùng lặp trả về 400 Bad Request")
    void testRegister_EmailAlreadyExists() throws Exception {
        RegisterRequest req = new RegisterRequest();
        req.setEmail("existing@gmail.com");
        req.setPassword("Password123!");

        when(userService.register(any(RegisterRequest.class), any()))
                .thenThrow(new RuntimeException("Email đã tồn tại!"));

        mockMvc.perform(post("/api/auth/register")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(req)))
                .andExpect(status().isBadRequest())
                .andExpect(jsonPath("$.status").value(400))
                .andExpect(jsonPath("$.message").value("Email đã tồn tại!"));
    }

    @Test
    @DisplayName("TC-AUTH-003: Đăng nhập thành công trả về 200 và token")
    void testLogin_Success() throws Exception {
        LoginRequest req = new LoginRequest();
        req.setEmail("test@gmail.com");
        req.setPassword("Password123!");

        AuthResponse res = AuthResponse.builder()
                .token("jwt-login-token")
                .email("test@gmail.com")
                .firstName("Anh")
                .lastName("Nguyen")
                .build();

        ResponseCookie cookie = ResponseCookie.from("auth_token", "jwt-login-token").build();

        when(userService.login(any(LoginRequest.class), any())).thenReturn(res);
        when(userService.generateCookie(eq("jwt-login-token"))).thenReturn(cookie);

        mockMvc.perform(post("/api/auth/login")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(req)))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.status").value(200))
                .andExpect(jsonPath("$.message").value("Đăng nhập thành công"))
                .andExpect(jsonPath("$.result.token").value("jwt-login-token"));
    }

    @Test
    @DisplayName("TC-AUTH-004: Đăng nhập sai mật khẩu trả về 400 Bad Request")
    void testLogin_WrongPassword() throws Exception {
        LoginRequest req = new LoginRequest();
        req.setEmail("test@gmail.com");
        req.setPassword("WrongPassword");

        when(userService.login(any(LoginRequest.class), any()))
                .thenThrow(new RuntimeException("Email hoặc mật khẩu không chính xác!"));

        mockMvc.perform(post("/api/auth/login")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(req)))
                .andExpect(status().isBadRequest())
                .andExpect(jsonPath("$.status").value(400))
                .andExpect(jsonPath("$.message").value("Email hoặc mật khẩu không chính xác!"));
    }

    @Test
    @DisplayName("TC-AUTH-005: Đăng xuất xóa Cookie")
    void testLogout() throws Exception {
        ResponseCookie clearCookie = ResponseCookie.from("auth_token", "").maxAge(0).build();
        when(userService.cleanCookie()).thenReturn(clearCookie);

        mockMvc.perform(post("/api/auth/logout"))
                .andDo(print())
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.status").value(200))
                .andExpect(jsonPath("$.message").value("Đăng xuất thành công"));
    }
}
