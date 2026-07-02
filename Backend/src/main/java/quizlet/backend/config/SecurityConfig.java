package quizlet.backend.config;


import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.security.config.annotation.web.builders.HttpSecurity;
import org.springframework.security.config.annotation.web.configuration.EnableWebSecurity;
import org.springframework.security.core.Authentication;
import org.springframework.security.oauth2.client.OAuth2AuthorizedClient;
import org.springframework.security.oauth2.client.OAuth2AuthorizedClientService;
import org.springframework.security.oauth2.client.authentication.OAuth2AuthenticationToken;
import org.springframework.security.oauth2.core.user.OAuth2User;
import org.springframework.security.web.SecurityFilterChain;
import org.springframework.security.web.authentication.AuthenticationSuccessHandler;
import quizlet.backend.model.User;
import quizlet.backend.repository.UserRepository;

import java.io.IOException;
import java.util.Optional;

@Configuration
@EnableWebSecurity
public class SecurityConfig {
    private final UserRepository userRepository;
    private final OAuth2AuthorizedClientService authorizedClientService;

    public SecurityConfig(UserRepository userRepository, OAuth2AuthorizedClientService authorizedClientService) {
        this.userRepository = userRepository;
        this.authorizedClientService = authorizedClientService;
        System.out.println("Tao chạy nè");
    }
@Bean
    public SecurityFilterChain securityFilterChain(HttpSecurity http) throws Exception {
        http
                .csrf(x -> x.disable()) // Tắt CSRF để frontend gọi được
                .authorizeHttpRequests(authur -> authur
                        .requestMatchers("/").permitAll()
                        .anyRequest().authenticated())
                .oauth2Login(oauth2 -> oauth2
                        .successHandler(new AuthenticationSuccessHandler() {
                            @Override
                            public void onAuthenticationSuccess(HttpServletRequest request, HttpServletResponse response, Authentication authentication) throws IOException {
                                OAuth2AuthenticationToken authToken = (OAuth2AuthenticationToken) authentication;
                                OAuth2User oauth2User = authToken.getPrincipal();

                                String email = oauth2User.getAttribute("email");
                                String name = oauth2User.getAttribute("name");

                                OAuth2AuthorizedClient client = authorizedClientService.loadAuthorizedClient(
                                        authToken.getAuthorizedClientRegistrationId(),
                                        authToken.getName()
                                );
                                String accessToken = (client !=null) ? client.getAccessToken().getTokenValue() : null;
                                String refreshToken = (client !=null && client.getRefreshToken()!=null) ? client.getRefreshToken().getTokenValue() : null;
                                Optional<User> existUser = userRepository.findByEmail(email);
                                if (existUser.isEmpty()) {
                                    User user = new User();
                                    user.setEmail(email);
                                    user.setFirstName(name);
                                    user.setGoogle_access_token(accessToken);
                                    user.setGoogle_refresh_token(refreshToken);
                                    userRepository.save(user);
                                    System.out.println("User with email " + email + " has been registered");
                                } else {
                                    User user = existUser.get();
                                    user.setFirstName(name);
                                    if (accessToken != null) {
                                        user.setGoogle_access_token(accessToken);
                                    }
                                    if (refreshToken != null) {
                                        user.setGoogle_refresh_token(refreshToken);
                                    }
                                    userRepository.save(user);
                                    System.out.println("🔄 Đã cập nhật Access Token mới cho: " + email);
                                }
                                response.sendRedirect("http://localhost:5173/studyset");
                            }
                        })
                );
        return http.build();
    }
}
