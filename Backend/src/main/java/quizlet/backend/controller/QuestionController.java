package quizlet.backend.controller;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import quizlet.backend.base.APIResponse;
import quizlet.backend.dto.QuestionDTO;
import quizlet.backend.services.QuestionService;

import java.util.List;

@RestController
@RequestMapping("/api/questions")
public class QuestionController {

    @Autowired
    private QuestionService questionService;

    // POST /api/questions
    @PostMapping
    public ResponseEntity<APIResponse<QuestionDTO>> createQuestion(@RequestBody QuestionDTO dto) {
        QuestionDTO result = questionService.createQuestion(dto);
        APIResponse<QuestionDTO> response = new APIResponse<>();
        response.setStatus(HttpStatus.CREATED.value());
        response.setMessage("Tạo Question thành công");
        response.setResult(result);
        return ResponseEntity.status(HttpStatus.CREATED).body(response);
    }

    // POST /api/questions/bulk
    @PostMapping("/bulk")
    public ResponseEntity<APIResponse<List<QuestionDTO>>> createQuestionsBulk(@RequestBody List<QuestionDTO> dtos) {
        List<QuestionDTO> result = questionService.createQuestionsBulk(dtos);
        APIResponse<List<QuestionDTO>> response = new APIResponse<>();
        response.setStatus(HttpStatus.CREATED.value());
        response.setMessage("Thêm danh sách câu hỏi Question hàng loạt thành công");
        response.setResult(result);
        return ResponseEntity.status(HttpStatus.CREATED).body(response);
    }

    @GetMapping("/{id}")
    public ResponseEntity<APIResponse<QuestionDTO>> getQuestionDetail(@PathVariable Long id) {
        QuestionDTO q = questionService.getQuestionById(id);
        APIResponse<QuestionDTO> response = new APIResponse<>();
        if (q == null) {
            response.setStatus(HttpStatus.NOT_FOUND.value());
            response.setMessage("Không tìm thấy Question với ID: " + id);
            return ResponseEntity.status(HttpStatus.NOT_FOUND).body(response);
        }
        response.setStatus(HttpStatus.OK.value());
        response.setMessage("Success");
        response.setResult(q);
        return ResponseEntity.ok(response);
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<APIResponse<Void>> deleteQuestion(@PathVariable Long id) {
        questionService.deleteQuestion(id);
        APIResponse<Void> response = new APIResponse<>();
        response.setStatus(HttpStatus.OK.value());
        response.setMessage("Xóa Question thành công");
        return ResponseEntity.ok(response);
    }
}
