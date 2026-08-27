package quizlet.backend.controller;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.*;
import quizlet.backend.base.APIResponse;
import quizlet.backend.dto.CreatePathRequest;
import quizlet.backend.dto.UpdateProgressRequest;
import quizlet.backend.model.StudyPath;
import quizlet.backend.model.StudyPathItem;
import quizlet.backend.model.User;
import quizlet.backend.services.StudyPathService;

import java.util.List;

@RestController
@RequestMapping("/api/paths")
public class StudyPathController {

    @Autowired
    private StudyPathService studyPathService;

    @GetMapping("/user")
    public ResponseEntity<APIResponse<List<StudyPath>>> getUserPaths(@AuthenticationPrincipal User user) {
        APIResponse<List<StudyPath>> response = new APIResponse<>();
        if (user == null) {
            response.setStatus(HttpStatus.UNAUTHORIZED.value());
            response.setMessage("Chưa đăng nhập");
            return ResponseEntity.status(HttpStatus.UNAUTHORIZED).body(response);
        }

        List<StudyPath> paths = studyPathService.getUserPaths(user.getId());
        response.setStatus(HttpStatus.OK.value());
        response.setMessage("Success");
        response.setResult(paths);
        return ResponseEntity.ok(response);
    }

    @GetMapping("/{id}")
    public ResponseEntity<APIResponse<StudyPath>> getPathById(@PathVariable Long id) {
        APIResponse<StudyPath> response = new APIResponse<>();
        StudyPath path = studyPathService.getPathById(id);
        if (path == null) {
            response.setStatus(HttpStatus.NOT_FOUND.value());
            response.setMessage("Không tìm thấy lộ trình học");
            return ResponseEntity.status(HttpStatus.NOT_FOUND).body(response);
        }
        response.setStatus(HttpStatus.OK.value());
        response.setMessage("Success");
        response.setResult(path);
        return ResponseEntity.ok(response);
    }

    @PostMapping
    public ResponseEntity<APIResponse<StudyPath>> createPath(
            @AuthenticationPrincipal User user,
            @RequestBody CreatePathRequest request) {

        APIResponse<StudyPath> response = new APIResponse<>();
        if (user == null) {
            response.setStatus(HttpStatus.UNAUTHORIZED.value());
            response.setMessage("Chưa đăng nhập");
            return ResponseEntity.status(HttpStatus.UNAUTHORIZED).body(response);
        }

        StudyPath path = studyPathService.createPath(user, request);
        response.setStatus(HttpStatus.CREATED.value());
        response.setMessage("Tạo lộ trình học thành công");
        response.setResult(path);
        return ResponseEntity.status(HttpStatus.CREATED).body(response);
    }

    @GetMapping("/items/{itemId}")
    public ResponseEntity<APIResponse<StudyPathItem>> getItemById(@PathVariable Long itemId) {
        APIResponse<StudyPathItem> response = new APIResponse<>();
        StudyPathItem item = studyPathService.getItemById(itemId);
        if (item == null) {
            response.setStatus(HttpStatus.NOT_FOUND.value());
            response.setMessage("Không tìm thấy mốc lộ trình");
            return ResponseEntity.status(HttpStatus.NOT_FOUND).body(response);
        }

        response.setStatus(HttpStatus.OK.value());
        response.setMessage("Success");
        response.setResult(item);
        return ResponseEntity.ok(response);
    }

    @PostMapping("/items/{itemId}/progress")
    public ResponseEntity<APIResponse<StudyPathItem>> updateItemProgress(
            @PathVariable Long itemId,
            @RequestBody UpdateProgressRequest request) {

        APIResponse<StudyPathItem> response = new APIResponse<>();
        StudyPathItem updatedItem = studyPathService.updateItemProgress(itemId, request.getMode());
        if (updatedItem == null) {
            response.setStatus(HttpStatus.NOT_FOUND.value());
            response.setMessage("Không tìm thấy mốc lộ trình");
            return ResponseEntity.status(HttpStatus.NOT_FOUND).body(response);
        }

        response.setStatus(HttpStatus.OK.value());
        response.setMessage("Cập nhật tiến trình mốc bộ thẻ thành công");
        response.setResult(updatedItem);
        return ResponseEntity.ok(response);
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<APIResponse<String>> deletePath(
            @AuthenticationPrincipal User user,
            @PathVariable Long id) {

        APIResponse<String> response = new APIResponse<>();
        if (user == null) {
            response.setStatus(HttpStatus.UNAUTHORIZED.value());
            response.setMessage("Chưa đăng nhập");
            return ResponseEntity.status(HttpStatus.UNAUTHORIZED).body(response);
        }

        boolean deleted = studyPathService.deletePath(id, user.getId());
        if (!deleted) {
            response.setStatus(HttpStatus.BAD_REQUEST.value());
            response.setMessage("Không thể xóa lộ trình này");
            return ResponseEntity.status(HttpStatus.BAD_REQUEST).body(response);
        }

        response.setStatus(HttpStatus.OK.value());
        response.setMessage("Đã xóa lộ trình thành công");
        response.setResult("DELETED");
        return ResponseEntity.ok(response);
    }
}
