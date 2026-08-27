package quizlet.backend.model;


import com.fasterxml.jackson.annotation.JsonIgnore;
import jakarta.persistence.*;
import lombok.Data;
import lombok.EqualsAndHashCode;
import lombok.ToString;
import org.hibernate.annotations.CreationTimestamp;

import java.time.LocalDateTime;
import java.util.List;

@Data
@Entity
@Table(name = "grammar_set")
public class GrammarSet {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(nullable = false)
    private String tilte;

    @Column(columnDefinition = "TEXT")
    private String description;

    @Column(nullable = false, unique = true)
    private String slug;

    @Column(name = "is_del")
    private Boolean isDel = false;

    @CreationTimestamp
    private LocalDateTime createdAt;

   @OneToMany(mappedBy = "grammarSet", cascade = CascadeType.ALL, orphanRemoval = true)
   @ToString.Exclude
   @EqualsAndHashCode.Exclude
    private List<Grammar> grammars;

    @ManyToOne
    @JoinColumn(name = "folder_id")
    @JsonIgnore
    @ToString.Exclude
    @EqualsAndHashCode.Exclude
    private Folder folder;

    @ManyToOne
    @JoinColumn(name = "user_id")
    @JsonIgnore
    @ToString.Exclude
    @EqualsAndHashCode.Exclude
    private User user;
}
