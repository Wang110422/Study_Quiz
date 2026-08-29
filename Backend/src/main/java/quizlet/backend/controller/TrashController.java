package quizlet.backend.controller;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.*;
import quizlet.backend.dto.FolderDTO;
import quizlet.backend.dto.StudySetDTO;
import quizlet.backend.dto.VocabularyFlashCardDTO;
import quizlet.backend.dto.res.APIResponse;
import quizlet.backend.model.User;
import quizlet.backend.services.FolderService;
import quizlet.backend.services.StudySetService;
import quizlet.backend.services.VocabularyService;

import java.util.HashMap;
import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/trash")
public class TrashController {

    @Autowired
    private FolderService folderService;

    @Autowired
    private StudySetService studySetService;

    @Autowired
    private VocabularyService vocabularyService;

    // 1. Lấy tất cả các mục đã xóa mềm của User
    @GetMapping("/all")
    public ResponseEntity<APIResponse<Map<String, Object>>> getAllTrashItems(@AuthenticationPrincipal User user) {
        APIResponse<Map<String, Object>> response = new APIResponse<>();
        if (user == null) {
            response.setStatus(HttpStatus.UNAUTHORIZED.value());
            response.setMessage("Chưa đăng nhập");
            return ResponseEntity.status(HttpStatus.UNAUTHORIZED).body(response);
        }

        List<FolderDTO> deletedFolders = folderService.getDeletedByUserId(user.getId());
        List<StudySetDTO> deletedSets = studySetService.getDeletedByUserId(user.getId());
        List<VocabularyFlashCardDTO> deletedVocabs = vocabularyService.getDeletedByUserId(user.getId());

        Map<String, Object> data = new HashMap<>();
        data.put("folders", deletedFolders);
        data.put("studySets", deletedSets);
        data.put("vocabularies", deletedVocabs);

        response.setStatus(HttpStatus.OK.value());
        response.setMessage("Lấy danh sách thùng rác thành công");
        response.setResult(data);
        return ResponseEntity.ok(response);
    }

    // 2. Khôi phục (Restore)
    @PutMapping("/restore")
    public ResponseEntity<APIResponse<Boolean>> restoreItem(
            @AuthenticationPrincipal User user,
            @RequestParam String type,
            @RequestParam Long id
    ) {
        APIResponse<Boolean> response = new APIResponse<>();
        if (user == null) {
            response.setStatus(HttpStatus.UNAUTHORIZED.value());
            response.setMessage("Chưa đăng nhập");
            return ResponseEntity.status(HttpStatus.UNAUTHORIZED).body(response);
        }

        boolean success = false;
        if ("folder".equalsIgnoreCase(type)) {
            success = folderService.restoreFolder(id);
        } else if ("set".equalsIgnoreCase(type) || "studyset".equalsIgnoreCase(type)) {
            success = studySetService.restoreStudySet(id);
        } else if ("vocabulary".equalsIgnoreCase(type) || "vocab".equalsIgnoreCase(type)) {
            success = vocabularyService.restoreVocabulary(id);
        }

        response.setStatus(HttpStatus.OK.value());
        response.setMessage(success ? "Khôi phục thành công!" : "Khôi phục thất bại!");
        response.setResult(success);
        return ResponseEntity.ok(response);
    }

    // 3. Xóa vĩnh viễn (Permanent Delete)
    @DeleteMapping("/permanent")
    public ResponseEntity<APIResponse<Boolean>> permanentDelete(
            @AuthenticationPrincipal User user,
            @RequestParam String type,
            @RequestParam Long id
    ) {
        APIResponse<Boolean> response = new APIResponse<>();
        if (user == null) {
            response.setStatus(HttpStatus.UNAUTHORIZED.value());
            response.setMessage("Chưa đăng nhập");
            return ResponseEntity.status(HttpStatus.UNAUTHORIZED).body(response);
        }

        boolean success = false;
        if ("folder".equalsIgnoreCase(type)) {
            success = folderService.permanentDeleteFolder(id);
        } else if ("set".equalsIgnoreCase(type) || "studyset".equalsIgnoreCase(type)) {
            success = studySetService.permanentDeleteStudySet(id);
        } else if ("vocabulary".equalsIgnoreCase(type) || "vocab".equalsIgnoreCase(type)) {
            success = vocabularyService.permanentDeleteVocabulary(id);
        }

        response.setStatus(HttpStatus.OK.value());
        response.setMessage(success ? "Đã xóa vĩnh viễn!" : "Xóa vĩnh viễn thất bại!");
        response.setResult(success);
        return ResponseEntity.ok(response);
    }
}
