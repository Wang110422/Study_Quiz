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
    private SectionService sectionService;

    @Autowired
    private PassageGroupService passageGroupService;

    @Autowired
    private QuestionService questionService;

    @Autowired
    private ExamAttemptRepository examAttemptRepository;

    @Autowired
    private UserRepository userRepository;

    // =========================================================================
    // 🌟 1. CÁC PHƯƠNG THỨC POST ĐỂ THÊM DỮ LIỆU THẬT QUA POSTMAN
    // =========================================================================

    @Transactional
    public ExamDTO createExam(ExamDTO dto) {
        Exam exam = new Exam();
        exam.setTitle(dto.getTitle());
        exam.setTotalMinutes(dto.getTotalMinutes() != null ? dto.getTotalMinutes() : 120);
        exam.setTotalScore(dto.getTotalScore() != null ? dto.getTotalScore() : 100);
        exam.setType(dto.getType() != null ? dto.getType() : ExamType.FULL_TEST);
        exam.setCreatedAt(LocalDateTime.now());

        Exam savedExam = examRepository.save(exam);

        if (dto.getSections() != null && !dto.getSections().isEmpty()) {
            for (SectionDTO sDto : dto.getSections()) {
                sDto.setExamId(savedExam.getId());
                sectionService.createSectionForExam(sDto, savedExam);
            }
        }

        return getExamById(savedExam.getId());
    }

    @Transactional
    public SectionDTO createSection(SectionDTO dto) {
        return sectionService.createSection(dto);
    }

    @Transactional
    public PassageGroupDTO createPassageGroup(PassageGroupDTO dto) {
        return passageGroupService.createPassageGroup(dto);
    }

    @Transactional
    public QuestionDTO createQuestion(QuestionDTO dto) {
        return questionService.createQuestion(dto);
    }

    @Transactional
    public List<QuestionDTO> createQuestionsBulk(List<QuestionDTO> dtos) {
        return questionService.createQuestionsBulk(dtos);
    }

    // =========================================================================
    // 🌟 2. CÁC PHƯƠNG THỨC DELETE ĐỂ DỄ DÀNG QUẢN LÝ QUA POSTMAN
    // =========================================================================

    @Transactional
    public void deleteExam(Long id) {
        examRepository.deleteById(id);
    }

    @Transactional
    public void deleteSection(Integer id) {
        sectionService.deleteSection(id);
    }

    @Transactional
    public void deletePassageGroup(Long id) {
        passageGroupService.deletePassageGroup(id);
    }

    @Transactional
    public void deleteQuestion(Long id) {
        questionService.deleteQuestion(id);
    }

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
    public ExamAttemptDTO submitExamAttempt(Long attemptId, Double manualScore, Integer totalTimeSeconds, String rawAnswerDetail) {
        ExamAttempt attempt = examAttemptRepository.findById(attemptId)
                .orElseThrow(() -> new RuntimeException("Không tìm thấy lượt thi với id: " + attemptId));

        Exam exam = attempt.getExam();
        com.fasterxml.jackson.databind.ObjectMapper mapper = new com.fasterxml.jackson.databind.ObjectMapper();

        // 1. Phân tích danh sách câu trả lời của thí sinh (rawAnswerDetail)
        java.util.Map<String, String> userAnswersMap = new java.util.HashMap<>();
        if (rawAnswerDetail != null && !rawAnswerDetail.trim().isEmpty() && !rawAnswerDetail.equals("{}")) {
            try {
                com.fasterxml.jackson.databind.JsonNode rootNode = mapper.readTree(rawAnswerDetail);
                if (rootNode.has("userAnswers") && rootNode.get("userAnswers").isObject()) {
                    rootNode = rootNode.get("userAnswers");
                }
                if (rootNode.isObject()) {
                    java.util.Iterator<java.util.Map.Entry<String, com.fasterxml.jackson.databind.JsonNode>> fields = rootNode.fields();
                    while (fields.hasNext()) {
                        java.util.Map.Entry<String, com.fasterxml.jackson.databind.JsonNode> field = fields.next();
                        if (field.getValue().isTextual()) {
                            userAnswersMap.put(field.getKey(), field.getValue().asText());
                        } else {
                            userAnswersMap.put(field.getKey(), field.getValue().toString());
                        }
                    }
                }
            } catch (Exception ex) {
                System.out.println("Could not parse rawAnswerDetail as JSON map: " + ex.getMessage());
            }
        }

        // 2. Lấy toàn bộ câu hỏi trong đề thi và sắp xếp chuẩn theo orderIndex của Section -> PassageGroup -> Question
        List<Question> allQuestions = new java.util.ArrayList<>();
        if (exam != null && exam.getSections() != null) {
            List<Section> sortedSections = new java.util.ArrayList<>(exam.getSections());
            sortedSections.sort(java.util.Comparator.comparing(s -> s.getOrderIndex() != null ? s.getOrderIndex() : 999));

            for (Section s : sortedSections) {
                if (s.getPassageGroups() != null) {
                    List<PassageGroup> sortedPgs = new java.util.ArrayList<>(s.getPassageGroups());
                    sortedPgs.sort(java.util.Comparator.comparing(p -> p.getOrderIndex() != null ? p.getOrderIndex() : 999));

                    for (PassageGroup pg : sortedPgs) {
                        if (pg.getQuestions() != null) {
                            List<Question> sortedQs = new java.util.ArrayList<>(pg.getQuestions());
                            sortedQs.sort(java.util.Comparator.comparing(q -> q.getOrderIndex() != null ? q.getOrderIndex() : 999));
                            allQuestions.addAll(sortedQs);
                        }
                    }
                }
            }
        }

        // 3. Tiến hành đối chiếu đáp án và cộng trực tiếp score của từng câu làm đúng (mỗi câu = 5 điểm)
        int totalQuestions = allQuestions.size();
        int correctCount = 0;
        int wrongCount = 0;
        int unansweredCount = 0;
        double totalEarnedScore = 0.0;

        List<java.util.Map<String, Object>> details = new java.util.ArrayList<>();

        for (Question q : allQuestions) {
            String qIdStr = q.getId().toString();
            String userAns = userAnswersMap.get(qIdStr);
            String correctAns = q.getCorrectAnswer();
            double qScore = (q.getScore() != null && q.getScore() > 0) ? q.getScore() : 5.0;

            boolean isCorrect = false;
            if (userAns != null && !userAns.trim().isEmpty()) {
                isCorrect = checkAnswerMatch(userAns, correctAns);
                if (isCorrect) {
                    correctCount++;
                    totalEarnedScore += qScore; // Cộng dồn trực tiếp score của câu hỏi (5 điểm mỗi câu)
                } else {
                    wrongCount++;
                }
            } else {
                unansweredCount++;
            }

            java.util.Map<String, Object> item = new java.util.HashMap<>();
            item.put("questionId", q.getId());
            item.put("orderIndex", q.getOrderIndex());
            item.put("userAnswer", userAns != null ? userAns : "");
            item.put("correctAnswer", correctAns != null ? correctAns : "");
            item.put("isCorrect", isCorrect);
            item.put("score", isCorrect ? qScore : 0.0);
            item.put("explanation", q.getExplanation() != null ? q.getExplanation() : "");
            details.add(item);
        }

        // 4. Tổng điểm chính thức = Tổng điểm các câu làm đúng (Số nguyên chuẩn TOEIC)
        double finalCalculatedScore;
        if (totalQuestions > 0) {
            finalCalculatedScore = Math.round(totalEarnedScore);
        } else if (manualScore != null && manualScore > 0) {
            finalCalculatedScore = Math.round(manualScore);
        } else {
            finalCalculatedScore = 0.0;
        }

        // 5. Đóng gói kết quả chấm bài chi tiết vào answerDetail JSON
        java.util.Map<String, Object> resultSummary = new java.util.HashMap<>();
        resultSummary.put("totalQuestions", totalQuestions);
        resultSummary.put("correctCount", correctCount);
        resultSummary.put("wrongCount", wrongCount);
        resultSummary.put("unansweredCount", unansweredCount);
        resultSummary.put("accuracyPercentage", totalQuestions > 0
                ? Math.round(((double) correctCount / totalQuestions) * 1000.0) / 10.0 : 0.0);
        resultSummary.put("totalScore", finalCalculatedScore);
        resultSummary.put("userAnswers", userAnswersMap);
        resultSummary.put("details", details);

        String finalAnswerDetailJson = "{}";
        try {
            finalAnswerDetailJson = mapper.writeValueAsString(resultSummary);
        } catch (Exception ex) {
            finalAnswerDetailJson = rawAnswerDetail;
        }

        // 6. Lưu kết quả chấm bài vào CSDL
        attempt.setEndTime(LocalDateTime.now());
        attempt.setTotalScore(finalCalculatedScore);
        attempt.setTotalTime(totalTimeSeconds != null ? totalTimeSeconds : 0);
        attempt.setAnswerDetail(finalAnswerDetailJson);

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

    private boolean checkAnswerMatch(String userAns, String correctAns) {
        if (userAns == null || correctAns == null) return false;
        String u = userAns.trim();
        String c = correctAns.trim();

        if (u.equalsIgnoreCase(c)) return true;

        // So khớp theo ký tự tiền tố (A), (B), (C), (D) hoặc A, B, C, D
        String uPrefix = extractChoicePrefix(u);
        String cPrefix = extractChoicePrefix(c);
        if (!uPrefix.isEmpty() && !cPrefix.isEmpty() && uPrefix.equalsIgnoreCase(cPrefix)) {
            return true;
        }

        return false;
    }

    private String extractChoicePrefix(String text) {
        if (text == null || text.isEmpty()) return "";
        String trimmed = text.trim();
        // Nhận diện dạng "(A)", "(B)", "(C)", "(D)"
        if (trimmed.length() >= 3 && trimmed.startsWith("(") && trimmed.charAt(2) == ')') {
            return String.valueOf(trimmed.charAt(1)).toUpperCase();
        }
        // Nhận diện dạng "A.", "B.", "C.", "D." hoặc "A)", "B)"
        if (trimmed.length() >= 2 && Character.isLetter(trimmed.charAt(0)) && (trimmed.charAt(1) == '.' || trimmed.charAt(1) == ')')) {
            return String.valueOf(trimmed.charAt(0)).toUpperCase();
        }
        // Nếu chỉ có đúng 1 ký tự A, B, C, D
        if (trimmed.length() == 1 && Character.isLetter(trimmed.charAt(0))) {
            return trimmed.toUpperCase();
        }
        return "";
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
            List<Section> sortedSections = new java.util.ArrayList<>(exam.getSections());
            sortedSections.sort(java.util.Comparator.comparing(s -> s.getOrderIndex() != null ? s.getOrderIndex() : 999));
            primarySkill = sortedSections.get(0).getSkill();
            for (Section s : sortedSections) {
                totalQuestions += calculateQuestions(s);
            }
        }

        List<SectionDTO> sectionDTOs = Collections.emptyList();
        if (exam.getSections() != null) {
            sectionDTOs = exam.getSections().stream()
                    .sorted(java.util.Comparator.comparing(s -> s.getOrderIndex() != null ? s.getOrderIndex() : 999))
                    .map(s -> SectionDTO.builder()
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
                .totalScore(exam.getTotalScore() != null ? exam.getTotalScore() : 500)
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
            sectionDTOs = exam.getSections().stream()
                    .sorted(java.util.Comparator.comparing(s -> s.getOrderIndex() != null ? s.getOrderIndex() : 999))
                    .map(s -> {
                        List<PassageGroupDTO> pDTOs = Collections.emptyList();
                        if (s.getPassageGroups() != null) {
                            pDTOs = s.getPassageGroups().stream()
                                    .sorted(java.util.Comparator.comparing(p -> p.getOrderIndex() != null ? p.getOrderIndex() : 999))
                                    .map(p -> {
                                        List<QuestionDTO> qDTOs = Collections.emptyList();
                                        if (p.getQuestions() != null) {
                                            qDTOs = p.getQuestions().stream()
                                                    .sorted(java.util.Comparator.comparing(q -> q.getOrderIndex() != null ? q.getOrderIndex() : 999))
                                                    .map(q -> QuestionDTO.builder()
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
                                                .imageUrl(p.getImageUrl())
                                                .audioUrl(p.getAudioUrl())
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
                .totalScore(exam.getTotalScore() != null ? exam.getTotalScore() : 500)
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
