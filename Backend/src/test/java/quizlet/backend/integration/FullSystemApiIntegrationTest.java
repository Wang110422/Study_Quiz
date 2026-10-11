package quizlet.backend.integration;

import com.fasterxml.jackson.databind.ObjectMapper;
import io.github.cdimascio.dotenv.Dotenv;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.test.context.bean.override.mockito.MockitoBean;
import org.springframework.http.MediaType;
import org.springframework.test.web.servlet.MockMvc;
import org.springframework.test.web.servlet.MvcResult;
import org.springframework.test.web.servlet.setup.MockMvcBuilders;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.context.WebApplicationContext;
import quizlet.backend.dto.req.LoginRequest;
import quizlet.backend.dto.req.RegisterRequest;
import quizlet.backend.model.User;
import quizlet.backend.repository.UserRepository;
import quizlet.backend.services.JwtCacheService;

import jakarta.servlet.http.Cookie;

import static org.assertj.core.api.Assertions.assertThat;
import static org.mockito.ArgumentMatchers.anyString;
import static org.mockito.Mockito.when;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.*;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.*;

@SpringBootTest
@Transactional
public class FullSystemApiIntegrationTest {

    static {
        Dotenv dotenv = Dotenv.configure().ignoreIfMissing().load();
        dotenv.entries().forEach(entry -> {
            System.setProperty(entry.getKey(), entry.getValue());
        });
        if (System.getProperty("DB_URL") == null) {
            System.setProperty("DB_URL", "jdbc:mysql://localhost:3306/quizlet_db?useSSL=false&serverTimezone=UTC&allowPublicKeyRetrieval=true");
        }
        if (System.getProperty("DB_USER") == null) {
            System.setProperty("DB_USER", "root");
        }
        if (System.getProperty("DB_PASSWORD") == null) {
            System.setProperty("DB_PASSWORD", "123456");
        }
        if (System.getProperty("JWT_SECRET") == null) {
            System.setProperty("JWT_SECRET", "default_jwt_secret_key_for_testing_purposes_only_at_least_32_bytes_long");
        }
        if (System.getProperty("GOOGLE_CLIENT_ID") == null) {
            System.setProperty("GOOGLE_CLIENT_ID", "test-google-client-id");
        }
        if (System.getProperty("GOOGLE_CLIENT_SECRET") == null) {
            System.setProperty("GOOGLE_CLIENT_SECRET", "test-google-client-secret");
        }
    }

    @Autowired
    private WebApplicationContext webApplicationContext;

    private MockMvc mockMvc;

    @Autowired
    private UserRepository userRepository;

    @MockitoBean
    private JwtCacheService jwtCacheService;

    private final ObjectMapper objectMapper = new ObjectMapper();

    @BeforeEach
    void setUp() {
        jakarta.servlet.Filter springSecurityFilterChain = (jakarta.servlet.Filter) webApplicationContext.getBean("springSecurityFilterChain");
        mockMvc = MockMvcBuilders.webAppContextSetup(webApplicationContext)
                .addFilter(springSecurityFilterChain)
                .build();
    }

    private Cookie obtainAuthenticatedCookie() throws Exception {
        when(jwtCacheService.isBlacklistJwtToken(anyString())).thenReturn(false);

        String testEmail = "system_user_" + System.currentTimeMillis() + "@lingomaster.vn";

        RegisterRequest registerReq = new RegisterRequest();
        registerReq.setEmail(testEmail);
        registerReq.setPassword("Password123!");
        registerReq.setFirstName("Thành");
        registerReq.setLastName("Lê");

        mockMvc.perform(post("/api/auth/register")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(registerReq)))
                .andExpect(status().isOk());

        LoginRequest loginReq = new LoginRequest();
        loginReq.setEmail(testEmail);
        loginReq.setPassword("Password123!");

        MvcResult loginResult = mockMvc.perform(post("/api/auth/login")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(loginReq)))
                .andExpect(status().isOk())
                .andReturn();

        return loginResult.getResponse().getCookie("auth_token");
    }

    @Test
    @DisplayName("E2E-SYSTEM-001: Luồng thực tế End-to-End: Đăng ký -> Lưu MySQL -> Đăng nhập -> Sinh JWT -> Lấy Profile qua Security Filter")
    void testEndToEnd_AuthAndUserProfileFlow() throws Exception {
        when(jwtCacheService.isBlacklistJwtToken(anyString())).thenReturn(false);

        String randomEmail = "system_test_" + System.currentTimeMillis() + "@lingomaster.vn";

        // 1. Gửi request đăng ký thật vào CSDL MySQL
        RegisterRequest registerReq = new RegisterRequest();
        registerReq.setEmail(randomEmail);
        registerReq.setPassword("Password123!");
        registerReq.setFirstName("Văn A");
        registerReq.setLastName("Nguyễn");

        mockMvc.perform(post("/api/auth/register")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(registerReq)))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.status").value(200))
                .andExpect(jsonPath("$.result.email").value(randomEmail));

        // Kiểm tra thực tế trong CSDL MySQL xem User đã được lưu chưa
        User savedUser = userRepository.findByEmail(randomEmail).orElse(null);
        assertThat(savedUser).isNotNull();
        assertThat(savedUser.getFirstName()).isEqualTo("Văn A");

        // 2. Gửi request đăng nhập thật
        LoginRequest loginReq = new LoginRequest();
        loginReq.setEmail(randomEmail);
        loginReq.setPassword("Password123!");

        MvcResult loginResult = mockMvc.perform(post("/api/auth/login")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(loginReq)))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.status").value(200))
                .andExpect(jsonPath("$.result.token").isNotEmpty())
                .andReturn();

        // 3. Lấy Cookie auth_token thật từ response
        Cookie authCookie = loginResult.getResponse().getCookie("auth_token");
        assertThat(authCookie).isNotNull();

        // 4. Dùng Cookie thật gọi endpoint bảo vệ /api/user/me qua chuỗi JwtAuthenticationFilter thật
        mockMvc.perform(get("/api/user/me")
                        .cookie(authCookie))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.status").value(200))
                .andExpect(jsonPath("$.result.email").value(randomEmail))
                .andExpect(jsonPath("$.result.firstName").value("Văn A"));
    }

    @Test
    @DisplayName("E2E-SYSTEM-002: Kiểm thử toàn hệ thống API Bảng xếp hạng (/api/leaderboard) với CSDL MySQL thật (Public API)")
    void testFullSystem_LeaderboardQuery() throws Exception {
        mockMvc.perform(get("/api/leaderboard?filter=vocab"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.status").value(200))
                .andExpect(jsonPath("$.result.filter").value("vocab"))
                .andExpect(jsonPath("$.result.rankings").isArray());
    }

    @Test
    @DisplayName("E2E-SYSTEM-003: Kiểm thử toàn hệ thống API Đề thi & Luyện đề (/api/exams) với Security Filter + MySQL")
    void testFullSystem_ExamsQuery() throws Exception {
        // Kiểm tra bảo mật: Không có JWT Token -> Spring Security chặn (Redirect OAuth2 302)
        mockMvc.perform(get("/api/exams"))
                .andExpect(status().is3xxRedirection());

        // Kiểm tra xác thực hợp lệ: Đăng nhập -> gửi Cookie JWT -> Lấy dữ liệu đề thi thành công từ MySQL
        Cookie authCookie = obtainAuthenticatedCookie();
        mockMvc.perform(get("/api/exams")
                        .cookie(authCookie))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.status").value(200))
                .andExpect(jsonPath("$.result").isArray());
    }

    @Test
    @DisplayName("E2E-SYSTEM-004: Kiểm thử toàn hệ thống API Bộ ngữ pháp (/api/grammar-sets) với Security Filter + MySQL")
    void testFullSystem_GrammarSetsQuery() throws Exception {
        // Không có token -> Bị chặn
        mockMvc.perform(get("/api/grammar-sets"))
                .andExpect(status().is3xxRedirection());

        // Có token -> Vượt qua filter và lấy danh sách thành công
        Cookie authCookie = obtainAuthenticatedCookie();
        mockMvc.perform(get("/api/grammar-sets")
                        .cookie(authCookie))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.status").value(200))
                .andExpect(jsonPath("$.result").isArray());
    }

    @Test
    @DisplayName("E2E-SYSTEM-005: Kiểm thử toàn hệ thống API Bộ thẻ từ vựng (/api/studyset) với Security Filter + MySQL")
    void testFullSystem_StudySetsQuery() throws Exception {
        // Không có token -> Bị chặn
        mockMvc.perform(get("/api/studyset"))
                .andExpect(status().is3xxRedirection());

        // Có token -> Vượt qua filter và lấy danh sách thành công
        Cookie authCookie = obtainAuthenticatedCookie();
        mockMvc.perform(get("/api/studyset")
                        .cookie(authCookie))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.status").value(200))
                .andExpect(jsonPath("$.result").isArray());
    }
}
