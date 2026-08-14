package quizlet.backend.dto;

import lombok.Data;
import quizlet.backend.enums.Role;
import quizlet.backend.enums.ThemePreference;
import quizlet.backend.enums.LanguagePreference;

@Data
public class UserDTO {
    private Long id;
    private String firstName;
    private String lastName;
    private String email;
    private Role role; // STUDENT, TEACHER, ADMIN
    private String avatarUrl;
    private String bio;
    private ThemePreference themePreference; // LIGHT, DARK, SYSTEM
    private LanguagePreference languagePreference; // VI, EN, JA, KO
    private Boolean reminderEnabled;
    private String reminderTime;
}
