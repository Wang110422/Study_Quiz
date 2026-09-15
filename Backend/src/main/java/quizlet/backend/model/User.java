package quizlet.backend.model;

import com.fasterxml.jackson.annotation.JsonIgnore;
import jakarta.persistence.*;
import lombok.Data;
import lombok.EqualsAndHashCode;
import lombok.ToString;

import java.util.Collection;
import java.util.List;

import org.springframework.security.core.GrantedAuthority;
import org.springframework.security.core.authority.SimpleGrantedAuthority;
import org.springframework.security.core.userdetails.UserDetails;
import quizlet.backend.enums.Role;
import quizlet.backend.enums.ThemePreference;
import quizlet.backend.enums.LanguagePreference;

@Entity
@Data
@Table(name = "user")
public class User implements UserDetails{
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    private String firstName;

    private String lastName;

    @Column(unique = true, nullable = false)
    private String email;

    @Column
    @JsonIgnore
    private String password;

    @Column(columnDefinition = "TEXT")
    @JsonIgnore
    private String google_access_token;

    @Column(columnDefinition = "TEXT")
    @JsonIgnore
    private String google_refresh_token;

    @Column(columnDefinition = "TEXT")
    private String sheetId;

    @Enumerated(EnumType.STRING)
    @Column(nullable = false)
    private Role role = Role.STUDENT;

    @Column
    private String avatarUrl;

    @Column
    private String bio;

    @Enumerated(EnumType.STRING)
    @Column(nullable = false)
    private ThemePreference themePreference = ThemePreference.LIGHT;

    @Enumerated(EnumType.STRING)
    @Column(nullable = false)
    private LanguagePreference languagePreference = LanguagePreference.VI;

    @Column
    private Boolean reminderEnabled = false;

    @Column
    private String reminderTime = "20:00";

    @Override
    public Collection<? extends GrantedAuthority> getAuthorities() {
        return List.of(new SimpleGrantedAuthority(role.name()));
    }

    @Override
    public String getUsername() {
        return this.email;
    }
}
