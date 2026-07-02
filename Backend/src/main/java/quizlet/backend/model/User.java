package quizlet.backend.model;

import jakarta.persistence.*;
import lombok.Data;
import java.util.List;

@Entity
@Data
@Table(name = "user")
public class User {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id ;

    private String firstName;

    private String lastName;

    @Column(unique = true,nullable = false)
    private String email;

    @Column
    private String password;

    @Column(columnDefinition = "TEXT")
    private String google_access_token;

    @Column(columnDefinition = "TEXT")
    private String google_refresh_token;

    @OneToMany(mappedBy = "user")
    private List<StudySet> studySets;
}
