package quizlet.backend.dto.req;

import lombok.Data;

@Data
public class LoginRequest {
    private String email;
    private String password;
}
