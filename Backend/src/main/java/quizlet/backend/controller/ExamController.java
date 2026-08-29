package quizlet.backend.controller;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.*;
import quizlet.backend.dto.res.APIResponse;
import quizlet.backend.dto.ExamAttemptDTO;
import quizlet.backend.dto.ExamDTO;
import quizlet.backend.enums.ExamType;
import quizlet.backend.enums.Mode;
import quizlet.backend.model.User;
import quizlet.backend.services.ExamService;

import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/exams")
public class ExamController {

    @Autowired
    private ExamService examService;

    @GetMapping
    public ResponseEntity<APIResponse<List<ExamDTO>>> getExams(@RequestParam(required = false) ExamType type) {
        List<ExamDTO> list = examService.getExamsByType(type);
        APIResponse<List<ExamDTO>> response = new APIResponse<>();
        response.setStatus(HttpStatus.OK.value());
        response.setMessage("Success");
        response.setResult(list);
        return ResponseEntity.ok(response);
    }

    @GetMapping("/practice")
    public ResponseEntity<APIResponse<List<ExamDTO>>> getPracticeExams() {
        return getExams(ExamType.PRACTICE);
    }

    @GetMapping("/mock")
    public ResponseEntity<APIResponse<List<ExamDTO>>> getMockExams() {
        return getExams(ExamType.FULL_TEST);
    }

    @GetMapping("/{id}")
    public ResponseEntity<APIResponse<ExamDTO>> getExamDetail(@PathVariable Long id) {
        ExamDTO exam = examService.getExamById(id);
        APIResponse<ExamDTO> response = new APIResponse<>();
        if (exam == null) {
            response.setStatus(HttpStatus.NOT_FOUND.value());
            response.setMessage("Không tìm thấy đề thi với ID: " + id);
            return ResponseEntity.status(HttpStatus.NOT_FOUND).body(response);
        }
        response.setStatus(HttpStatus.OK.value());
        response.setMessage("Success");
        response.setResult(exam);
        return ResponseEntity.ok(response);
    }

    // =========================================================================
    // 🌟 1. CÁC API POST ĐỂ NẠP DỮ LIỆU QUA POSTMAN (EXAM, SECTION, PASSAGE_GROUP, QUESTION)
    // =========================================================================

    // 1.1 POST /api/exams - Tạo Exam mới (hoặc import cả cây Section/PassageGroup/Question)
    @PostMapping
    public ResponseEntity<APIResponse<ExamDTO>> createExam(@RequestBody ExamDTO dto) {
        ExamDTO result = examService.createExam(dto);
        APIResponse<ExamDTO> response = new APIResponse<>();
        response.setStatus(HttpStatus.CREATED.value());
        response.setMessage("Tạo đề thi Exam thành công");
        response.setResult(result);
        return ResponseEntity.status(HttpStatus.CREATED).body(response);
    }

    // 1.2 POST /api/exams/sections - Tạo Section mới
    @PostMapping("/sections")
    public ResponseEntity<APIResponse<quizlet.backend.dto.SectionDTO>> createSection(@RequestBody quizlet.backend.dto.SectionDTO dto) {
        quizlet.backend.dto.SectionDTO result = examService.createSection(dto);
        APIResponse<quizlet.backend.dto.SectionDTO> response = new APIResponse<>();
        response.setStatus(HttpStatus.CREATED.value());
        response.setMessage("Tạo phần thi Section thành công");
        response.setResult(result);
        return ResponseEntity.status(HttpStatus.CREATED).body(response);
    }

    // 1.3 POST /api/exams/{examId}/sections - Tạo Section cho một Exam cụ thể
    @PostMapping("/{examId}/sections")
    public ResponseEntity<APIResponse<quizlet.backend.dto.SectionDTO>> createSectionForExam(
            @PathVariable Long examId,
            @RequestBody quizlet.backend.dto.SectionDTO dto
    ) {
        dto.setExamId(examId);
        quizlet.backend.dto.SectionDTO result = examService.createSection(dto);
        APIResponse<quizlet.backend.dto.SectionDTO> response = new APIResponse<>();
        response.setStatus(HttpStatus.CREATED.value());
        response.setMessage("Tạo Section cho Exam thành công");
        response.setResult(result);
        return ResponseEntity.status(HttpStatus.CREATED).body(response);
    }

    // 1.4 POST /api/exams/passage-groups - Tạo PassageGroup mới
    @PostMapping("/passage-groups")
    public ResponseEntity<APIResponse<quizlet.backend.dto.PassageGroupDTO>> createPassageGroup(@RequestBody quizlet.backend.dto.PassageGroupDTO dto) {
        quizlet.backend.dto.PassageGroupDTO result = examService.createPassageGroup(dto);
        APIResponse<quizlet.backend.dto.PassageGroupDTO> response = new APIResponse<>();
        response.setStatus(HttpStatus.CREATED.value());
        response.setMessage("Tạo nhóm đoạn văn / audio PassageGroup thành công");
        response.setResult(result);
        return ResponseEntity.status(HttpStatus.CREATED).body(response);
    }

    // 1.5 POST /api/exams/sections/{sectionId}/passage-groups - Tạo PassageGroup cho một Section cụ thể
    @PostMapping("/sections/{sectionId}/passage-groups")
    public ResponseEntity<APIResponse<quizlet.backend.dto.PassageGroupDTO>> createPassageGroupForSection(
            @PathVariable Integer sectionId,
            @RequestBody quizlet.backend.dto.PassageGroupDTO dto
    ) {
        dto.setSectionId(sectionId);
        quizlet.backend.dto.PassageGroupDTO result = examService.createPassageGroup(dto);
        APIResponse<quizlet.backend.dto.PassageGroupDTO> response = new APIResponse<>();
        response.setStatus(HttpStatus.CREATED.value());
        response.setMessage("Tạo PassageGroup cho Section thành công");
        response.setResult(result);
        return ResponseEntity.status(HttpStatus.CREATED).body(response);
    }

    // 1.6 POST /api/exams/questions - Tạo Question mới
    @PostMapping("/questions")
    public ResponseEntity<APIResponse<quizlet.backend.dto.QuestionDTO>> createQuestion(@RequestBody quizlet.backend.dto.QuestionDTO dto) {
        quizlet.backend.dto.QuestionDTO result = examService.createQuestion(dto);
        APIResponse<quizlet.backend.dto.QuestionDTO> response = new APIResponse<>();
        response.setStatus(HttpStatus.CREATED.value());
        response.setMessage("Tạo câu hỏi Question thành công");
        response.setResult(result);
        return ResponseEntity.status(HttpStatus.CREATED).body(response);
    }

    // 1.7 POST /api/exams/passage-groups/{groupId}/questions - Tạo Question cho một PassageGroup cụ thể
    @PostMapping("/passage-groups/{groupId}/questions")
    public ResponseEntity<APIResponse<quizlet.backend.dto.QuestionDTO>> createQuestionForGroup(
            @PathVariable Long groupId,
            @RequestBody quizlet.backend.dto.QuestionDTO dto
    ) {
        dto.setPassageGroupId(groupId);
        quizlet.backend.dto.QuestionDTO result = examService.createQuestion(dto);
        APIResponse<quizlet.backend.dto.QuestionDTO> response = new APIResponse<>();
        response.setStatus(HttpStatus.CREATED.value());
        response.setMessage("Tạo Question cho PassageGroup thành công");
        response.setResult(result);
        return ResponseEntity.status(HttpStatus.CREATED).body(response);
    }

    // 1.8 POST /api/exams/questions/bulk - Tạo danh sách câu hỏi hàng loạt
    @PostMapping("/questions/bulk")
    public ResponseEntity<APIResponse<List<quizlet.backend.dto.QuestionDTO>>> createQuestionsBulk(@RequestBody List<quizlet.backend.dto.QuestionDTO> dtos) {
        List<quizlet.backend.dto.QuestionDTO> result = examService.createQuestionsBulk(dtos);
        APIResponse<List<quizlet.backend.dto.QuestionDTO>> response = new APIResponse<>();
        response.setStatus(HttpStatus.CREATED.value());
        response.setMessage("Thêm danh sách câu hỏi hàng loạt thành công");
        response.setResult(result);
        return ResponseEntity.status(HttpStatus.CREATED).body(response);
    }

    // =========================================================================
    // 🌟 2. CÁC API DELETE ĐỂ TIỆN QUẢN LÝ / XÓA BẢN GHI QUA POSTMAN
    // =========================================================================

    @DeleteMapping("/{id}")
    public ResponseEntity<APIResponse<Void>> deleteExam(@PathVariable Long id) {
        examService.deleteExam(id);
        APIResponse<Void> response = new APIResponse<>();
        response.setStatus(HttpStatus.OK.value());
        response.setMessage("Xóa đề thi Exam thành công");
        return ResponseEntity.ok(response);
    }

    @DeleteMapping("/sections/{id}")
    public ResponseEntity<APIResponse<Void>> deleteSection(@PathVariable Integer id) {
        examService.deleteSection(id);
        APIResponse<Void> response = new APIResponse<>();
        response.setStatus(HttpStatus.OK.value());
        response.setMessage("Xóa phần thi Section thành công");
        return ResponseEntity.ok(response);
    }

    @DeleteMapping("/passage-groups/{id}")
    public ResponseEntity<APIResponse<Void>> deletePassageGroup(@PathVariable Long id) {
        examService.deletePassageGroup(id);
        APIResponse<Void> response = new APIResponse<>();
        response.setStatus(HttpStatus.OK.value());
        response.setMessage("Xóa nhóm đoạn văn PassageGroup thành công");
        return ResponseEntity.ok(response);
    }

    @DeleteMapping("/questions/{id}")
    public ResponseEntity<APIResponse<Void>> deleteQuestion(@PathVariable Long id) {
        examService.deleteQuestion(id);
        APIResponse<Void> response = new APIResponse<>();
        response.setStatus(HttpStatus.OK.value());
        response.setMessage("Xóa câu hỏi Question thành công");
        return ResponseEntity.ok(response);
    }
    @PostMapping("/{id}/attempt")
    public ResponseEntity<APIResponse<ExamAttemptDTO>> startAttempt(
            @PathVariable Long id,
            @RequestParam(defaultValue = "REAL_TEST") Mode mode,
            @AuthenticationPrincipal User user
    ) {
        APIResponse<ExamAttemptDTO> response = new APIResponse<>();
        try {
            Long userId = (user != null) ? user.getId() : null;
            ExamAttemptDTO attempt = examService.startExamAttempt(id, userId, mode);

            response.setStatus(HttpStatus.OK.value());
            response.setMessage("Kích hoạt lượt thi thành công");
            response.setResult(attempt);
            return ResponseEntity.ok(response);
        } catch (Exception ex) {
            ex.printStackTrace();
            response.setStatus(HttpStatus.INTERNAL_SERVER_ERROR.value());
            response.setMessage("Lỗi tạo lượt thi: " + ex.getMessage());
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).body(response);
        }
    }

    @PostMapping("/attempt/{attemptId}/submit")
    public ResponseEntity<APIResponse<ExamAttemptDTO>> submitAttempt(
            @PathVariable Long attemptId,
            @RequestBody Map<String, Object> body
    ) {
        APIResponse<ExamAttemptDTO> response = new APIResponse<>();
        try {
            Double totalScore = body.get("totalScore") != null ? Double.valueOf(body.get("totalScore").toString()) : 0.0;
            Integer totalTime = body.get("totalTime") != null ? Integer.valueOf(body.get("totalTime").toString()) : 0;
            String answerDetail = body.get("answerDetail") != null ? body.get("answerDetail").toString() : "{}";

            ExamAttemptDTO result = examService.submitExamAttempt(attemptId, totalScore, totalTime, answerDetail);

            response.setStatus(HttpStatus.OK.value());
            response.setMessage("Nộp bài thi thành công");
            response.setResult(result);
            return ResponseEntity.ok(response);
        } catch (Exception ex) {
            ex.printStackTrace();
            response.setStatus(HttpStatus.INTERNAL_SERVER_ERROR.value());
            response.setMessage("Lỗi nộp bài: " + ex.getMessage());
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).body(response);
        }
    }

    @GetMapping("/attempts/me")
    public ResponseEntity<APIResponse<List<ExamAttemptDTO>>> getMyAttempts(@AuthenticationPrincipal User user) {
        Long userId = (user != null) ? user.getId() : null;
        List<ExamAttemptDTO> list = examService.getUserAttempts(userId);

        APIResponse<List<ExamAttemptDTO>> response = new APIResponse<>();
        response.setStatus(HttpStatus.OK.value());
        response.setMessage("Success");
        response.setResult(list);
        return ResponseEntity.ok(response);
    }
}
