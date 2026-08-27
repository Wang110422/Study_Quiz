package quizlet.backend.controller;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.*;
import quizlet.backend.base.APIResponse;
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
