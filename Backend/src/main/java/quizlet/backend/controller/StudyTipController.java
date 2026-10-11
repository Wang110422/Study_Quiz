package quizlet.backend.controller;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;
import quizlet.backend.dto.ExamDTO;
import quizlet.backend.dto.StudyTipDTO;
import quizlet.backend.dto.res.APIResponse;
import quizlet.backend.enums.ExamType;
import quizlet.backend.enums.SkillType;
import quizlet.backend.services.StudyTipService;

import java.util.List;

@RestController
@RequestMapping("/api/study-tips")
public class StudyTipController {

    @Autowired
    private StudyTipService studyTipService;

    @GetMapping
    @PreAuthorize("hasAnyRole('STUDENT', 'TEACHER', 'ADMIN')")
    public ResponseEntity<APIResponse<List<StudyTipDTO>>> getStudyTips(
            @RequestParam(required = false) ExamType examType,
            @RequestParam(required = false) SkillType skill) {
        List<StudyTipDTO> list = studyTipService.getStudyTips(examType, skill);
        APIResponse<List<StudyTipDTO>> response = new APIResponse<>();
        response.setStatus(HttpStatus.OK.value());
        response.setMessage("Success");
        response.setResult(list);
        return ResponseEntity.ok(response);
    }

    @GetMapping("/{id}")
    @PreAuthorize("hasAnyRole('STUDENT', 'TEACHER', 'ADMIN')")
    public ResponseEntity<APIResponse<StudyTipDTO>> getStudyTipById(@PathVariable Long id) {
        StudyTipDTO dto = studyTipService.getStudyTipById(id);
        APIResponse<StudyTipDTO> response = new APIResponse<>();
        if (dto == null) {
            response.setStatus(HttpStatus.NOT_FOUND.value());
            response.setMessage("Không tìm thấy mẹo học với ID: " + id);
            return ResponseEntity.status(HttpStatus.NOT_FOUND).body(response);
        }
        response.setStatus(HttpStatus.OK.value());
        response.setMessage("Success");
        response.setResult(dto);
        return ResponseEntity.ok(response);
    }

    @GetMapping("/{id}/exams")
    @PreAuthorize("hasAnyRole('STUDENT', 'TEACHER', 'ADMIN')")
    public ResponseEntity<APIResponse<List<ExamDTO>>> getExamsByStudyTipId(@PathVariable Long id) {
        List<ExamDTO> exams = studyTipService.getExamsByStudyTipId(id);
        APIResponse<List<ExamDTO>> response = new APIResponse<>();
        response.setStatus(HttpStatus.OK.value());
        response.setMessage("Success");
        response.setResult(exams);
        return ResponseEntity.ok(response);
    }

    @PostMapping
    @PreAuthorize("hasAnyRole('TEACHER', 'ADMIN')")
    public ResponseEntity<APIResponse<StudyTipDTO>> createStudyTip(@RequestBody StudyTipDTO req) {
        StudyTipDTO created = studyTipService.createStudyTip(req);
        APIResponse<StudyTipDTO> response = new APIResponse<>();
        response.setStatus(HttpStatus.CREATED.value());
        response.setMessage("Tạo mẹo học thành công");
        response.setResult(created);
        return ResponseEntity.status(HttpStatus.CREATED).body(response);
    }

    @PutMapping("/{id}")
    @PreAuthorize("hasAnyRole('TEACHER', 'ADMIN')")
    public ResponseEntity<APIResponse<StudyTipDTO>> updateStudyTip(
            @PathVariable Long id,
            @RequestBody StudyTipDTO req) {
        StudyTipDTO updated = studyTipService.updateStudyTip(id, req);
        APIResponse<StudyTipDTO> response = new APIResponse<>();
        if (updated == null) {
            response.setStatus(HttpStatus.NOT_FOUND.value());
            response.setMessage("Không tìm thấy mẹo học để cập nhật");
            return ResponseEntity.status(HttpStatus.NOT_FOUND).body(response);
        }
        response.setStatus(HttpStatus.OK.value());
        response.setMessage("Cập nhật mẹo học thành công");
        response.setResult(updated);
        return ResponseEntity.ok(response);
    }

    @DeleteMapping("/{id}")
    @PreAuthorize("hasAnyRole('TEACHER', 'ADMIN')")
    public ResponseEntity<APIResponse<Void>> deleteStudyTip(@PathVariable Long id) {
        studyTipService.deleteStudyTip(id);
        APIResponse<Void> response = new APIResponse<>();
        response.setStatus(HttpStatus.OK.value());
        response.setMessage("Xóa mẹo học thành công");
        return ResponseEntity.ok(response);
    }

    @PostMapping("/{id}/exams/{examId}")
    @PreAuthorize("hasAnyRole('TEACHER', 'ADMIN')")
    public ResponseEntity<APIResponse<StudyTipDTO>> addExamToStudyTip(
            @PathVariable Long id,
            @PathVariable Long examId) {
        StudyTipDTO updated = studyTipService.addExamToStudyTip(id, examId);
        APIResponse<StudyTipDTO> response = new APIResponse<>();
        if (updated == null) {
            response.setStatus(HttpStatus.NOT_FOUND.value());
            response.setMessage("Không tìm thấy mẹo học với ID: " + id);
            return ResponseEntity.status(HttpStatus.NOT_FOUND).body(response);
        }
        response.setStatus(HttpStatus.OK.value());
        response.setMessage("Thêm bài thi vào mẹo học thành công");
        response.setResult(updated);
        return ResponseEntity.ok(response);
    }

    @PostMapping("/{id}/exams")
    @PreAuthorize("hasAnyRole('TEACHER', 'ADMIN')")
    public ResponseEntity<APIResponse<StudyTipDTO>> addExamsToStudyTip(
            @PathVariable Long id,
            @RequestBody List<Long> examIds) {
        StudyTipDTO updated = studyTipService.addExamsToStudyTip(id, examIds);
        APIResponse<StudyTipDTO> response = new APIResponse<>();
        if (updated == null) {
            response.setStatus(HttpStatus.NOT_FOUND.value());
            response.setMessage("Không tìm thấy mẹo học với ID: " + id);
            return ResponseEntity.status(HttpStatus.NOT_FOUND).body(response);
        }
        response.setStatus(HttpStatus.OK.value());
        response.setMessage("Thêm danh sách bài thi vào mẹo học thành công");
        response.setResult(updated);
        return ResponseEntity.ok(response);
    }

    @DeleteMapping("/{id}/exams/{examId}")
    @PreAuthorize("hasAnyRole('TEACHER', 'ADMIN')")
    public ResponseEntity<APIResponse<StudyTipDTO>> removeExamFromStudyTip(
            @PathVariable Long id,
            @PathVariable Long examId) {
        StudyTipDTO updated = studyTipService.removeExamFromStudyTip(id, examId);
        APIResponse<StudyTipDTO> response = new APIResponse<>();
        if (updated == null) {
            response.setStatus(HttpStatus.NOT_FOUND.value());
            response.setMessage("Không tìm thấy mẹo học với ID: " + id);
            return ResponseEntity.status(HttpStatus.NOT_FOUND).body(response);
        }
        response.setStatus(HttpStatus.OK.value());
        response.setMessage("Xóa bài thi khỏi mẹo học thành công");
        response.setResult(updated);
        return ResponseEntity.ok(response);
    }
}
