package quizlet.backend.controller;

import io.jsonwebtoken.Claims;
import jakarta.servlet.http.Cookie;
import jakarta.servlet.http.HttpServletRequest;
import org.springframework.http.HttpHeaders;
import org.springframework.http.ResponseCookie;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.web.bind.annotation.*;
import quizlet.backend.dto.res.AuthResponse;
import quizlet.backend.dto.req.LoginRequest;
import quizlet.backend.dto.req.RegisterRequest;
import quizlet.backend.model.User;
import quizlet.backend.security.jwt.JwtTokenProvider;
import quizlet.backend.services.JwtCacheService;
import quizlet.backend.services.UserService;

import java.util.Map;

@RestController
@RequestMapping("/api/auth")
public class AuthController {

    @Autowired
    private UserService userService;

    @Autowired
    private PasswordEncoder passwordEncoder;

    @Autowired
    private JwtTokenProvider jwtTokenProvider;

    @Autowired
    private JwtCacheService jwtCacheService;

    @PostMapping("/register")
    public ResponseEntity<?> register(@RequestBody RegisterRequest request) {
        try {
            AuthResponse response = userService.register(request, passwordEncoder);
            ResponseCookie cookie = userService.generateCookie(response.getToken());
            return ResponseEntity.ok()
                    .header(HttpHeaders.SET_COOKIE, cookie.toString())
                    .body(Map.of(
                            "status", 200,
                            "message", "Đăng ký thành công",
                            "result", response
                    ));
        } catch (Exception e) {
            return ResponseEntity.badRequest().body(Map.of(
                    "status", 400,
                    "message", e.getMessage()
            ));
        }
    }

    @PostMapping("/login")
    public ResponseEntity<?> login(@RequestBody LoginRequest request) {
        try {
            AuthResponse response = userService.login(request, passwordEncoder);
            ResponseCookie cookie = userService.generateCookie(response.getToken());
            return ResponseEntity.ok()
                    .header(HttpHeaders.SET_COOKIE, cookie.toString())
                    .body(Map.of(
                            "status", 200,
                            "message", "Đăng nhập thành công",
                            "result", response
                    ));
        } catch (Exception e) {
            return ResponseEntity.badRequest().body(Map.of(
                    "status", 400,
                    "message", e.getMessage()
            ));
        }
    }

    @PostMapping("/refresh-token")
    public ResponseEntity<?> refreshToken(jakarta.servlet.http.HttpServletRequest request) {
        try {
            String token = null;
            if (request.getCookies() != null) {
                for (jakarta.servlet.http.Cookie c : request.getCookies()) {
                    if ("auth_token".equals(c.getName())) {
                        token = c.getValue();
                        break;
                    }
                }
            }
            if (token == null || !jwtTokenProvider.validateToken(token)) {
                return ResponseEntity.status(401).body(Map.of(
                        "status", 401,
                        "message", "Token không hợp lệ hoặc đã hết hạn"
                ));
            }

            String email = jwtTokenProvider.getEmailFromToken(token);
            User user = userService.getUser(email)
                    .orElseThrow(() -> new RuntimeException("Người dùng không tồn tại"));

            String newToken = jwtTokenProvider.generateToken(user.getId(), user.getEmail());
            System.out.println("newToken:"+newToken);
            ResponseCookie cookie = userService.generateCookie(newToken);

            AuthResponse response = AuthResponse.builder()
                    .token(newToken)
                    .tokenType("Bearer")
                    .userId(user.getId())
                    .email(user.getEmail())
                    .firstName(user.getFirstName())
                    .lastName(user.getLastName())
                    .build();

            return ResponseEntity.ok()
                    .header(HttpHeaders.SET_COOKIE, cookie.toString())
                    .body(Map.of(
                            "status", 200,
                            "message", "Làm mới token thành công",
                            "result", response
                    ));
        } catch (Exception e) {
            return ResponseEntity.badRequest().body(Map.of(
                    "status", 400,
                    "message", e.getMessage()
            ));
        }
    }

    @PostMapping("/logout")
    public ResponseEntity<?> logout(HttpServletRequest request) {
        try {
            ResponseCookie cookie = userService.cleanCookie();
            String token = null;
            if (request.getCookies() != null) {
                for (Cookie c : request.getCookies()) {
                    if ("auth_token".equals(c.getName())) {
                        token = c.getValue();
                        break;
                    }
                }
            }
            if(token != null && !token.isBlank()) {
                jwtCacheService.blackListJwtToken(token);
                System.out.println("token:"+token);
            }
            return ResponseEntity.ok()
                    .header(HttpHeaders.SET_COOKIE, cookie.toString())
                    .body(Map.of(
                            "status", 200,
                            "message", "Đăng xuất thành công"
                    ));
        } catch (Exception e) {
            return ResponseEntity.badRequest().body(Map.of(
                    "status", 400,
                    "message", e.getMessage()
            ));
        }
    }

    @GetMapping("/me")
    @PreAuthorize("hasAnyRole('STUDENT', 'TEACHER', 'ADMIN')")
    public ResponseEntity<?> getCurrentUser() {
        Authentication authentication = SecurityContextHolder.getContext().getAuthentication();
        if (authentication == null || !(authentication.getPrincipal() instanceof User)) {
            return ResponseEntity.status(401).body(Map.of(
                    "status", 401,
                    "message", "Chưa đăng nhập hoặc token không hợp lệ"
            ));
        }

        User user = (User) authentication.getPrincipal();
        return ResponseEntity.ok(Map.of(
                "status", 200,
                "message", "Lấy thông tin người dùng thành công",
                "result", Map.of(
                        "id", user.getId(),
                        "email", user.getEmail(),
                        "firstName", user.getFirstName() != null ? user.getFirstName() : "",
                        "lastName", user.getLastName() != null ? user.getLastName() : "",
                        "role", user.getRole() != null ? user.getRole().name() : "STUDENT"
                )
        ));
    }
}
