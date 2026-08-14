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
@Table(name = "school_class")
public class SchoolClass {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(nullable = false)
    private String name;

    @Column(columnDefinition = "TEXT")
    private String description;

    @Column(unique = true, nullable = false)
    private String joinCode; // Mã tham gia duy nhất (Ví dụ: CLASS-8X92A)

    private LocalDateTime createdAt = LocalDateTime.now();

    private Boolean isDel = false;

    // Giáo viên quản lý lớp
    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "teacher_id", nullable = false)
    @ToString.Exclude
    @EqualsAndHashCode.Exclude
    private User teacher;

    // Danh sách các sinh viên trong lớp
    @ManyToMany
    @JoinTable(
            name = "school_class_students",
            joinColumns = @JoinColumn(name = "class_id"),
            inverseJoinColumns = @JoinColumn(name = "student_id")
    )
    @ToString.Exclude
    @EqualsAndHashCode.Exclude
    private Set<User> students = new HashSet<>();

    // Danh sách các bộ từ vựng gắn vào lớp
    @ManyToMany
    @JoinTable(
            name = "school_class_studysets",
            joinColumns = @JoinColumn(name = "class_id"),
            inverseJoinColumns = @JoinColumn(name = "studyset_id")
    )
    @ToString.Exclude
    @EqualsAndHashCode.Exclude
    private Set<StudySet> studySets = new HashSet<>();

    // Danh sách các thư mục gắn vào lớp
    @ManyToMany
    @JoinTable(
            name = "school_class_folders",
            joinColumns = @JoinColumn(name = "class_id"),
            inverseJoinColumns = @JoinColumn(name = "folder_id")
    )
    @ToString.Exclude
    @EqualsAndHashCode.Exclude
    private Set<Folder> folders = new HashSet<>();
}
