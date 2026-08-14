package quizlet.backend.controller;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.*;
import quizlet.backend.base.APIResponse;
import quizlet.backend.dto.StudyGroupDTO;
import quizlet.backend.model.User;
import quizlet.backend.services.StudyGroupService;

import java.util.List;

@RestController
@RequestMapping("/api/study-groups")
public class StudyGroupController {

    @Autowired
    private StudyGroupService studyGroupService;

    // 1. Lấy danh sách nhóm học của sinh viên hiện tại
    @GetMapping
    public ResponseEntity<APIResponse<List<StudyGroupDTO>>> getUserGroups(@AuthenticationPrincipal User user) {
        APIResponse<List<StudyGroupDTO>> response = new APIResponse<>();
        if (user == null) {
            response.setStatus(HttpStatus.UNAUTHORIZED.value());
            response.setMessage("Chưa đăng nhập");
            return ResponseEntity.status(HttpStatus.UNAUTHORIZED).body(response);
        }

        List<StudyGroupDTO> groups = studyGroupService.getUserGroups(user);
        response.setStatus(HttpStatus.OK.value());
        response.setMessage("Lấy danh sách nhóm học thành công");
        response.setResult(groups);
        return ResponseEntity.ok(response);
    }

    // 1b. Lấy chi tiết 1 nhóm học theo ID
    @GetMapping("/{groupId}")
    public ResponseEntity<APIResponse<StudyGroupDTO>> getGroupById(@PathVariable Long groupId) {
        APIResponse<StudyGroupDTO> response = new APIResponse<>();
        StudyGroupDTO groupDto = studyGroupService.getGroupById(groupId);

        response.setStatus(HttpStatus.OK.value());
        response.setMessage("Lấy chi tiết nhóm học thành công");
        response.setResult(groupDto);
        return ResponseEntity.ok(response);
    }

    // 2. Sinh viên tạo nhóm học mới
    @PostMapping
    public ResponseEntity<APIResponse<StudyGroupDTO>> createGroup(
            @AuthenticationPrincipal User student,
            @RequestBody StudyGroupDTO dto
    ) {
        APIResponse<StudyGroupDTO> response = new APIResponse<>();
        StudyGroupDTO created = studyGroupService.createGroup(student, dto);

        response.setStatus(HttpStatus.CREATED.value());
        response.setMessage("Tạo nhóm học mới thành công!");
        response.setResult(created);
        return ResponseEntity.status(HttpStatus.CREATED).body(response);
    }

    // 3. Sinh viên cập nhật thông tin nhóm học
    @PutMapping("/{groupId}")
    public ResponseEntity<APIResponse<StudyGroupDTO>> updateGroup(
            @AuthenticationPrincipal User student,
            @PathVariable Long groupId,
            @RequestBody StudyGroupDTO dto
    ) {
        APIResponse<StudyGroupDTO> response = new APIResponse<>();
        StudyGroupDTO updated = studyGroupService.updateGroup(student, groupId, dto);

        response.setStatus(HttpStatus.OK.value());
        response.setMessage("Cập nhật nhóm học thành công!");
        response.setResult(updated);
        return ResponseEntity.ok(response);
    }

    // 4. Sinh viên xóa nhóm học
    @DeleteMapping("/{groupId}")
    public ResponseEntity<APIResponse<String>> deleteGroup(
            @AuthenticationPrincipal User student,
            @PathVariable Long groupId
    ) {
        APIResponse<String> response = new APIResponse<>();
        studyGroupService.deleteGroup(student, groupId);

        response.setStatus(HttpStatus.OK.value());
        response.setMessage("Đã xóa nhóm học thành công");
        response.setResult("DELETED");
        return ResponseEntity.ok(response);
    }

    // 5. Sinh viên thêm Bộ từ vựng vào nhóm học
    @PostMapping("/{groupId}/study-sets/{studySetId}")
    public ResponseEntity<APIResponse<StudyGroupDTO>> addStudySetToGroup(
            @AuthenticationPrincipal User student,
            @PathVariable Long groupId,
            @PathVariable Long studySetId
    ) {
        APIResponse<StudyGroupDTO> response = new APIResponse<>();
        StudyGroupDTO updated = studyGroupService.addStudySetToGroup(student, groupId, studySetId);

        response.setStatus(HttpStatus.OK.value());
        response.setMessage("Đã thêm Bộ từ vựng vào nhóm học thành công!");
        response.setResult(updated);
        return ResponseEntity.ok(response);
    }

    // 6. Sinh viên thêm Thư mục vào nhóm học
    @PostMapping("/{groupId}/folders/{folderId}")
    public ResponseEntity<APIResponse<StudyGroupDTO>> addFolderToGroup(
            @AuthenticationPrincipal User student,
            @PathVariable Long groupId,
            @PathVariable Long folderId
    ) {
        APIResponse<StudyGroupDTO> response = new APIResponse<>();
        StudyGroupDTO updated = studyGroupService.addFolderToGroup(student, groupId, folderId);

        response.setStatus(HttpStatus.OK.value());
        response.setMessage("Đã thêm Thư mục vào nhóm học thành công!");
        response.setResult(updated);
        return ResponseEntity.ok(response);
    }

    // 7. Sinh viên khác tham gia nhóm học bằng mã (joinCode)
    @PostMapping("/join")
    public ResponseEntity<APIResponse<StudyGroupDTO>> joinGroupByCode(
            @AuthenticationPrincipal User student,
            @RequestParam String joinCode
    ) {
        APIResponse<StudyGroupDTO> response = new APIResponse<>();
        StudyGroupDTO joined = studyGroupService.joinGroupByCode(student, joinCode);

        response.setStatus(HttpStatus.OK.value());
        response.setMessage("Gia nhập nhóm học thành công!");
        response.setResult(joined);
        return ResponseEntity.ok(response);
    }
}
