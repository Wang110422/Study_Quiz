package quizlet.backend.controller;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.*;
import quizlet.backend.dto.res.APIResponse;
import quizlet.backend.dto.SchoolClassDTO;
import quizlet.backend.model.User;
import quizlet.backend.services.SchoolClassService;

import java.util.List;

@RestController
@RequestMapping("/api/classes")
public class SchoolClassController {

    @Autowired
    private SchoolClassService schoolClassService;

    // 1. Lấy danh sách lớp học của người dùng hiện tại
    @GetMapping
    public ResponseEntity<APIResponse<List<SchoolClassDTO>>> getUserClasses(@AuthenticationPrincipal User user) {
        APIResponse<List<SchoolClassDTO>> response = new APIResponse<>();
        if (user == null) {
            response.setStatus(HttpStatus.UNAUTHORIZED.value());
            response.setMessage("Chưa đăng nhập");
            return ResponseEntity.status(HttpStatus.UNAUTHORIZED).body(response);
        }

        List<SchoolClassDTO> classes = schoolClassService.getUserClasses(user);
        response.setStatus(HttpStatus.OK.value());
        response.setMessage("Lấy danh sách lớp học thành công");
        response.setResult(classes);
        return ResponseEntity.ok(response);
    }

    // 1b. Lấy chi tiết 1 lớp học theo ID
    @GetMapping("/{classId}")
    public ResponseEntity<APIResponse<SchoolClassDTO>> getClassById(@PathVariable Long classId) {
        APIResponse<SchoolClassDTO> response = new APIResponse<>();
        SchoolClassDTO classDto = schoolClassService.getClassById(classId);

        response.setStatus(HttpStatus.OK.value());
        response.setMessage("Lấy chi tiết lớp học thành công");
        response.setResult(classDto);
        return ResponseEntity.ok(response);
    }

    // 2. Giáo viên tạo lớp học mới
    @PostMapping
    @PreAuthorize("hasAnyRole('TEACHER', 'ADMIN')")
    public ResponseEntity<APIResponse<SchoolClassDTO>> createClass(
            @AuthenticationPrincipal User teacher,
            @RequestBody SchoolClassDTO dto
    ) {
        APIResponse<SchoolClassDTO> response = new APIResponse<>();
        SchoolClassDTO created = schoolClassService.createClass(teacher, dto);

        response.setStatus(HttpStatus.CREATED.value());
        response.setMessage("Tạo lớp học mới thành công!");
        response.setResult(created);
        return ResponseEntity.status(HttpStatus.CREATED).body(response);
    }

    // 3. Giáo viên cập nhật thông tin lớp học
    @PutMapping("/{classId}")
    @PreAuthorize("hasAnyRole('TEACHER', 'ADMIN')")
    public ResponseEntity<APIResponse<SchoolClassDTO>> updateClass(
            @AuthenticationPrincipal User teacher,
            @PathVariable Long classId,
            @RequestBody SchoolClassDTO dto
    ) {
        APIResponse<SchoolClassDTO> response = new APIResponse<>();
        SchoolClassDTO updated = schoolClassService.updateClass(teacher, classId, dto);

        response.setStatus(HttpStatus.OK.value());
        response.setMessage("Cập nhật thông tin lớp học thành công!");
        response.setResult(updated);
        return ResponseEntity.ok(response);
    }

    // 4. Giáo viên xóa mềm lớp học
    @DeleteMapping("/{classId}")
    @PreAuthorize("hasAnyRole('TEACHER', 'ADMIN')")
    public ResponseEntity<APIResponse<String>> deleteClass(
            @AuthenticationPrincipal User teacher,
            @PathVariable Long classId
    ) {
        APIResponse<String> response = new APIResponse<>();
        schoolClassService.deleteClass(teacher, classId);

        response.setStatus(HttpStatus.OK.value());
        response.setMessage("Đã xóa lớp học thành công");
        response.setResult("DELETED");
        return ResponseEntity.ok(response);
    }

    // 5. Giáo viên thêm Bộ từ vựng vào lớp học
    @PostMapping("/{classId}/study-sets/{studySetId}")
    @PreAuthorize("hasAnyRole('TEACHER', 'ADMIN')")
    public ResponseEntity<APIResponse<SchoolClassDTO>> addStudySetToClass(
            @AuthenticationPrincipal User teacher,
            @PathVariable Long classId,
            @PathVariable Long studySetId
    ) {
        APIResponse<SchoolClassDTO> response = new APIResponse<>();
        SchoolClassDTO updated = schoolClassService.addStudySetToClass(teacher, classId, studySetId);

        response.setStatus(HttpStatus.OK.value());
        response.setMessage("Đã thêm Bộ từ vựng vào lớp học thành công!");
        response.setResult(updated);
        return ResponseEntity.ok(response);
    }

    // 6. Giáo viên thêm Thư mục vào lớp học
    @PostMapping("/{classId}/folders/{folderId}")
    @PreAuthorize("hasAnyRole('TEACHER', 'ADMIN')")
    public ResponseEntity<APIResponse<SchoolClassDTO>> addFolderToClass(
            @AuthenticationPrincipal User teacher,
            @PathVariable Long classId,
            @PathVariable Long folderId
    ) {
        APIResponse<SchoolClassDTO> response = new APIResponse<>();
        SchoolClassDTO updated = schoolClassService.addFolderToClass(teacher, classId, folderId);

        response.setStatus(HttpStatus.OK.value());
        response.setMessage("Đã thêm Thư mục vào lớp học thành công!");
        response.setResult(updated);
        return ResponseEntity.ok(response);
    }

    // 7. Sinh viên tham gia lớp học bằng mã (joinCode)
    @PostMapping("/join")
    public ResponseEntity<APIResponse<SchoolClassDTO>> joinClassByCode(
            @AuthenticationPrincipal User student,
            @RequestParam String joinCode
    ) {
        APIResponse<SchoolClassDTO> response = new APIResponse<>();
        SchoolClassDTO joined = schoolClassService.joinClassByCode(student, joinCode);

        response.setStatus(HttpStatus.OK.value());
        response.setMessage("Gia nhập lớp học thành công!");
        response.setResult(joined);
        return ResponseEntity.ok(response);
    }
}
