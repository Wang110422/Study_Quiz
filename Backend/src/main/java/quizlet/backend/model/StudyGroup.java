package quizlet.backend.model;

import com.fasterxml.jackson.annotation.JsonIgnore;
import jakarta.persistence.*;
import lombok.Data;
import lombok.EqualsAndHashCode;
import lombok.ToString;

import java.time.LocalDateTime;
import java.util.HashSet;
import java.util.Set;

@Entity
@Data
@Table(name = "study_group")
public class StudyGroup {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(nullable = false)
    private String name;

    @Column(columnDefinition = "TEXT")
    private String description;

    @Column(unique = true, nullable = false)
    private String joinCode; // Mã mời nhóm duy nhất (Ví dụ: GRP-7K92M)

    private LocalDateTime createdAt = LocalDateTime.now();

    private Boolean isDel = false;

    // Sinh viên tạo nhóm học
    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "creator_id", nullable = false)
    @ToString.Exclude
    @EqualsAndHashCode.Exclude
    private User creator;

    // Danh sách thành viên sinh viên trong nhóm
    @ManyToMany
    @JoinTable(
            name = "study_group_members",
            joinColumns = @JoinColumn(name = "group_id"),
            inverseJoinColumns = @JoinColumn(name = "user_id")
    )
    @ToString.Exclude
    @EqualsAndHashCode.Exclude
    private Set<User> members = new HashSet<>();

    // Danh sách các bộ từ vựng gắn vào nhóm
    @ManyToMany
    @JoinTable(
            name = "study_group_studysets",
            joinColumns = @JoinColumn(name = "group_id"),
            inverseJoinColumns = @JoinColumn(name = "studyset_id")
    )
    @ToString.Exclude
    @EqualsAndHashCode.Exclude
    private Set<StudySet> studySets = new HashSet<>();

    // Danh sách các thư mục gắn vào nhóm
    @ManyToMany
    @JoinTable(
            name = "study_group_folders",
            joinColumns = @JoinColumn(name = "group_id"),
            inverseJoinColumns = @JoinColumn(name = "folder_id")
    )
    @ToString.Exclude
    @EqualsAndHashCode.Exclude
    private Set<Folder> folders = new HashSet<>();
}
