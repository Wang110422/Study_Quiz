package quizlet.backend.security.oauth2;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.security.oauth2.client.userinfo.DefaultOAuth2UserService;
import org.springframework.security.oauth2.client.userinfo.OAuth2UserRequest;
import org.springframework.security.oauth2.core.OAuth2AuthenticationException;
import org.springframework.security.oauth2.core.user.OAuth2User;
import org.springframework.stereotype.Service;
import quizlet.backend.model.User;
import quizlet.backend.services.UserService;

@Service
public class CustomOAuth2UserService extends DefaultOAuth2UserService {

    @Autowired
    private UserService userService;
    @Override
    public OAuth2User loadUser(OAuth2UserRequest userRequest) throws OAuth2AuthenticationException {
        OAuth2User oauth2User = super.loadUser(userRequest);
        String email = oauth2User.getAttributes().get("email").toString();
        String name = oauth2User.getAttributes().get("name").toString();
        String accessToken = userRequest.getAccessToken().getTokenValue();

        User user = userService.createOrUpdateUser(email,name,accessToken);
        return new CustomOAuth2User(user.getId(), oauth2User.getAttributes());
    }
}
