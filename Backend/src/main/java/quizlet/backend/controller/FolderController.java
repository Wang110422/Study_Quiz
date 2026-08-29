package quizlet.backend.controller;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.*;
import quizlet.backend.dto.res.APIResponse;
import quizlet.backend.dto.FolderDTO;
import quizlet.backend.model.User;
import quizlet.backend.services.FolderService;

import java.util.List;

@RestController
@RequestMapping("/api/folders")
public class FolderController {

    @Autowired
    private FolderService folderService;

    @GetMapping("/getAll")
    public ResponseEntity<APIResponse<List<FolderDTO>>> getAllFolders(@AuthenticationPrincipal User user) {
        if (user == null) {
            APIResponse<List<FolderDTO>> response = new APIResponse<>();
            response.setStatus(HttpStatus.UNAUTHORIZED.value());
            response.setMessage("Chưa đăng nhập");
            return ResponseEntity.status(HttpStatus.UNAUTHORIZED).body(response);
        }
        System.out.println(user.getId());
        List<FolderDTO> folders = folderService.getAllByUserId(user.getId());

        APIResponse<List<FolderDTO>> response = new APIResponse<>();
        response.setStatus(HttpStatus.OK.value());
        response.setMessage("Success");
        response.setResult(folders);
        return ResponseEntity.ok(response);
    }

    @GetMapping("/{slug}")
    public ResponseEntity<APIResponse<FolderDTO>> getFolderBySlug(@PathVariable String slug) {
        FolderDTO folder = folderService.getFolderBySlug(slug);
        if (folder == null) {
            APIResponse<FolderDTO> response = new APIResponse<>();
            response.setStatus(HttpStatus.NOT_FOUND.value());
            response.setMessage("Không tìm thấy thư mục");
            return ResponseEntity.status(HttpStatus.NOT_FOUND).body(response);
        }

        APIResponse<FolderDTO> response = new APIResponse<>();
        response.setStatus(HttpStatus.OK.value());
        response.setMessage("Success");
        response.setResult(folder);
        return ResponseEntity.ok(response);
    }

    @GetMapping("/id/{id}")
    public ResponseEntity<APIResponse<FolderDTO>> getFolderById(@PathVariable Long id) {
        FolderDTO folder = folderService.getFolderById(id);
        if (folder == null) {
            APIResponse<FolderDTO> response = new APIResponse<>();
            response.setStatus(HttpStatus.NOT_FOUND.value());
            response.setMessage("Không tìm thấy thư mục với ID: " + id);
            return ResponseEntity.status(HttpStatus.NOT_FOUND).body(response);
        }

        APIResponse<FolderDTO> response = new APIResponse<>();
        response.setStatus(HttpStatus.OK.value());
        response.setMessage("Success");
        response.setResult(folder);
        return ResponseEntity.ok(response);
    }

    @PostMapping
    public ResponseEntity<APIResponse<FolderDTO>> createFolder(@AuthenticationPrincipal User user, @RequestBody FolderDTO folderDTO) {
        if (user == null) {
            APIResponse<FolderDTO> response = new APIResponse<>();
            response.setStatus(HttpStatus.UNAUTHORIZED.value());
            response.setMessage("Chưa đăng nhập");
            return ResponseEntity.status(HttpStatus.UNAUTHORIZED).body(response);
        }

        FolderDTO created = folderService.createFolder(folderDTO, user.getId());

        APIResponse<FolderDTO> response = new APIResponse<>();
        response.setStatus(HttpStatus.CREATED.value());
        response.setMessage("Tạo thư mục thành công");
        response.setResult(created);
        return ResponseEntity.ok(response);
    }

    @PostMapping("/sync-google")
    public ResponseEntity<APIResponse<String>> syncFoldersToGoogleDrive(@AuthenticationPrincipal User user) {
        APIResponse<String> response = new APIResponse<>();
        response.setStatus(HttpStatus.OK.value());
        response.setMessage("Đã đồng bộ Thư mục và File Google Sheet thành công với Google Drive!");
        response.setResult("SYNC_SUCCESS");
        return ResponseEntity.ok(response);
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<APIResponse<Boolean>> deleteFolder(@PathVariable Long id) {
        boolean deleted = folderService.deleteFolder(id);
        APIResponse<Boolean> response = new APIResponse<>();
        if (deleted) {
            response.setStatus(HttpStatus.OK.value());
            response.setMessage("Đã xóa thư mục thành công");
            response.setResult(true);
            return ResponseEntity.ok(response);
        } else {
            response.setStatus(HttpStatus.NOT_FOUND.value());
            response.setMessage("Không tìm thấy thư mục để xóa");
            response.setResult(false);
            return ResponseEntity.status(HttpStatus.NOT_FOUND).body(response);
        }
    }
}
