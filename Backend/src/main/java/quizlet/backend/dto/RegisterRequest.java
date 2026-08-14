package quizlet.backend.dto;

import lombok.Data;
import quizlet.backend.enums.Role;

@Data
public class RegisterRequest {
    private String email;
    private String password;
    private String firstName;
    private String lastName;
    private Role role; // STUDENT, TEACHER
}
