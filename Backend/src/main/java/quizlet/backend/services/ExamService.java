package quizlet.backend.services;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import quizlet.backend.dto.*;
import quizlet.backend.enums.ExamType;
import quizlet.backend.enums.Mode;
import quizlet.backend.enums.SkillType;
import quizlet.backend.model.*;
import quizlet.backend.repository.ExamAttemptRepository;
import quizlet.backend.repository.ExamRepository;
import quizlet.backend.repository.UserRepository;

import java.time.LocalDateTime;
import java.util.Collections;
import java.util.List;
import java.util.stream.Collectors;

@Service
public class ExamService {

    @Autowired
    private ExamRepository examRepository;

    @Autowired
    private ExamAttemptRepository examAttemptRepository;

    @Autowired
    private UserRepository userRepository;

    @Transactional(readOnly = true)
    public List<ExamDTO> getExamsByType(ExamType type) {
        List<Exam> exams = (type != null) ? examRepository.findByType(type) : examRepository.findAll();
        return exams.stream().map(this::mapToOverviewDTO).collect(Collectors.toList());
    }

    @Transactional(readOnly = true)
    public ExamDTO getExamById(Long id) {
        Exam exam = examRepository.findById(id).orElse(null);
        if (exam == null) return null;
        return mapToDetailDTO(exam);
    }

    @Transactional
    public ExamAttemptDTO startExamAttempt(Long examId, Long userId, Mode mode) {
        Exam exam = examRepository.findById(examId)
                .orElseThrow(() -> new RuntimeException("Không tìm thấy đề thi với id: " + examId));

        User user = null;
        if (userId != null) {
            user = userRepository.findById(userId).orElse(null);
        }
        if (user == null) {
            user = userRepository.findAll().stream().findFirst().orElse(null);
        }

        ExamAttempt attempt = new ExamAttempt();
        attempt.setExam(exam);
        attempt.setUser(user);
        attempt.setMode(mode != null ? mode : Mode.REAL_TEST);
        attempt.setStartTime(LocalDateTime.now());
        attempt.setTotalTime(0);
        attempt.setTotalScore(0.0);
        attempt.setAnswerDetail("{}");
        System.out.println("Starting exam attempt " + attempt.toString());
        ExamAttempt saved = examAttemptRepository.save(attempt);

        return ExamAttemptDTO.builder()
                .id(saved.getId())
                .examId(exam.getId())
                .examTitle(exam.getTitle())
                .mode(saved.getMode())
                .startTime(saved.getStartTime())
                .build();
    }

    @Transactional
    public ExamAttemptDTO submitExamAttempt(Long attemptId, Double totalScore, Integer totalTimeSeconds, String answerDetail) {
        ExamAttempt attempt = examAttemptRepository.findById(attemptId)
                .orElseThrow(() -> new RuntimeException("Không tìm thấy lượt thi với id: " + attemptId));

        attempt.setEndTime(LocalDateTime.now());
        attempt.setTotalScore(totalScore != null ? totalScore : 0.0);
        attempt.setTotalTime(totalTimeSeconds != null ? totalTimeSeconds : 0);
        attempt.setAnswerDetail(answerDetail);

        ExamAttempt saved = examAttemptRepository.save(attempt);

        return ExamAttemptDTO.builder()
                .id(saved.getId())
                .examId(saved.getExam() != null ? saved.getExam().getId() : null)
                .examTitle(saved.getExam() != null ? saved.getExam().getTitle() : "")
                .mode(saved.getMode())
                .totalScore(saved.getTotalScore())
                .totalTime(saved.getTotalTime())
                .answerDetail(saved.getAnswerDetail())
                .startTime(saved.getStartTime())
                .endTime(saved.getEndTime())
                .build();
    }

    @Transactional(readOnly = true)
    public List<ExamAttemptDTO> getUserAttempts(Long userId) {
        List<ExamAttempt> list;
        if (userId != null) {
            list = examAttemptRepository.findByUserIdOrderByStartTimeDesc(userId);
        } else {
            list = examAttemptRepository.findAllByOrderByStartTimeDesc();
        }
        return list.stream().map(a -> ExamAttemptDTO.builder()
                .id(a.getId())
                .examId(a.getExam() != null ? a.getExam().getId() : null)
                .examTitle(a.getExam() != null ? a.getExam().getTitle() : "")
                .mode(a.getMode())
                .totalScore(a.getTotalScore())
                .totalTime(a.getTotalTime())
                .startTime(a.getStartTime())
                .endTime(a.getEndTime())
                .build()
        ).collect(Collectors.toList());
    }

    private ExamDTO mapToOverviewDTO(Exam exam) {
        int sectionCount = exam.getSections() != null ? exam.getSections().size() : 0;
        int totalQuestions = 0;
        SkillType primarySkill = null;

        if (exam.getSections() != null && !exam.getSections().isEmpty()) {
            primarySkill = exam.getSections().get(0).getSkill();
            for (Section s : exam.getSections()) {
                totalQuestions += calculateQuestions(s);
            }
        }

        List<SectionDTO> sectionDTOs = Collections.emptyList();
        if (exam.getSections() != null) {
            sectionDTOs = exam.getSections().stream().map(s -> SectionDTO.builder()
                    .id(s.getId())
                    .title(s.getTitle())
                    .skill(s.getSkill())
                    .orderIndex(s.getOrderIndex())
                    .questionCount(calculateQuestions(s))
                    .minutes(exam.getTotalMinutes() != null && sectionCount > 0 ? exam.getTotalMinutes() / sectionCount : 15)
                    .build()
            ).collect(Collectors.toList());
        }

        return ExamDTO.builder()
                .id(exam.getId())
                .title(exam.getTitle())
                .description("Bộ đề thi chuẩn format quốc tế, kiểm tra kỹ năng và phân tích điểm mạnh yếu.")
                .totalMinutes(exam.getTotalMinutes() != null ? exam.getTotalMinutes() : 60)
                .totalScore(exam.getTotalScore() != null ? exam.getTotalScore() : 100)
                .type(exam.getType())
                .primarySkill(primarySkill)
                .sectionCount(sectionCount)
                .totalQuestions(totalQuestions)
                .sections(sectionDTOs)
                .build();
    }

    private ExamDTO mapToDetailDTO(Exam exam) {
        List<SectionDTO> sectionDTOs = Collections.emptyList();

        if (exam.getSections() != null) {
            sectionDTOs = exam.getSections().stream().map(s -> {
                List<PassageGroupDTO> pDTOs = Collections.emptyList();
                if (s.getPassageGroups() != null) {
                    pDTOs = s.getPassageGroups().stream().map(p -> {
                        List<QuestionDTO> qDTOs = Collections.emptyList();
                        if (p.getQuestions() != null) {
                            qDTOs = p.getQuestions().stream().map(q -> QuestionDTO.builder()
                                    .id(q.getId())
                                    .content(q.getContent())
                                    .answer(q.getAnswer())
                                    .correctAnswer(q.getCorrectAnswer())
                                    .explanation(q.getExplanation())
                                    .score(q.getScore())
                                    .orderIndex(q.getOrderIndex())
                                    .build()
                            ).collect(Collectors.toList());
                        }

                        return PassageGroupDTO.builder()
                                .id(p.getId())
                                .title(p.getTitle())
                                .passageText(p.getPassageText())
                                .mediaUrl(p.getMediaUrl())
                                .orderIndex(p.getOrderIndex())
                                .toeicPart(p.getToeicPart())
                                .questions(qDTOs)
                                .build();
                    }).collect(Collectors.toList());
                }

                int sQuestions = pDTOs.stream().mapToInt(p -> p.getQuestions() != null ? p.getQuestions().size() : 0).sum();

                return SectionDTO.builder()
                        .id(s.getId())
                        .title(s.getTitle())
                        .skill(s.getSkill())
                        .orderIndex(s.getOrderIndex())
                        .questionCount(sQuestions)
                        .minutes(exam.getTotalMinutes() != null && exam.getSections().size() > 0 ? exam.getTotalMinutes() / exam.getSections().size() : 15)
                        .passageGroups(pDTOs)
                        .build();
            }).collect(Collectors.toList());
        }

        int finalTotalQuestions = sectionDTOs.stream().mapToInt(s -> s.getQuestionCount() != null ? s.getQuestionCount() : 0).sum();

        return ExamDTO.builder()
                .id(exam.getId())
                .title(exam.getTitle())
                .description("Bộ đề thi chuẩn format quốc tế, kiểm tra kỹ năng và phân tích điểm mạnh yếu.")
                .totalMinutes(exam.getTotalMinutes() != null ? exam.getTotalMinutes() : 60)
                .totalScore(exam.getTotalScore() != null ? exam.getTotalScore() : 100)
                .type(exam.getType())
                .sectionCount(sectionDTOs.size())
                .totalQuestions(finalTotalQuestions)
                .sections(sectionDTOs)
                .build();
    }

    private int calculateQuestions(Section s) {
        if (s.getPassageGroups() == null) return 0;
        return s.getPassageGroups().stream()
                .mapToInt(p -> p.getQuestions() != null ? p.getQuestions().size() : 0)
                .sum();
    }
}
