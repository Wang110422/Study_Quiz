package quizlet.backend.config;

import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.security.config.annotation.web.builders.HttpSecurity;
import org.springframework.security.config.annotation.web.configuration.EnableWebSecurity;
import org.springframework.security.config.http.SessionCreationPolicy;
import org.springframework.security.crypto.bcrypt.BCryptPasswordEncoder;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.security.web.SecurityFilterChain;
import org.springframework.security.web.authentication.UsernamePasswordAuthenticationFilter;
import org.springframework.web.cors.CorsConfiguration;
import org.springframework.web.cors.CorsConfigurationSource;
import org.springframework.web.cors.UrlBasedCorsConfigurationSource;
import quizlet.backend.security.oauth2.CustomOAuth2UserService;
import quizlet.backend.security.jwt.JwtAuthenticationFilter;
import quizlet.backend.security.oauth2.OAuth2AuthenticationSuccessHandler;

import java.util.List;

import org.springframework.security.config.annotation.method.configuration.EnableMethodSecurity;
import quizlet.backend.security.oauth2.HttpCookieOAuth2AuthorizationRequestRepository;

@Configuration
@EnableWebSecurity
@EnableMethodSecurity
public class SecurityConfig {

    private final CustomOAuth2UserService customOAuth2UserService;
    private final OAuth2AuthenticationSuccessHandler oAuth2AuthenticationSuccessHandler;
    private final JwtAuthenticationFilter jwtAuthenticationFilter;
    private final HttpCookieOAuth2AuthorizationRequestRepository cookieAuthorizationRequestRepository;

    public SecurityConfig(CustomOAuth2UserService customOAuth2UserService,
            OAuth2AuthenticationSuccessHandler oAuth2AuthenticationSuccessHandler,
            JwtAuthenticationFilter jwtAuthenticationFilter,
            HttpCookieOAuth2AuthorizationRequestRepository cookieAuthorizationRequestRepository) {
        this.customOAuth2UserService = customOAuth2UserService;
        this.oAuth2AuthenticationSuccessHandler = oAuth2AuthenticationSuccessHandler;
        this.jwtAuthenticationFilter = jwtAuthenticationFilter;
        this.cookieAuthorizationRequestRepository = cookieAuthorizationRequestRepository;
    }

    @Bean
    public PasswordEncoder passwordEncoder() {
        return new BCryptPasswordEncoder();
    }

    @Bean
    public SecurityFilterChain securityFilterChain(HttpSecurity http) throws Exception {
        http
                // 1. Kiem tra cors và tắt csrf
                .cors(cors -> cors.configurationSource(corsConfigurationSource()))
                .csrf(csrf -> csrf.disable())
                // 2 . Tat che do không lưu session (Stateless) như sessionId
                .sessionManagement(session -> session.sessionCreationPolicy(SessionCreationPolicy.STATELESS))
                // 3. Xác thực danh tính qua Google Oauth2
                .oauth2Login(oauth2 -> oauth2
                        .authorizationEndpoint(authorization -> authorization
                                .authorizationRequestRepository(cookieAuthorizationRequestRepository))
                        // 3.2 Khi xác thực thành công thi trả ve đối tuong DefaultOauth2User --> custom
                        // lại thêm role
                        .userInfoEndpoint(userInfo -> userInfo.userService(customOAuth2UserService))
                        // 3.3 Đăng nhập thành công lưu google accesstoken với tao JWT token lưu vào DB
                        .successHandler(oAuth2AuthenticationSuccessHandler)
                        // 3.4 Thất bại thì trả về
                        .failureHandler((request, response, exception) -> {
                            response.sendRedirect("http://localhost:5173/login?error="
                                    + java.net.URLEncoder.encode(exception.getMessage(), "UTF-8"));
                        }))
                // 4. Xác thực JWT token filter trước xác thực tài khoản mật khẩu
                .addFilterBefore(jwtAuthenticationFilter, UsernamePasswordAuthenticationFilter.class)
                // 5. Phân quyen người dùng ví dụ student - api/student , teacher - api/teacher
                .authorizeHttpRequests(auth -> auth
                        .requestMatchers("/", "/api/auth/**", "/oauth2/**", "/login/oauth2/**", "/error",
                                "/api/leaderboard")
                        .permitAll()
                        .anyRequest().authenticated());
        return http.build();
    }

    @Bean
    public CorsConfigurationSource corsConfigurationSource() {
        CorsConfiguration configuration = new CorsConfiguration();
        configuration.setAllowedOriginPatterns(List.of("http://localhost:*", "https://study-quiz-3.onrender.com",
                "https://study-quiz-3.onrender.com:*", "chrome-extension://*"));
        configuration.setAllowedMethods(List.of("GET", "POST", "PUT", "DELETE", "OPTIONS", "PATCH"));
        configuration.setAllowedHeaders(List.of("Authorization", "Content-Type", "X-Requested-With"));
        configuration.setAllowCredentials(true);

        UrlBasedCorsConfigurationSource source = new UrlBasedCorsConfigurationSource();
        source.registerCorsConfiguration("/**", configuration);
        return source;
    }
}
