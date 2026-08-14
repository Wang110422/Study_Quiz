package quizlet.backend.services;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import quizlet.backend.authe.JwtTokenProvider;
import quizlet.backend.dto.AuthResponse;
import quizlet.backend.dto.LoginRequest;
import quizlet.backend.dto.RegisterRequest;
import quizlet.backend.model.User;
import quizlet.backend.repository.UserRepository;

import java.util.Optional;

@Service
public class UserService {
    @Autowired
    private UserRepository userRepository;

    @Autowired
    private JwtTokenProvider jwtTokenProvider;

    public Optional<User> getUser(String email) {
        return userRepository.findByEmail(email);
    }

    public Optional<User> getUserById(Long id) {
        return userRepository.findById(id);
    }

    public User createOrUpdateUser(String email, String name, String accessToken) {
        Optional<User> user = userRepository.findByEmail(email);
        User u;
        if (user.isPresent()) {
            u = user.get();
            u.setFirstName(name);
            u.setGoogle_access_token(accessToken);
        } else {
            u = new User();
            u.setGoogle_access_token(accessToken);
            u.setEmail(email);
            u.setFirstName(name);
        }
        return userRepository.save(u);
    }

    public void upadateRefreshToken(Long userId, String refreshToken) {
        if (refreshToken == null || refreshToken.isEmpty()) {
            return;
        } else {
            userRepository.findById(userId).ifPresent(user -> {
                user.setGoogle_refresh_token(refreshToken);
                userRepository.save(user);
            });
        }
    }

    public AuthResponse register(RegisterRequest request, PasswordEncoder passwordEncoder) {
        if (userRepository.findByEmail(request.getEmail()).isPresent()) {
            throw new RuntimeException("Email đã được sử dụng!");
        }

        User user = new User();
        user.setEmail(request.getEmail());
        user.setPassword(passwordEncoder.encode(request.getPassword()));
        user.setFirstName(request.getFirstName());
        user.setLastName(request.getLastName());
        if (request.getRole() != null) {
            user.setRole(request.getRole());
        }

        User savedUser = userRepository.save(user);
        String token = jwtTokenProvider.generateToken(savedUser.getId(), savedUser.getEmail());

        return AuthResponse.builder()
                .token(token)
                .tokenType("Bearer")
                .userId(savedUser.getId())
                .email(savedUser.getEmail())
                .firstName(savedUser.getFirstName())
                .lastName(savedUser.getLastName())
                .build();
    }

    public AuthResponse login(LoginRequest request, PasswordEncoder passwordEncoder) {
        User user = userRepository.findByEmail(request.getEmail())
                .orElseThrow(() -> new RuntimeException("Email hoặc mật khẩu không chính xác!"));

        if (user.getPassword() == null || !passwordEncoder.matches(request.getPassword(), user.getPassword())) {
            throw new RuntimeException("Email hoặc mật khẩu không chính xác!");
        }

        String token = jwtTokenProvider.generateToken(user.getId(), user.getEmail());

        return AuthResponse.builder()
                .token(token)
                .tokenType("Bearer")
                .userId(user.getId())
                .email(user.getEmail())
                .firstName(user.getFirstName())
                .lastName(user.getLastName())
                .build();
    }
}
