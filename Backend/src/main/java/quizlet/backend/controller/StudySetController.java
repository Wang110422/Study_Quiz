package quizlet.backend.controller;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.*;
import quizlet.backend.dto.res.APIResponse;
import quizlet.backend.dto.StudySetDTO;
import quizlet.backend.model.User;
import quizlet.backend.services.StudySetService;

import java.util.List;

@RestController
@RequestMapping("/api/studyset")
public class StudySetController {
    @Autowired
    private StudySetService studySetService;

    @GetMapping
    public ResponseEntity<APIResponse<List<StudySetDTO>>> getAllStudySets() {
        List<StudySetDTO> studySets = studySetService.getAllStudySets();

        APIResponse<List<StudySetDTO>> response = new APIResponse<>();
        response.setStatus(HttpStatus.OK.value());
        response.setMessage("Success");
        response.setResult(studySets);
        return ResponseEntity.ok(response);
    }

    @GetMapping("/all")
    public ResponseEntity<APIResponse<List<StudySetDTO>>> getAllStudySetsEndpoint() {
        return getAllStudySets();
    }

    @GetMapping("/user")
    public ResponseEntity<APIResponse<List<StudySetDTO>>> getStudySetsByUser(@AuthenticationPrincipal User user) {
        APIResponse<List<StudySetDTO>> response = new APIResponse<>();
        if (user == null) {
            response.setStatus(HttpStatus.UNAUTHORIZED.value());
            response.setMessage("Chưa đăng nhập");
            return ResponseEntity.status(HttpStatus.UNAUTHORIZED).body(response);
        }
        List<StudySetDTO> studySets = studySetService.getAllByUserId(user.getId());
        response.setStatus(HttpStatus.OK.value());
        response.setMessage("Success");
        response.setResult(studySets);
        return ResponseEntity.ok(response);
    }

    @GetMapping("/folder/{folderId}")
    public ResponseEntity<APIResponse<List<StudySetDTO>>> getStudySetsByFolderId(@PathVariable Long folderId) {
        List<StudySetDTO> studySets = studySetService.getAllByFolderId(folderId);

        APIResponse<List<StudySetDTO>> response = new APIResponse<>();
        response.setStatus(HttpStatus.OK.value());
        response.setMessage("Success");
        response.setResult(studySets);
        return ResponseEntity.ok(response);
    }

    @GetMapping("/folder-name/{folderName}")
    public ResponseEntity<APIResponse<List<StudySetDTO>>> getStudySetsByFolderName(@PathVariable String folderName) {
        List<StudySetDTO> studySets = studySetService.getAllByFolderName(folderName);

        APIResponse<List<StudySetDTO>> response = new APIResponse<>();
        response.setStatus(HttpStatus.OK.value());
        response.setMessage("Success");
        response.setResult(studySets);
        return ResponseEntity.ok(response);
    }

    @PostMapping
    public ResponseEntity<APIResponse<StudySetDTO>> createStudySet(@AuthenticationPrincipal User user, @RequestBody StudySetDTO studySetDTO) {
        if (user == null) {
            APIResponse<StudySetDTO> response = new APIResponse<>();
            response.setStatus(HttpStatus.UNAUTHORIZED.value());
            response.setMessage("Chưa đăng nhập");
            return ResponseEntity.status(HttpStatus.UNAUTHORIZED).body(response);
        }

        StudySetDTO created = studySetService.createStudySet(studySetDTO, user);

        APIResponse<StudySetDTO> response = new APIResponse<>();
        response.setStatus(HttpStatus.CREATED.value());
        response.setMessage("Tạo bộ từ vựng thành công");
        response.setResult(created);
        return ResponseEntity.ok(response);
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<APIResponse<Boolean>> deleteStudySet(@PathVariable Long id) {
        boolean deleted = studySetService.softDeleteStudySet(id);
        APIResponse<Boolean> response = new APIResponse<>();
        response.setStatus(HttpStatus.OK.value());
        response.setMessage(deleted ? "Đã xóa bộ từ vựng thành công" : "Xóa thất bại");
        response.setResult(deleted);
        return ResponseEntity.ok(response);
    }
}
