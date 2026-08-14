package quizlet.backend.authe;

import jakarta.servlet.ServletException;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.security.core.Authentication;
import org.springframework.security.oauth2.client.OAuth2AuthorizedClient;
import org.springframework.security.oauth2.client.OAuth2AuthorizedClientService;
import org.springframework.security.oauth2.client.authentication.OAuth2AuthenticationToken;
import org.springframework.security.web.authentication.SimpleUrlAuthenticationSuccessHandler;
import org.springframework.stereotype.Component;
import org.springframework.web.util.UriComponentsBuilder;
import quizlet.backend.model.User;
import quizlet.backend.repository.UserRepository;
import quizlet.backend.services.UserService;

import java.io.IOException;
import java.util.Optional;

@Component
public class OAuth2AuthenticationSuccessHandler extends SimpleUrlAuthenticationSuccessHandler {

    @Autowired
    private JwtTokenProvider jwtTokenProvider;

    @Autowired
    private UserRepository userRepository;

    @Autowired
    private UserService userService;

    @Autowired
    private OAuth2AuthorizedClientService authorizedClientService;

    @Override
    public void onAuthenticationSuccess(HttpServletRequest request, HttpServletResponse response, Authentication authentication)
            throws IOException, ServletException {

        OAuth2AuthenticationToken authToken = (OAuth2AuthenticationToken) authentication;
        CustomOAuth2User principal = (CustomOAuth2User) authToken.getPrincipal();

        OAuth2AuthorizedClient client = authorizedClientService.loadAuthorizedClient(
                authToken.getAuthorizedClientRegistrationId(),
                authToken.getName()
        );

        if (client != null && client.getRefreshToken() != null) {
            String refreshToken = client.getRefreshToken().getTokenValue();
            userService.upadateRefreshToken(principal.getUserId(), refreshToken);
        }

        Optional<User> userOptional = userRepository.findById(principal.getUserId());
        if (userOptional.isEmpty()) {
            response.sendRedirect("http://localhost:5173/login?error=user_not_found");
            return;
        }

        User user = userOptional.get();
        String token = jwtTokenProvider.generateToken(user.getId(), user.getEmail());

        // Set Cookie auth_token cho trình duyệt
        jakarta.servlet.http.Cookie cookie = new jakarta.servlet.http.Cookie("auth_token", token);
        cookie.setPath("/");
        cookie.setHttpOnly(false);
        cookie.setMaxAge(864000);
        response.addCookie(cookie);

        String targetUrl = UriComponentsBuilder.fromUriString("http://localhost:5173/oauth2/redirect")
                .queryParam("token", token)
                .build().toUriString();

        getRedirectStrategy().sendRedirect(request, response, targetUrl);
    }
}
