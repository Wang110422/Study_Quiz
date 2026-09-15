package quizlet.backend.enums;

import jakarta.persistence.*;
import lombok.Data;

@Data
@Entity
@Table(name = "phase_task")
public class PhaseTask {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    private String title;

    @Enumerated(EnumType.STRING)
    private TaskType taskType; // nhiệm vụ cho từng task ví dụ task từ vựng , task ngữ pháp , task luyện tập , task thi

    private Long targetId; // id của từng nhóm từ vựng , từng bài thi liên kết với

    private Integer orderIndex; // thus tự 
}
