package quizlet.backend.controller;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.*;
import quizlet.backend.dto.RoadmapDTO;
import quizlet.backend.dto.req.CreateRoadmapRequest;
import quizlet.backend.dto.req.UpdateTaskProgressRequest;
import quizlet.backend.dto.res.APIResponse;
import quizlet.backend.model.Roadmap;
import quizlet.backend.model.User;
import quizlet.backend.model.UserTaskProgress;
import quizlet.backend.services.RoadmapService;

import java.util.List;

@RestController
@RequestMapping("/api/roadmaps")
public class RoadmapController {

    @Autowired
    private RoadmapService roadmapService;

    @GetMapping
    @PreAuthorize("hasAnyRole('STUDENT', 'TEACHER', 'ADMIN')")
    public ResponseEntity<APIResponse<List<RoadmapDTO>>> getAllRoadmaps(@AuthenticationPrincipal User user) {
        APIResponse<List<RoadmapDTO>> response = new APIResponse<>();
        List<RoadmapDTO> list = roadmapService.getAllRoadmaps(user);
        response.setStatus(HttpStatus.OK.value());
        response.setMessage("Success");
        response.setResult(list);
        return ResponseEntity.ok(response);
    }

    @GetMapping("/user")
    @PreAuthorize("hasAnyRole('STUDENT', 'TEACHER', 'ADMIN')")
    public ResponseEntity<APIResponse<List<RoadmapDTO>>> getUserRoadmaps(@AuthenticationPrincipal User user) {
        APIResponse<List<RoadmapDTO>> response = new APIResponse<>();
        List<RoadmapDTO> list = roadmapService.getAllRoadmaps(user);
        response.setStatus(HttpStatus.OK.value());
        response.setMessage("Success");
        response.setResult(list);
        return ResponseEntity.ok(response);
    }

    @GetMapping("/{id}")
    @PreAuthorize("hasAnyRole('STUDENT', 'TEACHER', 'ADMIN')")
    public ResponseEntity<APIResponse<RoadmapDTO>> getRoadmapById(
            @PathVariable Long id,
            @AuthenticationPrincipal User user) {
        APIResponse<RoadmapDTO> response = new APIResponse<>();
        RoadmapDTO roadmap = roadmapService.getRoadmapById(id, user);
        if (roadmap == null) {
            response.setStatus(HttpStatus.NOT_FOUND.value());
            response.setMessage("Không tìm thấy lộ trình học");
            return ResponseEntity.status(HttpStatus.NOT_FOUND).body(response);
        }
        response.setStatus(HttpStatus.OK.value());
        response.setMessage("Success");
        response.setResult(roadmap);
        return ResponseEntity.ok(response);
    }

    @PostMapping
    @PreAuthorize("hasAnyRole('TEACHER', 'ADMIN')")
    public ResponseEntity<APIResponse<Roadmap>> createRoadmap(
            @AuthenticationPrincipal User user,
            @RequestBody CreateRoadmapRequest request) {
        APIResponse<Roadmap> response = new APIResponse<>();
        Roadmap created = roadmapService.createRoadmap(request);
        response.setStatus(HttpStatus.CREATED.value());
        response.setMessage("Tạo lộ trình học thành công");
        response.setResult(created);
        return ResponseEntity.status(HttpStatus.CREATED).body(response);
    }

    @DeleteMapping("/{id}")
    @PreAuthorize("hasAnyRole('TEACHER', 'ADMIN')")
    public ResponseEntity<APIResponse<String>> deleteRoadmap(@PathVariable Long id) {
        APIResponse<String> response = new APIResponse<>();
        boolean deleted = roadmapService.deleteRoadmap(id);
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

    @PostMapping("/{roadmapId}/phases")
    @PreAuthorize("hasAnyRole('TEACHER', 'ADMIN')")
    public ResponseEntity<APIResponse<quizlet.backend.model.RoadmapPhase>> addPhase(
            @PathVariable Long roadmapId,
            @RequestBody CreateRoadmapRequest.PhaseRequest request) {
        APIResponse<quizlet.backend.model.RoadmapPhase> response = new APIResponse<>();
        quizlet.backend.model.RoadmapPhase phase = roadmapService.addPhase(roadmapId, request);
        if (phase == null) {
            response.setStatus(HttpStatus.NOT_FOUND.value());
            response.setMessage("Không tìm thấy lộ trình học");
            return ResponseEntity.status(HttpStatus.NOT_FOUND).body(response);
        }
        response.setStatus(HttpStatus.CREATED.value());
        response.setMessage("Thêm chặng mới thành công");
        response.setResult(phase);
        return ResponseEntity.ok(response);
    }

    @DeleteMapping("/phases/{phaseId}")
    @PreAuthorize("hasAnyRole('TEACHER', 'ADMIN')")
    public ResponseEntity<APIResponse<String>> deletePhase(@PathVariable Long phaseId) {
        APIResponse<String> response = new APIResponse<>();
        boolean deleted = roadmapService.deletePhase(phaseId);
        if (!deleted) {
            response.setStatus(HttpStatus.BAD_REQUEST.value());
            response.setMessage("Không thể xóa chặng này");
            return ResponseEntity.status(HttpStatus.BAD_REQUEST).body(response);
        }
        response.setStatus(HttpStatus.OK.value());
        response.setMessage("Đã xóa chặng thành công");
        response.setResult("DELETED");
        return ResponseEntity.ok(response);
    }

    @PostMapping("/phases/{phaseId}/tasks")
    @PreAuthorize("hasAnyRole('TEACHER', 'ADMIN')")
    public ResponseEntity<APIResponse<quizlet.backend.model.PhaseTask>> addTask(
            @PathVariable Long phaseId,
            @RequestBody CreateRoadmapRequest.TaskRequest request) {
        APIResponse<quizlet.backend.model.PhaseTask> response = new APIResponse<>();
        quizlet.backend.model.PhaseTask task = roadmapService.addTask(phaseId, request);
        if (task == null) {
            response.setStatus(HttpStatus.NOT_FOUND.value());
            response.setMessage("Không tìm thấy chặng");
            return ResponseEntity.status(HttpStatus.NOT_FOUND).body(response);
        }
        response.setStatus(HttpStatus.CREATED.value());
        response.setMessage("Thêm tác vụ thành công");
        response.setResult(task);
        return ResponseEntity.status(HttpStatus.CREATED).body(response);
    }

    @DeleteMapping("/tasks/{taskId}")
    @PreAuthorize("hasAnyRole('TEACHER', 'ADMIN')")
    public ResponseEntity<APIResponse<String>> deleteTask(@PathVariable Long taskId) {
        APIResponse<String> response = new APIResponse<>();
        boolean deleted = roadmapService.deleteTask(taskId);
        if (!deleted) {
            response.setStatus(HttpStatus.BAD_REQUEST.value());
            response.setMessage("Không thể xóa tác vụ này");
            return ResponseEntity.status(HttpStatus.BAD_REQUEST).body(response);
        }
        response.setStatus(HttpStatus.OK.value());
        response.setMessage("Đã xóa tác vụ thành công");
        response.setResult("DELETED");
        return ResponseEntity.ok(response);
    }

    @PostMapping("/tasks/{taskId}/progress")
    @PreAuthorize("hasAnyRole('STUDENT', 'TEACHER', 'ADMIN')")
    public ResponseEntity<APIResponse<UserTaskProgress>> updateTaskProgress(
            @PathVariable Long taskId,
            @AuthenticationPrincipal User user,
            @RequestBody UpdateTaskProgressRequest request) {
        APIResponse<UserTaskProgress> response = new APIResponse<>();
        if (user == null) {
            response.setStatus(HttpStatus.UNAUTHORIZED.value());
            response.setMessage("Chưa đăng nhập");
            return ResponseEntity.status(HttpStatus.UNAUTHORIZED).body(response);
        }

        UserTaskProgress progress = roadmapService.updateTaskProgress(taskId, user, request);
        if (progress == null) {
            response.setStatus(HttpStatus.NOT_FOUND.value());
            response.setMessage("Không tìm thấy tác vụ");
            return ResponseEntity.status(HttpStatus.NOT_FOUND).body(response);
        }

        response.setStatus(HttpStatus.OK.value());
        response.setMessage("Cập nhật tiến trình thành công");
        response.setResult(progress);
        return ResponseEntity.ok(response);
    }

    @GetMapping("/tasks/{taskId}/progress")
    @PreAuthorize("hasAnyRole('STUDENT', 'TEACHER', 'ADMIN')")
    public ResponseEntity<APIResponse<UserTaskProgress>> getTaskProgress(
            @PathVariable Long taskId,
            @AuthenticationPrincipal User user) {
        APIResponse<UserTaskProgress> response = new APIResponse<>();
        if (user == null) {
            response.setStatus(HttpStatus.UNAUTHORIZED.value());
            response.setMessage("Chưa đăng nhập");
            return ResponseEntity.status(HttpStatus.UNAUTHORIZED).body(response);
        }

        UserTaskProgress progress = roadmapService.getTaskProgress(taskId, user);
        response.setStatus(HttpStatus.OK.value());
        response.setMessage("Success");
        response.setResult(progress);
        return ResponseEntity.ok(response);
    }
}
