package quizlet.backend.controller;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import quizlet.backend.dto.res.APIResponse;
import quizlet.backend.dto.PassageGroupDTO;
import quizlet.backend.services.PassageGroupService;

@RestController
@RequestMapping("/api/passage-groups")
public class PassageGroupController {

    @Autowired
    private PassageGroupService passageGroupService;

    // POST /api/passage-groups
    // Nhận JSON PassageGroup gồm: sectionId, title, toeicPart, audioUrl, imageUrl, passageText, orderIndex, questions (danh sách câu hỏi lồng nhau)
    @PostMapping
    public ResponseEntity<APIResponse<PassageGroupDTO>> createPassageGroup(@RequestBody PassageGroupDTO dto) {
        PassageGroupDTO result = passageGroupService.createPassageGroup(dto);
        APIResponse<PassageGroupDTO> response = new APIResponse<>();
        response.setStatus(HttpStatus.CREATED.value());
        response.setMessage("Tạo PassageGroup thành công");
        response.setResult(result);
        return ResponseEntity.status(HttpStatus.CREATED).body(response);
    }

    @GetMapping("/{id}")
    public ResponseEntity<APIResponse<PassageGroupDTO>> getPassageGroupDetail(@PathVariable Long id) {
        PassageGroupDTO pg = passageGroupService.getPassageGroupById(id);
        APIResponse<PassageGroupDTO> response = new APIResponse<>();
        if (pg == null) {
            response.setStatus(HttpStatus.NOT_FOUND.value());
            response.setMessage("Không tìm thấy PassageGroup với ID: " + id);
            return ResponseEntity.status(HttpStatus.NOT_FOUND).body(response);
        }
        response.setStatus(HttpStatus.OK.value());
        response.setMessage("Success");
        response.setResult(pg);
        return ResponseEntity.ok(response);
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<APIResponse<Void>> deletePassageGroup(@PathVariable Long id) {
        passageGroupService.deletePassageGroup(id);
        APIResponse<Void> response = new APIResponse<>();
        response.setStatus(HttpStatus.OK.value());
        response.setMessage("Xóa PassageGroup thành công");
        return ResponseEntity.ok(response);
    }
}
